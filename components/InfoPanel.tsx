'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, Star } from 'lucide-react';

interface InfoPanelProps {
  title: string;
  year: number;
  genre: string;
  runtime?: string;
  description: string;
  cast?: string[];
  director?: string;
  rating?: number;
}

export default function InfoPanel({
  title,
  year,
  genre,
  runtime,
  description,
  cast,
  director,
  rating
}: InfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Truncate description to approximately 2-3 lines (around 150 characters)
  const truncatedDescription = description.length > 150 
    ? description.substring(0, 150).trim() + '...'
    : description;

  const shouldShowReadMore = description.length > 150;

  return (
    <motion.div
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed left-0 top-0 h-screen w-80 bg-black/30 backdrop-blur-md border-r border-white/10 z-40"
    >
      <div className="flex flex-col h-full p-6 pt-8">
        {/* Movie Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white leading-tight drop-shadow-lg">
            {title}
          </h1>
        </div>

        {/* Metadata */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
            <span>{year}</span>
            <span className="text-gray-500">•</span>
            <span>{genre}</span>
            {runtime && (
              <>
                <span className="text-gray-500">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{runtime}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Public Rating */}
        {rating && (
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= rating
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-yellow-500 font-medium text-sm">
                {rating.toFixed(1)}/5
              </span>
              <span className="text-gray-500 text-xs">
                Public Rating
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-6 flex-1">
          <h3 className="text-white text-lg font-semibold mb-3 drop-shadow-sm">
            Synopsis
          </h3>
          
          <div className="relative">
            <motion.div
              initial={false}
              animate={{ height: showFullDescription ? 'auto' : 'auto' }}
              className="text-gray-300 text-sm leading-relaxed"
            >
              {showFullDescription ? description : truncatedDescription}
            </motion.div>
            
            {shouldShowReadMore && (
              <motion.button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-blue-400 hover:text-blue-300 text-sm mt-2 flex items-center gap-1 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showFullDescription ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Read More
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Cast & Crew */}
        {(director || (cast && cast.length > 0)) && (
          <div className="mt-auto">
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="text-white font-medium">Cast & Crew</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.div>
            </motion.button>

            <motion.div
              initial={false}
              animate={{ 
                height: isExpanded ? 'auto' : 0,
                opacity: isExpanded ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-3 space-y-3">
                {director && (
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-1">DIRECTOR</p>
                    <p className="text-white text-sm">{director}</p>
                  </div>
                )}
                
                {cast && cast.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-1">CAST</p>
                    <div className="space-y-1">
                      {cast.slice(0, 5).map((actor, index) => (
                        <p key={index} className="text-white text-sm">{actor}</p>
                      ))}
                      {cast.length > 5 && (
                        <p className="text-gray-400 text-xs">+{cast.length - 5} more</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}