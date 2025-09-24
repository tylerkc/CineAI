// Simplified movie storage utility with localStorage persistence

export interface StoredMovie {
  id: string;
  title: string;
  year?: number;
  genre?: string;
  poster?: string;
  rating: number; // User's rating (1-5 stars) when in watchedList, movie rating when in myList
  dateAdded: string;
  dateWatched?: string; // When the movie was watched/rated
}

export interface MovieLists {
  myList: StoredMovie[];
  watchedList: StoredMovie[];
  blockedMovies: string[];
}

export interface MovieStorage {
  lists: MovieLists;
  embeddingProfile: number[]; // Empty placeholder for future AI features
  version: string;
}

const STORAGE_KEY = 'cineai_movie_data';
const STORAGE_VERSION = '2.0';

// Default empty storage structure
const getDefaultStorage = (): MovieStorage => ({
  lists: {
    myList: [],
    watchedList: [],
    blockedMovies: []
  },
  embeddingProfile: [], // Empty placeholder for future AI features
  version: STORAGE_VERSION
});

// Load data from localStorage
export const loadMovieData = (): MovieStorage => {
  if (typeof window === 'undefined') {
    return getDefaultStorage();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultStorage();
    }

    const parsed = JSON.parse(stored);
    
    // Simple migration from old versions
    if (parsed.version !== STORAGE_VERSION) {
      return migrateFromOldVersion(parsed);
    }

    return parsed as MovieStorage;
  } catch (error) {
    console.error('Error loading movie data:', error);
    return getDefaultStorage();
  }
};

// Simple migration from old versions
const migrateFromOldVersion = (oldData: any): MovieStorage => {
  const newStorage = getDefaultStorage();
  
  try {
    // Migrate from old structure if it exists
    if (oldData.lists) {
      // Map old structure to current structure
      if (oldData.lists.myList) {
        newStorage.lists.myList = oldData.lists.myList.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          year: movie.year,
          genre: movie.genre,
          poster: movie.poster,
          rating: movie.rating,
          dateAdded: movie.dateAdded || new Date().toISOString()
        }));
      }
      
      if (oldData.lists.watchedList) {
        newStorage.lists.watchedList = oldData.lists.watchedList.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          year: movie.year,
          genre: movie.genre,
          poster: movie.poster,
          rating: movie.rating,
          dateAdded: movie.dateAdded || new Date().toISOString()
        }));
      }
      
      if (oldData.lists.blockedMovies) {
        newStorage.lists.blockedMovies = oldData.lists.blockedMovies;
      }
      
      // Handle old field names for backward compatibility
      if (oldData.lists.wantToWatch) {
        newStorage.lists.myList = oldData.lists.wantToWatch.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          year: movie.year,
          genre: movie.genre,
          poster: movie.poster,
          rating: movie.rating,
          dateAdded: movie.dateAdded || new Date().toISOString()
        }));
      }
      
      if (oldData.lists.watched) {
        newStorage.lists.watchedList = oldData.lists.watched.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          year: movie.year,
          genre: movie.genre,
          poster: movie.poster,
          rating: movie.rating,
          dateAdded: movie.dateAdded || new Date().toISOString()
        }));
      }
      
      if (oldData.lists.blocked) {
        newStorage.lists.blockedMovies = oldData.lists.blocked;
      }
    }
    
    // Keep embeddingProfile as empty placeholder
    newStorage.embeddingProfile = [];
    
    return newStorage;
  } catch (error) {
    console.error('Migration failed:', error);
    return getDefaultStorage();
  }
};

// Save data to localStorage
export const saveMovieData = (data: MovieStorage): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving movie data:', error);
    return false;
  }
};

// Helper function to convert API movie data to StoredMovie
export const createStoredMovie = (movieData: any): StoredMovie => {
  return {
    id: movieData.id,
    title: movieData.title,
    year: movieData.year,
    genre: movieData.genre,
    poster: movieData.posterUrl || movieData.poster,
    rating: movieData.userRating || movieData.rating, // Prioritize user rating over movie rating
    dateAdded: new Date().toISOString()
  };
};

// Add movie to Want to Watch list (lightweight)
export const addToWantToWatchList = (movieData: any): MovieStorage => {
  const storage = loadMovieData();
  const movie = createStoredMovie(movieData);

  // Simple check and add - no complex calculations
  const existsInMyList = storage.lists.myList.some(m => m.id === movie.id);
  const existsInWatched = storage.lists.watchedList.some(m => m.id === movie.id);

  if (!existsInMyList && !existsInWatched) {
    storage.lists.myList.push(movie);
    saveMovieData(storage);
  }

  return storage;
};

// Add movie to My List (lightweight - just add to list without calculations)
export const addToMyList = (movieData: any): MovieStorage => {
  const storage = loadMovieData();
  const movie = createStoredMovie(movieData);

  // Simple check and add - no complex calculations
  const existsInMyList = storage.lists.myList.some(m => m.id === movie.id);
  const existsInWatched = storage.lists.watchedList.some(m => m.id === movie.id);

  if (!existsInMyList && !existsInWatched) {
    storage.lists.myList.push(movie);
    saveMovieData(storage);
  }

  return storage;
};

// Add movie to Watched List (lightweight - no preference calculations)
export const addToWatchedList = (movieData: any): MovieStorage => {
  const storage = loadMovieData();
  const movie = createStoredMovie(movieData);
  
  // Add the date when the movie was watched/rated
  movie.dateWatched = new Date().toISOString();

  // Simple operations - just add to list without complex calculations
  // Remove from My List if it exists there
  storage.lists.myList = storage.lists.myList.filter(m => m.id !== movie.id);

  // Add to watched list (or update if already exists)
  const existingIndex = storage.lists.watchedList.findIndex(m => m.id === movie.id);
  if (existingIndex >= 0) {
    storage.lists.watchedList[existingIndex] = movie;
  } else {
    storage.lists.watchedList.unshift(movie); // Add to beginning
  }

  saveMovieData(storage);
  return storage;
};

// Remove movie from a specific list (lightweight - no complex recalculations)
export const removeFromList = (movieId: string, listType: 'myList' | 'watchedList'): MovieStorage => {
  const storage = loadMovieData();

  // Simple removal operation - no complex preference recalculation
  if (listType === 'myList') {
    storage.lists.myList = storage.lists.myList.filter(m => m.id !== movieId);
  } else {
    storage.lists.watchedList = storage.lists.watchedList.filter(m => m.id !== movieId);
  }

  saveMovieData(storage);
  return storage;
};

// Move movie from Watched back to My List (lightweight)
export const moveToWantToWatchList = (movieId: string): MovieStorage => {
  const storage = loadMovieData();

  // Find movie in watched list
  const movieIndex = storage.lists.watchedList.findIndex(m => m.id === movieId);
  if (movieIndex >= 0) {
    const movie = storage.lists.watchedList[movieIndex];

    // Simple operations - just move between lists without calculations
    // Remove from watched
    storage.lists.watchedList.splice(movieIndex, 1);

    // Add to my list
    storage.lists.myList.push({
      ...movie,
      dateAdded: new Date().toISOString()
    });

    saveMovieData(storage);
  }

  return storage;
};

// Move movie to My List (lightweight - just move between lists)
export const moveToMyList = (movieId: string): MovieStorage => {
  const storage = loadMovieData();

  // Find movie in watched list
  const movieIndex = storage.lists.watchedList.findIndex(m => m.id === movieId);
  if (movieIndex >= 0) {
    const movie = storage.lists.watchedList[movieIndex];

    // Simple operations - just move between lists without calculations
    // Remove from watched
    storage.lists.watchedList.splice(movieIndex, 1);

    // Add to my list
    storage.lists.myList.push({
      ...movie,
      dateAdded: new Date().toISOString()
    });

    saveMovieData(storage);
  }

  return storage;
};

// Reorder My List (lightweight - synchronous and fast)
export const reorderMyList = (newOrder: StoredMovie[]): MovieStorage => {
  const storage = loadMovieData();
  
  // Simple reorder operation - just update the array without calculations
  storage.lists.myList = newOrder;
  saveMovieData(storage);
  
  return storage;
};

// Block a movie from future recommendations (lightweight - just add ID to blocked list)
export const blockMovie = (movieId: string): MovieStorage => {
  const storage = loadMovieData();

  // Simple operation - just add ID to blocked list without complex calculations
  if (!storage.lists.blockedMovies.includes(movieId)) {
    storage.lists.blockedMovies.push(movieId);
    saveMovieData(storage);
  }

  return storage;
};

// Clear all data (for testing or reset)
export const clearAllData = (): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY);
  }
};

// Export data for backup
export const exportData = (): string => {
  const storage = loadMovieData();
  return JSON.stringify(storage, null, 2);
};

// Import data from backup
export const importData = (jsonData: string): boolean => {
  try {
    const data: MovieStorage = JSON.parse(jsonData);
    return saveMovieData(data);
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Get user statistics (lightweight - basic stats only)
export const getUserStats = () => {
  const storage = loadMovieData();
  
  // Simple statistics without complex calculations
  const watchedMovies = storage.lists.watchedList;
  const ratedMovies = watchedMovies.filter(m => m.rating); // Movies with ratings
  const totalRating = ratedMovies.reduce((sum, movie) => sum + movie.rating, 0);
  const averageRating = ratedMovies.length > 0 ? Math.round((totalRating / ratedMovies.length) * 10) / 10 : 0;
  
  return {
    totalMoviesWatched: watchedMovies.length,
    totalMoviesRated: ratedMovies.length,
    averageRating: averageRating,
    totalMoviesInMyList: storage.lists.myList.length,
    totalBlockedMovies: storage.lists.blockedMovies.length,
    lastUpdated: new Date().toISOString()
  };
};

