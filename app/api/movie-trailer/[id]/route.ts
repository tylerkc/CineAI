import { NextResponse } from 'next/server';
import { getMovieDetails, getTrailerUrl } from '../../../../lib/tmdb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = parseInt(params.id);
    
    if (isNaN(movieId)) {
      return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
    }

    try {
      // Get movie details with videos
      const movieDetails = await getMovieDetails(movieId);
      
      // Get the best trailer URL
      const trailerUrl = getTrailerUrl(movieDetails);
      
      if (!trailerUrl) {
        return NextResponse.json({ 
          error: 'No trailer available',
          hasTrailer: false 
        }, { status: 404 });
      }

      return NextResponse.json({
        trailerUrl,
        hasTrailer: true,
        movieTitle: movieDetails.title
      });
    } catch (tmdbError) {
      console.warn('TMDB API failed for trailer:', tmdbError);
      
      // Return no trailer available if TMDB fails
      return NextResponse.json({ 
        error: 'Trailer service temporarily unavailable',
        hasTrailer: false 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching movie trailer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie trailer' }, 
      { status: 500 }
    );
  }
}