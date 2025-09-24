# Implementation Plan

- [x] 1. Fix broken imports and remove complex embedded code








  - Fix import errors in lib/recommendations.ts (remove references to non-existent mathUtils, userProfile, logger)
  - Remove complex performance monitoring, caching, and ML-related code from lib/recommendations.ts
  - Remove complex scoring algorithms and mathematical calculations from lib/recommendations.ts
  - Clean up src/recommendation directory structure to remove unused files
  - _Requirements: 4.1, 4.2, 5.3_


- [x] 2. Simplify lib/recommendations.ts to basic API calls





  - Replace 2000+ line complex recommendation engine with simple TMDB API calls
  - Remove all performance optimization classes (GenreLookupCache, CandidateProcessor, etc.)
  - Remove complex scoring, ranking, and explanation generation
  - Keep only basic genre parsing and simple movie filtering
  - Replace complex recommendation logic with direct TMDB popular/trending calls
  - _Requirements: 3.1, 4.1, 4.2, 4.3, 5.3_

- [x] 3. Simplify movie storage system with data migration





  - Refactor lib/movieStorage.ts to remove complex preference calculations (1200+ lines → simple)
  - Remove complex updatePreferences, updateGenreProfile, updateEmbeddingProfile functions
  - Keep embeddingProfile field as empty placeholder for future AI features
  - Keep only simple user lists: watched, wantToWatch, blocked
  - Remove complex migration logic and async preference update calculations
  - _Requirements: 2.1, 2.2, 4.1, 4.3_

- [x] 4. Update list management functions to be lightweight





  - Simplify addToWatchedList function to just add movie to list without calculations
  - Simplify addToMyList function without preference updates
  - Make blockMovie function just add ID to blocked list
  - Remove all complex preference recalculation from list operations
  - Make all list operations synchronous and fast
  - _Requirements: 2.1, 2.2, 4.3, 5.4_

- [x] 5. Simplify recommendation integration layer





  - Replace complex lib/recommendationIntegration.ts with simple version
  - Remove performance monitoring and caching layers
  - Make recommendation service just call TMDB API with basic filtering
  - Remove complex state management and preference tracking
  - Keep existing UI interface but simplify backend calls
  - _Requirements: 3.1, 3.3, 4.3, 5.1_

- [x] 6. Update TMDB API integration with fallback system





  - Modify lib/tmdb.ts to handle simple recommendation requests
  - Add getRecommendations function that uses TMDB's built-in endpoints
  - Add basic exclusion of watched/blocked movies in API calls
  - Use TMDB's popular, trending, and similar movie endpoints directly
  - Implement fallback to cached popular movies when TMDB API fails
  - Create local fallback data file with popular movies for offline scenarios
  - _Requirements: 3.1, 3.2, 3.3, 5.4_

- [x] 7. Fix component imports and simplify backend calls





  - Fix broken imports in RecommendationDemo.tsx and other components
  - Update import paths to use simplified lib files instead of src/recommendation
  - Remove complex stats and performance monitoring from service calls
  - Keep all UI interactions and displays unchanged
  - Ensure fast loading by removing heavy calculations
  - _Requirements: 1.1, 5.1, 5.2, 5.4_

- [x] 8. Remove unused dependencies and imports










  - Clean up package.json to remove unused ML and math libraries
  - Remove complex algorithm imports from all files
  - Update import statements to use simplified services
  - Remove performance monitoring dependencies
  - Keep only essential dependencies for UI and basic API calls
  - _Requirements: 4.2, 5.3_

- [x] 9. Test simplified system with existing UI





  - Verify all existing UI components work with simplified backend
  - Test that movie recommendations load quickly without heavy calculations
  - Test list management operations are fast and responsive
  - Ensure UI remains exactly the same while backend is simplified
  - Verify app startup time is significantly improved
  - _Requirements: 1.3, 2.3, 3.4, 5.1, 5.4_

- [x] 10. Optimize for fast loading with robust fallbacks





  - Remove any remaining client-side processing bottlenecks
  - Ensure all API calls are lightweight and fast
  - Remove complex error handling that slows down operations
  - Implement graceful fallbacks: TMDB API → cached popular movies → default movie list
  - Add simple retry logic for network failures without blocking UI
  - Verify smooth UI interactions without calculation delays
  - Test offline functionality with fallback data
  - _Requirements: 5.1, 5.2, 5.4_