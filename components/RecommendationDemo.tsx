'use client';

import React, { useState, useEffect } from 'react';
import { 
  getRecommendationService, 
  updateRecommendationState,
  getRecommendationStats,
  type UIRecommendation 
} from '../lib/recommendationIntegration';
import { loadMovieData } from '../lib/movieStorage';

/**
 * Demo component showing recommendation system integration
 * This demonstrates how UI components can interact with the recommendation system
 */
export default function RecommendationDemo() {
  const [recommendations, setRecommendations] = useState<UIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [context, setContext] = useState<any>(null);

  // Sample movies are no longer needed - we use TMDB API directly

  const generateRecommendations = async () => {
    setLoading(true);
    
    // Update stats immediately for responsive UI
    setStats(getRecommendationStats());
    const storage = loadMovieData();
    setContext({
      watchedMovies: storage.lists.watchedList.length,
      myListMovies: storage.lists.myList.length,
      blockedMovies: storage.lists.blockedMovies.length
    });
    
    try {
      const service = getRecommendationService();
      
      // Use timeout to prevent hanging UI
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 8000)
      );
      
      const recommendationsPromise = service.getRecommendationsForUI([], 3);
      
      const recs = await Promise.race([recommendationsPromise, timeoutPromise]);
      setRecommendations(recs);
      
    } catch (error) {
      console.warn('Error generating recommendations:', error);
      
      // Set fallback recommendations to keep UI functional
      setRecommendations([
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
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieAction = async (action: 'like' | 'dislike' | 'rate' | 'skip', movie: UIRecommendation, rating?: number) => {
    try {
      // Update UI immediately for responsiveness
      console.log(`Action ${action} performed on ${movie.title}`);
      
      // Update state in background without blocking UI
      updateRecommendationState(action, {
        id: movie.id,
        title: movie.title,
        genre: movie.genre,
        userRating: rating
      }).catch(error => console.warn('Background state update failed:', error));

      // Only refresh if user explicitly requests it to avoid delays
      // generateRecommendations() can be called manually via the button
      
    } catch (error) {
      console.warn('Error handling movie action:', error);
      // Don't block UI for action errors
    }
  };

  useEffect(() => {
    generateRecommendations();
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Recommendation System Integration Demo</h1>
        
        {/* Controls */}
        <div className="mb-6">
          <button
            onClick={generateRecommendations}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Generating...' : 'Generate New Recommendations'}
          </button>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {recommendations.map((movie) => (
            <div key={movie.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{movie.year} • {movie.genre?.replace(/,\s*/g, ' • ')}</p>
              <p className="text-yellow-400 mb-2">★ {movie.rating.toFixed(1)}</p>
              <p className="text-gray-300 text-sm mb-3 italic">"{movie.reason}"</p>
              <p className="text-blue-400 text-xs mb-4">Confidence: {(movie.confidence * 100).toFixed(0)}%</p>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleMovieAction('like', movie)}
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Like
                </button>
                <button
                  onClick={() => handleMovieAction('dislike', movie)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Dislike
                </button>
                <button
                  onClick={() => handleMovieAction('rate', movie, 5)}
                  className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Rate 5★
                </button>
                <button
                  onClick={() => handleMovieAction('skip', movie)}
                  className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats and Context */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendation Stats */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">Simple Stats</h3>
            {stats ? (
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Watched Movies:</span> {stats.watchedMovies}</p>
                <p><span className="text-gray-400">My List Movies:</span> {stats.myListMovies}</p>
                <p><span className="text-gray-400">Blocked Movies:</span> {stats.blockedMovies}</p>
                <p><span className="text-gray-400">Last Update:</span> {new Date(stats.lastUpdate).toLocaleTimeString()}</p>
              </div>
            ) : (
              <p className="text-gray-400">Loading stats...</p>
            )}
          </div>

          {/* Simple Context */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">Simple User Context</h3>
            {context ? (
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Watched Movies:</span> {context.watchedMovies}</p>
                <p><span className="text-gray-400">My List Movies:</span> {context.myListMovies}</p>
                <p><span className="text-gray-400">Blocked Movies:</span> {context.blockedMovies}</p>
                <p className="text-gray-500 text-xs mt-2">
                  Simple system - no complex preference tracking
                </p>
              </div>
            ) : (
              <p className="text-gray-400">Loading context...</p>
            )}
          </div>
        </div>

        {/* Integration Status */}
        <div className="mt-6 bg-green-900 border border-green-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-400 mb-2">✓ Simplified Integration Status</h3>
          <ul className="text-sm text-green-300 space-y-1">
            <li>✓ Simple recommendation service using TMDB API</li>
            <li>✓ UI components connected to simplified system</li>
            <li>✓ User actions logged (no complex state updates)</li>
            <li>✓ Basic list management with localStorage</li>
            <li>✓ Simple error handling implemented</li>
            <li>✓ Fast loading without complex calculations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}