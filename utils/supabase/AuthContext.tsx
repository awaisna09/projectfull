import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './client';
import { supabaseUrl, publicAnonKey } from './info';
import { AuthService, UserCredentials } from './auth-service';
import { comprehensiveAnalyticsService } from './comprehensive-analytics-service';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'student' | 'teacher' | 'admin';
  curriculum: 'igcse' | 'o-levels' | 'a-levels' | 'edexcel' | 'ib';
  grade: string;
  subjects: string[];
  preferences: {
    language: 'en';
    notifications: boolean;
    darkMode: boolean;
    theme: 'light' | 'dark';
    autoPlayFlashcards: boolean;
    showHints: boolean;
    soundEffects: boolean;
    studyReminders: boolean;
    dailyGoal: number;
  };
}

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, metadata: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  language?: 'en';
}

export function AuthProvider({ children, language = 'en' }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Local storage for demo authentication
  const LOCAL_STORAGE_KEY = 'imtehaan_user';

  // Check if Supabase is properly configured
  const isSupabaseConfigured = () => {
    try {
      return supabase && 
             supabase.auth && 
             typeof supabase.auth.signUp === 'function';
    } catch (error) {
      console.log('Supabase configuration check failed:', error);
      return false;
    }
  };

  // Local authentication functions (fallback)
  const localSignUp = async (email: string, password: string, metadata: any) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: `local_${Date.now()}`,
        name: metadata.full_name || 'User',
        email,
        type: metadata.user_type || 'student',
        curriculum: 'igcse',
        grade: 'Year 10',
        subjects: ['Mathematics', 'Physics', 'Chemistry'],
        preferences: {
          language,
          notifications: metadata.preferences?.notifications || false,
          darkMode: false,
          theme: 'light',
          autoPlayFlashcards: true,
          showHints: true,
          soundEffects: true,
          studyReminders: true,
          dailyGoal: 60
        }
      };

      // Store in localStorage but don't set as current user
      // User needs to login separately
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
      
      return { data: { user: newUser }, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Local signup failed' } };
    }
  };

  const localSignIn = async (email: string, password: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!storedUser) {
        return { data: null, error: { message: 'No account found with this email' } };
      }

      const user = JSON.parse(storedUser);
      if (user.email !== email) {
        return { data: null, error: { message: 'Invalid email or password' } };
      }

      // For local auth, we'll just check if the email matches
      // In a real implementation, you'd verify the password hash
      
      // No longer resetting on login - buffer system handles daily resets
      console.log('✅ LOCAL AUTH: User signed in, buffer system active');
      
      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Local signin failed' } };
    }
  };

  const localSignOut = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem('imtehaan_current_page');
      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Local signout failed' } };
    }
  };

  const localSignInWithGoogle = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For local auth, we'll create a mock Google user
      const mockUser: User = {
        id: `google_${Date.now()}`,
        name: 'Google User',
        email: 'google@example.com',
        type: 'student',
        curriculum: 'igcse',
        grade: 'Year 10',
        subjects: ['Mathematics', 'Physics', 'Chemistry'],
        preferences: {
          language,
          notifications: true,
          darkMode: false,
          theme: 'light',
          autoPlayFlashcards: true,
          showHints: true,
          soundEffects: true,
          studyReminders: true,
          dailyGoal: 60
        }
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Local Google signin failed' } };
    }
  };

  // Authentication functions
  const signUp = async (email: string, password: string, metadata: any) => {
    if (isSupabaseConfigured()) {
      try {
        const result = await AuthService.signUp({
          email,
          password,
          full_name: metadata.full_name,
          user_type: metadata.user_type || 'student',
          curriculum: metadata.curriculum || 'igcse',
          grade: metadata.grade || 'Year 10',
          subjects: metadata.subjects || ['Mathematics', 'Physics', 'Chemistry'],
          preferences: metadata.preferences || {}
        });
        
        if (result.error) {
          return { error: result.error };
        }
        
        return { data: result.data };
      } catch (error) {
        return { error: { message: 'Signup failed' } };
      }
    } else {
      return localSignUp(email, password, metadata);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured()) {
      try {
        const result = await AuthService.signIn(email, password);
        if (result.error) {
          return { error: result.error };
        }
        
        // Return the data in the expected format
        return { data: result.data };
      } catch (error) {
        return { error: { message: 'Signin failed' } };
      }
    } else {
      return localSignIn(email, password);
    }
  };

  const signOut = async () => {
    // Clear ALL saved data on logout
    localStorage.removeItem('imtehaan_current_page');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    
    // Clear user state immediately
    setUser(null);
    
    if (isSupabaseConfigured()) {
      try {
        const result = await AuthService.signOut();
        if (result.error) {
          // Handle signout error
          return { error: result.error };
        }
        return { success: true };
      } catch (error) {
        // Handle signout error
        return { error: { message: 'Signout failed' } };
      }
    } else {
      return localSignOut();
    }
  };

  const signInWithGoogle = async () => {
    if (isSupabaseConfigured()) {
      try {
        const result = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (result.error) {
          // Handle OAuth error
          return { error: result.error };
        }
        
        return { success: true };
      } catch (error) {
        // Handle OAuth error
        return { error: { message: 'Google signin failed' } };
      }
    } else {
      return localSignInWithGoogle();
    }
  };

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check Supabase session first (if configured)
        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Convert Supabase user to our User format
            const userData: User = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              type: session.user.user_metadata?.user_type || 'student',
              curriculum: session.user.user_metadata?.curriculum || 'igcse',
              grade: session.user.user_metadata?.grade || 'Year 10',
              subjects: session.user.user_metadata?.subjects || ['Mathematics', 'Physics', 'Chemistry'],
              preferences: {
                language: session.user.user_metadata?.preferences?.language || language,
                notifications: session.user.user_metadata?.preferences?.notifications || false,
                darkMode: session.user.user_metadata?.preferences?.darkMode || false,
                theme: session.user.user_metadata?.preferences?.theme || 'light',
                autoPlayFlashcards: session.user.user_metadata?.preferences?.autoPlayFlashcards ?? true,
                showHints: session.user.user_metadata?.preferences?.showHints ?? true,
                soundEffects: session.user.user_metadata?.preferences?.soundEffects ?? true,
                studyReminders: session.user.user_metadata?.preferences?.studyReminders ?? true,
                dailyGoal: session.user.user_metadata?.preferences?.dailyGoal || 60
              }
            };
            setUser(userData);
            setLoading(false);
            return;
          }
        }

        // Only check local storage as fallback if Supabase is not configured or no session exists
        const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Session check failed:', error);
        // Clear any stale data on error
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem('imtehaan_current_page');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [language]);

  // Listen for auth changes
  useEffect(() => {
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const userData: User = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              type: session.user.user_metadata?.user_type || 'student',
              curriculum: session.user.user_metadata?.curriculum || 'igcse',
              grade: session.user.user_metadata?.grade || 'Year 10',
              subjects: session.user.user_metadata?.subjects || ['Mathematics', 'Physics', 'Chemistry'],
              preferences: {
                language: session.user.user_metadata?.preferences?.language || language,
                notifications: session.user.user_metadata?.preferences?.notifications || false,
                darkMode: session.user.user_metadata?.preferences?.darkMode || false,
                theme: session.user.user_metadata?.preferences?.theme || 'light',
                autoPlayFlashcards: session.user.user_metadata?.preferences?.autoPlayFlashcards ?? true,
                showHints: session.user.user_metadata?.preferences?.showHints ?? true,
                soundEffects: session.user.user_metadata?.preferences?.soundEffects ?? true,
                studyReminders: session.user.user_metadata?.preferences?.studyReminders ?? true,
                dailyGoal: session.user.user_metadata?.preferences?.dailyGoal || 60
              }
            };
            
            // No longer resetting on login - buffer system handles daily resets
            console.log('✅ AUTH: User signed in, buffer system active');
            
            setUser(userData);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, [language]);

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 