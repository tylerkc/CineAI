'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, ChevronDown, Download, Upload, Trash2, Database } from 'lucide-react';
import { exportData, importData, clearAllData, getUserStats } from '../lib/movieStorage';

interface UserProfileProps {
  username?: string;
  avatar?: string;
  onDataCleared?: () => void;
}

export default function UserProfile({ 
  username = "Movie Lover", 
  avatar,
  onDataCleared
}: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDataMenu, setShowDataMenu] = useState(false);

  // Generate initials from username
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate consistent color based on username
  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-blue-600',
      'from-yellow-500 to-orange-600',
      'from-purple-500 to-pink-600',
      'from-teal-500 to-green-600',
    ];
    
    // Use username length to pick a consistent gradient
    const index = name.length % gradients.length;
    return gradients[index];
  };

  // Data management functions
  const handleExportData = () => {
    try {
      const jsonData = exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cineai-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsOpen(false);
      console.log('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Check console for details.');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = importData(jsonData);
        
        if (success) {
          alert('Data imported successfully! Refresh the page to see changes.');
          window.location.reload();
        } else {
          alert('Error importing data. Please check the file format.');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    setIsOpen(false);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all movie data? This cannot be undone.')) {
      clearAllData();
      onDataCleared?.();
      setIsOpen(false);
      alert('All data cleared!');
    }
  };

  const handleViewData = () => {
    const jsonData = exportData();
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>CineAI Movie Data</title></head>
          <body style="font-family: monospace; padding: 20px; background: #1a1a1a; color: #fff;">
            <h1>Your CineAI Movie Data</h1>
            <pre style="background: #2a2a2a; padding: 20px; border-radius: 8px; overflow: auto;">
${jsonData}
            </pre>
          </body>
        </html>
      `);
    }
    setIsOpen(false);
  };

  const stats = getUserStats();

  return (
    <div className="fixed top-6 right-24 z-40">
      {/* Profile Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-3 bg-black/30 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/40 hover:border-white/20 transition-all duration-300 min-h-[60px]"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(username)} flex items-center justify-center text-white text-sm font-medium`}>
          {avatar ? (
            <img 
              src={avatar} 
              alt={username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(username)
          )}
        </div>

        {/* Username */}
        <span className="text-white text-sm font-medium hidden sm:block">
          {username}
        </span>

        {/* Dropdown Arrow */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-48 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl z-50"
            >
              <div className="p-2">
                {/* Profile Header */}
                <div className="px-3 py-2 border-b border-white/10 mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(username)} flex items-center justify-center text-white text-sm font-medium`}>
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt={username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(username)
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{username}</p>
                      <p className="text-gray-400 text-xs">Free Account</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-1">
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white text-sm rounded-md transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                      // TODO: Navigate to profile settings
                      console.log('Profile settings clicked');
                    }}
                  >
                    <User className="w-4 h-4" />
                    Profile Settings
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white text-sm rounded-md transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                      // TODO: Navigate to app settings
                      console.log('App settings clicked');
                    }}
                  >
                    <Settings className="w-4 h-4" />
                    App Settings
                  </motion.button>

                  <div className="border-t border-white/10 my-2"></div>

                  {/* Statistics Section */}
                  <div className="px-3 py-2 mb-4">
                    <p className="text-gray-400 text-xs font-medium mb-3">Your Statistics</p>
                    <div className="bg-white/5 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Movies Watched:</span>
                        <span className="text-white font-medium">{stats.totalMoviesWatched}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Movies Rated:</span>
                        <span className="text-white font-medium">{stats.totalMoviesRated}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Average Rating:</span>
                        <span className="text-white font-medium">{stats.averageRating}/5</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">My List:</span>
                        <span className="text-white font-medium">{stats.totalMoviesInMyList}</span>
                      </div>
                    </div>
                  </div>

                  {/* Data Management Section */}
                  <div className="px-3 py-2">
                    <p className="text-gray-400 text-xs font-medium mb-2">Data Management</p>
                    <div className="space-y-1">
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-blue-400 text-sm rounded-md transition-colors"
                        onClick={handleExportData}
                      >
                        <Download className="w-4 h-4" />
                        Export Data
                      </motion.button>

                      <motion.label
                        whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-green-400 text-sm rounded-md transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Import Data
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportData}
                          className="hidden"
                        />
                      </motion.label>

                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-purple-400 text-sm rounded-md transition-colors"
                        onClick={handleViewData}
                      >
                        <Database className="w-4 h-4" />
                        View Data
                      </motion.button>

                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-red-400 text-sm rounded-md transition-colors"
                        onClick={handleClearData}
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All Data
                      </motion.button>
                    </div>
                  </div>

                  <div className="border-t border-white/10 my-2"></div>

                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-red-400 text-sm rounded-md transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                      // TODO: Handle logout
                      console.log('Logout clicked');
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}