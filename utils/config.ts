/**
 * Application Configuration
 * Manages environment variables and API endpoints
 */

// Get API base URL from environment variable or default to localhost for development
// Force localhost if Railway URL is detected (Railway backend deleted)
const envUrl = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = (envUrl && envUrl.includes('railway')) 
  ? 'http://localhost:8000' 
  : (envUrl || 'http://localhost:8000');

// Supabase configuration (from environment variables)
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// API Endpoints
export const API_ENDPOINTS = {
  // AI Tutor
  askAITutor: `${API_BASE_URL}/ask-tutor`,
  generateLesson: `${API_BASE_URL}/generate-lesson`,
  
  // Grading
  gradeAnswer: `${API_BASE_URL}/grade-answer`,
  gradeMockExam: `${API_BASE_URL}/grade-mock-exam`,
  
  // Health
  health: `${API_BASE_URL}/health`,
  status: `${API_BASE_URL}/status`,
} as const;

// Feature flags
export const FEATURES = {
  enableAITutor: true,
  enableGrading: true,
  enableMockExams: true,
  enableAnalytics: true,
} as const;

// Development mode detection
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Logging helper
export const logConfig = () => {
  if (isDevelopment) {
    console.log('🔧 Configuration:', {
      apiBaseUrl: API_BASE_URL,
      environment: isProduction ? 'production' : 'development',
      features: FEATURES,
    });
  }
};

