import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

export default function LoginScreen() {
  const handleSpotifyLogin = () => {
    // Spotify OAuth implementation will go here
    console.log('Spotify Login pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.geometricBackground}>
        {/* Decorative geometric shapes */}
        <View style={[styles.triangle, styles.triangleTopLeft]} />
        <View style={[styles.square, styles.squareBottomRight]} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>QUAI M</Text>
          <View style={styles.logoUnderline} />
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            SYNCHRONISEZ VOTRE MUSIQUE.
          </Text>
          <Text style={styles.description}>
            TROUVEZ VOS CONCERTS.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleSpotifyLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>SE CONNECTER AVEC SPOTIFY</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  geometricBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    position: 'absolute',
  },
  triangleTopLeft: {
    top: -50,
    left: -50,
    borderLeftWidth: 200,
    borderRightWidth: 0,
    borderBottomWidth: 200,
    borderLeftColor: '#ffffff',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    opacity: 0.1,
  },
  square: {
    width: 300,
    height: 300,
    backgroundColor: '#ffffff',
    position: 'absolute',
    opacity: 0.05,
    transform: [{ rotate: '45deg' }],
  },
  squareBottomRight: {
    bottom: -150,
    right: -150,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 60,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
  },
  logoUnderline: {
    height: 8,
    backgroundColor: '#ffffff',
    width: 80,
    marginTop: -5,
  },
  descriptionContainer: {
    marginBottom: 80,
  },
  description: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 2,
    lineHeight: 28,
  },
  loginButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    // Sharp corners for geometric style
    borderRadius: 0,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
