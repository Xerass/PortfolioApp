import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>Your Name</Text>
        <Text style={styles.tagline}>Mobile Developer | Web Enthusiast</Text>
      </View>

      {/* Bio */}
      <Text style={styles.bio}>
        Welcome to my portfolio! I build modern mobile and web apps with React
        Native, Expo, and Supabase. Here you’ll find a showcase of my projects
        and ways to get in touch.
      </Text>

      {/* Placeholder sections */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Featured Projects</Text>
        <Text style={styles.sectionText}>[Projects preview will go here]</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Get In Touch</Text>
        <Text style={styles.sectionText}>[Contact info / form will go here]</Text>
      </View>
    </View>
  );
}

const ACCENT = '#4A90E2'; // nice blue accent

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4, // subtle shadow (Android)
    shadowColor: '#000', // shadow (iOS)
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  name: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#e0e0e0',
  },
  bio: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: ACCENT,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});
