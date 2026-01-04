import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity } from 'react-native';
import { trpc } from '../lib/trpc';
import { Ticket } from 'lucide-react-native';

export default function ConcertsScreen() {
  const matchesQuery = trpc.matching.getMatches.useQuery();

  const renderItem = ({ item }: any) => {
    const { event, score, tag } = item;
    
    // Geometric tag colors
    const tagStyles = {
      very_match: { bg: '#ffffff', text: '#000000', label: 'MATCH PARFAIT' },
      close: { bg: '#333333', text: '#ffffff', label: 'PROCHE' },
      discovery: { bg: '#666666', text: '#ffffff', label: 'DÉCOUVERTE' },
      out_of_zone: { bg: '#999999', text: '#ffffff', label: 'HORS ZONE' },
    }[tag as keyof typeof tagStyles] || { bg: '#000000', text: '#ffffff', label: 'INCONNU' };

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          {event.imageUrl ? (
            <Image source={{ uri: event.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ticket color="#ffffff" size={48} strokeWidth={1} />
            </View>
          )}
          <View style={[styles.scoreTag, { backgroundColor: tagStyles.bg }]}>
            <Text style={[styles.scoreText, { color: tagStyles.text }]}>{score}%</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.artistName}>{event.artistName.toUpperCase()}</Text>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{new Date(event.eventDate).toLocaleDateString('fr-FR')}</Text>
            <View style={styles.geometricDot} />
            <Text style={styles.dateText}>{event.eventTime}</Text>
          </View>
          
          <View style={[styles.typeBadge, { backgroundColor: tagStyles.bg }]}>
             <Text style={[styles.typeBadgeText, { color: tagStyles.text }]}>{tagStyles.label}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QUAI M</Text>
        <Text style={styles.headerSubtitle}>PROGRAMMATION</Text>
      </View>
      
      {matchesQuery.isLoading ? (
        <View style={styles.loadingContainer}>
           <Text style={styles.loadingText}>CHARGEMENT...</Text>
        </View>
      ) : (
        <FlatList
          data={matchesQuery.data}
          renderItem={renderItem}
          keyExtractor={(item) => item.eventId.toString()}
          contentContainerStyle={styles.listContent}
          numColumns={1}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerSubtitle: {
    color: '#ffffff',
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: '300',
    marginTop: -5,
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#ffffff',
    marginBottom: 20,
    flexDirection: 'row',
    height: 150,
  },
  imageContainer: {
    width: 120,
    height: '100%',
    position: 'relative',
    borderRightWidth: 1,
    borderRightColor: '#ffffff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '900',
  },
  cardContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  artistName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '300',
  },
  geometricDot: {
    width: 4,
    height: 4,
    backgroundColor: '#ffffff',
    marginHorizontal: 8,
    transform: [{ rotate: '45deg' }],
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    letterSpacing: 4,
  }
});
