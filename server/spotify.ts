import axios from "axios";
import { SPOTIFY_ENV } from "./_core/spotifyEnv";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_ACCOUNTS_BASE = "https://accounts.spotify.com";

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images: Array<{ url: string }>;
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    images: Array<{ url: string }>;
  };
}

export interface SpotifyAudioFeatures {
  id: string;
  energy: number;
  tempo: number;
  valence: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string }>;
}

/**
 * Generate Spotify authorization URL
 */
export function getSpotifyAuthUrl(state: string): string {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-library-read",
  ];

  const params = new URLSearchParams({
    client_id: SPOTIFY_ENV.clientId,
    response_type: "code",
    redirect_uri: SPOTIFY_ENV.redirectUri,
    scope: scopes.join(" "),
    state,
  });

  return `${SPOTIFY_ACCOUNTS_BASE}/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string
): Promise<SpotifyTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: SPOTIFY_ENV.redirectUri,
  });

  const response = await axios.post<SpotifyTokenResponse>(
    `${SPOTIFY_ACCOUNTS_BASE}/api/token`,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_ENV.clientId}:${SPOTIFY_ENV.clientSecret}`
        ).toString("base64")}`,
      },
    }
  );

  return response.data;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<SpotifyTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await axios.post<SpotifyTokenResponse>(
    `${SPOTIFY_ACCOUNTS_BASE}/api/token`,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_ENV.clientId}:${SPOTIFY_ENV.clientSecret}`
        ).toString("base64")}`,
      },
    }
  );

  return response.data;
}

/**
 * Get current user's Spotify profile
 */
export async function getUserProfile(
  accessToken: string
): Promise<SpotifyUserProfile> {
  const response = await axios.get<SpotifyUserProfile>(
    `${SPOTIFY_API_BASE}/me`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.data;
}

/**
 * Get user's top artists
 */
export async function getTopArtists(
  accessToken: string,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit: number = 50
): Promise<SpotifyArtist[]> {
  const response = await axios.get<{ items: SpotifyArtist[] }>(
    `${SPOTIFY_API_BASE}/me/top/artists`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { time_range: timeRange, limit },
    }
  );
  return response.data.items;
}

/**
 * Get user's top tracks
 */
export async function getTopTracks(
  accessToken: string,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit: number = 50
): Promise<SpotifyTrack[]> {
  const response = await axios.get<{ items: SpotifyTrack[] }>(
    `${SPOTIFY_API_BASE}/me/top/tracks`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { time_range: timeRange, limit },
    }
  );
  return response.data.items;
}

/**
 * Get user's saved tracks (liked songs)
 */
export async function getSavedTracks(
  accessToken: string,
  limit: number = 50
): Promise<SpotifyTrack[]> {
  const response = await axios.get<{ items: Array<{ track: SpotifyTrack }> }>(
    `${SPOTIFY_API_BASE}/me/tracks`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit },
    }
  );
  return response.data.items.map((item) => item.track);
}

/**
 * Get audio features for multiple tracks
 */
export async function getAudioFeatures(
  accessToken: string,
  trackIds: string[]
): Promise<SpotifyAudioFeatures[]> {
  if (trackIds.length === 0) return [];

  const response = await axios.get<{ audio_features: SpotifyAudioFeatures[] }>(
    `${SPOTIFY_API_BASE}/audio-features`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { ids: trackIds.join(",") },
    }
  );
  return response.data.audio_features.filter((f) => f !== null);
}

/**
 * Search for an artist by name
 */
export async function searchArtist(
  accessToken: string,
  artistName: string
): Promise<SpotifyArtist | null> {
  try {
    const response = await axios.get<{ artists: { items: SpotifyArtist[] } }>(
      `${SPOTIFY_API_BASE}/search`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          q: artistName,
          type: "artist",
          limit: 1,
        },
      }
    );

    const artists = response.data.artists.items;
    return artists.length > 0 ? artists[0] : null;
  } catch (error) {
    console.error(`Error searching for artist ${artistName}:`, error);
    return null;
  }
}

/**
 * Get artist's top tracks
 */
export async function getArtistTopTracks(
  accessToken: string,
  artistId: string
): Promise<SpotifyTrack[]> {
  try {
    const response = await axios.get<{ tracks: SpotifyTrack[] }>(
      `${SPOTIFY_API_BASE}/artists/${artistId}/top-tracks`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { market: "FR" },
      }
    );
    return response.data.tracks;
  } catch (error) {
    console.error(`Error getting top tracks for artist ${artistId}:`, error);
    return [];
  }
}

/**
 * Get full artist details
 */
export async function getArtist(
  accessToken: string,
  artistId: string
): Promise<SpotifyArtist | null> {
  try {
    const response = await axios.get<SpotifyArtist>(
      `${SPOTIFY_API_BASE}/artists/${artistId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error getting artist ${artistId}:`, error);
    return null;
  }
}
