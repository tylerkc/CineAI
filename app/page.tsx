'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CineAI from '../components/CineAI';
import Sidebar from '../components/Sidebar';
import InfoPanel from '../components/InfoPanel';
import SearchBar from '../components/SearchBar';
import UserProfile from '../components/UserProfile';
import {
  loadMovieData,
  addToMyList,
  addToWatchedList,
  removeFromList,
  moveToMyList,
  blockMovie,
  reorderMyList,
  type StoredMovie
} from '../lib/movieStorage';

interface MovieData {
  id: string;
  title: string;
  year: number;
  genre: string;
  description: string;
  rating: number;
  runtime: string;
  posterUrl?: string;
  backdropUrl?: string;
  director: string;
  cast: string[];
  reason: string;
}

interface MovieLists {
  myList: StoredMovie[];
  watchedList: StoredMovie[];
}

export default function Home() {
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [movieLists, setMovieLists] = useState<MovieLists>({ myList: [], watchedList: [] });
  const [loading, setLoading] = useState(true);
  const [blockedMovies, setBlockedMovies] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchNewMovie = async (maxAttempts = 10, customBlockedMovies?: Set<string>) => {
    console.log('🎬 fetchNewMovie called');
    try {
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 300));

      let attempts = 0;
      let movie = null;

      // Simplified approach - just fetch a movie
      while (attempts < maxAttempts) {
        console.log(`🎬 Attempt ${attempts + 1}/${maxAttempts}: Fetching movie...`);

        const movieResponse = await fetch(`/api/random-movie?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        if (!movieResponse.ok) {
          console.warn('❌ API response not ok:', movieResponse.status, movieResponse.statusText);
          attempts++;
          continue;
        }

        const fetchedMovie = await movieResponse.json();
        console.log('✅ Fetched movie:', fetchedMovie.title, 'ID:', fetchedMovie.id);

        // Get current blocked/watched movies
        const currentStorage = loadMovieData();
        const currentBlockedMovies = customBlockedMovies || new Set(currentStorage.lists.blockedMovies);
        const excludedIds = new Set([
          ...Array.from(currentBlockedMovies),
          ...currentStorage.lists.myList.map(m => m.id),
          ...currentStorage.lists.watchedList.map(m => m.id)
        ]);

        if (!excludedIds.has(fetchedMovie.id)) {
          movie = fetchedMovie;
          console.log('✅ Movie is unique, using it!');
          break;
        }

        attempts++;
        console.log(`⚠️ Movie ${fetchedMovie.title} already in lists, trying again...`);
      }

      // If we couldn't find a unique movie, just use any movie
      if (!movie) {
        console.log('⚠️ Could not find unique movie, fetching any movie...');
        const movieResponse = await fetch(`/api/random-movie?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        if (movieResponse.ok) {
          movie = await movieResponse.json();
          console.log('✅ Using fallback movie:', movie.title);
        } else {
          throw new Error('Failed to fetch any movie');
        }
      }

      console.log('🎬 Setting new movie:', movie.title);
      setMovieData(movie);
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsTransitioning(false);
      console.log('✅ Movie transition complete');
    } catch (error) {
      console.error('❌ Error fetching new movie:', error);
      setIsTransitioning(false);

      // Set a fallback movie if everything fails
      const fallbackMovie = {
        id: 'fallback-' + Date.now(),
        title: 'The Shawshank Redemption',
        year: 1994,
        genre: 'Drama',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        rating: 4.7,
        runtime: '142 min',
        director: 'Frank Darabont',
        cast: ['Tim Robbins', 'Morgan Freeman'],
        reason: 'A timeless classic (fallback movie)'
      };

      console.log('🆘 Using emergency fallback movie:', fallbackMovie.title);
      setMovieData(fallbackMovie);
    }
  };

  const handleMovieAction = async (action: 'like' | 'dislike' | 'skip' | 'rate' | 'trailer', data: any) => {
    console.log(`Movie action: ${action} on ${data.title}`);

    switch (action) {
      case 'like':
        console.log('Adding to My List and fetching new movie...');
        const updatedStorage = addToMyList(data);
        setMovieLists({
          myList: updatedStorage.lists.myList,
          watchedList: updatedStorage.lists.watchedList
        });
        await fetchNewMovie();
        break;

      case 'dislike':
        console.log('Blocking movie and fetching new movie...');
        const blockedStorage = await blockMovie(data.id);
        const newBlockedMovies = new Set(blockedStorage.lists.blockedMovies);
        setBlockedMovies(newBlockedMovies);
        await fetchNewMovie(5, newBlockedMovies);
        break;

      case 'skip':
        console.log('Skipping movie and fetching new movie...');
        await fetchNewMovie();
        break;

      case 'rate':
        console.log('Rating movie and fetching new movie...');
        const watchedStorage = addToWatchedList({
          ...data,
          rating: data.userRating,
          userRating: data.userRating // Keep both for compatibility
        });
        setMovieLists({
          myList: watchedStorage.lists.myList,
          watchedList: watchedStorage.lists.watchedList
        });
        await fetchNewMovie();
        break;

      case 'trailer':
        handlePlayTrailer(data.id, data.title);
        break;
    }
  };

  const handlePlayTrailer = async (movieId: string, movieTitle: string) => {
    try {
      const response = await fetch(`/api/movie-trailer/${movieId}`);
      const data = await response.json();

      if (data.hasTrailer && data.trailerUrl) {
        window.open(data.trailerUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert(`🎬 Sorry, no trailer available for "${movieTitle}"`);
      }
    } catch (error) {
      console.error('Error playing trailer:', error);
      alert(`🎬 Unable to load trailer for "${movieTitle}". Please try again.`);
    }
  };

  const handleUpdateLists = (newMyList: StoredMovie[], newWatchedList: StoredMovie[]) => {
    setMovieLists({
      myList: newMyList,
      watchedList: newWatchedList
    });
  };

  const handleRemoveFromList = async (movieId: string, listType: 'myList' | 'watchedList') => {
    const updatedStorage = await removeFromList(movieId, listType);
    setMovieLists({
      myList: updatedStorage.lists.myList,
      watchedList: updatedStorage.lists.watchedList
    });
  };

  const handleMoveToMyList = async (movieId: string) => {
    const updatedStorage = await moveToMyList(movieId);
    setMovieLists({
      myList: updatedStorage.lists.myList,
      watchedList: updatedStorage.lists.watchedList
    });
  };

  const handleReorderMyList = (newOrder: StoredMovie[]) => {
    const updatedStorage = reorderMyList(newOrder);
    setMovieLists({
      myList: updatedStorage.lists.myList,
      watchedList: updatedStorage.lists.watchedList
    });
  };

  const handleDataCleared = () => {
    setMovieLists({ myList: [], watchedList: [] });
    setBlockedMovies(new Set());
  };

  const handleSurpriseMe = (selectedMovie: StoredMovie) => {
    // Create movie data in the format expected by the main view
    const surpriseMovieData = {
      id: selectedMovie.id,
      title: selectedMovie.title,
      year: selectedMovie.year || 2024,
      genre: selectedMovie.genre || 'Unknown',
      description: `Surprise! Here's "${selectedMovie.title}" from your list. Time to watch it!`,
      rating: selectedMovie.rating,
      runtime: '120 min', // Default runtime
      posterUrl: selectedMovie.poster,
      director: 'Unknown Director',
      cast: [],
      reason: `You added this to your list - perfect time to watch it!`
    };

    // Update the current movie display
    setMovieData(surpriseMovieData);

    console.log(`Surprise Me: Now showing ${selectedMovie.title}`);
  };



  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const savedData = loadMovieData();
        setMovieLists({
          myList: savedData.lists.myList,
          watchedList: savedData.lists.watchedList
        });
        setBlockedMovies(new Set(savedData.lists.blockedMovies));

        const movieResponse = await fetch(`/api/random-movie?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        const movie = await movieResponse.json();
        setMovieData(movie);
      } catch (error) {
        console.error('Error fetching movie data:', error);
        setMovieData({
          id: '1',
          title: 'Inception',
          year: 2010,
          genre: 'Sci-Fi, Thriller',
          description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
          rating: 4.8,
          runtime: '148 min',
          posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
          director: 'Christopher Nolan',
          cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy'],
          reason: 'Popular sci-fi thriller'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  if (loading || !movieData) {
    return (
      <main className="h-screen w-full relative bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading amazing movies...</div>
      </main>
    );
  }

  return (
    <main className="h-screen w-full relative bg-gray-900">
      <motion.div
        key={movieData.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: isTransitioning ? 0 : 1,
          scale: isTransitioning ? 0.95 : 1
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <InfoPanel
          title={movieData.title}
          year={movieData.year}
          genre={movieData.genre}
          runtime={movieData.runtime}
          description={movieData.description}
          director={movieData.director}
          cast={movieData.cast}
          rating={movieData.rating}
        />
        <CineAI
          posterUrl={movieData.posterUrl}
          title={movieData.title}
          year={movieData.year}
          genre={movieData.genre}
          description={movieData.description}
          rating={movieData.rating}
          reason={movieData.reason}
          movieId={movieData.id}
          onMovieAction={handleMovieAction}
        />
      </motion.div>

      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-20 pointer-events-none"
        >
          <div className="text-gray-400 text-lg font-light">Loading next movie...</div>
        </motion.div>
      )}

      <Sidebar
        myList={movieLists.myList}
        watchedList={movieLists.watchedList}
        onUpdateLists={handleUpdateLists}
        onRemoveFromList={handleRemoveFromList}
        onMoveToMyList={handleMoveToMyList}
        onReorderMyList={handleReorderMyList}
        onSurpriseMe={handleSurpriseMe}
      />
      <SearchBar />
      <UserProfile username="CineExplorer" onDataCleared={handleDataCleared} />
    </main>
  );
}