import React from 'react';
import { StyleSheet, Image, ImageBackground, TouchableOpacity, ScrollView, View } from 'react-native';
import { Text } from '@/components/Themed';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const AVATAR = require('@/assets/images/avatar.jpg');
const HERO_BG = require('@/assets/images/bgHero.jpg');

/* === THEME === */
const COLORS = {
  accent: '#6FB3FF',
  bg: '#0B1220',
  surface: '#111A2C',
  card: '#0F1726',
  border: '#1E2A44',
  text: '#E6EDF3',
  muted: '#A5B4C3',
};

// Small helpers to avoid repeating the family everywhere
const MONO_REG = { fontFamily: 'JetBrainsMono-Regular', fontWeight: 'normal' as const };
const MONO_BOLD = { fontFamily: 'JetBrainsMono-Bold', fontWeight: 'normal' as const };

function Chip({ label }: { label: string }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionCard({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      {/* === BACKDROP (bleed) === */}
      <View pointerEvents="none" style={styles.backdropWrap}>
        <Image source={HERO_BG} style={styles.backdropImage} resizeMode="cover" />
        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(11,18,32,0)', 'rgba(11,18,32,0.6)', COLORS.bg]}
          locations={[0.4, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <ScrollView style={styles.scroller} contentContainerStyle={styles.container}>
        {/* === HERO === */}
        <ImageBackground source={HERO_BG} resizeMode="cover" style={styles.heroBg}>
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.0)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View style={styles.avatarRing}>
              <Image source={AVATAR} style={styles.avatar} resizeMode="cover" />
            </View>
            <Text style={styles.welcome}>Welcome to my Portfolio</Text>
            <Text style={styles.headline}>
              Hi I’m <Text style={styles.headlineAccent}>Jomar Jake Mapa</Text>
            </Text>
            <Text style={styles.roleLine}>AI Developer • ML Engineer</Text>
          </View>
        </ImageBackground>

        {/* === HEADER CARD === */}
        <View style={styles.headerCard}>
          <Text style={styles.name}>Jomar Jake Mapa</Text>
          <Text style={styles.tagline}>AI Developer | ML guy</Text>
        </View>

        {/* === BIO === */}
        <Text style={styles.bio}>
          I build practical AI/ML apps, from computer vision and NLP to deployable models.
          I also love games, tinkering, and teaching what I learn.
        </Text>

        {/* === SKILLS === */}
        <SectionCard title="Skills">
          <View style={styles.chipsWrap}>
            {[
              'Python',
              'PyTorch',
              'TensorFlow',
              'Scikit-learn',
              'Pandas',
              'NumPy',
              'Data Visualization',
              'Deep Learning',
              'Computer Vision',
              'NLP',
              'Transfer Learning',
              'Model Deployment',
              'ONNX / TorchScript',
              'MLOps',
              'SQL',
              'Data Engineering',
              'AI Ethics',
            ].map((s) => (
              <Chip key={s} label={s} />
            ))}
          </View>
        </SectionCard>

        {/* === PROJECTS === */}
        <SectionCard title="Featured Projects">
          <Text style={styles.sectionText}>[Projects preview will go here]</Text>
        </SectionCard>

        {/* === CONTACT === */}
        <SectionCard title="Get In Touch">
          <Text style={styles.sectionText}>[Contact info / form will go here]</Text>
        </SectionCard>
      </ScrollView>
    </View>
  );
}

/* === STYLES === */
const { bg, surface, card, border, text, muted, accent } = COLORS;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: bg },

  // Backdrop sits behind everything and extends beyond edges to create the "bleed"
  backdropWrap: {
    position: 'absolute',
    top: -120,
    left: -40,
    right: -40,
    height: 320,
    borderRadius: 32,
    overflow: 'hidden',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },

  scroller: { backgroundColor: 'transparent' },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },

  /* HERO with its own crisp image + soft overlay */
  heroBg: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 16,
  },

  avatarRing: {
    width: 140,
    height: 140,
    borderRadius: 140,
    backgroundColor: card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: border,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: { width: 124, height: 124, borderRadius: 124 },

  // ======= TEXT STYLES (JetBrains Mono) =======
  welcome: { ...MONO_REG, fontSize: 13, color: muted, marginBottom: 4 },
  headline: {
    ...MONO_BOLD,
    fontSize: 28,
    color: text,
    textAlign: 'center',
    lineHeight: 32,
  },
  headlineAccent: { ...MONO_BOLD, color: '#0B1220' },
  roleLine: { ...MONO_BOLD, fontSize: 20, color: '#0B1220', textAlign: 'center', marginTop: 6 },

  headerCard: {
    backgroundColor: surface,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: border,
  },
  name: { ...MONO_BOLD, fontSize: 28, color: text, marginBottom: 6 },
  tagline: { ...MONO_REG, fontSize: 15, color: muted },

  bio: {
    ...MONO_REG,
    fontSize: 15,
    color: muted,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 18,
  },

  sectionCard: {
    backgroundColor: surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: border,
  },
  sectionTitle: {
    ...MONO_BOLD,
    fontSize: 18,
    color: accent,
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionText: { ...MONO_REG, fontSize: 14, color: muted, textAlign: 'center' },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#1A2642',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2D406B',
  },
  chipText: { ...MONO_REG, fontSize: 13, color: accent, letterSpacing: 0.2 },
});
