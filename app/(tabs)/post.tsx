import React, { useEffect, useState } from 'react'
import { StyleSheet, TextInput, Alert, Switch, View, ScrollView, Image, ActivityIndicator, Platform, TouchableOpacity, Dimensions } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/Themed'
import { supabase } from '@/lib/supabase'
import * as ImagePicker from 'expo-image-picker'

const SCREEN_HEIGHT = Dimensions.get('window').height

// ---- JetBrains Mono helpers ----
const MONO_REG = { fontFamily: 'JetBrainsMono-Regular', fontWeight: 'normal' as const }
const MONO_BOLD = { fontFamily: 'JetBrainsMono-Bold', fontWeight: 'normal' as const }

export default function PostScreen() {
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [toolsCsv, setToolsCsv] = useState('')
  const [published, setPublished] = useState(true)
  const [uploading, setUploading] = useState(false)
  // post.tsx is for creating new projects only

  useEffect(() => {
    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const uid = session?.user?.id
        if (!uid) return setIsAdmin(false)
        const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', uid).limit(1).single()
        if (error) throw error
        setIsAdmin(data?.role === 'admin')
      } catch (e) {
        console.log('post role check', e)
        setIsAdmin(false)
      }
    })()
  }, [])

  async function pickImage() {
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
  }

  async function uploadImage(uri: string) {
    try {
      setUploading(true)
      const fetchRes = await fetch(uri)
      const blob = await fetchRes.blob()

      const extMatch = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
      const ext = extMatch ? extMatch[1] : 'jpg'
      const fileName = `covers/${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`

      const { error: uploadError } = await supabase.storage.from('projects').upload(fileName, blob, { cacheControl: '3600', upsert: false })
      if (uploadError) {
        throw uploadError
      }

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

  async function onSubmit() {
    if (!isAdmin) {
      Alert.alert('Unauthorized', 'Only admins can create a project.')
      return
    }
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required')
      return
    }
    setLoading(true)
    try {
      const tools = toolsCsv.split(',').map((t) => t.trim()).filter(Boolean)
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        github_url: githubUrl.trim() || null,
        cover_url: coverUrl || null,
        tools,
        published,
      }
      const res = await supabase.from('projects').insert([payload]).select().single()
      const data = res.data
      const error = res.error
      if (error) throw error
      Alert.alert('Success', 'Project created')
      // reset
      setTitle('')
      setDescription('')
      setGithubUrl('')
      setCoverUrl('')
      setToolsCsv('')
      setPublished(true)
    } catch (e: any) {
      console.log('insert project error', e)
      Alert.alert('Error', e.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  const HERO_BG = require('@/assets/images/bgHero.jpg')

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Post a Project</Text>
        <Text style={styles.note}>This page is only available to administrators.</Text>
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

      <ScrollView contentContainerStyle={[styles.container, { paddingTop: SCREEN_HEIGHT * 0.05, paddingBottom: SCREEN_HEIGHT * 0.10 }]}>
        <Text style={styles.title}>Post a Project</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          placeholder="Project title"
          placeholderTextColor="#8A99B5"  // slightly opaque placeholder
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Short description"
          placeholderTextColor="#8A99B5"  // slightly opaque placeholder
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 100 }]}
          multiline
        />

        <Text style={styles.label}>GitHub URL</Text>
        <TextInput
          placeholder="https://github.com/owner/repo"
          placeholderTextColor="#8A99B5"  // slightly opaque placeholder
          value={githubUrl}
          onChangeText={setGithubUrl}
          style={styles.input}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Cover image</Text>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={{ width: '100%', height: 160, borderRadius: 10, marginBottom: 8 }} />
        ) : (
          <View style={styles.noCoverBox}>
            <Text style={styles.noCoverText}>No cover selected</Text>
          </View>
        )}

        {/* Pick image button (styled) */}
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
          placeholder="React, TypeScript, Supabase"
          placeholderTextColor="#8A99B5"  // slightly opaque placeholder
          value={toolsCsv}
          onChangeText={setToolsCsv}
          style={styles.input}
        />

        <View style={styles.row}>
          <Text style={styles.label}>Publish</Text>
          <Switch value={published} onValueChange={setPublished} />
        </View>

        <View style={{ height: 12 }} />

        {/* Create Project button (styled) */}
        {loading ? (
          <ActivityIndicator />
        ) : (
          <TouchableOpacity
            onPress={onSubmit}
            activeOpacity={0.85}
            style={styles.btn}
          >
            <Text style={styles.btnText}>Create Project</Text>
          </TouchableOpacity>
        )}
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

  // make the content container transparent so the local backdrop is visible
  container: { padding: 16, flexGrow: 1, backgroundColor: 'transparent' },

  title: {
    ...MONO_BOLD,
    fontSize: 20,
    color: '#6FB3FF',
    marginBottom: 12,
  },
  note: { ...MONO_REG, color: '#A5B4C3' },

  label: {
    ...MONO_REG,
    color: '#A5B4C3',
    marginBottom: 6,
    marginTop: 10,
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
    color: '#8A99B5', // muted/opaque-ish for default state
  },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },

  // --- Buttons (Mono-styled) ---
  btn: {
    backgroundColor: '#1A2642',
    borderWidth: 1,
    borderColor: '#2D406B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    ...MONO_BOLD,
    fontSize: 14,
    color: '#6FB3FF',
    letterSpacing: 0.2,
  },
})
