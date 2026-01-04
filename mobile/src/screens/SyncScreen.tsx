import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, Easing } from 'react-native';
import { trpc } from '../lib/trpc';

export default function SyncScreen({ navigation }: any) {
  const [progress] = useState(new Animated.Value(0));
  const syncMutation = trpc.spotify.syncProfile.useMutation();
  const [status, setStatus] = useState('ANALYSE DE VOTRE PROFIL...');

  useEffect(() => {
    // Simuler une progression géométrique
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const performSync = async () => {
      try {
        await syncMutation.mutateAsync();
        setStatus('SYNCHRONISATION TERMINÉE');
        setTimeout(() => {
          navigation.navigate('Main');
        }, 1000);
      } catch (error) {
        setStatus('ERREUR DE SYNCHRONISATION');
        console.error(error);
      }
    };

    performSync();
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>SYNCHRONISATION</Text>
        
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, { width }]} />
          {/* Decorative geometric overlay */}
          <View style={styles.progressOverlay} />
        </View>

        <Text style={styles.statusText}>{status}</Text>
        
        <View style={styles.geometricDecoration}>
          <View style={styles.square} />
          <View style={[styles.square, { transform: [{ rotate: '45deg' }], opacity: 0.3 }] } />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 40,
    textAlign: 'center',
  },
  progressContainer: {
    height: 40,
    borderWidth: 2,
    borderColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
  },
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Add some diagonal lines or patterns if needed
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 2,
    marginTop: 20,
    textAlign: 'center',
  },
  geometricDecoration: {
    marginTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  square: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#ffffff',
    position: 'absolute',
  },
});
