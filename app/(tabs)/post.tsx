import React, { useEffect, useState } from 'react'
import { StyleSheet, TextInput, Button, Alert, Switch, View, ScrollView, Image, ActivityIndicator, Platform } from 'react-native'
import { Text } from '@/components/Themed'
import { supabase } from '@/lib/supabase'
import * as ImagePicker from 'expo-image-picker'

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

  // no editing behavior here; post.tsx is for new posts only

  async function pickImage() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted) {
        Alert.alert('Permission required', 'Please allow access to photos to upload a cover image.')
        return
      }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 })
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
      // fetch the file
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

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Post a Project</Text>
        <Text style={styles.note}>This page is only available to administrators.</Text>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Post a Project</Text>

  <Text style={styles.label}>Title</Text>
  <TextInput placeholder="Project title" placeholderTextColor="#8A99B5" value={title} onChangeText={setTitle} style={styles.input} />

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
  <TextInput placeholder="https://github.com/owner/repo" placeholderTextColor="#8A99B5" value={githubUrl} onChangeText={setGithubUrl} style={styles.input} autoCapitalize="none" />

      <Text style={styles.label}>Cover image</Text>
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={{ width: '100%', height: 160, borderRadius: 10, marginBottom: 8 }} />
      ) : (
        <View style={{ height: 160, borderRadius: 10, backgroundColor: '#0F1726', borderWidth: 1, borderColor: '#1E2A44', marginBottom: 8, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#8A99B5' }}>No cover selected</Text>
        </View>
      )}
      <View style={{ marginBottom: 8 }}>
        <Button title={uploading ? 'Uploading...' : 'Pick an image'} onPress={pickImage} disabled={uploading} />
      </View>

      <Text style={styles.label}>Tools (comma separated)</Text>
  <TextInput placeholder="React, TypeScript, Supabase" placeholderTextColor="#8A99B5" value={toolsCsv} onChangeText={setToolsCsv} style={styles.input} />

      <View style={styles.row}> 
        <Text style={styles.label}>Publish</Text>
        <Switch value={published} onValueChange={setPublished} />
      </View>

      <View style={{ height: 12 }} />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title={'Create Project'} onPress={onSubmit} />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1, backgroundColor: '#0B1220' },
  title: { fontSize: 20, fontWeight: '700', color: '#6FB3FF', marginBottom: 12 },
  note: { color: '#A5B4C3' },
  label: { color: '#A5B4C3', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#0F1726', borderRadius: 8, padding: 10, color: '#E6EDF3', borderWidth: 1, borderColor: '#1E2A44' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
})
