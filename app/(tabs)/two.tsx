// app/(tabs)/two.tsx
import { useEffect, useState } from 'react'
import { StyleSheet, TextInput, Button, Alert } from 'react-native'
import { Text, View } from '@/components/Themed'
import { supabase } from '@/lib/supabase'

export default function TabTwoScreen() {
  const [clientOk, setClientOk] = useState<'...' | '✅' | '❌'>('...')
  const [sessionOk, setSessionOk] = useState<'...' | '✅' | '❌'>('...')
  const [table, setTable] = useState('')          // type a table name to try (e.g., notes)
  const [rowsPreview, setRowsPreview] = useState<string>('(no data)')

  // 1) Basic client/env sanity
  useEffect(() => {
    const hasUrl = !!process.env.EXPO_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    setClientOk(hasUrl && hasKey ? '✅' : '❌')
  }, [])

  // 2) Ping Supabase by asking for session (works even logged out)
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        // data.session can be null if not logged in; that’s fine — it still proves the client works
        setSessionOk('✅')
      } catch (e) {
        console.log('[getSession error]', e)
        setSessionOk('❌')
      }
    })()
  }, [])

  async function trySelect() {
    if (!table.trim()) {
      Alert.alert('Enter a table name', 'Example: notes')
      return
    }
    try {
      const { data, error } = await supabase.from(table.trim()).select('*').limit(5)
      if (error) throw error
      setRowsPreview(JSON.stringify(data, null, 2) || '(empty)')
      Alert.alert('Success', `Fetched up to 5 rows from "${table.trim()}"`)
    } catch (e: any) {
      console.log('[select error]', e)
      setRowsPreview('(no data)')
      Alert.alert('Query failed', e.message ?? String(e))
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Playground</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Client initialized (envs present): {clientOk}</Text>
        <Text style={styles.label}>auth.getSession() ping: {sessionOk}</Text>

        <View style={{ height: 12 }} />

        <Text style={styles.sub}>Optional: quick table read</Text>
        <TextInput
          placeholder="table name (e.g., notes)"
          value={table}
          onChangeText={setTable}
          autoCapitalize="none"
          style={styles.input}
        />
        <Button title="Fetch 5 rows" onPress={trySelect} />

        <View style={{ height: 12 }} />
        <Text style={styles.sub}>Preview</Text>
        <View style={styles.previewBox}>
          <Text numberOfLines={12}>{rowsPreview}</Text>
        </View>
      </View>

      <Text style={{ marginTop: 12, opacity: 0.7 }}>
        Tip: create a table like "notes" with RLS policies to test reads.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: { width: '100%', maxWidth: 520, padding: 16, borderRadius: 12, borderWidth: 1, opacity: 0.95 },
  label: { fontSize: 16, marginBottom: 6 },
  sub: { fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8 },
  previewBox: { borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 120 },
})
