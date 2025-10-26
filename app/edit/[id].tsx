import React, { useEffect, useState, useCallback } from 'react'
import { StyleSheet, TextInput, Alert, Switch, View, ScrollView, Image, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/Themed'
import { supabase } from '@/lib/supabase'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'

const SCREEN_HEIGHT = Dimensions.get('window').height

// JetBrains Mono helpers
const MONO_REG = { fontFamily: 'JetBrainsMono-Regular', fontWeight: 'normal' as const }
const MONO_BOLD = { fontFamily: 'JetBrainsMono-Bold', fontWeight: 'normal' as const }

// Modern edit screen that mirrors the post flow and focuses on reliability and UX.
export default function EditProject() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const id = params?.id as string

  const HERO_BG = require('@/assets/images/bgHero.jpg')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [toolsCsv, setToolsCsv] = useState('')
  const [published, setPublished] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!id) {
        if (mounted) setLoading(false)
        return
      }
      try {
        // Role check
        const { data: { session } } = await supabase.auth.getSession()
        const uid = session?.user?.id
        if (!uid) {
          if (mounted) setIsAdmin(false)
        } else {
          const { data: roleData, error: roleErr } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', uid)
            .limit(1)
            .single()
          if (!roleErr && mounted) setIsAdmin(roleData?.role === 'admin')
        }

        // Load project
        const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
        if (error) throw error
        if (!mounted) return
        setTitle(data.title || '')
        setDescription(data.description || '')
        setGithubUrl(data.github_url || '')
        setCoverUrl(data.cover_url || '')
        setToolsCsv((data.tools || []).join(', '))
        setPublished(!!data.published)
      } catch (e) {
        console.log('load project for edit', e)
        Alert.alert('Error', 'Failed to load project')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  const pickImage = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted) {
        Alert.alert('Permission required', 'Please allow access to photos to upload a cover image.')
        return
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8
      })
      if (res.canceled) return
      const asset = res.assets?.[0]
      if (!asset?.uri) return
      await uploadImage(asset.uri)
    } catch (e: any) {
      console.log('pickImage error', e)
      Alert.alert('Error', e.message ?? String(e))
    }
  }, [])

  async function uploadImage(uri: string) {
    try {
      setUploading(true)
      const fetchRes = await fetch(uri)
      const blob = await fetchRes.blob()

      const extMatch = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
      const ext = extMatch ? extMatch[1] : 'jpg'
      const fileName = `covers/${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`

      const { error: uploadError } = await supabase
        .storage
        .from('projects')
        .upload(fileName, blob, { cacheControl: '3600', upsert: false })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('projects').getPublicUrl(fileName)
      setCoverUrl(data.publicUrl)
      Alert.alert('Uploaded', 'Cover image uploaded and will be used for the project.')
    } catch (e: any) {
      console.log('uploadImage error', e)
      Alert.alert('Upload failed', e.message ?? String(e))
    } finally {
      setUploading(false)
    }
  }

  async function onSave() {
    if (!isAdmin) {
      Alert.alert('Unauthorized', 'Only admins can edit projects.')
      return
    }
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required')
      return
    }
    setSaving(true)
    try {
      const tools = toolsCsv.split(',').map((t) => t.trim()).filter(Boolean)
      const payload: any = {
        title: title.trim(),
        description: description.trim() || null,
        github_url: githubUrl.trim() || null,
        cover_url: coverUrl || null,
        tools,
        published,
      }
      if (!id) throw new Error('Missing project id')
      const { error } = await supabase.from('projects').update(payload).eq('id', id)
      if (error) throw error
      Alert.alert('Saved', 'Project updated successfully')
      ;(router.push as any)('/projects')
    } catch (e) {
      console.log('save edit', e)
      Alert.alert('Error', 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.screen}>
        <View pointerEvents="none" style={styles.backdropWrap}>
          <Image source={HERO_BG} style={styles.backdropImage} resizeMode="cover" />
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(11,18,32,0)', 'rgba(11,18,32,0.35)', 'rgba(11,18,32,0.7)', '#0B1220']}
            locations={[0.2, 0.55, 0.8, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.backdropWrap}>
        <Image source={HERO_BG} style={styles.backdropImage} resizeMode="cover" />
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(11,18,32,0)', 'rgba(11,18,32,0.35)', 'rgba(11,18,32,0.7)', '#0B1220']}
          locations={[0.2, 0.55, 0.8, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: SCREEN_HEIGHT * 0.05, paddingBottom: SCREEN_HEIGHT * 0.10 }]}
      >
        <Text style={styles.title}>Edit Project</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          placeholder="Project title"
          placeholderTextColor="#8A99B5"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Short description"
          placeholderTextColor="#8A99B5"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 100 }]}
          multiline
        />

        <Text style={styles.label}>GitHub URL</Text>
        <TextInput
          placeholder="https://github.com/owner/repo"
          placeholderTextColor="#8A99B5"
          value={githubUrl}
          onChangeText={setGithubUrl}
          style={styles.input}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Cover image</Text>
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            style={{ width: '100%', height: 160, borderRadius: 10, marginBottom: 8 }}
          />
        ) : (
          <View style={styles.noCoverBox}>
            <Text style={styles.noCoverText}>No cover selected</Text>
          </View>
        )}

        {/* Replaces Button: Pick an image */}
        <View style={{ marginBottom: 8 }}>
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.85}
            disabled={uploading}
            style={[styles.btn, uploading && styles.btnDisabled]}
          >
            {uploading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.btnText}>Pick an image</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Tools (comma separated)</Text>
        <TextInput
          placeholder="React, TypeScript"
          placeholderTextColor="#8A99B5"
          value={toolsCsv}
          onChangeText={setToolsCsv}
          style={styles.input}
        />

        <View style={styles.row}>
          <Text style={styles.label}>Publish</Text>
          <Switch value={published} onValueChange={setPublished} />
        </View>

        <View style={{ height: 12 }} />

        {/* Actions Row (Cancel / Save) */}
        <View style={styles.actionsRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <TouchableOpacity
              onPress={() => (router.back as any)()}
              activeOpacity={0.85}
              style={[styles.btn, styles.btnSecondary]}
            >
              <Text style={[styles.btnText, styles.btnTextSecondary]}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={onSave}
              activeOpacity={0.85}
              disabled={saving}
              style={[styles.btn, saving && styles.btnDisabled]}
            >
              {saving ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.btnText}>Save changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B1220' },

  backdropWrap: {
    position: 'absolute',
    top: -160,
    left: -40,
    right: -40,
    height: 380,
    borderRadius: 32,
    overflow: 'hidden',
  },
  backdropImage: { width: '100%', height: '100%' },

  container: {
    padding: 16,
    backgroundColor: 'transparent',
    flexGrow: 1,
  },

  title: {
    ...MONO_BOLD,
    fontSize: 20,
    color: '#6FB3FF',
    marginBottom: 12,
  },

  label: {
    ...MONO_REG,
    color: '#A5B4C3',
    marginBottom: 6,
  },

  input: {
    ...MONO_REG,
    backgroundColor: '#0F1726',
    borderRadius: 8,
    padding: 10,
    color: '#E6EDF3',
    borderWidth: 1,
    borderColor: '#1E2A44',
  },

  noCoverBox: {
    height: 160,
    borderRadius: 10,
    backgroundColor: '#0F1726',
    borderWidth: 1,
    borderColor: '#1E2A44',
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCoverText: {
    ...MONO_REG,
    color: '#8A99B5',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  // Buttons
  btn: {
    backgroundColor: '#1A2642',
    borderWidth: 1,
    borderColor: '#2D406B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    ...MONO_BOLD,
    fontSize: 14,
    color: '#6FB3FF',
    letterSpacing: 0.2,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
  },
  btnTextSecondary: {
    color: '#A5B4C3',
  },
})
