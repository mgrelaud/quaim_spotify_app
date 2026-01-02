import {
  getTopArtists,
  getTopTracks,
  getSavedTracks,
  getAudioFeatures,
  SpotifyArtist,
  SpotifyTrack,
  SpotifyAudioFeatures,
} from "./spotify";
import { upsertMusicalProfile } from "./db";
import { InsertMusicalProfile } from "../drizzle/schema";

interface GenreDistribution {
  [genre: string]: number;
}

interface AudioFeaturesAverage {
  energy: number;
  tempo: number;
  valence: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
}

/**
 * Calculate genre distribution from artists
 */
function calculateGenreDistribution(artists: SpotifyArtist[]): GenreDistribution {
  const genreCounts: { [genre: string]: number } = {};
  let totalGenres = 0;

  for (const artist of artists) {
    for (const genre of artist.genres) {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      totalGenres++;
    }
  }

  // Convert counts to percentages
  const distribution: GenreDistribution = {};
  for (const [genre, count] of Object.entries(genreCounts)) {
    distribution[genre] = count / totalGenres;
  }

  return distribution;
}

/**
 * Calculate average audio features from tracks
 */
function calculateAverageFeatures(
  features: SpotifyAudioFeatures[]
): AudioFeaturesAverage {
  if (features.length === 0) {
    return {
      energy: 0,
      tempo: 0,
      valence: 0,
      danceability: 0,
      acousticness: 0,
      instrumentalness: 0,
    };
  }

  const sum = features.reduce(
    (acc, f) => ({
      energy: acc.energy + f.energy,
      tempo: acc.tempo + f.tempo,
      valence: acc.valence + f.valence,
      danceability: acc.danceability + f.danceability,
      acousticness: acc.acousticness + f.acousticness,
      instrumentalness: acc.instrumentalness + f.instrumentalness,
    }),
    {
      energy: 0,
      tempo: 0,
      valence: 0,
      danceability: 0,
      acousticness: 0,
      instrumentalness: 0,
    }
  );

  return {
    energy: sum.energy / features.length,
    tempo: sum.tempo / features.length,
    valence: sum.valence / features.length,
    danceability: sum.danceability / features.length,
    acousticness: sum.acousticness / features.length,
    instrumentalness: sum.instrumentalness / features.length,
  };
}

/**
 * Get top genres sorted by frequency
 */
function getTopGenres(distribution: GenreDistribution, limit: number = 10): string[] {
  return Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre]) => genre);
}

/**
 * Build complete musical profile for a user
 */
export async function buildMusicalProfile(
  userId: number,
  accessToken: string
): Promise<void> {
  console.log(`[MusicalProfile] Building profile for user ${userId}`);

  // Fetch user's top artists (medium term = last 6 months)
  const topArtists = await getTopArtists(accessToken, "medium_term", 50);
  console.log(`[MusicalProfile] Fetched ${topArtists.length} top artists`);

  // Fetch user's top tracks
  const topTracks = await getTopTracks(accessToken, "medium_term", 50);
  console.log(`[MusicalProfile] Fetched ${topTracks.length} top tracks`);

  // Fetch saved tracks (liked songs)
  const savedTracks = await getSavedTracks(accessToken, 50);
  console.log(`[MusicalProfile] Fetched ${savedTracks.length} saved tracks`);

  // Combine all tracks
  const allTracks = [...topTracks, ...savedTracks];
  const uniqueTrackIds = Array.from(new Set(allTracks.map((t) => t.id)));

  // Get audio features for all tracks
  const audioFeatures = await getAudioFeatures(accessToken, uniqueTrackIds);
  console.log(`[MusicalProfile] Fetched audio features for ${audioFeatures.length} tracks`);

  // Calculate genre distribution from top artists
  const genreDistribution = calculateGenreDistribution(topArtists);
  const topGenres = getTopGenres(genreDistribution, 10);

  // Calculate average audio features
  const avgFeatures = calculateAverageFeatures(audioFeatures);

  // Prepare data for database
  const profile: InsertMusicalProfile = {
    userId,
    genreDistribution: JSON.stringify(genreDistribution),
    avgEnergy: avgFeatures.energy.toFixed(3),
    avgTempo: avgFeatures.tempo.toFixed(1),
    avgValence: avgFeatures.valence.toFixed(3),
    avgDanceability: avgFeatures.danceability.toFixed(3),
    avgAcousticness: avgFeatures.acousticness.toFixed(3),
    avgInstrumentalness: avgFeatures.instrumentalness.toFixed(3),
    topArtists: JSON.stringify(topArtists.slice(0, 20).map((a) => a.name)),
    topGenres: JSON.stringify(topGenres),
    lastCalculated: new Date(),
  };

  await upsertMusicalProfile(profile);
  console.log(`[MusicalProfile] Profile saved for user ${userId}`);
}

/**
 * Parse musical profile from database record
 */
export function parseMusicalProfile(profile: any): {
  genreDistribution: GenreDistribution;
  avgFeatures: AudioFeaturesAverage;
  topArtists: string[];
  topGenres: string[];
} {
  return {
    genreDistribution: JSON.parse(profile.genreDistribution || "{}"),
    avgFeatures: {
      energy: parseFloat(profile.avgEnergy || "0"),
      tempo: parseFloat(profile.avgTempo || "0"),
      valence: parseFloat(profile.avgValence || "0"),
      danceability: parseFloat(profile.avgDanceability || "0"),
      acousticness: parseFloat(profile.avgAcousticness || "0"),
      instrumentalness: parseFloat(profile.avgInstrumentalness || "0"),
    },
    topArtists: JSON.parse(profile.topArtists || "[]"),
    topGenres: JSON.parse(profile.topGenres || "[]"),
  };
}
