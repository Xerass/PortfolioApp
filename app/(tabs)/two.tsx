import { useEffect, useState } from 'react'
import { StyleSheet, TextInput, Button, Alert, TouchableOpacity, View as RNView } from 'react-native'
import { Text, View } from '@/components/Themed'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function TabTwoScreen() {
  const [clientOk, setClientOk] = useState<'...' | '✅' | '❌'>('...')
  const [sessionOk, setSessionOk] = useState<'...' | '✅' | '❌'>('...')
  const [adminOk, setAdminOk] = useState<'...' | '✅' | '❌'>('...')
  const [roleLabel, setRoleLabel] = useState<string>('(unknown)')
  const [roleError, setRoleError] = useState<string | null>(null)   // <-- error tracker
  const [table, setTable] = useState('')
  const [rowsPreview, setRowsPreview] = useState<string>('(no data)')
  const router = useRouter()

  // --- 1) Check env vars
  useEffect(() => {
    const hasUrl = !!process.env.EXPO_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    setClientOk(hasUrl && hasKey ? '✅' : '❌')
  }, [])

  // --- 2) Ping Supabase (session)
  useEffect(() => {
    ;(async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        setSessionOk(data.session ? '✅' : '❌')
      } catch (e) {
        console.log('[getSession error]', e)
        setSessionOk('❌')
      }
    })()
  }, [])

  // --- 3) Check current user's role & admin (with detailed error reporting)
  useEffect(() => {
    checkRoleAndAdmin()
  }, [])

  async function checkRoleAndAdmin() {
    setRoleError(null)
    setAdminOk('...')
    setRoleLabel('(checking)')
    try {
      // get current user
      const { data: userRes, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      const user = userRes.user
      if (!user) {
        setRoleLabel('(signed out)')
        setAdminOk('❌')
        return
      }

      // A) preferred: RPC uses auth.uid() on server
      const { data: isAdmin, error: rpcErr } = await supabase.rpc('is_current_user_admin')
      console.log('[RPC is_current_user_admin]', { isAdmin, rpcErr })

      if (rpcErr) {
        // show exact RPC error
        setRoleError(`RPC is_current_user_admin failed: ${rpcErr.message}`)
      } else {
        setAdminOk(isAdmin === true ? '✅' : '❌')
      }

      // B) also fetch explicit role row (policy allows reading own row)
      const { data: roleRow, error: roleErr } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      console.log('[select user_roles]', { roleRow, roleErr })

      if (roleErr) {
        setRoleLabel('(no access)')
        setRoleError(prev =>
          prev ? `${prev} | user_roles read failed: ${roleErr.message}` : `user_roles read failed: ${roleErr.message}`
        )
      } else {
        setRoleLabel(roleRow?.role ?? '(no row)')
        // if RPC errored, infer admin from role row
        if (rpcErr) setAdminOk(roleRow?.role === 'admin' ? '✅' : '❌')
      }
    } catch (e: any) {
      console.log('[role/admin check error]', e)
      setRoleLabel('(error)')
      setAdminOk('❌')
      setRoleError(e?.message ?? String(e))
    }
  }

  // --- 4) Test read
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

  // --- 5) Admin-only test: try to insert into projects (RLS requires admin)
  async function tryAdminInsert() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: 'Admin test project',
          description: 'This should only succeed for admins via RLS.',
          published: true,
          tools: ['react-native', 'supabase'],
        })
        .select()
        .single()

      if (error) throw error
      Alert.alert('Insert OK', `Created project: ${data?.title ?? '(no title)'}`)
    } catch (e: any) {
      // If not admin, expect 401/403 RLS error
      Alert.alert('Insert blocked', e.message ?? String(e))
    }
  }

  // --- 6) Logout
  async function onLogout() {
    try {
      await supabase.auth.signOut()
      Alert.alert('Signed out', 'You have been logged out.')
      router.replace('/login') // adjust to '/(auth)/login' if that’s your route
    } catch (e: any) {
      Alert.alert('Logout failed', e.message ?? String(e))
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Playground</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Client initialized (envs present): {clientOk}</Text>
        <Text style={styles.label}>auth.getSession() ping: {sessionOk}</Text>
        <Text style={styles.label}>current role: {roleLabel}</Text>
        <Text style={styles.label}>is admin: {adminOk}</Text>

        {/* Error banner (shows exact reason) */}
        {roleError ? (
          <RNView style={styles.errBox}>
            <Text style={{ color: '#E6EDF3' }}>{roleError}</Text>
          </RNView>
        ) : null}

        <View style={{ height: 8 }} />
        <Button title="Refresh status" onPress={checkRoleAndAdmin} />

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

        <View style={{ height: 16 }} />
        <Button title="Admin test: insert into projects" onPress={tryAdminInsert} />
      </View>

      <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 12, opacity: 0.7 }}>
        Tip: ensure your RLS & policies are in place and that you seeded your role row.
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
  logoutBtn: {
    marginTop: 24,
    backgroundColor: '#6FB3FF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutText: { color: '#0B1220', fontWeight: '700' },

  // Error banner style (dark theme friendly)
  errBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#90414f',
    backgroundColor: '#3b1e27',
    padding: 8,
    borderRadius: 8,
  },
})
