import axios from "axios";
import * as cheerio from "cheerio";
import { InsertEvent } from "../drizzle/schema";

const QUAI_M_AGENDA_URL = "https://quai-m.fr/agenda";

export interface ScrapedEvent {
  externalId: string; // URL de l'événement
  artistName: string;
  eventDate: Date;
  eventTime: string;
  description: string;
  eventUrl: string;
  imageUrl?: string;
  genres: string[]; // Genres musicaux extraits
  eventType: string; // CONCERT, ATELIER, etc.
  similarArtists?: string[]; // Artistes similaires suggérés par le Quai M
}

/**
 * Parse date string from Quai M format
 * Example: "24 Janv. 2026 20:30" or "08 Janv. 2026"
 */
function parseQuaiMDate(dateStr: string): { date: Date; time: string } {
  const monthMap: { [key: string]: number } = {
    janv: 0,
    févr: 1,
    mars: 2,
    avr: 3,
    mai: 4,
    juin: 5,
    juil: 6,
    août: 7,
    sept: 8,
    oct: 9,
    nov: 10,
    déc: 11,
  };

  // Remove extra whitespace and normalize
  const normalized = dateStr.trim().toLowerCase();

  // Match pattern: "DD Month. YYYY HH:MM" or "DD Month. YYYY"
  const match = normalized.match(
    /(\d{1,2})\s+([a-zéû]+)\.?\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/
  );

  if (!match) {
    console.warn(`Could not parse date: ${dateStr}`);
    return { date: new Date(), time: "" };
  }

  const day = parseInt(match[1], 10);
  const monthStr = match[2].substring(0, 4); // Take first 4 chars
  const year = parseInt(match[3], 10);
  const hour = match[4] ? parseInt(match[4], 10) : 0;
  const minute = match[5] ? parseInt(match[5], 10) : 0;

  const month = monthMap[monthStr];
  if (month === undefined) {
    console.warn(`Unknown month: ${monthStr} in ${dateStr}`);
    return { date: new Date(), time: "" };
  }

  const date = new Date(year, month, day, hour, minute);
  const time = match[4] ? `${match[4]}:${match[5]}` : "";

  return { date, time };
}

/**
 * Extract genres from text like "CONCERT • RAP" or "CONCERT • JAZZ • POP"
 */
function extractGenres(text: string): string[] {
  const parts = text.split("•").map((p) => p.trim());
  // Filter out event types (CONCERT, ATELIER, etc.)
  const eventTypes = [
    "CONCERT",
    "ATELIER",
    "MASTERCLASS",
    "PROJECTION",
    "CONFÉRENCE",
    "JEUNE PUBLIC",
    "VISITE",
    "BLIND TEST",
    "FESTIVAL",
  ];
  return parts.filter((p) => !eventTypes.includes(p.toUpperCase()));
}

/**
 * Scrape events from Quai M agenda page
 */
export async function scrapeQuaiMAgenda(): Promise<ScrapedEvent[]> {
  console.log("[Scraper] Fetching Quai M agenda...");

  try {
    const response = await axios.get(QUAI_M_AGENDA_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const events: ScrapedEvent[] = [];

    // Find all event links on the page
    $('a[href^="/agenda/"]').each((_, element) => {
      const $el = $(element);
      const href = $el.attr("href");

      // Skip if not a valid event link or if it's just /agenda
      if (!href || href === "/agenda" || href.includes("?")) {
        return;
      }

      const fullUrl = `https://quai-m.fr${href}`;

      // Extract text content
      const text = $el.text().trim();

      // Try to find date pattern in the text
      const dateMatch = text.match(/\d{1,2}\s+[A-Za-zéû]+\.?\s+\d{4}/);
      if (!dateMatch) {
        return; // Skip if no date found
      }

      // Extract event type and genres (usually at the beginning)
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      let eventType = "CONCERT";
      let genres: string[] = [];
      let artistName = "";
      let dateStr = "";
      let timeStr = "";

      // Parse the structure
      for (const line of lines) {
        if (
          line.includes("•") &&
          (line.includes("CONCERT") ||
            line.includes("ATELIER") ||
            line.includes("MASTERCLASS"))
        ) {
          // This line contains event type and genres
          const parts = line.split("•").map((p) => p.trim());
          eventType = parts[0] || "CONCERT";
          genres = extractGenres(line);
        } else if (line.match(/\d{1,2}\s+[A-Za-zéû]+\.?\s+\d{4}/)) {
          // This line contains the date
          dateStr = line;
        } else if (
          line.length > 3 &&
          !line.includes("COMPLET") &&
          !line.includes("GRATUIT") &&
          !line.includes("CARTE QUAI M")
        ) {
          // This might be the artist name (longest meaningful line)
          if (line.length > artistName.length) {
            artistName = line;
          }
        }
      }

      // Clean up artist name (remove extra info)
      artistName = artistName
        .replace(/\+\s*1RE PARTIE/i, "")
        .replace(/AVEC\s+.*/i, "")
        .replace(/de\s+.*/i, "")
        .trim();

      if (!artistName || !dateStr) {
        return; // Skip if essential info is missing
      }

      const { date, time } = parseQuaiMDate(dateStr);

      events.push({
        externalId: fullUrl,
        artistName,
        eventDate: date,
        eventTime: time,
        description: text.substring(0, 500), // Store first 500 chars as description
        eventUrl: fullUrl,
        genres,
        eventType,
      });
    });

    console.log(`[Scraper] Found ${events.length} events`);
    return events;
  } catch (error) {
    console.error("[Scraper] Error scraping Quai M agenda:", error);
    return [];
  }
}

/**
 * Scrape detailed event page for additional information
 */
export async function scrapeEventDetails(eventUrl: string): Promise<{
  description: string;
  imageUrl?: string;
  similarArtists?: string[];
}> {
  try {
    const response = await axios.get(eventUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    // Extract full description
    let description = "";
    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 100) {
        description += text + "\n\n";
      }
    });

    // Extract image
    let imageUrl: string | undefined;
    const img = $('img[src*="quai-m"]').first();
    if (img.length) {
      imageUrl = img.attr("src");
      if (imageUrl && !imageUrl.startsWith("http")) {
        imageUrl = `https://quai-m.fr${imageUrl}`;
      }
    }

    // Extract similar artists from "Si vous aimez :"
    const similarArtists: string[] = [];
    
    // Try multiple selectors to find the "Si vous aimez" section
    const similarText = $('*:contains("Si vous aimez")').first().text();
    if (similarText) {
      const match = similarText.match(/Si vous aimez\s*[:\-]?\s*(.+)/i);
      if (match) {
        // Split by / or , and clean up
        const artists = match[1]
          .split(/[\/,]/)  
          .map((a) => a.trim())
          .filter((a) => a.length > 0 && a.length < 50); // Filter out garbage
        similarArtists.push(...artists);
      }
    }

    console.log(`[Scraper] Found ${similarArtists.length} similar artists for ${eventUrl}`);

    return {
      description: description.trim(),
      imageUrl,
      similarArtists: similarArtists.length > 0 ? similarArtists : undefined,
    };
  } catch (error) {
    console.error(`[Scraper] Error scraping event details ${eventUrl}:`, error);
    return { description: "" };
  }
}
