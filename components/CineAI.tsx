'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface CineAIProps {
    posterUrl?: string;
    title: string;
    year: number;
    genre: string;
    description: string;
    rating: number;
    reason: string;
    movieId: string;
    onMovieAction?: (action: 'like' | 'dislike' | 'skip' | 'rate' | 'trailer', data?: any) => void;
}

export default function CineAI({
    posterUrl,
    title,
    year,
    genre,
    description,
    rating,
    reason,
    movieId,
    onMovieAction
}: CineAIProps) {
    const [hoveredZone, setHoveredZone] = useState<'left' | 'right' | 'top' | 'bottom' | null>(null);
    const [userRating, setUserRating] = useState(0);
    const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({});
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const posterRef = useRef<HTMLDivElement>(null);

    // Reset user rating when movie changes
    useEffect(() => {
        setUserRating(0);
    }, [movieId]);

    // Track mouse position for tooltip
    const handleMouseMove = (e: React.MouseEvent) => {
        if (posterRef.current) {
            const rect = posterRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    // Extract dominant colors from poster image
    const extractDominantColors = (imageUrl: string): Promise<string[]> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                const canvas = canvasRef.current;
                if (!canvas) {
                    resolve(['#1f2937', '#111827']); // fallback
                    return;
                }

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(['#1f2937', '#111827']);
                    return;
                }

                canvas.width = 50;
                canvas.height = 50;
                ctx.drawImage(img, 0, 0, 50, 50);

                const imageData = ctx.getImageData(0, 0, 50, 50);
                const data = imageData.data;

                const colorCounts: { [key: string]: number } = {};

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Skip very light or very dark colors
                    const brightness = (r + g + b) / 3;
                    if (brightness < 30 || brightness > 225) continue;

                    const color = `rgb(${r},${g},${b})`;
                    colorCounts[color] = (colorCounts[color] || 0) + 1;
                }

                const sortedColors = Object.entries(colorCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 2)
                    .map(([color]) => color);

                if (sortedColors.length >= 2) {
                    resolve(sortedColors);
                } else {
                    resolve(['#1f2937', '#111827']);
                }
            };

            img.onerror = () => resolve(['#1f2937', '#111827']);
            img.src = imageUrl;
        });
    };

    // Set background based on poster availability
    useEffect(() => {
        if (posterUrl) {
            // First set a gradient background immediately
            setBackgroundStyle({
                background: 'linear-gradient(135deg, #1f2937, #111827)',
            });

            // Then try to load the poster image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                // Image loaded successfully, use it as background
                setBackgroundStyle({
                    backgroundImage: `linear-gradient(135deg, rgba(31, 41, 55, 0.7), rgba(17, 24, 39, 0.7)), url(${posterUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                });

                // Extract colors for better gradient
                extractDominantColors(posterUrl).then((colors) => {
                    if (colors.length >= 2) {
                        const color1 = colors[0].replace('rgb(', '').replace(')', '').split(',');
                        const color2 = colors[1].replace('rgb(', '').replace(')', '').split(',');
                        const gradientOverlay = `linear-gradient(135deg, rgba(${color1[0]}, ${color1[1]}, ${color1[2]}, 0.8), rgba(${color2[0]}, ${color2[1]}, ${color2[2]}, 0.8))`;

                        setBackgroundStyle({
                            backgroundImage: `${gradientOverlay}, url(${posterUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        });
                    }
                });
            };

            img.onerror = () => {
                // Image failed to load, keep gradient
                setBackgroundStyle({
                    background: 'linear-gradient(135deg, #1f2937, #111827)',
                });
            };

            img.src = posterUrl;
        } else {
            // Fallback to neutral gradient
            setBackgroundStyle({
                background: 'linear-gradient(135deg, #1f2937, #111827)',
            });
        }
    }, [posterUrl]);

    const handleZoneClick = (zone: 'left' | 'right' | 'top' | 'bottom') => {
        const movieData = {
            id: movieId,
            title,
            year,
            genre,
            posterUrl,
            rating
        };

        switch (zone) {
            case 'left':
                console.log('Movie disliked - adding to blocked list');
                onMovieAction?.('dislike', movieData);
                break;
            case 'right':
                console.log('Movie added to My List');
                onMovieAction?.('like', movieData);
                break;
            case 'top':
                console.log('Movie skipped - getting next movie');
                onMovieAction?.('skip', movieData);
                break;
            case 'bottom':
                console.log('Playing trailer for movie');
                onMovieAction?.('trailer', movieData);
                break;
        }
    };

    const handleRatingClick = (ratingValue: number) => {
        setUserRating(ratingValue);
        console.log(`Movie rated: ${ratingValue} stars - adding to watched`);
        
        const movieData = {
            id: movieId,
            title,
            year,
            genre,
            posterUrl,
            rating,
            userRating: ratingValue
        };
        
        onMovieAction?.('rate', movieData);
    };



    return (
        <div className="relative w-full h-screen overflow-hidden bg-gray-900">
            {/* Hidden canvas for color extraction */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Background */}
            <div
                className="absolute inset-0 transition-all duration-1000"
                style={backgroundStyle}
            >
                {/* Blur overlay for poster background with vignette */}
                {posterUrl && (
                    <>
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage: `url(${posterUrl})`,
                                filter: 'blur(20px) brightness(0.3)',
                                transform: 'scale(1.1)', // Prevent blur edge artifacts
                            }}
                        />
                        {/* Vignette overlay */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: 'radial-gradient(circle at center, transparent 20%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.8) 80%, rgba(0, 0, 0, 0.95) 100%)'
                            }}
                        />
                    </>
                )}
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 bg-black bg-opacity-20">

                {/* Movie Poster with Hover Zones */}
                <div className="relative group">
                    {/* Background Glow Effects */}
                    <motion.div
                        className="absolute inset-0 rounded-lg"
                        animate={{
                            boxShadow: hoveredZone === 'left'
                                ? '0 0 80px 20px rgba(239, 68, 68, 0.4), 0 0 120px 40px rgba(239, 68, 68, 0.2)'
                                : hoveredZone === 'right'
                                    ? '0 0 80px 20px rgba(34, 197, 94, 0.4), 0 0 120px 40px rgba(34, 197, 94, 0.2)'
                                    : hoveredZone === 'top'
                                        ? '0 0 80px 20px rgba(234, 179, 8, 0.4), 0 0 120px 40px rgba(234, 179, 8, 0.2)'
                                        : hoveredZone === 'bottom'
                                            ? '0 0 80px 20px rgba(255, 255, 255, 0.4), 0 0 120px 40px rgba(255, 255, 255, 0.2)'
                                            : '0 0 0px 0px rgba(0, 0, 0, 0)'
                        }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    />

                    <motion.div
                        ref={posterRef}
                        className="relative w-80 h-[480px] rounded-lg overflow-hidden shadow-2xl z-10"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                        onMouseMove={handleMouseMove}
                    >
                        {/* Poster Image */}
                        {posterUrl ? (
                            <img
                                src={posterUrl}
                                alt={`${title} poster`}
                                className="w-full h-full object-cover"
                                style={{ boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.2)' }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                <span className="text-white text-lg font-medium">{title}</span>
                            </div>
                        )}

                        {/* Triangular Hover Zones */}
                        {/* Left Zone - Dislike (left triangle) */}
                        <motion.div
                            className="absolute top-0 left-0 w-full h-full cursor-pointer z-20"
                            style={{
                                clipPath: 'polygon(0% 0%, 50% 30%, 50% 70%, 0% 100%)'
                            }}
                            onMouseEnter={() => setHoveredZone('left')}
                            onMouseLeave={() => setHoveredZone(null)}
                            onClick={() => handleZoneClick('left')}
                            whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
                            transition={{ duration: 0.2 }}
                        />

                        {/* Right Zone - Like (right triangle) */}
                        <motion.div
                            className="absolute top-0 left-0 w-full h-full cursor-pointer z-20"
                            style={{
                                clipPath: 'polygon(50% 30%, 100% 0%, 100% 100%, 50% 70%)'
                            }}
                            onMouseEnter={() => setHoveredZone('right')}
                            onMouseLeave={() => setHoveredZone(null)}
                            onClick={() => handleZoneClick('right')}
                            whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.05)' }}
                            transition={{ duration: 0.2 }}
                        />

                        {/* Top Zone - Skip (top triangle) */}
                        <motion.div
                            className="absolute top-0 left-0 w-full h-full cursor-pointer z-20"
                            style={{
                                clipPath: 'polygon(0% 0%, 100% 0%, 50% 30%)'
                            }}
                            onMouseEnter={() => setHoveredZone('top')}
                            onMouseLeave={() => setHoveredZone(null)}
                            onClick={() => handleZoneClick('top')}
                            whileHover={{ backgroundColor: 'rgba(234, 179, 8, 0.05)' }}
                            transition={{ duration: 0.2 }}
                        />

                        {/* Bottom Zone - Trailer (bottom triangle) */}
                        <motion.div
                            className="absolute top-0 left-0 w-full h-full cursor-pointer z-20"
                            style={{
                                clipPath: 'polygon(50% 70%, 0% 100%, 100% 100%)'
                            }}
                            onMouseEnter={() => setHoveredZone('bottom')}
                            onMouseLeave={() => setHoveredZone(null)}
                            onClick={() => handleZoneClick('bottom')}
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                            transition={{ duration: 0.2 }}
                        />
                    </motion.div>

                    {/* Mouse-Following Tooltip */}
                    {hoveredZone && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute z-30 px-4 py-2 text-white text-lg font-bold pointer-events-none whitespace-nowrap"
                            style={{
                                left: mousePosition.x + 20,
                                top: mousePosition.y - 10,
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                                filter: 'drop-shadow(0 0 12px rgba(0, 0, 0, 0.7))',
                                color: hoveredZone === 'left' ? '#ef4444' :
                                    hoveredZone === 'right' ? '#22c55e' : 
                                    hoveredZone === 'top' ? '#eab308' : '#ffffff'
                            }}
                            transition={{ duration: 0.1 }}
                        >
                            {hoveredZone === 'left' ? 'Nope' :
                                hoveredZone === 'right' ? 'Add to List' : 
                                hoveredZone === 'top' ? 'Skip' : 'Watch Trailer'}
                        </motion.div>
                    )}
                </div>

                {/* Movie Info */}
                <div className="mt-8 text-center text-white max-w-md">
                    <h2 className="text-3xl font-bold mb-3 tracking-tight">{title}</h2>
                    <p className="text-gray-400 text-lg mb-4 font-medium">{year} • {genre?.replace(/,\s*/g, ' • ')}</p>
                </div>

                {/* Interactive Rating */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-yellow-500 font-medium text-sm">
                            {userRating > 0 ? `${userRating}/5` : `${rating.toFixed(1)}/5`}
                        </span>
                        <span className="text-gray-500 text-xs">
                            {userRating > 0 ? '• Your Rating' : '• Public Rating'}
                        </span>
                    </div>
                    <p className="text-gray-400 text-xs mb-3">
                        {userRating > 0 ? 'You rated this movie' : 'Click stars to rate'}
                    </p>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-1 mt-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                            key={star}
                            onClick={() => handleRatingClick(star)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-1"
                        >
                            <Star
                                className={`w-8 h-8 ${
                                    star <= (userRating > 0 ? userRating : rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-400 hover:text-yellow-400'
                                } transition-colors duration-200`}
                            />
                        </motion.button>
                    ))}
                </div>

                {/* Reason Text */}
                <p className="text-gray-400 text-base mt-8 max-w-lg text-center leading-relaxed font-light italic">
                    {reason}
                </p>


            </div>
        </div>
    );
}