import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Spotify profile data for each user
 * Stores OAuth tokens and refresh tokens for API access
 */
export const spotifyProfiles = mysqlTable("spotify_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  spotifyId: varchar("spotifyId", { length: 128 }).notNull().unique(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken").notNull(),
  tokenExpiresAt: timestamp("tokenExpiresAt").notNull(),
  lastSynced: timestamp("lastSynced"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SpotifyProfile = typeof spotifyProfiles.$inferSelect;
export type InsertSpotifyProfile = typeof spotifyProfiles.$inferInsert;

/**
 * User's musical profile computed from Spotify data
 * Stores genre distribution and average audio features
 */
export const musicalProfiles = mysqlTable("musical_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  // Genre distribution stored as JSON: { "indie rock": 0.35, "electronic": 0.25, ... }
  genreDistribution: text("genreDistribution").notNull(),
  // Average audio features
  avgEnergy: varchar("avgEnergy", { length: 10 }),
  avgTempo: varchar("avgTempo", { length: 10 }),
  avgValence: varchar("avgValence", { length: 10 }),
  avgDanceability: varchar("avgDanceability", { length: 10 }),
  avgAcousticness: varchar("avgAcousticness", { length: 10 }),
  avgInstrumentalness: varchar("avgInstrumentalness", { length: 10 }),
  topArtists: text("topArtists"), // JSON array of top artist names
  topGenres: text("topGenres"), // JSON array of top genres
  lastCalculated: timestamp("lastCalculated").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MusicalProfile = typeof musicalProfiles.$inferSelect;
export type InsertMusicalProfile = typeof musicalProfiles.$inferInsert;

/**
 * Events scraped from Quai M agenda
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("externalId", { length: 256 }).unique(), // URL or unique identifier from Quai M
  artistName: varchar("artistName", { length: 256 }).notNull(),
  eventDate: timestamp("eventDate").notNull(),
  eventTime: varchar("eventTime", { length: 50 }),
  description: text("description"),
  eventUrl: varchar("eventUrl", { length: 512 }),
  imageUrl: varchar("imageUrl", { length: 512 }),
  venue: varchar("venue", { length: 256 }).default("Quai M"),
  similarArtists: text("similarArtists"), // JSON array of similar artists suggested by Quai M
  isNew: int("isNew").default(1).notNull(),
  scrapedAt: timestamp("scrapedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Artist data enriched from Spotify API
 */
export const artists = mysqlTable("artists", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  spotifyId: varchar("spotifyId", { length: 128 }).unique(),
  genres: text("genres"), // JSON array of genres
  // Average audio features from artist's tracks
  avgEnergy: varchar("avgEnergy", { length: 10 }),
  avgTempo: varchar("avgTempo", { length: 10 }),
  avgValence: varchar("avgValence", { length: 10 }),
  avgDanceability: varchar("avgDanceability", { length: 10 }),
  avgAcousticness: varchar("avgAcousticness", { length: 10 }),
  avgInstrumentalness: varchar("avgInstrumentalness", { length: 10 }),
  popularity: int("popularity"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  spotifyUrl: varchar("spotifyUrl", { length: 512 }),
  lastEnriched: timestamp("lastEnriched"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Artist = typeof artists.$inferSelect;
export type InsertArtist = typeof artists.$inferInsert;

/**
 * Link events to artists (many-to-many)
 */
export const eventArtists = mysqlTable("event_artists", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull().references(() => events.id, { onDelete: "cascade" }),
  artistId: int("artistId").notNull().references(() => artists.id, { onDelete: "cascade" }),
  isPrimary: int("isPrimary").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventArtist = typeof eventArtists.$inferSelect;
export type InsertEventArtist = typeof eventArtists.$inferInsert;

/**
 * Match scores between users and events
 */
export const matchScores = mysqlTable("match_scores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventId: int("eventId").notNull().references(() => events.id, { onDelete: "cascade" }),
  score: varchar("score", { length: 10 }).notNull(), // 0-100+ compatibility score (can exceed 100 with bonus)
  genreScore: varchar("genreScore", { length: 10 }),
  featureScore: varchar("featureScore", { length: 10 }),
  similarArtistBonus: varchar("similarArtistBonus", { length: 10 }), // Bonus from similar artists match
  tag: mysqlEnum("tag", ["very_match", "close", "discovery", "out_of_zone"]).notNull(),
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MatchScore = typeof matchScores.$inferSelect;
export type InsertMatchScore = typeof matchScores.$inferInsert;

/**
 * Email notification preferences and history
 */
export const emailPreferences = mysqlTable("email_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  weeklyDigest: int("weeklyDigest").default(1).notNull(),
  newEventAlerts: int("newEventAlerts").default(1).notNull(),
  lastEmailSent: timestamp("lastEmailSent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailPreference = typeof emailPreferences.$inferSelect;
export type InsertEmailPreference = typeof emailPreferences.$inferInsert;