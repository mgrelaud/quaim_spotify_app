import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import crypto from "crypto";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/auth/login", (req: Request, res: Response) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const scope = "user-read-private user-read-email";
  
  // Génération d'un state aléatoire pour la sécurité
  const state = crypto.randomBytes(16).toString("hex");
  
  // Optionnel : stocker le state dans un cookie pour le vérifier au retour
  res.cookie("spotify_auth_state", state, { maxAge: 900000, httpOnly: true } );

  const spotifyUrl = `https://accounts.spotify.com/authorize?` + 
    new URLSearchParams({
      response_type: "code",
      client_id: clientId!,
      scope: scope,
      redirect_uri: redirectUri!,
      state: state,
      show_dialog: "true"
    } ).toString();

  res.redirect(spotifyUrl);
});

 app.get("/api/oauth/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  const storedState = req.cookies ? req.cookies["spotify_auth_state"] : null;

  // 1. Vérification du state
  if (!state || state !== storedState) {
    return res.status(400).json({ error: "state_mismatch" });
  }
  res.clearCookie("spotify_auth_state");

  try {
    // 2. Échange du code contre un Access Token (via Spotify API)
    // C'est ici que vous appellerez votre sdk ou fetch directement
    const authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        grant_type: "authorization_code"
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET ).toString('base64'))
      },
      json: true
    };

    // Une fois le token reçu, vous utilisez votre db.upsertUser comme avant
    // ...
  } catch (error) {
    res.status(500).send("Erreur lors de l'authentification");
  }
});
}
