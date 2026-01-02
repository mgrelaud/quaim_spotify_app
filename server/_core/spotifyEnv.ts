/**
 * Spotify API configuration
 * These environment variables need to be set by the user
 */

export const SPOTIFY_ENV = {
  clientId: process.env.SPOTIFY_CLIENT_ID || "",
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
  redirectUri: process.env.SPOTIFY_REDIRECT_URI || "",
};

export function validateSpotifyEnv(): boolean {
  return !!(
    SPOTIFY_ENV.clientId &&
    SPOTIFY_ENV.clientSecret &&
    SPOTIFY_ENV.redirectUri
  );
}
