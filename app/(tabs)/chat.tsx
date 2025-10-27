import React, { useRef, useState, useMemo } from 'react'
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native'
import { Text } from '@/components/Themed'
import { GoogleGenAI } from '@google/genai'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

/* ==== THEME / CONST ==== */
const SCREEN_HEIGHT = Dimensions.get('window').height
const HERO_BG = require('@/assets/images/bgHero.jpg')
const MONO_REG = { fontFamily: 'JetBrainsMono-Regular', fontWeight: 'normal' as const }
const MONO_BOLD = { fontFamily: 'JetBrainsMono-Bold', fontWeight: 'normal' as const }
// Space so the input (and last messages) aren’t hidden under the tab bar
const TABBAR_SPACER = 92

// Read your key from env (put in .env/.env.local with EXPO_PUBLIC_ prefix)
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GENAI_API_KEY as string

type Msg = { id: string; role: 'user' | 'assistant'; text: string }

export default function ChatGeminiTab() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'hello', role: 'assistant', text: 'Hi! I am the FREE TIER of Google AI API! Ask me anything about the projects here to help you understand!' },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef<FlatList<Msg>>(null)

  const ai = useMemo(() => (API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null), [])

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    if (!ai) {
      setMessages(m => [
        ...m,
        { id: String(Math.random()), role: 'assistant', text: 'API key missing. Add EXPO_PUBLIC_GOOGLE_GENAI_API_KEY in your .env.' },
      ])
      return
    }

    setInput('')
    const userMsg: Msg = { id: String(Math.random()), role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setBusy(true)

    try {
      const recent = [...messages.slice(-6), userMsg]
      const prompt = recent.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n') + '\nAssistant:'

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      })

      const replyText = (response as any)?.text ?? '…'
      setMessages(prev => [...prev, { id: String(Math.random()), role: 'assistant', text: String(replyText).trim() || '…' }])
    } catch (e: any) {
      setMessages(prev => [...prev, { id: String(Math.random()), role: 'assistant', text: `Error: ${e?.message || String(e)}` }])
    } finally {
      setBusy(false)
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50)
    }
  }

  return (
    <View style={styles.screen}>
      {/* === BACKDROP (bleed image + blur + fade) === */}
      <View pointerEvents="none" style={styles.backdropWrap}>
        <Image source={HERO_BG} style={styles.backdropImage} resizeMode="cover" />
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(11,18,32,0)', 'rgba(11,18,32,0.35)', 'rgba(11,18,32,0.7)', '#0B1220']}
          locations={[0.2, 0.55, 0.8, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* === CONTENT CONTAINER === */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.user : styles.bot]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
            </View>
          )}
        />

        {/* Input dock (inside container), lifted above tab bar */}
        <View style={styles.inputDock}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message…"
            placeholderTextColor="#8A99B5"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={send}
            activeOpacity={0.85}
            style={[styles.sendBtn, busy && { opacity: 0.6 }]}
            disabled={busy}
          >
            {busy ? <ActivityIndicator /> : <Text style={styles.sendText}>Send</Text>}
          </TouchableOpacity>
        </View>

        {/* Spacer so the dock + last messages never sit under the tab bar */}
        <View style={{ height: TABBAR_SPACER }} />
      </KeyboardAvoidingView>
    </View>
  )
}

/* ==== STYLES ==== */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B1220' },

  // Backdrop (bleed)
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

  // Main container with padding to match other screens
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: SCREEN_HEIGHT * 0.05,
  },

  list: { paddingBottom: 12, gap: 8 },

  bubble: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: '90%',
  },
  user: { alignSelf: 'flex-end', backgroundColor: '#111A2C', borderColor: '#1E2A44' },
  bot: { alignSelf: 'flex-start', backgroundColor: '#0F1726', borderColor: '#1E2A44' },
  bubbleText: { ...MONO_REG, color: '#E6EDF3' },

  // Input dock (inside content container)
  inputDock: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
  },
  textInput: {
    ...MONO_REG,
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#0F1726',
    color: '#E6EDF3',
    borderWidth: 1,
    borderColor: '#1E2A44',
  },
  sendBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D406B',
    backgroundColor: '#1A2642',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { ...MONO_BOLD, color: '#6FB3FF' },
})
