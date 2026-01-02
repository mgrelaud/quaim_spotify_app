export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
/*   console.log("Base URL récupérée :", import.meta.env.VITE_OAUTH_SERVER_URL);
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  console.log("url :", url);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString(); */
    // On récupère la variable brute
  const baseUrl = import.meta.env.VITE_OAUTH_SERVER_URL || "";
  
  // On nettoie les espaces éventuels et le slash final
  const cleanBase = baseUrl.trim().replace(/\/$/, "");
  
  // On construit la chaîne manuellement SANS utiliser 'new URL()'
  const loginPath = "/api/auth/login";
  
  const finalUrl = cleanBase ? `${cleanBase}${loginPath}` : loginPath;
  
  console.log("URL de login générée :", finalUrl);
  return finalUrl;
};
