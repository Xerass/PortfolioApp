import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

const HERO_BG = require('@/assets/images/bgHero.jpg') // ← same image you used on Home

type Props = {
  top?: number
  height?: number
  bleed?: number
}

export default function Backdrop({ top = -160, height = 380, bleed = 40 }: Props) {
  return (
    <View pointerEvents="none" style={[
      styles.wrap,
      { top, left: -bleed, right: -bleed, height }
    ]}>
      <Image source={HERO_BG} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(11,18,32,0)', 'rgba(11,18,32,0.35)', 'rgba(11,18,32,0.7)', '#0B1220']}
        locations={[0.2, 0.55, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    borderRadius: 32,
    overflow: 'hidden',
    // leave zIndex unset so the backdrop sits above the parent's solid background
    // but underneath later-rendered screen content (the Stack screens).
  },
})
