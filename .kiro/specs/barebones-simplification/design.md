# Design Document

## Overview

This design outlines the simplification of the CineAI movie recommendation app by removing complex scoring algorithms, machine learning features, and advanced recommendation logic. The goal is to create a clean, maintainable application focused on essential functionality: movie display, basic recommendations, and simple list management.

## Architecture

### Current Complex System
The existing system includes:
- Complex scoring algorithms with genre weights and recency decay
- Machine learning embeddings and vector similarity calculations
- Performance optimization layers (caching, batch processing)
- Advanced recommendation engines with multiple scoring factors
- Complex user preference tracking and profile management

### Simplified Architecture
The new system will have:
- **UI Layer**: Clean movie display interface
- **Simple Recommendation Engine**: Basic genre-based suggestions
- **List Management**: Simple CRUD operations for user lists
- **Local Storage**: Minimal data persistence
- **Movie Data**: Basic movie information handling

## Components and Interfaces

### 1. Simplified Movie Interface
```typescript
interface SimpleMovie {
  id: string;
  title: string;
  year?: number;
  genre?: string;
  poster?: string;
  rating: number;
  synopsis?: string;
}
```

### 2. User Lists Interface
```typescript
interface UserLists {
  watched: SimpleMovie[];
  wantToWatch: SimpleMovie[];
  blocked: string[]; // Just movie IDs
}
```

### 3. Simple Recommendation Engine
```typescript
interface SimpleRecommendationEngine {
  getRecommendations(excludeIds: string[]): SimpleMovie[];
  getPopularMovies(): SimpleMovie[];
  getSimilarByGenre(genre: string, excludeIds: string[]): SimpleMovie[];
}
```

### 4. List Management Service
```typescript
interface ListManager {
  addToWatched(movie: SimpleMovie): void;
  addToWantToWatch(movie: SimpleMovie): void;
  blockMovie(movieId: string): void;
  removeFromList(movieId: string, listType: 'watched' | 'wantToWatch'): void;
  getUserLists(): UserLists;
}
```

## Data Models

### Movie Data
- Remove complex metadata and embeddings
- Keep only essential fields: id, title, year, genre, poster, rating, synopsis
- Remove user rating tracking and complex preference calculations

### User Preferences
- Remove genre profiles, recency tracking, and embedding profiles
- Keep only simple lists: watched, want to watch, blocked
- Remove complex preference calculations and scoring

### Storage Structure
```typescript
interface SimpleStorage {
  lists: UserLists;
  lastUpdated: string;
  version: string;
}
```

## Recommendation Logic

### Simple Algorithm
1. **Popular Movies**: Show trending/popular movies by default
2. **Genre-Based**: If user has watched movies, suggest similar genres
3. **Exclusion**: Filter out watched and blocked movies
4. **Randomization**: Add some variety to prevent repetitive suggestions

### Implementation Approach
```typescript
function getSimpleRecommendations(userLists: UserLists, allMovies: SimpleMovie[]): SimpleMovie[] {
  // Get user's watched genres
  const watchedGenres = extractGenres(userLists.watched);
  
  // Filter out excluded movies
  const available = allMovies.filter(movie => 
    !userLists.blocked.includes(movie.id) &&
    !userLists.watched.some(w => w.id === movie.id)
  );
  
  // If user has preferences, weight by genre similarity
  if (watchedGenres.length > 0) {
    return available
      .filter(movie => hasMatchingGenre(movie, watchedGenres))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  }
  
  // Otherwise, return popular movies
  return available
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);
}
```

## Error Handling

### Simplified Error Management
- Remove complex error tracking and performance monitoring
- Use basic try-catch blocks for essential operations
- Simple fallbacks: show popular movies if recommendations fail
- Basic localStorage error handling with default empty state

### Error Scenarios
1. **Storage Errors**: Fall back to empty lists
2. **Recommendation Errors**: Show popular movies
3. **Movie Data Errors**: Skip invalid entries
4. **UI Errors**: Show error message, continue with available data

## Testing Strategy

### Unit Tests
- Test simple recommendation logic
- Test list management operations
- Test storage save/load operations
- Test movie data validation

### Integration Tests
- Test UI interactions with list management
- Test recommendation display
- Test storage persistence

### Removed Testing
- Remove complex algorithm testing
- Remove performance benchmarking
- Remove ML model testing
- Remove advanced error scenario testing

## Files to Remove

### Complex Recommendation Files
- `src/recommendation/scoring/recency-decay.ts`
- `src/recommendation/filtering/movie-filter.ts`
- `src/recommendation/core/genre-parser.ts`
- `lib/mathUtils.ts`
- `lib/userProfile.ts`
- `lib/logger.ts`
- All performance optimization utilities
- All ML/embedding related code

### Complex Storage Logic
- Remove complex preference calculations from `movieStorage.ts`
- Remove genre profile management
- Remove recency tracking
- Remove embedding profile handling

### Testing and Documentation
- Remove performance tests
- Remove complex algorithm documentation
- Remove ML training notebooks
- Remove advanced configuration files

## Migration Strategy

### Phase 1: Simplify Core Logic
1. Create new simple recommendation engine
2. Simplify movie storage interface
3. Remove complex scoring algorithms

### Phase 2: Update UI Components
1. Simplify recommendation display
2. Update list management UI
3. Remove complex preference settings

### Phase 3: Clean Up
1. Remove unused files and dependencies
2. Update documentation
3. Simplify configuration

## Performance Considerations

### Simplified Performance
- Remove caching layers (not needed for simple operations)
- Remove batch processing optimizations
- Remove performance monitoring
- Keep basic operations fast through simplicity

### Expected Benefits
- Faster app startup (no complex initialization)
- Simpler debugging and maintenance
- Reduced bundle size
- More predictable behavior