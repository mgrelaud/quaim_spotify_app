import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  spotifyProfiles, 
  InsertSpotifyProfile,
  musicalProfiles,
  InsertMusicalProfile,
  events,
  InsertEvent,
  artists,
  InsertArtist
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Spotify Profile Management
export async function upsertSpotifyProfile(profile: InsertSpotifyProfile) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert Spotify profile: database not available");
    return;
  }

  await db.insert(spotifyProfiles).values(profile).onDuplicateKeyUpdate({
    set: {
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
      tokenExpiresAt: profile.tokenExpiresAt,
      lastSynced: profile.lastSynced,
      updatedAt: new Date(),
    },
  });
}

export async function getSpotifyProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(spotifyProfiles).where(eq(spotifyProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSpotifyProfileBySpotifyId(spotifyId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(spotifyProfiles).where(eq(spotifyProfiles.spotifyId, spotifyId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Musical Profile Management
export async function upsertMusicalProfile(profile: InsertMusicalProfile) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert musical profile: database not available");
    return;
  }

  await db.insert(musicalProfiles).values(profile).onDuplicateKeyUpdate({
    set: {
      genreDistribution: profile.genreDistribution,
      avgEnergy: profile.avgEnergy,
      avgTempo: profile.avgTempo,
      avgValence: profile.avgValence,
      avgDanceability: profile.avgDanceability,
      avgAcousticness: profile.avgAcousticness,
      avgInstrumentalness: profile.avgInstrumentalness,
      topArtists: profile.topArtists,
      topGenres: profile.topGenres,
      lastCalculated: profile.lastCalculated,
      updatedAt: new Date(),
    },
  });
}

export async function getMusicalProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(musicalProfiles).where(eq(musicalProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Event Management
export async function upsertEvent(event: InsertEvent) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert event: database not available");
    return;
  }

  await db.insert(events).values(event).onDuplicateKeyUpdate({
    set: {
      artistName: event.artistName,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      description: event.description,
      imageUrl: event.imageUrl,
      isNew: event.isNew,
      scrapedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function getAllUpcomingEvents() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const result = await db.select().from(events).where(sql`${events.eventDate} >= ${now}`);
  return result;
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEventByExternalId(externalId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(events).where(eq(events.externalId, externalId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function markEventsAsNotNew() {
  const db = await getDb();
  if (!db) return;

  await db.update(events).set({ isNew: 0 });
}

// Artist Management
export async function upsertArtist(artist: InsertArtist) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert artist: database not available");
    return;
  }

  const result = await db.insert(artists).values(artist).onDuplicateKeyUpdate({
    set: {
      genres: artist.genres,
      avgEnergy: artist.avgEnergy,
      avgTempo: artist.avgTempo,
      avgValence: artist.avgValence,
      avgDanceability: artist.avgDanceability,
      avgAcousticness: artist.avgAcousticness,
      avgInstrumentalness: artist.avgInstrumentalness,
      popularity: artist.popularity,
      imageUrl: artist.imageUrl,
      spotifyUrl: artist.spotifyUrl,
      lastEnriched: new Date(),
      updatedAt: new Date(),
    },
  });

  return result;
}

export async function getArtistByName(name: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(artists).where(eq(artists.name, name)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getArtistBySpotifyId(spotifyId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(artists).where(eq(artists.spotifyId, spotifyId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
