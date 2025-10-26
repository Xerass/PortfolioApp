import React, { useState } from 'react'
import { StyleSheet, TextInput, Alert, View, Linking, Platform, Image, Dimensions, TouchableOpacity } from 'react-native'
import { Text } from '@/components/Themed'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

const SCREEN_HEIGHT = Dimensions.get('window').height
const ADMIN_EMAIL = 'mapa.jomarjake.dagmil@gmail.com'
const HERO_BG = require('@/assets/images/bgHero.jpg') // use same image as Home

// JetBrains Mono helpers
const MONO_REG = { fontFamily: 'JetBrainsMono-Regular', fontWeight: 'normal' as const }
const MONO_BOLD = { fontFamily: 'JetBrainsMono-Bold', fontWeight: 'normal' as const }

export default function ContactsScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  async function onSend() {
    if (!message.trim()) return Alert.alert('Validation', 'Please enter a message')

    const subject = `Portfolio contact from ${name || email || 'visitor'}`
    const body = `Name: ${name || '(no name)'}\nEmail: ${email || '(no email)'}\n\n${message}`
    const mailto = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    try {
      const supported = await Linking.canOpenURL(mailto)
      if (supported) {
        await Linking.openURL(mailto)
      } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.href = mailto
      } else {
        Alert.alert('Unable to open mail client', `Please email ${ADMIN_EMAIL} manually.`)
      }
    } catch (e: any) {
      console.log('mailto error', e)
      Alert.alert('Error', e.message ?? String(e))
    }
  }

  return (
    <View style={styles.screen}>
      {/* === BACKDROP (bleed image + blur + fade) === */}
      <View pointerEvents="none" style={styles.backdropWrap}>
        <Image source={HERO_BG} style={styles.backdropImage} resizeMode="cover" />
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={[
            'rgba(11,18,32,0)',
            'rgba(11,18,32,0.35)',
            'rgba(11,18,32,0.7)',
            '#0B1220'
          ]}
          locations={[0.2, 0.55, 0.8, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* === CONTENT === */}
      <View style={styles.container}>
        <Text style={styles.title}>Contact Admin</Text>

        <Text style={styles.label}>Your name</Text>
        <TextInput
          placeholder="Name"
          placeholderTextColor="#8A99B5"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <Text style={styles.label}>Your email</Text>
        <TextInput
          placeholder="you@example.com"
          placeholderTextColor="#8A99B5"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          placeholder="Hello..."
          placeholderTextColor="#8A99B5"
          value={message}
          onChangeText={setMessage}
          style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
          multiline
        />

        <View style={{ height: 12 }} />

        {/* Styled button so JetBrains Mono applies */}
        <TouchableOpacity onPress={onSend} activeOpacity={0.85} style={styles.btn}>
          <Text style={styles.btnText}>Send to Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B1220' },

  // === BACKGROUND BLEED + BLUR ===
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

  // === MAIN CONTAINER WITH TOP/BOTTOM PADDING ===
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: SCREEN_HEIGHT * 0.05,      // 5% of screen height
    paddingBottom: SCREEN_HEIGHT * 0.1,    // 10% of screen height
    backgroundColor: 'transparent',
  },

  // === TEXT STYLES ===
  title: {
    ...MONO_BOLD,
    fontSize: 20,
    color: '#6FB3FF',
    marginBottom: 12,
  },
  label: { ...MONO_REG, color: '#A5B4C3', marginBottom: 6 },
  input: {
    ...MONO_REG,
    backgroundColor: '#0F1726',
    borderRadius: 8,
    padding: 10,
    color: '#E6EDF3',
    borderWidth: 1,
    borderColor: '#1E2A44',
    marginBottom: 10,
  },
  note: { ...MONO_REG, color: '#8A99B5', marginTop: 12, fontSize: 12 },

  // Button styles
  btn: {
    backgroundColor: '#1A2642',
    borderWidth: 1,
    borderColor: '#2D406B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { ...MONO_BOLD, fontSize: 14, color: '#6FB3FF', letterSpacing: 0.2 },
})
