// Simple integration layer between TMDB API and UI components

import { 
  getBasicRecommendations,
  getMixedRecommendations,
  SimpleMovie
} from './recommendations';
import { 
  loadMovieData
} from './movieStorage';

/**
 * Simple movie recommendation interface for UI integration
 */
export interface UIRecommendation {
  id: string;
  title: string;
  year?: number;
  genre: string;
  rating: number;
  poster?: string;
  reason: string;
  score: number;
  confidence: number;
}

/**
 * Simple recommendation service for UI components
 * Uses TMDB API with basic filtering - no complex algorithms
 */
export class RecommendationService {
  private static instance: RecommendationService;

  static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  /**
   * Get simple movie recommendations for the UI - optimized for speed
   * Uses TMDB API with basic user list filtering
   */
  async getRecommendationsForUI(
    _candidates?: any[], // Ignored - we use TMDB API directly
    limit: number = 10
  ): Promise<UIRecommendation[]> {
    try {
      // Get user lists for filtering - use cached data if available
      const storage = loadMovieData();
      const userLists = {
        watchedList: storage.lists.watchedList || [],
        blockedMovies: storage.lists.blockedMovies || []
      };

      // Get recommendations from TMDB API - use faster method
      const recommendations = await getBasicRecommendations(userLists);
      
      // If we got recommendations, convert to UI format
      if (recommendations && recommendations.length > 0) {
        return this.convertToUIFormat(recommendations, limit);
      }
      
      // If no recommendations, use fallback
      throw new Error('No recommendations from API');

    } catch (error) {
      console.warn('Error getting recommendations, using fallback:', error);
      // Fallback to cached recommendations if available
      return this.getFallbackRecommendations(limit);
    }
  }

  /**
   * Get a single recommendation for the main UI display
   */
  async getSingleRecommendation(): Promise<UIRecommendation | null> {
    const recommendations = await this.getRecommendationsForUI([], 1);
    return recommendations.length > 0 ? recommendations[0] : null;
  }

  /**
   * Simple update function - no complex state management
   * Just logs the action for potential future use
   */
  async updateRecommendationState(
    action: 'like' | 'dislike' | 'rate' | 'skip',
    movieData: {
      id: string;
      title: string;
      genre?: string;
      userRating?: number;
    }
  ): Promise<void> {
    // Simple logging - no complex preference tracking
    console.log(`User ${action} movie: ${movieData.title}`);
    // In a simple system, we don't need to update complex state
    // The movie storage functions handle list updates directly
  }

  /**
   * Simple explanation based on basic criteria
   */
  getRecommendationExplanation(hasWatchedMovies: boolean = false): string {
    if (!hasWatchedMovies) {
      return "Popular movie you might enjoy";
    }
    return "Recommended based on popular choices";
  }

  /**
   * Convert simple movies to UI format
   */
  private convertToUIFormat(movies: SimpleMovie[], limit: number): UIRecommendation[] {
    const storage = loadMovieData();
    const hasWatchedMovies = storage.lists.watchedList.length > 0;

    return movies.slice(0, limit).map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.year,
      genre: movie.genre || 'Unknown',
      rating: movie.rating,
      poster: movie.poster,
      reason: this.getRecommendationExplanation(hasWatchedMovies),
      score: movie.rating,
      confidence: 0.7 // Fixed confidence for simplicity
    }));
  }

  /**
   * Fallback recommendations when API fails - optimized for offline scenarios
   */
  private async getFallbackRecommendations(limit: number): Promise<UIRecommendation[]> {
    // Return minimal hardcoded recommendations immediately for reliability
    const hardcodedRecommendations = [
      {
        id: '550',
        title: 'Fight Club',
        year: 1999,
        genre: 'Drama',
        rating: 4.2,
        poster: undefined,
        reason: 'Popular movie (offline)',
        score: 4.2,
        confidence: 0.5
      },
      {
        id: '278',
        title: 'The Shawshank Redemption',
        year: 1994,
        genre: 'Drama',
        rating: 4.4,
        poster: undefined,
        reason: 'Highly rated (offline)',
        score: 4.4,
        confidence: 0.5
      },
      {
        id: '13',
        title: 'Forrest Gump',
        year: 1994,
        genre: 'Comedy',
        rating: 4.3,
        poster: undefined,
        reason: 'Classic movie (offline)',
        score: 4.3,
        confidence: 0.5
      },
      {
        id: '238',
        title: 'The Godfather',
        year: 1972,
        genre: 'Crime',
        rating: 4.4,
        poster: undefined,
        reason: 'Masterpiece (offline)',
        score: 4.4,
        confidence: 0.5
      },
      {
        id: '680',
        title: 'Pulp Fiction',
        year: 1994,
        genre: 'Crime',
        rating: 4.3,
        poster: undefined,
        reason: 'Cult classic (offline)',
        score: 4.3,
        confidence: 0.5
      }
    ];

    return hardcodedRecommendations.slice(0, limit);
  }
}

/**
 * Convenience function to get the recommendation service instance
 */
export const getRecommendationService = (): RecommendationService => {
  return RecommendationService.getInstance();
};

/**
 * Simple hook for UI components to get recommendation data
 * Uses TMDB API directly - no complex candidate processing
 */
export const useRecommendations = async (
  _candidates?: any[], // Ignored in simple implementation
  limit: number = 10
): Promise<UIRecommendation[]> => {
  const service = getRecommendationService();
  return service.getRecommendationsForUI([], limit);
};

/**
 * Simple hook for UI components to update recommendation state
 * Just logs actions - no complex state management
 */
export const updateRecommendationState = async (
  action: 'like' | 'dislike' | 'rate' | 'skip',
  movieData: {
    id: string;
    title: string;
    genre?: string;
    userRating?: number;
  }
): Promise<void> => {
  const service = getRecommendationService();
  return service.updateRecommendationState(action, movieData);
};

/**
 * Simple stats function - no complex analytics
 */
export const getRecommendationStats = () => {
  const storage = loadMovieData();
  
  return {
    watchedMovies: storage.lists.watchedList.length,
    myListMovies: storage.lists.myList.length,
    blockedMovies: storage.lists.blockedMovies.length,
    lastUpdate: Date.now()
  };
};