# CineAI - Movie Recommendation System

A clean, fast movie recommendation app built with Next.js 14, TypeScript, and TMDB API integration. Features user ratings, personalized lists, and intelligent movie suggestions.

## ✨ Features

- 🎬 **Movie Discovery**: Browse popular, trending, and personalized recommendations
- ⭐ **User Ratings**: Rate movies 1-5 stars and track your preferences  
- 📝 **Personal Lists**: Maintain "My List" and "Watched" collections
- 🎲 **Surprise Me**: Random movie selection from your saved movies
- 💾 **Data Management**: Export, import, and backup your movie data
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Fast Performance**: Optimized loading with robust offline fallbacks

## 🏗️ Project Structure

```
cineai/
├── 📱 app/                        # Next.js App Router
│   ├── api/                       # API routes (serverless functions)
│   │   ├── movie-trailer/[id]/    # Movie trailer endpoints
│   │   ├── random-movie/          # Random movie selection
│   │   └── sample-lists/          # Sample data endpoint
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
│
├── 🧩 components/                 # React components
│   ├── CineAI.tsx                 # Main movie display component
│   ├── InfoPanel.tsx              # Movie information panel
│   ├── RecommendationDemo.tsx     # Recommendation integration
│   ├── SearchBar.tsx              # Movie search functionality
│   ├── Sidebar.tsx                # Movie lists sidebar
│   └── UserProfile.tsx            # User profile and data management
│
├── 📚 lib/                        # Core utilities and logic
│   ├── cn.ts                      # Utility functions
│   ├── movieStorage.ts            # Local storage management
│   ├── recommendations.ts         # Recommendation algorithms
│   ├── recommendationIntegration.ts # UI integration layer
│   └── tmdb.ts                    # TMDB API integration
│
├── 🌐 public/                     # Static assets
│   └── data/
│       └── fallback-movies.json   # Offline fallback data
│
└── ⚙️ Configuration files          # Next.js, TypeScript, Tailwind configs
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- TMDB API key (free from [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cineai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your TMDB API key:
   ```env
   TMDB_API_KEY=your_tmdb_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How It Works

### Movie Recommendations
- **TMDB Integration**: Fetches popular, trending, and detailed movie data
- **Smart Filtering**: Excludes movies you've already watched or blocked
- **Fallback System**: Works offline with cached movie data
- **Fast Loading**: Optimized API calls with timeout protection

### User Data Management
- **Local Storage**: All data stored in your browser (privacy-first)
- **Export/Import**: Backup and restore your movie data as JSON
- **Statistics**: Track movies watched, ratings given, and list sizes
- **Data Persistence**: Your preferences survive browser sessions

### Rating System
- **5-Star Ratings**: Rate movies from 1-5 stars
- **Automatic Lists**: Rated movies move to "Watched" list
- **Visual Feedback**: See your ratings displayed with stars and numbers
- **Persistent Storage**: Ratings saved permanently in local storage

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **API**: TMDB (The Movie Database)

### Code Style
- TypeScript strict mode enabled
- ESLint + Next.js config for linting
- Tailwind CSS for consistent styling
- Component-based architecture
- Clean, readable code with proper error handling

## 📊 Performance & Privacy

### Performance Features
- **Fast Loading**: Optimized API calls with 5-second timeouts
- **Retry Logic**: Automatic retry on network failures
- **Offline Support**: Works without internet using fallback data
- **Efficient Storage**: Lightweight localStorage operations
- **Responsive UI**: Non-blocking user interactions

### Privacy First
- **Local Storage Only**: All user data stays in your browser
- **No Tracking**: No analytics or user behavior tracking
- **No Account Required**: Use immediately without sign-up
- **Data Control**: Export, import, or clear your data anytime
- **TMDB API Only**: Only movie metadata is fetched externally

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your `TMDB_API_KEY` environment variable
4. Deploy automatically on every push

### Manual Deployment
```bash
npm run build    # Build for production
npm start        # Start production server
```

### Environment Variables
- **Development**: `.env.local`
- **Production**: Set `TMDB_API_KEY` in your hosting platform
- **Required**: `TMDB_API_KEY` from [TMDB API](https://www.themoviedb.org/settings/api)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain clean, readable code
- Test your changes thoroughly
- Update documentation as needed
- Ensure the build passes (`npm run build`)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing the movie database API
- [Next.js](https://nextjs.org/) for the excellent React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives

---

**Built with ❤️ for movie lovers everywhere**
**Thank you for the inspiration A**
**-Tyler**