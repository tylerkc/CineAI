import { NextResponse } from 'next/server';
import { getPopularMovies, getTrendingMovies, getTopRatedMovies, getNowPlayingMovies, getUpcomingMovies, getMovieDetails } from '../../../lib/tmdb';

// Disable caching for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fallback movies in case TMDB API fails
const fallbackMovies = [
  {
    id: '550',
    title: 'Fight Club',
    year: 1999,
    genre: 'Drama, Thriller',
    description: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    rating: 4.2,
    runtime: '139 min',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNDIzNDU0YzEtYzE5Ni00ZjlkLTk5ZjgtNjM3NWE4YzA3Nzk3XkEyXkFqcGdeQXVyMjUzOTY0NTM@._V1_SX300.jpg',
    director: 'David Fincher',
    cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
    reason: 'A cult classic that explores themes of consumerism and masculinity.'
  },
  {
    id: '278',
    title: 'The Shawshank Redemption',
    year: 1994,
    genre: 'Drama',
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    rating: 4.7,
    runtime: '142 min',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
    director: 'Frank Darabont',
    cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
    reason: 'Widely considered one of the greatest films ever made.'
  },
  {
    id: '238',
    title: 'The Godfather',
    year: 1972,
    genre: 'Crime, Drama',
    description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    rating: 4.6,
    runtime: '175 min',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    director: 'Francis Ford Coppola',
    cast: ['Marlon Brando', 'Al Pacino', 'James Caan'],
    reason: 'A masterpiece of cinema that defined the crime genre.'
  },
  {
    id: '680',
    title: 'Pulp Fiction',
    year: 1994,
    genre: 'Crime, Drama',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
    rating: 4.5,
    runtime: '154 min',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    director: 'Quentin Tarantino',
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
    reason: 'Tarantino\'s non-linear masterpiece that redefined storytelling.'
  },
  {
    id: '13',
    title: 'Forrest Gump',
    year: 1994,
    genre: 'Drama, Romance',
    description: 'The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.',
    rating: 4.3,
    runtime: '142 min',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',
    director: 'Robert Zemeckis',
    cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
    reason: 'A heartwarming tale that spans decades of American history.'
  }
];

export async function GET() {
  try {
    // Try to use TMDB API first
    try {
      // Randomly choose between different movie sources for much more variety
      const movieSources = [
        'popular',
        'trending_week', 
        'trending_day',
        'top_rated',
        'now_playing',
        'upcoming'
      ];
      
      const randomSource = movieSources[Math.floor(Math.random() * movieSources.length)];
      let movies;
      
      // Expand to pages 1-20 for much more variety (up to 400 movies per source)
      const randomPage = Math.floor(Math.random() * 20) + 1;
      
      switch (randomSource) {
        case 'popular':
          movies = await getPopularMovies(randomPage);
          break;
        case 'trending_week':
          movies = await getTrendingMovies('week');
          break;
        case 'trending_day':
          movies = await getTrendingMovies('day');
          break;
        case 'top_rated':
          movies = await getTopRatedMovies(randomPage);
          break;
        case 'now_playing':
          movies = await getNowPlayingMovies(randomPage);
          break;
        case 'upcoming':
          movies = await getUpcomingMovies(randomPage);
          break;
        default:
          movies = await getPopularMovies(randomPage);
      }
      
      if (movies.results.length === 0) {
        throw new Error('No movies found from TMDB');
      }

      // Pick a random movie from the results
      const randomIndex = Math.floor(Math.random() * movies.results.length);
      const randomMovie = movies.results[randomIndex];

      // Get detailed info for the random movie
      const movieDetails = await getMovieDetails(randomMovie.id);

      // Format the data for our components
      const formattedMovie = {
        id: movieDetails.id.toString(),
        title: movieDetails.title,
        year: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : 2024,
        genre: movieDetails.genres.map(g => g.name).slice(0, 2).join(', '),
        description: movieDetails.overview,
        rating: Math.round(movieDetails.vote_average * 10) / 20, // Convert 0-10 to 0-5 stars
        runtime: movieDetails.runtime ? `${movieDetails.runtime} min` : '120 min',
        posterUrl: movieDetails.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` 
          : undefined,
        backdropUrl: movieDetails.backdrop_path 
          ? `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}` 
          : undefined,
        director: movieDetails.credits?.crew.find(person => person.job === 'Director')?.name || 'Unknown Director',
        cast: movieDetails.credits?.cast.slice(0, 7).map(actor => actor.name) || [],
        reason: `Why this movie? Because it's trending with a ${movieDetails.vote_average.toFixed(1)}/10 rating and ${movieDetails.vote_count.toLocaleString()} votes.`,
        _timestamp: Date.now() // Add timestamp to ensure uniqueness
      };

      return NextResponse.json(formattedMovie, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      });
      
    } catch (tmdbError) {
      console.warn('TMDB API failed, using fallback movies:', tmdbError);
      
      // Use fallback movies if TMDB fails
      const randomIndex = Math.floor(Math.random() * fallbackMovies.length);
      const fallbackMovie = fallbackMovies[randomIndex];
      
      return NextResponse.json(fallbackMovie, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      });
    }
    
  } catch (error) {
    console.error('Error fetching random movie:', error);
    
    // Last resort: return a hardcoded movie
    return NextResponse.json({
      id: '550',
      title: 'Fight Club',
      year: 1999,
      genre: 'Drama, Thriller',
      description: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
      rating: 4.2,
      runtime: '139 min',
      director: 'David Fincher',
      cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
      reason: 'A cult classic that explores themes of consumerism and masculinity.'
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  }
}