import { NextResponse } from 'next/server';
import { getPopularMovies, getTrendingMovies, convertTMDBToMovie } from '../../../lib/tmdb';

export async function GET() {
  try {
    // Get popular movies for "My List"
    const popularMovies = await getPopularMovies(1);
    const myList = popularMovies.results.slice(0, 5).map(movie => ({
      ...convertTMDBToMovie(movie),
      userRating: Math.floor(Math.random() * 5) + 1, // Random rating 1-5
    }));

    // Get trending movies for "Watched List"
    const trendingMovies = await getTrendingMovies('week');
    const watchedList = trendingMovies.results.slice(0, 3).map(movie => ({
      ...convertTMDBToMovie(movie),
      userRating: Math.floor(Math.random() * 5) + 1, // Random rating 1-5
    }));

    return NextResponse.json({
      myList,
      watchedList
    });
  } catch (error) {
    console.error('Error fetching sample lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sample lists' }, 
      { status: 500 }
    );
  }
}