import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

// --- Colors copied from your index.tsx theme ---
const COLORS = {
  accent: '#6FB3FF',
  bg: '#0B1220',
  surface: '#111A2C',
  border: '#1E2A44',
  text: '#E6EDF3',
  muted: '#A5B4C3',
};

const REMEMBER_KEY = 'remember_me';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'info' | 'error' | 'success'; msg: string } | null>(null);

  function show(kind: 'info' | 'error' | 'success', msg: string) {
    setNotice({ kind, msg });
    console.log(`[${kind}]`, msg);
    setTimeout(() => setNotice(null), 4000); // auto-hide after 4s
  }

  // If already logged in AND remember_me was true → skip to tabs
  useEffect(() => {
    (async () => {
      try {
        const remembered = (await AsyncStorage.getItem(REMEMBER_KEY)) === '1';
        const { data: { session } } = await supabase.auth.getSession();
        if (remembered && session) {
          router.replace('/(tabs)');
        }
      } catch {}
    })();
  }, []);

  async function onSignIn() {
    if (!email || !password) {
      show('error', 'Enter email and password.');
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      await AsyncStorage.setItem(REMEMBER_KEY, remember ? '1' : '0');
      show('success', 'Signed in! Redirecting…');

      setTimeout(() => router.replace('/(tabs)'), 1000);
    } catch (e: any) {
      show('error', e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onSignUp() {
    if (!email || !password) {
      show('error', 'Enter email and password.');
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      show('info', 'We sent a confirmation link. Check your email.');
    } catch (e: any) {
      show('error', e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to continue</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />

        <View style={styles.rememberRow}>
          <Switch
            value={remember}
            onValueChange={setRemember}
            ios_backgroundColor="#2A334A"
            trackColor={{ false: '#2A334A', true: '#2A334A' }}
            thumbColor={remember ? COLORS.accent : '#64708A'}
            style={{ transform: [{ scale: Platform.OS === 'web' ? 0.9 : 1 }] }}
          />
          <Text style={styles.muted}>Stay signed in</Text>
        </View>

        {notice && (
          <View
            style={[
              styles.banner,
              notice.kind === 'error' && { backgroundColor: '#3b1e27', borderColor: '#90414f' },
              notice.kind === 'info' && { backgroundColor: '#1b2738', borderColor: '#3b4d6b' },
              notice.kind === 'success' && { backgroundColor: '#1d2b21', borderColor: '#3f6e4d' },
            ]}
          >
            <Text style={{ color: COLORS.text }}>{notice.msg}</Text>
          </View>
        )}

        <TouchableOpacity disabled={busy} onPress={onSignIn} style={[styles.btn, busy && { opacity: 0.6 }]}>
          <Text style={styles.btnText}>{busy ? 'Signing in…' : 'Sign In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity disabled={busy} onPress={onSignUp} style={[styles.linkBtn, busy && { opacity: 0.6 }]}>
          <Text style={styles.linkText}>Create an account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const { bg, surface, border, text, muted, accent } = COLORS;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: surface,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 16,
    padding: 18,
  },
  title: { fontSize: 22, color: text, fontWeight: '700', textAlign: 'center' },
  sub: { fontSize: 14, color: muted, textAlign: 'center', marginTop: 4, marginBottom: 14 },
  label: { fontSize: 13, color: muted, marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: 10,
    padding: 12,
    color: text,
    backgroundColor: '#0F1726',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  muted: { color: muted, fontSize: 13 },
  banner: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  btn: {
    backgroundColor: accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: { color: '#0B1220', fontWeight: '700' },
  linkBtn: { paddingVertical: 12, alignItems: 'center' },
  linkText: { color: accent },
  footerHint: { color: muted, fontSize: 12, marginTop: 14 },
});
