export interface Movie {
  id: string;
  title: string;
  year: number;
  rating: number;
  votesCount: string; // e.g. "2.4M ratings"
  genres: string[];
  director: string;
  cast: string[];
  synopsis: string;
  trendReason: string; // e.g., "Trending #3 global, +15% search spike this week"
  popularityScore: number; // 0-100 for visualization
  ratingPercentage: number; // e.g., 94 for Rotten Tomatoes equivalent
  bannerColor: string; // Tailwind color classes for card accent
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  favoriteGenres: string[];
  createdAt: string;
}

export interface RecommendationHistory {
  id: string;
  userId: string;
  genre: string;
  timestamp: string;
  movies: Movie[];
}
