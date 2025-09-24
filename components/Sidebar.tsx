'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Star, Play, Tv, Smartphone, Menu, X, GripVertical, Trash2, Plus, Shuffle } from 'lucide-react';

interface Movie {
  id: string;
  poster?: string;
  title: string;
  rating: number; // User's rating (1-5 stars) when in watchedList, movie rating when in myList
  userRating?: number; // Alias for rating for backward compatibility
  year?: number;
  genre?: string;
  dateAdded: string;
  dateWatched?: string;
}

interface SidebarProps {
  myList: Movie[];
  watchedList: Movie[];
  onUpdateLists?: (myList: Movie[], watchedList: Movie[]) => void;
  onRemoveFromList?: (movieId: string, listType: 'myList' | 'watchedList') => void;
  onMoveToMyList?: (movieId: string) => void;
  onReorderMyList?: (newOrder: Movie[]) => void;
  onSurpriseMe?: (movie: Movie) => void;
}

export default function Sidebar({ 
  myList, 
  watchedList, 
  onUpdateLists, 
  onRemoveFromList, 
  onMoveToMyList, 
  onReorderMyList,
  onSurpriseMe
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'MY LIST' | 'WATCHED'>('MY LIST');
  const [movieRatings, setMovieRatings] = useState<{ [key: string]: number }>({});
  const [isOpen, setIsOpen] = useState(false);

  const handleRatingClick = (movieId: string, rating: number) => {
    setMovieRatings(prev => ({
      ...prev,
      [movieId]: rating
    }));
    
    // Find the movie in My List and move it to Watched
    const movieToMove = myList.find(movie => movie.id === movieId);
    if (movieToMove) {
      // Remove from My List and add to Watched with rating
      const newMyList = myList.filter(movie => movie.id !== movieId);
      const watchedMovie = { ...movieToMove, userRating: rating };
      const newWatchedList = [watchedMovie, ...watchedList];
      
      onUpdateLists?.(newMyList, newWatchedList);
      console.log(`Movie "${movieToMove.title}" rated ${rating} stars and moved to Watched`);
    } else {
      console.log(`Rated movie ${movieId}: ${rating} stars`);
    }
  };

  const handleRemoveMovie = (movieId: string, fromList: 'MY LIST' | 'WATCHED') => {
    const listType = fromList === 'MY LIST' ? 'myList' : 'watchedList';
    onRemoveFromList?.(movieId, listType);
    console.log(`Removed movie ${movieId} from ${fromList}`);
  };

  const handleAddToMyList = (movie: Movie) => {
    onMoveToMyList?.(movie.id);
    
    // Clear the rating from local state
    setMovieRatings(prev => {
      const newRatings = { ...prev };
      delete newRatings[movie.id];
      return newRatings;
    });
    
    console.log(`Movie "${movie.title}" added back to My List`);
  };

  const handleReorderMyList = (newOrder: Movie[]) => {
    onReorderMyList?.(newOrder);
  };

  const handleSurpriseMe = () => {
    if (myList.length === 0) {
      alert('Add some movies to your list first!');
      return;
    }
    
    // Randomly select a movie from My List
    const randomIndex = Math.floor(Math.random() * myList.length);
    const selectedMovie = myList[randomIndex];
    
    onSurpriseMe?.(selectedMovie);
    setIsOpen(false); // Close sidebar after selection
    
    console.log(`Surprise Me selected: ${selectedMovie.title}`);
  };

  const currentList = activeTab === 'MY LIST' ? myList : watchedList;

  const MovieItem = ({ movie, isDraggable = false, listType }: { 
    movie: Movie; 
    isDraggable?: boolean; 
    listType: 'MY LIST' | 'WATCHED';
  }) => {
    // For watched movies, use the saved rating; for My List movies, use local state
    const userRating = listType === 'WATCHED' 
      ? movie.rating // Use the saved user rating for watched movies
      : (movieRatings[movie.id] || 0); // Use local state for My List movies

    return (
      <motion.div
        className="flex items-center gap-3 p-3 rounded-lg group relative"
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
        transition={{ duration: 0.2 }}
        layout
      >
        {/* Drag Handle (only for My List) */}
        {isDraggable && (
          <motion.div
            className="flex-shrink-0 opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none"
            whileHover={{ scale: 1.1 }}
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </motion.div>
        )}

        {/* Poster Thumbnail */}
        <div className="flex-shrink-0 w-12 h-16 rounded overflow-hidden bg-black/40 backdrop-blur-sm border border-white/10">
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={`${movie.title} poster`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-black/60 to-black/80 flex items-center justify-center">
              <Play className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-sm font-medium truncate group-hover:text-gray-100 transition-colors drop-shadow-sm">
            {movie.title}
          </h3>
          
          {/* Where to Watch Icons */}
          <div className="flex items-center gap-1 mt-1 mb-2">
            <Tv className="w-3 h-3 text-gray-400 drop-shadow-sm" />
            <Smartphone className="w-3 h-3 text-gray-400 drop-shadow-sm" />
            <Play className="w-3 h-3 text-gray-400 drop-shadow-sm" />
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                onClick={() => handleRatingClick(movie.id, star)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-0.5"
                disabled={listType === 'WATCHED' && userRating > 0}
              >
                <Star
                  className={`w-3 h-3 drop-shadow-sm ${
                    star <= userRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : listType === 'WATCHED' && userRating > 0
                      ? 'text-gray-600'
                      : 'text-gray-400 hover:text-yellow-400'
                  } transition-colors duration-150`}
                />
              </motion.button>
            ))}
            {/* Show rating number for watched movies */}
            {listType === 'WATCHED' && userRating > 0 && (
              <span className="text-yellow-400 text-xs font-medium ml-1">
                {userRating}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Add to My List button (only for Watched tab) */}
          {listType === 'WATCHED' && (
            <motion.button
              onClick={() => handleAddToMyList(movie)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-colors"
              title="Add to My List"
            >
              <Plus className="w-3 h-3 text-green-400" />
            </motion.button>
          )}
          
          {/* Remove button */}
          <motion.button
            onClick={() => handleRemoveMovie(movie.id, listType)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
            title="Remove"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-50 p-3 bg-black/30 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/40 hover:border-white/20 transition-all duration-300 min-w-[60px] min-h-[60px] flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <Menu className="w-5 h-5 text-white" />
          )}
        </motion.div>
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 h-screen w-80 bg-black/30 backdrop-blur-xl border-l border-white/10 z-40"
          >
            <div className="flex flex-col h-full pt-20">
        
        {/* Tab Header */}
        <div className="flex border-b border-white/10 bg-black/20 backdrop-blur-sm">
          {(['MY LIST', 'WATCHED'] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 relative ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              whileTap={{ scale: 0.98 }}
            >
              {tab}
              
              {/* Active Tab Indicator */}
              {activeTab === tab && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  layoutId="activeTab"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full flex flex-col"
            >
              {/* List Header */}
              <div className="px-6 py-4 border-b border-white/10 bg-black/10 flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-white text-lg font-semibold">
                    {activeTab}
                  </h2>
                  {activeTab === 'MY LIST' && currentList.length > 0 && (
                    <motion.button
                      onClick={handleSurpriseMe}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 text-xs rounded-full border border-purple-500/30 transition-all duration-200"
                      title="Pick a random movie from your list"
                    >
                      <Shuffle className="w-3 h-3" />
                      Surprise Me
                    </motion.button>
                  )}
                </div>
                <p className="text-gray-300 text-sm">
                  {currentList.length} {currentList.length === 1 ? 'movie' : 'movies'}
                  {activeTab === 'MY LIST' && currentList.length > 0 && (
                    <span className="text-purple-400 ml-2">• Drag to reorder</span>
                  )}
                </p>
                {activeTab === 'MY LIST' && currentList.length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                      Up Next: {currentList[0]?.title}
                    </span>
                  </div>
                )}
              </div>

              {/* Movie List - Scrollable */}
              <div 
                className="flex-1 overflow-y-auto px-3 py-2 min-h-0 sidebar-scroll"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
                }}
              >
                {currentList.length > 0 ? (
                  activeTab === 'MY LIST' ? (
                    // Reorderable My List
                    <Reorder.Group
                      axis="y"
                      values={myList}
                      onReorder={handleReorderMyList}
                      className="space-y-1"
                    >
                      {myList.map((movie) => (
                        <Reorder.Item
                          key={movie.id}
                          value={movie}
                          whileDrag={{ 
                            scale: 1.02, 
                            zIndex: 1000,
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px'
                          }}
                          transition={{ duration: 0.2 }}
                          className="cursor-grab active:cursor-grabbing"
                          style={{ listStyle: 'none' }}
                        >
                          <MovieItem movie={movie} isDraggable={true} listType="MY LIST" />
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  ) : (
                    // Regular Watched List
                    <div className="space-y-1">
                      {currentList.map((movie, index) => (
                        <motion.div
                          key={movie.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: index * 0.05,
                            ease: "easeOut" 
                          }}
                        >
                          <MovieItem movie={movie} isDraggable={false} listType="WATCHED" />
                        </motion.div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-4">
                      <Play className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-300 text-sm drop-shadow-sm">
                      No movies in your {activeTab.toLowerCase()} yet
                    </p>
                    <p className="text-gray-400 text-xs mt-1 drop-shadow-sm">
                      Start adding movies to see them here
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}