import React, { createContext, useContext, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { StudentDashboard } from './components/StudentDashboard';
import { StudyPlanPage } from './components/StudyPlanPage';
import { PracticeMode } from './components/PracticeMode';
import { FlashcardSelection } from './components/FlashcardSelection';
import { FlashcardPage } from './components/FlashcardPage';
import { SubjectOverview } from './components/SubjectOverview';
import { AIFeedback } from './components/AIFeedback';
import { PricingPage } from './components/PricingPage';
import { AITutorPage } from './components/AITutorPage';
import { VisualLearning } from './components/VisualLearning';
import Analytics from './components/Analytics';
import { SettingsPage } from './components/SettingsPage';
import { MockExamPage } from './components/MockExamPage';
import { MockExamSelection } from './components/MockExamSelection';
import { MockExamP2 } from './components/MockExamP2';
import { TopicSelection } from './components/TopicSelection';
import { AITutorTopicSelection } from './components/AITutorTopicSelection';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/TermsOfServicePage';
import { ContactSupportPage } from './components/ContactSupportPage';
import { HelpCenterPage } from './components/HelpCenterPage';
import { ToastProvider } from './components/ui/toast';
import { AuthProvider, useAuth } from './utils/supabase/AuthContext';
import { analyticsBufferService } from './utils/supabase/analytics-buffer-service';
import { validateEnv } from './utils/env-validator';

// Types
export type Page = 
  | 'landing'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'reset-password'
  | 'onboarding'
  | 'dashboard'
  | 'study-plan'
  | 'practice'
  | 'flashcard-selection'
  | 'flashcards'
  | 'subject'
  | 'feedback'
  | 'pricing'
  | 'ai-tutor'
  | 'ai-tutor-topic-selection'
  | 'visual-learning'
  | 'analytics'
  | 'settings'
  | 'mock-exam'
  | 'mock-exam-selection'
  | 'mock-exam-p2'
  | 'topic-selection'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'contact-support'
  | 'help-center';

export type Language = 'en';
export type Curriculum = 'igcse' | 'ib' | 'sat' | 'ap' | 'all';

export interface Subject {
  id: string;
  name: string;
  curriculum: Curriculum;
  grade: string;
  topics: any[];
  progress: number;
  color: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  duration: number;
  goals: string[];
  created_at: string;
}

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  questions_answered: number;
  correct_answers: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

// App Context Type
interface AppContextType {
  // Core state
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  curriculum: Curriculum;
  setCurriculum: (curr: Curriculum) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Data state
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
  currentSubject: Subject | null;
  setCurrentSubject: (subject: Subject | null) => void;
  
  // Study plan state
  studyPlans: StudyPlan[];
  setStudyPlans: (plans: StudyPlan[]) => void;
  
  // Study sessions state
  studySessions: StudySession[];
  setStudySessions: (sessions: StudySession[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default function App() {
  // Validate environment variables before starting the app
  React.useEffect(() => {
    try {
      validateEnv();
    } catch (error) {
      console.error('Environment validation failed:', error);
      // In production, you might want to show a user-friendly error page
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  // Get the authenticated user from AuthContext
  const { user: authUser, loading: authLoading } = useAuth();
  
  // Initialize currentPage - don't set it until we know auth status
  const getInitialPage = (): Page | null => {
    try {
      const savedPage = localStorage.getItem('imtehaan_current_page');
      if (savedPage) {
        return savedPage as Page;
      }
    } catch (error) {
      console.error('Error reading saved page:', error);
    }
    return null; // Return null to indicate we need to wait for auth check
  };
  
  // Core state - start with null page to prevent flash
  const [currentPage, setCurrentPage] = useState<Page | null>(getInitialPage());
  const [language, setLanguage] = useState<Language>('en');
  const [curriculum, setCurriculum] = useState<Curriculum>('igcse');
  const [user, setUser] = useState<User | null>(null);
  const [isContextReady, setIsContextReady] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Initialize analytics buffer service and sync pending data on app load
  React.useEffect(() => {
    console.log('🔄 Initializing analytics buffer service...');
    
    // Initialize fresh day if needed (clears old buffers)
    if (authUser?.id) {
      analyticsBufferService.initializeFreshDay(authUser.id);
    }
    
    // Sync any pending data
    analyticsBufferService.syncPendingData();
  }, [authUser?.id]);
  
  // Save current page to localStorage whenever it changes
  React.useEffect(() => {
    if (currentPage) {
      try {
        localStorage.setItem('imtehaan_current_page', currentPage);
      } catch (error) {
        console.error('Error saving current page:', error);
      }
    }
  }, [currentPage]);

  // Scroll to top whenever page changes
  React.useEffect(() => {
    if (currentPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);
  
  // Update user state when authUser changes
  React.useEffect(() => {
    // Wait for auth to finish loading before making decisions
    if (authLoading) return;
    
    if (authUser) {
      // Convert AuthContext User to App User type
      const appUser: User = {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.name,
        avatar_url: undefined
      };
      setUser(appUser);
      
      // Handle page routing for authenticated users
      const publicPages: Page[] = ['landing', 'login', 'signup', 'forgot-password', 'reset-password', 'privacy-policy', 'terms-of-service', 'contact-support', 'help-center'];
      const savedPage = localStorage.getItem('imtehaan_current_page');
      
      // If currentPage is null (initial load) or on a public page, redirect appropriately
      if (currentPage === null || publicPages.includes(currentPage)) {
        if (savedPage && !publicPages.includes(savedPage as Page)) {
          // Restore the saved protected page
          setCurrentPage(savedPage as Page);
        } else {
          // Default to dashboard for authenticated users
          setCurrentPage('dashboard');
        }
      }
      // If already on a protected page, keep them there
    } else {
      setUser(null);
      
      // Handle page routing for non-authenticated users
      const publicPages: Page[] = ['landing', 'login', 'signup', 'forgot-password', 'reset-password', 'privacy-policy', 'terms-of-service', 'contact-support', 'help-center'];
      
      // If on a protected page or null, redirect to landing page
      if (currentPage === null || !publicPages.includes(currentPage)) {
        // Clear saved page when logged out
        try {
          localStorage.removeItem('imtehaan_current_page');
        } catch (error) {
          console.error('Error clearing saved page:', error);
        }
        setCurrentPage('landing');
      }
    }
    
    setInitialLoadComplete(true);
  }, [authUser, authLoading]);

  // Check for authentication tokens in URL hash
  React.useEffect(() => {
    const hash = window.location.hash;
    
    // Only redirect to reset-password if it's specifically a recovery/password reset token
    if (hash.includes('type=recovery')) {
      setCurrentPage('reset-password');
      // Clean up the hash
      window.history.replaceState(null, '', window.location.pathname);
    }
    // For email verification (type=signup or type=email), redirect to login
    else if (hash.includes('type=signup') || hash.includes('type=email')) {
      setCurrentPage('login');
      // Clean up the hash
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);
  
  // Data state
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: '1',
      name: 'Mathematics',
      curriculum: 'all',
      grade: 'IGCSE',
      topics: [],
      progress: 75,
      color: 'bg-blue-500'
    },
    {
      id: '2', 
      name: 'Physics',
      curriculum: 'all',
      grade: 'IGCSE',
      topics: [],
      progress: 60,
      color: 'bg-green-500'
    },
    {
      id: '3',
      name: 'Chemistry',
      curriculum: 'all',
      grade: 'IGCSE', 
      topics: [],
      progress: 85,
      color: 'bg-purple-500'
    },
    {
      id: '4',
      name: 'Biology',
      curriculum: 'all',
      grade: 'IGCSE',
      topics: [],
      progress: 45,
      color: 'bg-orange-500'
    }
  ]);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  
  // Study plan state
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  
  // Study sessions state
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);

  // Ensure context is ready
  React.useEffect(() => {
    setIsContextReady(true);
  }, []);

  const contextValue: AppContextType = {
    // Core state
    currentPage,
    setCurrentPage,
    language,
    setLanguage,
    curriculum,
    setCurriculum,
    user,
    setUser,
    
    // Data state
    subjects,
    setSubjects,
    currentSubject,
    setCurrentSubject,
    
    // Study plan state
    studyPlans,
    setStudyPlans,
    
    // Study sessions state
    studySessions,
    setStudySessions,
  };

  // Show loading screen while auth is checking or page is not determined yet
  if (authLoading || !initialLoadComplete || currentPage === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render until context is ready
  if (!isContextReady) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Define public pages that don't require authentication
  const publicPages: Page[] = ['landing', 'login', 'signup', 'forgot-password', 'reset-password', 'privacy-policy', 'terms-of-service', 'contact-support', 'help-center'];
  
  // Check if current page requires authentication
  const requiresAuth = !publicPages.includes(currentPage);
  
  // If page requires auth and user is not logged in, redirect to login
  if (requiresAuth && !user) {
    // Set the intended page to redirect back after login
    const intendedPage = currentPage;
    setCurrentPage('login');
  }

  // Render the appropriate page
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignUpPage />;
      case 'forgot-password':
        return <ForgotPasswordPage />;
      case 'reset-password':
        return <ResetPasswordPage />;
      case 'onboarding':
        return <OnboardingFlow />;
      case 'dashboard':
        return <StudentDashboard />;
      case 'study-plan':
        return <StudyPlanPage />;
      case 'practice':
        return <PracticeMode />;
      case 'flashcard-selection':
        return <FlashcardSelection />;
      case 'flashcards':
        return <FlashcardPage />;
      case 'subject':
        return <SubjectOverview />;
      case 'feedback':
        return <AIFeedback />;
      case 'pricing':
        return <PricingPage />;
      case 'ai-tutor':
        return <AITutorPage />;
      case 'ai-tutor-topic-selection':
        return <AITutorTopicSelection />;
      case 'visual-learning':
        return <VisualLearning />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SettingsPage />;
      case 'mock-exam':
        return <MockExamPage />;
      case 'mock-exam-selection':
        return <MockExamSelection />;
      case 'mock-exam-p2':
        return <MockExamP2 />;
      case 'topic-selection':
        return <TopicSelection />;
      case 'privacy-policy':
        return <PrivacyPolicyPage />;
      case 'terms-of-service':
        return <TermsOfServicePage />;
      case 'contact-support':
        return <ContactSupportPage />;
      case 'help-center':
        return <HelpCenterPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <ToastProvider>
        <div className="min-h-screen bg-background text-foreground" dir="ltr">
          {renderPage()}
        </div>
      </ToastProvider>
    </AppContext.Provider>
  );
}