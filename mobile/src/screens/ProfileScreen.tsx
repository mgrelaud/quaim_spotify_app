import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { trpc } from '../lib/trpc';
import { User, Settings, LogOut, RefreshCw } from 'lucide-react-native';

export default function ProfileScreen({ navigation }: any) {
  const userQuery = trpc.auth.me.useQuery();
  const spotifyStatusQuery = trpc.spotify.getStatus.useQuery();
  const musicalProfileQuery = trpc.spotify.getMusicalProfile.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleSync = () => {
    navigation.navigate('Sync');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <User color="#ffffff" size={40} strokeWidth={1} />
          </View>
          <Text style={styles.userName}>{userQuery.data?.name || 'UTILISATEUR'}</Text>
          <Text style={styles.userEmail}>{userQuery.data?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFIL MUSICAL</Text>
          <View style={styles.genreGrid}>
            {musicalProfileQuery.data?.topGenres.slice(0, 6).map((genre: string, index: number) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SPOTIFY</Text>
          <View style={styles.statusBox}>
            <View style={[styles.statusIndicator, { backgroundColor: spotifyStatusQuery.data?.connected ? '#ffffff' : '#333333' }]} />
            <Text style={styles.statusText}>
              {spotifyStatusQuery.data?.connected ? 'CONNECTÉ' : 'NON CONNECTÉ'}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleSync}>
             <RefreshCw color="#000000" size={20} />
             <Text style={styles.actionButtonText}>SYNCHRONISER À NOUVEAU</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings color="#ffffff" size={20} />
            <Text style={styles.footerButtonText}>RÉGLAGES</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut color="#ffffff" size={20} />
            <Text style={styles.footerButtonText}>DÉCONNEXION</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  userEmail: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '300',
    opacity: 0.7,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffffff',
    paddingLeft: 10,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreTag: {
    borderWidth: 1,
    borderColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  genreText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    marginRight: 10,
    transform: [{ rotate: '45deg' }],
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 10,
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
  footer: {
    marginTop: 20,
    gap: 15,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 10,
  },
  footerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 2,
  },
});
