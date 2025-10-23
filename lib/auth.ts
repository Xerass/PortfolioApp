// lib/auth.ts
import { supabase } from './supabase'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'

export async function signUpEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signInEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export function onAuthStateChange(cb: (session: Session | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event: AuthChangeEvent, session: Session | null) => cb(session)
  )
  return () => subscription.unsubscribe()
}

export async function signOut() {
  await supabase.auth.signOut()
}
