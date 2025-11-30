# Frontend - Imtehaan AI EdTech Platform

This folder contains a complete, working frontend application for the Imtehaan AI EdTech Platform.

## 📁 Folder Structure

```
frontend/
├── components/          # React components
│   ├── ui/             # UI component library (shadcn/ui)
│   ├── modals/         # Modal components
│   ├── Dashboard/      # Dashboard-specific components
│   ├── Analytics/      # Analytics components
│   ├── AIFeedback/     # AI Feedback components
│   └── Practice/       # Practice mode components
├── utils/              # Utility functions
│   └── supabase/       # Supabase client and services
├── hooks/              # React hooks
├── constants/          # Constants and configuration
├── styles/             # CSS stylesheets
├── supabase/           # Supabase SQL files and functions
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
├── index.html          # HTML template
├── package.json        # Dependencies
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
├── *.png               # Image assets
└── *.mp4               # Video assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend folder with the following variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## 🖼️ Media Assets

The frontend includes all necessary media files:
- **Images**: Logo files, UI images, and other visual assets
- **Videos**: Animation videos and educational content

All media files are located in the root of the frontend folder and can be referenced directly in components.

## 📦 Key Features

- **Authentication**: Complete authentication system with Supabase
- **Dashboard**: Student dashboard with analytics and progress tracking
- **AI Tutor**: Interactive AI-powered tutoring system
- **Practice Mode**: Practice questions with AI grading
- **Mock Exams**: Full mock exam system
- **Flashcards**: Interactive flashcard learning
- **Analytics**: Comprehensive learning analytics
- **Study Plans**: Personalized study plan management

## 🛠️ Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Supabase** - Backend and authentication
- **Radix UI** - UI component primitives
- **Chart.js** - Data visualization
- **Framer Motion** - Animations

## 📝 Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

Optional environment variables:

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8000)
- `VITE_ENABLE_DEBUG` - Enable debug mode (default: false)

## 🔧 Configuration

### Vite Configuration

The `vite.config.ts` file includes:
- React plugin
- Path aliases (@components, @utils, @styles)
- Proxy configuration for API requests
- Build optimizations

### TypeScript Configuration

The `tsconfig.json` is configured for:
- React JSX
- ES modules
- Strict type checking (disabled for flexibility)

### Tailwind Configuration

Custom theme configuration with brand colors and design tokens.

## 📚 Component Structure

### Main Components

- `App.tsx` - Main application router and context provider
- `StudentDashboard.tsx` - Main dashboard page
- `AITutorPage.tsx` - AI tutor interface
- `PracticeMode.tsx` - Practice question interface
- `MockExamPage.tsx` - Mock exam interface

### UI Components

All UI components are in `components/ui/` and follow the shadcn/ui pattern.

### Supabase Integration

- `utils/supabase/client.ts` - Supabase client initialization
- `utils/supabase/AuthContext.tsx` - Authentication context
- `utils/supabase/services.ts` - Data service functions
- `utils/supabase/analytics-*.ts` - Analytics tracking services

## 🗄️ Supabase Files

The `supabase/` folder contains:
- SQL schema files
- Table creation scripts
- RPC functions
- Migration files

## 🎨 Styling

- Global styles: `styles/globals.css`
- Component styles: `styles/components.css`
- Page-specific styles: `styles/pages.css`
- Tailwind utilities are used throughout

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔐 Authentication Flow

1. User signs up/logs in via Supabase Auth
2. AuthContext manages authentication state
3. Protected routes redirect to login if not authenticated
4. User data is fetched and stored in context

## 📊 Analytics

The application includes comprehensive analytics:
- Learning activity tracking
- Page session tracking
- Study time tracking
- Performance metrics

## 🐛 Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure `.env` file is in the frontend root
   - Restart the dev server after adding env variables

2. **Supabase connection errors**
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
   - Check Supabase project is active

3. **Build errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run build`

## 📄 License

This is part of the Imtehaan AI EdTech Platform.

## 🤝 Support

For issues or questions, refer to the main project documentation.

