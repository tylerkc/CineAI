// Simple movie recommendation system using TMDB API calls

import { 
  TMDBMovie,
  getPopularMovies, 
  getTrendingMovies, 
  getTopRatedMovies,
  convertTMDBToMovie 
} from './tmdb';

// Simple movie interface for recommendations
export interface SimpleMovie {
  id: string;
  title: string;
  year?: number;
  genre?: string;
  poster?: string;
  rating: number;
  synopsis?: string;
}

// User lists interface for filtering
export interface UserLists {
  watchedList: { id: string }[];
  blockedMovies: string[];
}

/**
 * Parse genre string by splitting on comma delimiter (preferred for ML)
 * Also handles legacy bullet point format for backward compatibility
 */
export const parseGenres = (genreString: string): string[] => {
  if (!genreString || typeof genreString !== 'string') {
    return [];
  }
  
  // Check if it contains commas (new format) or bullet points (legacy format)
  const delimiter = genreString.includes(',') ? ',' : ' • ';
  
  return genreString
    .split(delimiter)
    .map(genre => genre.trim())
    .filter(genre => genre.length > 0);
};

/**
 * Format genres for display with bullet points (looks better on frontend)
 * Takes comma-separated genre string and converts to bullet-separated for display
 */
export const formatGenresForDisplay = (genreString: string): string => {
  if (!genreString || typeof genreString !== 'string') {
    return '';
  }
  
  // If already has bullet points, return as-is
  if (genreString.includes(' • ')) {
    return genreString;
  }
  
  // Convert comma-separated to bullet-separated for display
  return genreString.replace(/,\s*/g, ' • ');
};

/**
 * Filter out movies that are already watched or blocked by the user
 * Simple filtering using basic array operations
 */
export const filterExcludedMovies = (
  movies: TMDBMovie[],
  userLists: UserLists
): TMDBMovie[] => {
  if (!movies || !Array.isArray(movies) || movies.length === 0) {
    return [];
  }

  if (!userLists) {
    return movies;
  }

  // Create exclusion set for fast lookup
  const excludedIds = new Set<string>();

  // Add watched movie IDs
  if (userLists.watchedList && Array.isArray(userLists.watchedList)) {
    userLists.watchedList.forEach(movie => {
      if (movie && movie.id) {
        excludedIds.add(movie.id);
      }
    });
  }

  // Add blocked movie IDs
  if (userLists.blockedMovies && Array.isArray(userLists.blockedMovies)) {
    userLists.blockedMovies.forEach(movieId => {
      if (movieId) {
        excludedIds.add(movieId);
      }
    });
  }

  // Filter out excluded movies
  return movies.filter(movie => 
    movie && movie.id && !excludedIds.has(movie.id.toString())
  );
};

/**
 * Get popular movie recommendations using TMDB API - optimized for speed
 * Simple implementation without complex scoring
 */
export const getPopularRecommendations = async (userLists?: UserLists): Promise<SimpleMovie[]> => {
  try {
    const response = await getPopularMovies(1);
    let movies = response.results;

    // Quick validation
    if (!movies || !Array.isArray(movies)) {
      throw new Error('Invalid response from TMDB API');
    }

    // Filter out excluded movies if user lists provided
    if (userLists) {
      movies = filterExcludedMovies(movies, userLists);
    }

    // Convert to simple movie format and return top 10 - optimized conversion
    return movies
      .slice(0, 10)
      .map(movie => {
        const converted = convertTMDBToMovie(movie);
        return {
          ...converted,
          synopsis: movie.overview || 'No description available'
        };
      });
  } catch (error) {
    console.warn('Error fetching popular recommendations:', error);
    return [];
  }
};

/**
 * Get trending movie recommendations using TMDB API
 * Simple implementation for trending content
 */
export const getTrendingRecommendations = async (userLists?: UserLists): Promise<SimpleMovie[]> => {
  try {
    const response = await getTrendingMovies('week');
    let movies = response.results;

    // Filter out excluded movies if user lists provided
    if (userLists) {
      movies = filterExcludedMovies(movies, userLists);
    }

    // Convert to simple movie format and return top 10
    return movies
      .slice(0, 10)
      .map(movie => ({
        ...convertTMDBToMovie(movie),
        synopsis: movie.overview
      }));
  } catch (error) {
    console.error('Error fetching trending recommendations:', error);
    return [];
  }
};

/**
 * Get top rated movie recommendations using TMDB API
 * Simple implementation for high-quality content
 */
export const getTopRatedRecommendations = async (userLists?: UserLists): Promise<SimpleMovie[]> => {
  try {
    const response = await getTopRatedMovies(1);
    let movies = response.results;

    // Filter out excluded movies if user lists provided
    if (userLists) {
      movies = filterExcludedMovies(movies, userLists);
    }

    // Convert to simple movie format and return top 10
    return movies
      .slice(0, 10)
      .map(movie => ({
        ...convertTMDBToMovie(movie),
        synopsis: movie.overview
      }));
  } catch (error) {
    console.error('Error fetching top rated recommendations:', error);
    return [];
  }
};

/**
 * Get basic movie recommendations - optimized for fast loading
 * Uses TMDB popular movies as the primary source with quick fallback
 */
export const getBasicRecommendations = async (userLists?: UserLists): Promise<SimpleMovie[]> => {
  try {
    // Try popular movies first (most reliable)
    const recommendations = await getPopularRecommendations(userLists);
    
    if (recommendations.length > 0) {
      return recommendations;
    }
    
    // Quick fallback to trending if popular fails
    return await getTrendingRecommendations(userLists);
  } catch (error) {
    console.warn('Basic recommendations failed:', error);
    
    // Return empty array to trigger fallback system
    return [];
  }
};

/**
 * Get mixed recommendations combining different TMDB endpoints
 * Simple approach without complex algorithms
 */
export const getMixedRecommendations = async (userLists?: UserLists): Promise<SimpleMovie[]> => {
  try {
    // Get a mix of popular, trending, and top rated
    const [popular, trending, topRated] = await Promise.all([
      getPopularRecommendations(userLists),
      getTrendingRecommendations(userLists),
      getTopRatedRecommendations(userLists)
    ]);

    // Simple mixing: take first few from each category
    const mixed: SimpleMovie[] = [];
    const maxPerCategory = 4;

    // Add movies from each category, avoiding duplicates
    const addedIds = new Set<string>();
    
    [popular, trending, topRated].forEach(categoryMovies => {
      let added = 0;
      for (const movie of categoryMovies) {
        if (!addedIds.has(movie.id) && added < maxPerCategory) {
          mixed.push(movie);
          addedIds.add(movie.id);
          added++;
        }
      }
    });

    return mixed.slice(0, 10); // Return max 10 recommendations
  } catch (error) {
    console.error('Error fetching mixed recommendations:', error);
    return getBasicRecommendations(userLists);
  }
};