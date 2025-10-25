import React, { useState } from 'react'
import { StyleSheet, TextInput, Button, Alert, View, Linking, Platform } from 'react-native'
import { Text } from '@/components/Themed'

const ADMIN_EMAIL = process.env.EXPO_PUBLIC_ADMIN_EMAIL || 'admin@example.com'

export default function ContactsScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  async function onSend() {
    if (!message.trim()) return Alert.alert('Validation', 'Please enter a message')

    const subject = `Portfolio contact from ${name || email || 'visitor'}`
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`
    const mailto = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    try {
      // Open the user's email client as a safe default
      const supported = await Linking.canOpenURL(mailto)
      if (supported) {
        await Linking.openURL(mailto)
      } else {
        // Fallback: try window location for web
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = mailto
        } else {
          Alert.alert('Unable to open mail client', `Please email ${ADMIN_EMAIL} manually.`)
        }
      }
    } catch (e: any) {
      console.log('mailto error', e)
      Alert.alert('Error', e.message ?? String(e))
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Admin</Text>

      <Text style={styles.label}>Your name</Text>
  <TextInput placeholder="Name" placeholderTextColor="#8A99B5" value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Your email</Text>
  <TextInput placeholder="you@example.com" placeholderTextColor="#8A99B5" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />

      <Text style={styles.label}>Message</Text>
  <TextInput placeholder="Hello..." placeholderTextColor="#8A99B5" value={message} onChangeText={setMessage} style={[styles.input, { height: 120 }]} multiline />

      <View style={{ height: 12 }} />
      <Button title="Send to Admin" onPress={onSend} />

      <Text style={styles.note}>This will open your mail client to send the message to the admin email.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0B1220' },
  title: { fontSize: 20, color: '#6FB3FF', fontWeight: '700', marginBottom: 12 },
  label: { color: '#A5B4C3', marginBottom: 6 },
  input: { backgroundColor: '#0F1726', borderRadius: 8, padding: 10, color: '#E6EDF3', borderWidth: 1, borderColor: '#1E2A44' },
  note: { color: '#8A99B5', marginTop: 12 },
})
