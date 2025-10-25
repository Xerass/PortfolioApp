import React, { useEffect, useState } from 'react'
import { StyleSheet, ScrollView, Image, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native'
import { Text } from '@/components/Themed'
import { supabase } from '@/lib/supabase'
import { Linking } from 'react-native'
import { useRouter } from 'expo-router'

export default function ProjectsList() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data, error } = await supabase.from('projects').select('*').eq('published', true).order('created_at', { ascending: false })
        if (error) throw error
        if (!mounted) return
        setProjects(data ?? [])
      } catch (e) {
        console.log('fetch projects', e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const uid = session?.user?.id
        if (!uid) return
        const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', uid).limit(1).single()
        if (!error && data?.role === 'admin') setIsAdmin(true)
      } catch (e) {
        console.log('role check', e)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Projects</Text>
      {projects.map((p) => (
        <View key={p.id} style={[styles.card, { position: 'relative' }]}>
          {p.cover_url ? <Image source={{ uri: p.cover_url }} style={styles.image} /> : <View style={[styles.image, { alignItems: 'center', justifyContent: 'center' }]}><Text style={{ color: '#8A99B5' }}>No image</Text></View>}
          <Text style={styles.projectTitle}>{p.title}</Text>
          <View style={styles.toolsWrap}>
            {(p.tools || []).map((t: string) => (
              <TouchableOpacity key={t} style={styles.toolChip} activeOpacity={0.85}>
                <Text style={{ color: '#6FB3FF', fontFamily: 'JetBrainsMono-Regular' }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.desc}>{p.description}</Text>
          {p.github_url ? (
            <TouchableOpacity onPress={() => Linking.openURL(p.github_url)} style={styles.ghBtn}>
              <Text style={{ color: '#0B1220', fontFamily: 'JetBrainsMono-Bold' }}>Open GitHub</Text>
            </TouchableOpacity>
          ) : null}

          {isAdmin && (
            <View style={styles.adminActions}>
              <TouchableOpacity style={styles.adminBtn} onPress={() => (router.push as any)(`/edit/${p.id}`)}>
                <Text style={{ color: '#0B1220', fontFamily: 'JetBrainsMono-Bold' }}>✎</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.adminBtn, { backgroundColor: p.featured ? '#ffd166' : '#223344', marginLeft: 8 }]}
                onPress={async () => {
                  // toggle featured flag, with graceful handling if column missing
                  try {
                    const { error } = await supabase.from('projects').update({ featured: !p.featured }).eq('id', p.id)
                    if (error) throw error
                    setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, featured: !x.featured } : x)))
                  } catch (e: any) {
                    console.log('feature toggle', e)
                    // common PostgREST error if column doesn't exist
                    if (e?.code === 'PGRST204' || e?.code === '42703') {
                      const sql = 'ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;'
                      Alert.alert('Database column missing', `The 'featured' column does not exist in the projects table. Run this SQL in the Supabase SQL editor to add it:\n\n${sql}`)
                    } else {
                      Alert.alert('Error', 'Could not toggle featured')
                    }
                  }
                }}
              >
                <Text style={{ color: p.featured ? '#0B1220' : '#6FB3FF', fontFamily: 'JetBrainsMono-Bold' }}>{p.featured ? '★' : '☆'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.adminBtn, { backgroundColor: '#ff6b6b', marginLeft: 8 }]}
                onPress={() => {
                  Alert.alert('Delete project', 'Are you sure you want to delete this project?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete', style: 'destructive', onPress: async () => {
                        try {
                          const { error } = await supabase.from('projects').delete().eq('id', p.id)
                          if (error) throw error
                          setProjects((prev) => prev.filter((x) => x.id !== p.id))
                        } catch (e) {
                          console.log('delete error', e)
                          Alert.alert('Error', 'Could not delete project')
                        }
                      }
                    }
                  ])
                }}
              >
                <Text style={{ color: '#0B1220', fontFamily: 'JetBrainsMono-Bold' }}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#0B1220', paddingBottom: 40 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B1220' },
  title: { fontSize: 22, color: '#6FB3FF', fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#0F1726', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1E2A44', marginBottom: 14 },
  image: { width: '100%', height: 180, borderRadius: 8, marginBottom: 10 },
  projectTitle: { fontSize: 18, color: '#E6EDF3', fontFamily: 'JetBrainsMono-Bold', marginBottom: 8 },
  toolsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  toolChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#12213a', borderWidth: 1, borderColor: '#243553', marginRight: 6, marginBottom: 6 },
  desc: { color: '#A5B4C3', marginTop: 6 },
  ghBtn: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#6FB3FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  adminActions: { position: 'absolute', right: 12, bottom: 12, flexDirection: 'row' },
  adminBtn: { backgroundColor: '#6FB3FF', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
})
