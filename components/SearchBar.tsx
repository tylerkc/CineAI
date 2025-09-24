'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';

export default function SearchBar() {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      console.log('Search query:', searchValue);
      // Placeholder toast notification
      showToast(`Searching for: "${searchValue}"`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Simple toast notification (placeholder)
  const showToast = (message: string) => {
    // For now, just log - later we can integrate with a proper toast system
    console.log('Toast:', message);
    alert(`🔍 ${message}\n\n(This will be connected to semantic search later)`);
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center z-30 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="pointer-events-auto"
      >
      <motion.form
        onSubmit={handleSearch}
        className="relative"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={`flex items-center gap-4 px-6 py-4 bg-black/30 backdrop-blur-md rounded-full border transition-all duration-300 ${
            isFocused 
              ? 'border-white/20 bg-black/40 shadow-lg shadow-white/10' 
              : 'border-white/10 hover:border-white/15'
          }`}
          animate={{
            width: isFocused ? 500 : 450,
            boxShadow: isFocused 
              ? '0 0 30px rgba(255, 255, 255, 0.15)' 
              : '0 0 0px rgba(255, 255, 255, 0)'
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Search Icon */}
          <motion.div
            animate={{ 
              scale: isFocused ? 1.1 : 1,
              color: isFocused ? '#ffffff' : '#9ca3af'
            }}
            transition={{ duration: 0.2 }}
          >
            <Search className="w-5 h-5 flex-shrink-0" />
          </motion.div>

          {/* Input Field */}
          <input
            type="text"
            value={searchValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="I'm looking for…"
            className="flex-1 bg-transparent text-white text-base placeholder-gray-400 outline-none"
          />

          {/* AI Sparkles Icon */}
          <motion.div
            animate={{ 
              opacity: isFocused ? 1 : 0.6,
              scale: isFocused ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
          </motion.div>

          {/* Submit Button (Hidden but functional) */}
          <button
            type="submit"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Search"
          />
        </motion.div>

        {/* Floating hint text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isFocused ? 1 : 0,
            y: isFocused ? 0 : 10
          }}
          transition={{ duration: 0.2 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs text-gray-400 pointer-events-none whitespace-nowrap"
        >
          Press Enter to search
        </motion.div>
      </motion.form>
      </motion.div>
    </div>
  );
}