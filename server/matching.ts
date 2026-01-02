import { parseMusicalProfile } from "./musicalProfile";

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

export interface MatchResult {
  eventId: number;
  score: number; // 0-100
  genreScore: number;
  featureScore: number;
  tag: "very_match" | "close" | "discovery" | "out_of_zone";
}

/**
 * Calculate Jaccard similarity between two genre distributions
 * Returns a value between 0 and 1
 */
function calculateGenreSimilarity(
  userGenres: GenreDistribution,
  artistGenres: string[]
): number {
  if (artistGenres.length === 0) {
    return 0;
  }

  const userGenreSet = new Set(Object.keys(userGenres));
  const artistGenreSet = new Set(artistGenres.map((g) => g.toLowerCase()));

  // Calculate intersection and union
  const intersection = new Set(
    Array.from(userGenreSet).filter((g) => artistGenreSet.has(g))
  );
  const union = new Set([...Array.from(userGenreSet), ...Array.from(artistGenreSet)]);

  if (union.size === 0) {
    return 0;
  }

  // Jaccard similarity
  const jaccard = intersection.size / union.size;

  // Weight by user's preference for matched genres
  let weightedScore = 0;
  for (const genre of Array.from(intersection)) {
    weightedScore += userGenres[genre] || 0;
  }

  // Combine Jaccard with weighted preference
  return (jaccard * 0.5 + weightedScore * 0.5);
}

/**
 * Calculate Euclidean distance between audio features
 * Returns a value between 0 and 1 (0 = identical, 1 = very different)
 */
function calculateFeatureSimilarity(
  userFeatures: AudioFeaturesAverage,
  artistFeatures: AudioFeaturesAverage
): number {
  // Normalize tempo to 0-1 range (assuming tempo is between 0-250 BPM)
  const normalizedUserTempo = userFeatures.tempo / 250;
  const normalizedArtistTempo = artistFeatures.tempo / 250;

  // Calculate squared differences for each feature
  const energyDiff = Math.pow(userFeatures.energy - artistFeatures.energy, 2);
  const tempoDiff = Math.pow(normalizedUserTempo - normalizedArtistTempo, 2);
  const valenceDiff = Math.pow(userFeatures.valence - artistFeatures.valence, 2);
  const danceabilityDiff = Math.pow(
    userFeatures.danceability - artistFeatures.danceability,
    2
  );
  const acousticnessDiff = Math.pow(
    userFeatures.acousticness - artistFeatures.acousticness,
    2
  );
  const instrumentalnessDiff = Math.pow(
    userFeatures.instrumentalness - artistFeatures.instrumentalness,
    2
  );

  // Calculate Euclidean distance
  const distance = Math.sqrt(
    energyDiff +
      tempoDiff +
      valenceDiff +
      danceabilityDiff +
      acousticnessDiff +
      instrumentalnessDiff
  );

  // Normalize distance to 0-1 range (max possible distance is sqrt(6) ≈ 2.45)
  const normalizedDistance = distance / 2.45;

  // Convert distance to similarity (1 - distance)
  return Math.max(0, 1 - normalizedDistance);
}

/**
 * Calculate match score between user profile and event
 */
export function calculateMatchScore(
  userProfile: {
    genreDistribution: GenreDistribution;
    avgFeatures: AudioFeaturesAverage;
    topArtists: string[];
  },
  eventArtist: {
    genres: string[];
    avgFeatures: AudioFeaturesAverage;
  },
  eventSimilarArtists?: string[]
): { score: number; genreScore: number; featureScore: number; similarArtistBonus: number } {
  // Calculate genre similarity (0-1)
  const genreSimilarity = calculateGenreSimilarity(
    userProfile.genreDistribution,
    eventArtist.genres
  );

  // Calculate feature similarity (0-1)
  const featureSimilarity = calculateFeatureSimilarity(
    userProfile.avgFeatures,
    eventArtist.avgFeatures
  );

  // Calculate bonus for similar artists match
  let similarArtistBonus = 0;
  if (eventSimilarArtists && eventSimilarArtists.length > 0 && userProfile.topArtists) {
    // Normalize artist names for comparison (lowercase, trim)
    const userArtistsNormalized = userProfile.topArtists.map((a) =>
      a.toLowerCase().trim()
    );
    const similarArtistsNormalized = eventSimilarArtists.map((a) =>
      a.toLowerCase().trim()
    );

    // Count matches
    let matchCount = 0;
    for (const similarArtist of similarArtistsNormalized) {
      if (userArtistsNormalized.includes(similarArtist)) {
        matchCount++;
      }
    }

    // Bonus: +15 points per match, max +30 points
    similarArtistBonus = Math.min(matchCount * 15, 30);
  }

  // Weight: 55% genres, 35% features, +10% similar artists bonus
  const genreWeight = 0.55;
  const featureWeight = 0.35;

  const genreScore = genreSimilarity * 100;
  const featureScore = featureSimilarity * 100;
  const baseScore =
    genreSimilarity * genreWeight * 100 + featureSimilarity * featureWeight * 100;
  
  // Add similar artist bonus to final score
  const finalScore = baseScore + similarArtistBonus;

  return {
    score: Math.round(finalScore * 10) / 10, // Round to 1 decimal
    genreScore: Math.round(genreScore * 10) / 10,
    featureScore: Math.round(featureScore * 10) / 10,
    similarArtistBonus: Math.round(similarArtistBonus * 10) / 10,
  };
}

/**
 * Assign a tag based on the match score
 */
export function assignMatchTag(
  score: number
): "very_match" | "close" | "discovery" | "out_of_zone" {
  if (score >= 70) {
    return "very_match";
  } else if (score >= 50) {
    return "close";
  } else if (score >= 30) {
    return "discovery";
  } else {
    return "out_of_zone";
  }
}

/**
 * Parse artist data from database record
 */
export function parseArtistProfile(artist: any): {
  genres: string[];
  avgFeatures: AudioFeaturesAverage;
} {
  return {
    genres: artist.genres ? JSON.parse(artist.genres) : [],
    avgFeatures: {
      energy: parseFloat(artist.avgEnergy || "0"),
      tempo: parseFloat(artist.avgTempo || "0"),
      valence: parseFloat(artist.avgValence || "0"),
      danceability: parseFloat(artist.avgDanceability || "0"),
      acousticness: parseFloat(artist.avgAcousticness || "0"),
      instrumentalness: parseFloat(artist.avgInstrumentalness || "0"),
    },
  };
}

/**
 * Calculate match scores for all events for a user
 */
export async function calculateAllMatches(
  userId: number
): Promise<MatchResult[]> {
  const { getMusicalProfileByUserId, getAllUpcomingEvents, getArtistByName } =
    await import("./db");

  // Get user's musical profile
  const userProfile = await getMusicalProfileByUserId(userId);
  if (!userProfile) {
    console.warn(`[Matching] No musical profile found for user ${userId}`);
    return [];
  }

  const parsedUserProfile = parseMusicalProfile(userProfile);

  // Get all upcoming events
  const events = await getAllUpcomingEvents();
  console.log(`[Matching] Calculating matches for ${events.length} events`);

  const matches: MatchResult[] = [];

  for (const event of events) {
    // Get artist data
    const artist = await getArtistByName(event.artistName);

    if (!artist || !artist.genres) {
      // Skip if artist not enriched yet
      continue;
    }

    const artistProfile = parseArtistProfile(artist);

    // Parse similar artists from event
    const eventSimilarArtists = event.similarArtists
      ? JSON.parse(event.similarArtists)
      : undefined;

    // Calculate match score with similar artists bonus
    const { score, genreScore, featureScore, similarArtistBonus } = calculateMatchScore(
      parsedUserProfile,
      artistProfile,
      eventSimilarArtists
    );

    const tag = assignMatchTag(score);

    matches.push({
      eventId: event.id,
      score,
      genreScore,
      featureScore,
      tag,
    });
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  console.log(`[Matching] Calculated ${matches.length} matches`);
  return matches;
}
