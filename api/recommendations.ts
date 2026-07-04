import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";
import { FALLBACK_DATABASE } from "../src/fallbackDatabase";

function getFallbackMovies(genreKey: string): any[] {
  const pool = FALLBACK_DATABASE[genreKey] || FALLBACK_DATABASE["drama"];
  // Shuffle and select exactly 5 unique movies
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);

  // Apply slight live metric variations (+/- 2%) to simulate real-time live-updating ratings
  return selected.map((movie, index) => {
    const jitter = Math.floor(Math.random() * 5) - 2; // -2 to +2
    const popularityScore = Math.min(100, Math.max(70, movie.popularityScore + jitter));
    const ratingPercentage = Math.min(100, Math.max(70, movie.ratingPercentage + jitter));
    
    return {
      ...movie,
      popularityScore,
      ratingPercentage,
      id: `${movie.id}_rec_${Date.now()}_${index}` // ensure fresh, unique keys to trigger animation updates
    };
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { genre } = req.body;
    if (!genre) {
      return res.status(400).json({ error: "Genre is required" });
    }

    const normalizedGenre = genre.toLowerCase().trim();

    // Check if Gemini API Key is available
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      console.log(`[VERCEL API] No Gemini API key detected. Using fallback database for: ${genre}`);
      const fallbackMovies = getFallbackMovies(normalizedGenre);
      return res.status(200).json({
        source: "global_trend_database_offline",
        genre: genre,
        movies: fallbackMovies
      });
    }

    console.log(`[VERCEL API] Gemini API Key detected. Fetching global trend movie recommendations for: ${genre}`);
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    const timestampSeed = Date.now();
    const prompt = `
      You are a highly advanced movie recommendation engine connected to a database of global movie ratings, containing over 50 million reviews from platforms like IMDb, Letterboxd, and Rotten Tomatoes.
      
      The user wants recommendations for the genre: "${genre}".
      
      Current Request Timestamp/Seed: ${timestampSeed}. 
      To ensure the movie recommendation feed feels completely active, fresh, and live-updating, you MUST vary your selections. Do NOT return the exact same 5 movies if the user requests again. Select from a wide variety of highly rated classic and contemporary masterpieces in this genre.
      
      Provide exactly 5 highly-rated, popular, and currently trending movies in the genre "${genre}" (or closely matching it).
      Your recommendations should feel incredibly real, accurate, and include realistic rating metrics (IMDb-like rating out of 10, votes count representing millions of users, popularity scores, etc.).
      
      Provide the response in INDONESIAN language for titles (if commonly known in Indonesia, like "A Quiet Place" or "Laskar Pelangi"), synopsis, and trendReason.
      
      You must return a JSON object with a single root key "movies" containing an array of 5 movie objects.
      Each movie object in the "movies" array must match the provided response schema exactly.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              movies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Unique string ID (e.g. gemini-1)" },
                    title: { type: Type.STRING, description: "Movie title" },
                    year: { type: Type.INTEGER, description: "Release year" },
                    rating: { type: Type.NUMBER, description: "Decimal rating out of 10 (e.g. 8.4)" },
                    votesCount: { type: Type.STRING, description: "Number of reviews/votes (e.g. 1.2M ratings)" },
                    genres: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of genres"
                    },
                    director: { type: Type.STRING, description: "Director name" },
                    cast: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of 3-4 lead cast members"
                    },
                    synopsis: { type: Type.STRING, description: "Short engaging plot summary in Indonesian (approx 2 sentences)" },
                    trendReason: { type: Type.STRING, description: "Why this movie is trending in our global ratings database (in Indonesian)" },
                    popularityScore: { type: Type.INTEGER, description: "A number between 70 and 100 indicating popularity trend" },
                    ratingPercentage: { type: Type.INTEGER, description: "Rating equivalent percentage (e.g. 92% Rotten Tomatoes score)" },
                    bannerColor: { type: Type.STRING, description: "A Tailwind gradient CSS class combination like: from-purple-600 to-indigo-950" }
                  },
                  required: [
                    "id", "title", "year", "rating", "votesCount", "genres", "director", "cast", "synopsis", "trendReason", "popularityScore", "ratingPercentage", "bannerColor"
                  ]
                },
                description: "Array of exactly 5 movie objects"
              }
            },
            required: ["movies"]
          }
        }
      });

      const textResponse = response.text ? response.text.trim() : "";
      if (!textResponse) {
        throw new Error("Empty response from Gemini");
      }

      const parsedData = JSON.parse(textResponse);
      if (parsedData && Array.isArray(parsedData.movies) && parsedData.movies.length > 0) {
        // Map unique postfixed IDs to guarantee fresh animation cycles
        const moviesWithUniqueIds = parsedData.movies.map((m: any, idx: number) => ({
          ...m,
          id: `${m.id}_gemini_${timestampSeed}_${idx}`
        }));

        return res.status(200).json({
          source: "gemini_trend_engine",
          genre: genre,
          movies: moviesWithUniqueIds
        });
      } else {
        throw new Error("Invalid structure from Gemini response");
      }
    } catch (geminiError) {
      console.error("[VERCEL API] Error calling Gemini API, falling back to local dataset:", geminiError);
      const fallbackMovies = getFallbackMovies(normalizedGenre);
      return res.status(200).json({
        source: "global_trend_database_fallback",
        genre: genre,
        movies: fallbackMovies,
        error: "Failed to connect to real-time Gemini feed. Displaying high-quality offline rating cache."
      });
    }

  } catch (error: any) {
    console.error("[VERCEL API] General route handler error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
