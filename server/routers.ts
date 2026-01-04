import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  spotify: router({
    // Get Spotify authorization URL
    getAuthUrl: publicProcedure.query(async () => {
      const { getSpotifyAuthUrl } = await import("./spotify");
      const { validateSpotifyEnv } = await import("./_core/spotifyEnv");
      
      if (!validateSpotifyEnv()) {
        throw new Error("Spotify credentials not configured");
      }
      
      // Generate a random state for CSRF protection
      const state = Math.random().toString(36).substring(7);
      const authUrl = getSpotifyAuthUrl(state);
      
      return { authUrl, state };
    }),

    // Handle OAuth callback and store tokens
    handleCallback: publicProcedure
      .input(z.object({ code: z.string(), userId: z.number() }))
      .mutation(async ({ input }) => {
        const { exchangeCodeForToken, getUserProfile } = await import("./spotify");
        const { upsertSpotifyProfile } = await import("./db");
        
        // Exchange code for tokens
        const tokenData = await exchangeCodeForToken(input.code);
        const userProfile = await getUserProfile(tokenData.access_token);
        
        // Calculate token expiration
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
        
        // Store in database
        await upsertSpotifyProfile({
          userId: input.userId,
          spotifyId: userProfile.id,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || "",
          tokenExpiresAt: expiresAt,
          lastSynced: new Date(),
        });
        
        return { success: true, spotifyId: userProfile.id };
      }),

    // Get Spotify connection status
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const { getSpotifyProfileByUserId } = await import("./db");
      const profile = await getSpotifyProfileByUserId(ctx.user.id);
      
      return {
        connected: !!profile,
        lastSynced: profile?.lastSynced,
        spotifyId: profile?.spotifyId,
      };
    }),

    // Sync musical profile from Spotify
    syncProfile: protectedProcedure.mutation(async ({ ctx }) => {
      const { getSpotifyProfileByUserId, upsertSpotifyProfile } = await import("./db");
      const { refreshAccessToken } = await import("./spotify");
      const { buildMusicalProfile } = await import("./musicalProfile");
      
      let profile = await getSpotifyProfileByUserId(ctx.user.id);
      
      if (!profile) {
        throw new Error("Spotify not connected");
      }
      
      // Check if token needs refresh
      const now = new Date();
      if (profile.tokenExpiresAt <= now) {
        const tokenData = await refreshAccessToken(profile.refreshToken);
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
        
        await upsertSpotifyProfile({
          userId: ctx.user.id,
          spotifyId: profile.spotifyId,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || profile.refreshToken,
          tokenExpiresAt: expiresAt,
          lastSynced: new Date(),
        });
        
        // Refresh profile object
        profile = await getSpotifyProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Failed to refresh profile");
      }
      
      // Build musical profile
      await buildMusicalProfile(ctx.user.id, profile.accessToken);
      
      return { success: true };
    }),

    // Get user's musical profile
    getMusicalProfile: protectedProcedure.query(async ({ ctx }) => {
      const { getMusicalProfileByUserId } = await import("./db");
      const { parseMusicalProfile } = await import("./musicalProfile");
      
      const profile = await getMusicalProfileByUserId(ctx.user.id);
      
      if (!profile) {
        return null;
      }
      
      return {
        ...parseMusicalProfile(profile),
        lastCalculated: profile.lastCalculated,
      };
    }),
  }),

  matching: router({
    // Get all matches for the current user
    getMatches: protectedProcedure.query(async ({ ctx }) => {
      const { calculateAllMatches } = await import("./matching");
      const { getEventById } = await import("./db");
      
      const matches = await calculateAllMatches(ctx.user.id);
      
      // Enrich matches with event data
      const enrichedMatches = await Promise.all(
        matches.map(async (match) => {
          const event = await getEventById(match.eventId);
          return {
            ...match,
            event,
          };
        })
      );
      
      return enrichedMatches;
    }),
  }),
});

export type AppRouter = typeof appRouter;
