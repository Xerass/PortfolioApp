import { StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';

const AVATAR = require('@/assets/images/avatar.jpg');

/** Dark palette */
const ACCENT = '#6FB3FF';
const BG = '#0B1220';
const SURFACE = '#111A2C';
const CARD = '#0F1726';
const BORDER = '#1E2A44';
const TEXT = '#E6EDF3';
const MUTED = '#A5B4C3';

function SkillChip({ label }: { label: string }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HERO */}
      <View style={styles.hero}>
        {/* Darker avatar ring */}
        <View style={styles.avatarRing}>
          <Image source={AVATAR} style={styles.avatar} resizeMode="cover" />
        </View>

        <Text style={styles.welcome}>Welcome to my Portfolio</Text>

        <Text style={styles.headline}>
          Hi I’m <Text style={styles.headlineAccent}>Jomar Jake Mapa</Text>
        </Text>
        <Text style={styles.roleLine}>Developer</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>Jomar Jake Mapa</Text>
        <Text style={styles.tagline}>AI Developer | ML guy</Text>
      </View>

      {/* Bio */}
      <Text style={styles.bio}>
        Welcome to my portfolio! I enjoy games and stuffs and also developing AI/ML applications.
      </Text>

      {/* Skills */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.chipsWrap}>
          {[
            'React Native',
            'Expo',
            'TypeScript',
            'React',
            'Tailwind/RNW',
            'Supabase',
            'Node.js',
            'UI/UX',
            'Figma',
          ].map((s) => (
            <SkillChip key={s} label={s} />
          ))}
        </View>
      </View>

      {/* Projects */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Featured Projects</Text>
        <Text style={styles.sectionText}>[Projects preview will go here]</Text>
      </View>

      {/* Contact */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Get In Touch</Text>
        <Text style={styles.sectionText}>[Contact info / form will go here]</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 32,
    backgroundColor: BG,
  },

  /* === HERO === */
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarRing: {
    width: 140,
    height: 140,
    borderRadius: 140,
    backgroundColor: CARD, // now dark instead of white
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 124,
  },
  welcome: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 4,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT,
    textAlign: 'center',
    lineHeight: 32,
  },
  headlineAccent: {
    color: ACCENT,
  },
  roleLine: {
    fontSize: 22,
    fontWeight: '800',
    color: '#B8C6D8',
    textAlign: 'center',
    lineHeight: 26,
  },

  /* === HEADER === */
  header: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BORDER,
  },
  name: {
    fontSize: 32,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: MUTED,
  },

  bio: {
    fontSize: 15,
    color: MUTED,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },

  /* === CARDS === */
  sectionCard: {
    backgroundColor: SURFACE, // darker container
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: ACCENT,
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
  },

  /* === CHIPS === */
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#1A2642', // darker chip background
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2D406B',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACCENT,
  },
});
