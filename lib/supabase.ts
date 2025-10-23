// lib/supabase.ts
import 'react-native-url-polyfill/auto'
import { Platform } from 'react-native'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!
const pk  = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// During SSR (no window) we must not touch real storage
const isServer = typeof window === 'undefined'
const isWeb    = Platform.OS === 'web'

// Minimal no-op storage for SSR
const serverStorage = {
  getItem: async (_key: string) => null,
  setItem: async (_key: string, _value: string) => {},
  removeItem: async (_key: string) => {},
}

// On native: AsyncStorage; on SSR: no-op; on web client: let supabase use browser storage
const storage = isServer ? serverStorage : (isWeb ? undefined : AsyncStorage)

export const supabase = createClient(url, pk, {
  auth: {
    storage,
    // Don’t try to refresh/persist on the Node server during SSR
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: false,
  },
})
