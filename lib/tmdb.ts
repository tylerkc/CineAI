// TMDB API utility functions

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Simple retry configuration
const RETRY_CONFIG = {
  maxRetries: 2,
  retryDelay: 500, // 500ms
  timeout: 5000 // 5 seconds
};

// Simple fetch with timeout and retry
const fetchWithRetry = async (url: string, retries = RETRY_CONFIG.maxRetries): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RETRY_CONFIG.timeout);

  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (retries > 0 && !controller.signal.aborted) {
      // Simple delay before retry
      await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay));
      return fetchWithRetry(url, retries - 1);
    }
    
    throw error;
  }
};

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  runtime?: number;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
}

export interface TMDBMovieDetails extends TMDBMovie {
  genres: { id: number; name: string }[];
  runtime: number;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; profile_path: string | null }[];
  };
  videos?: {
    results: TMDBVideo[];
  };
}

// Helper function to get full image URL
export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Search for movies
export const searchMovies = async (query: string, page: number = 1): Promise<TMDBSearchResponse> => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured');
  }

  try {
    const response = await fetchWithRetry(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    return response.json();
  } catch (error) {
    console.warn('Search movies failed:', error);
    throw new Error('Failed to search movies');
  }
};

// Get movie details by ID
export const getMovieDetails = async (movieId: number): Promise<TMDBMovieDetails> => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
  );

  if (!response.ok) {
    throw new Error('Failed to get movie details');
  }

  return response.json();
};

// Get popular movies
export const getPopularMovies = async (page: number = 1): Promise<TMDBSearchResponse> => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured');
  }

  try {
    const response = await fetchWithRetry(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
    );
    return response.json();
  } catch (error) {
    console.warn('Get popular movies failed:', error);
    throw new Error('Failed to get popular movies');
  }
};

// Get trending movies
export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'week'): Promise<TMDBSearchResponse> => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured');
  }

  try {
    const response = await fetchWithRetry(
      `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`
    );
    return response.json();
  } catch (error) {
    console.warn('Get trending movies failed:', error);
    throw new Error('Failed to get trending movies');
  }
};

// Get top rated movies
export const getTopRatedMovies = async (page: number = 1): Promise<TMDBSearchResponse> => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`
  );

  if (!response.ok) {
    throw new Error('Failed to get top rated movies');
  }

  return response.json();
};

// Get now playing movies
export const getNowPlayingMovies = async (page: number = 1): Promise<TMDBSearchResponse> => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`
  );

  if (!response.ok) {
    throw new Error('Failed to get now playing movies');
  }

  return response.json();
};

// Get upcoming movies
export const getUpcomingMovies = async (page: number = 1): Promise<TMDBSearchResponse> => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`
  );

  if (!response.ok) {
    throw new Error('Failed to get upcoming movies');
  }

  return response.json();
};

// Get the best trailer URL for a movie
export const getTrailerUrl = (movieDetails: TMDBMovieDetails): string | null => {
  if (!movieDetails.videos?.results) {
    return null;
  }

  // Filter for YouTube trailers
  const trailers = movieDetails.videos.results.filter(
    video => video.site === 'YouTube' && video.type === 'Trailer'
  );

  if (trailers.length === 0) {
    return null;
  }

  // Prefer "Official Trailer" or just take the first one
  const officialTrailer = trailers.find(trailer => 
    trailer.name.toLowerCase().includes('official trailer')
  );
  
  const selectedTrailer = officialTrailer || trailers[0];
  return `https://www.youtube.com/watch?v=${selectedTrailer.key}`;
};

// Get similar movies by movie ID
export const getSimilarMovies = async (movieId: number, page: number = 1): Promise<TMDBSearchResponse> => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&page=${page}`
  );

  if (!response.ok) {
    throw new Error('Failed to get similar movies');
  }

  return response.json();
};

// Get movie recommendations by movie ID
export const getMovieRecommendations = async (movieId: number, page: number = 1): Promise<TMDBSearchResponse> => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}&page=${page}`
  );

  if (!response.ok) {
    throw new Error('Failed to get movie recommendations');
  }

  return response.json();
};

// Cached fallback movies to avoid repeated fetch calls
let cachedFallbackMovies: TMDBMovie[] | null = null;

// Load fallback movies from local data with caching
const loadFallbackMovies = async (): Promise<TMDBMovie[]> => {
  // Return cached version if available
  if (cachedFallbackMovies) {
    return cachedFallbackMovies;
  }

  try {
    const response = await fetch('/data/fallback-movies.json');
    if (!response.ok) {
      throw new Error('Failed to load fallback data');
    }
    const data = await response.json();
    
    // Convert string IDs to numbers for consistency
    const movies = data.popular.map((movie: any) => ({
      ...movie,
      id: typeof movie.id === 'string' ? parseInt(movie.id) : movie.id
    }));
    
    // Cache the result
    cachedFallbackMovies = movies;
    return movies;
  } catch (error) {
    console.warn('Failed to load fallback movies:', error);
    
    // Return hardcoded fallback as last resort
    const hardcodedFallback = [
      {
        id: 550,
        title: "Fight Club",
        overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
        poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        backdrop_path: null,
        release_date: "1999-10-15",
        vote_average: 8.4,
        vote_count: 26280,
        genre_ids: [18, 53]
      },
      {
        id: 278,
        title: "The Shawshank Redemption",
        overview: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.",
        poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        backdrop_path: null,
        release_date: "1994-09-23",
        vote_average: 8.7,
        vote_count: 24916,
        genre_ids: [18, 80]
      }
    ];
    
    // Cache even the hardcoded fallback
    cachedFallbackMovies = hardcodedFallback;
    return hardcodedFallback;
  }
};

// Main recommendation function with optimized fallback system
export const getRecommendations = async (
  excludeWatchedIds: string[] = [],
  excludeBlockedIds: string[] = [],
  watchedMovies: any[] = []
): Promise<TMDBMovie[]> => {
  const excludeIds = [...excludeWatchedIds, ...excludeBlockedIds].map(id => parseInt(id));
  
  // Fast path: If no API key, go straight to fallback
  if (!TMDB_API_KEY) {
    console.warn('No TMDB API key, using fallback movies');
    const fallbackMovies = await loadFallbackMovies();
    return fallbackMovies.filter(movie => !excludeIds.includes(movie.id));
  }
  
  try {
    let recommendations: TMDBMovie[] = [];
    
    // Strategy 1: Get popular movies first (fastest and most reliable)
    try {
      const popular = await getPopularMovies();
      recommendations.push(...popular.results);
    } catch (error) {
      console.warn('Failed to get popular movies:', error);
    }
    
    // Strategy 2: Add trending if we need more variety
    if (recommendations.length < 15) {
      try {
        const trending = await getTrendingMovies();
        recommendations.push(...trending.results);
      } catch (error) {
        console.warn('Failed to get trending movies:', error);
      }
    }
    
    // Strategy 3: Only try personalized recommendations if we have basic ones
    if (recommendations.length > 0 && watchedMovies.length > 0) {
      const recentWatched = watchedMovies.slice(0, 2); // Limit to 2 for speed
      
      for (const movie of recentWatched) {
        try {
          const movieId = parseInt(movie.id);
          
          // Only try one method to avoid delays
          const similar = await getSimilarMovies(movieId);
          recommendations.push(...similar.results.slice(0, 5)); // Limit results
          
          if (recommendations.length >= 25) break; // Enough recommendations
        } catch (error) {
          console.warn(`Failed to get recommendations for movie ${movie.id}:`, error);
          // Don't retry, just continue
        }
      }
    }
    
    // Remove duplicates and excluded movies efficiently
    const seen = new Set<number>();
    const uniqueRecommendations = recommendations
      .filter(movie => {
        if (!movie || seen.has(movie.id) || excludeIds.includes(movie.id)) {
          return false;
        }
        seen.add(movie.id);
        return true;
      })
      .slice(0, 20); // Limit to 20 recommendations
    
    // If we got some results, return them
    if (uniqueRecommendations.length > 0) {
      return uniqueRecommendations;
    }
    
    // If no results, fall through to fallback
    throw new Error('No recommendations from API');
    
  } catch (error) {
    console.warn('TMDB API failed, using fallback movies:', error);
    
    // Fallback: Load local popular movies
    try {
      const fallbackMovies = await loadFallbackMovies();
      return fallbackMovies.filter(movie => !excludeIds.includes(movie.id));
    } catch (fallbackError) {
      console.error('Fallback movies also failed:', fallbackError);
      return []; // Return empty array as last resort
    }
  }
};

// Convert TMDB movie to our Movie interface
export const convertTMDBToMovie = (tmdbMovie: TMDBMovie | TMDBMovieDetails): {
  id: string;
  poster?: string;
  title: string;
  rating: number;
  year?: number;
  genre?: string;
} => {
  return {
    id: tmdbMovie.id.toString(),
    poster: tmdbMovie.poster_path ? getImageUrl(tmdbMovie.poster_path) : undefined,
    title: tmdbMovie.title,
    rating: Math.round(tmdbMovie.vote_average * 10) / 20, // Convert 0-10 to 0-5 stars
    year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : undefined,
    genre: 'genres' in tmdbMovie ? tmdbMovie.genres.map(g => g.name).join(', ') : undefined,
  };
};