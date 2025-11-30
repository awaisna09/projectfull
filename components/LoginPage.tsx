import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Logo } from './Logo';
import { useApp } from '../App';
import { useAuth } from '../utils/supabase/AuthContext';
import { userService } from '../utils/supabase/services';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  ArrowLeft, 
  Globe
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const palette = {
  violet: '#9B4DFF',
  magenta: '#FF4D91',
  coral: '#FF6C6C',
  lightViolet: 'rgba(155,77,255,0.12)',
  lightMagenta: 'rgba(255,77,145,0.12)',
  lightCoral: 'rgba(255,108,108,0.12)'
};

const translations = {
  en: {
    title: "Welcome Back",
    subtitle: "Sign in to continue your learning journey",
    email: "Email Address",
    password: "Password",
    forgotPassword: "Forgot your password?",
    signIn: "Sign In",
    signInWithGoogle: "Sign in with Google",
    orContinueWith: "or continue with",
    noAccount: "Don't have an account?",
    createAccount: "Create one here",
    backToHome: "Back to Home",
    emailPlaceholder: "Enter your email address",
    passwordPlaceholder: "Enter your password",
    switchToEmail: "Sign in with Email",
    errors: {
      emailRequired: "Email address is required",
      passwordRequired: "Password is required",
      invalidCredentials: "Invalid email or password"
    }
  },};

export function LoginPage() {
  const {setCurrentPage, setUser} = useApp();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const t = translations.en;

  // Show success message if user just signed up
  useEffect(() => {
    const justSignedUp = sessionStorage.getItem('justSignedUp');
    if (justSignedUp === 'true') {
      setShowSuccessMessage(true);
      sessionStorage.removeItem('justSignedUp');
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError(t.errors.emailRequired);
      return false;
    }
    if (!formData.password.trim()) {
      setError(t.errors.passwordRequired);
      return false;
    }
    return true;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting to sign in with:', formData.email);
      const { data, error } = await signIn(formData.email, formData.password);
      console.log('Signin response:', { data, error });

      if (error) {
        console.error('Signin error:', error);
        setError(error.message || t.errors.invalidCredentials);
        setIsLoading(false);
        return;
      }

      if (!data) {
        console.error('No data returned from signin');
        setError('No data returned from signin');
        setIsLoading(false);
        return;
      }

      console.log('Processing signin data:', data);

      // Handle the new data structure from simplified AuthService
      let userProfile;
      
      if (data.auth && data.profile) {
        // New structure: { auth: authData, profile: profileData }
        userProfile = data.profile;
        console.log('Using profile data:', userProfile);
      } else if (data.user) {
        // Fallback for old structure or local auth
        userProfile = data.user;
        console.log('Using user data:', userProfile);
      } else if (data.auth?.user) {
        // Supabase auth data without profile
        userProfile = data.auth.user;
        console.log('Using auth user data:', userProfile);
      } else {
        // No user data found
        console.error('No user profile found in data:', data);
        setError('Authentication successful but no user data found');
        setIsLoading(false);
        return;
      }

      // Create user object from profile data
      const user = {
        id: userProfile.id,
        email: userProfile.email || '',
        full_name: userProfile.full_name || userProfile.name || userProfile.email?.split('@')[0] || 'User'
      };
      
      console.log('Created user object:', user);
      
      // Reset daily time spent on login
      console.log('🔄 LOGIN PAGE: User signed in, initializing analytics...');
      try {
        const { analyticsBufferService } = await import('../utils/supabase/analytics-buffer-service');
        await analyticsBufferService.initializeFreshDay(user.id);
        console.log('✅ LOGIN PAGE: Daily time spent reset completed');
      } catch (error) {
        console.error('❌ LOGIN PAGE: Failed to reset daily time spent:', error);
      }
      
      setUser(user);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Signin exception:', error);
      setError(t.errors.invalidCredentials);
    } finally {
      setIsLoading(false);
    }
  };


  const backgroundGradient = `linear-gradient(135deg, ${palette.lightViolet}, ${palette.lightMagenta}, ${palette.lightCoral})`;
  const cardOverlayGradient = 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.92))';
  const headerBarGradient = `linear-gradient(90deg, ${palette.lightViolet}, ${palette.lightMagenta})`;
  const primaryGradient = `linear-gradient(90deg, ${palette.violet}, ${palette.magenta}, ${palette.coral})`;

  return (
    <div
      className="min-h-screen lg:h-screen overflow-hidden flex flex-col lg:flex-row"
      style={{ background: backgroundGradient }}
    >
      {/* Left side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-10 lg:py-16 lg:h-screen">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-black mb-1">{t.title}</h1>
            <p className="text-sm text-gray-600">{t.subtitle}</p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 rounded-2xl"
                style={{ background: cardOverlayGradient }}
              ></div>
              <div className="relative z-10">
                <CardHeader
                  className="space-y-1 pb-2 border-b"
                  style={{ background: headerBarGradient, borderColor: 'rgba(155,77,255,0.2)' }}
                >
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentPage('landing')}
                      className="text-gray-600 p-1.5 rounded-lg text-sm transition-all duration-200"
                      style={{
                        color: palette.violet,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = palette.lightViolet;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      {t.backToHome}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 p-4">
                  {error && (
                    <Alert className="border-red-200/50 text-red-700 bg-red-50/80 backdrop-blur-sm rounded-xl py-2">
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )}

                  {showSuccessMessage && (
                    <Alert className="border-green-200/50 text-green-700 bg-green-50/80 backdrop-blur-sm rounded-xl py-2">
                      <AlertDescription className="text-sm">
                        {true 
                          ? '✅ Signup successful! Please sign in to continue.' 
                          : '✅ تم التسجيل بنجاح! يرجى تسجيل الدخول للمتابعة.'
                        }
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleEmailSignIn} className="space-y-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs font-semibold text-gray-700">{t.email}</Label>
                      <div className="relative group">
                        <Input
                          id="email"
                          type="email"
                          placeholder={t.emailPlaceholder}
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={isLoading}
                          className="bg-white/85 border-gray-200 focus:border-[#9B4DFF] focus:ring-2 focus:ring-[#9B4DFF]/25 rounded-xl transition-all duration-200 group-hover:border-[#9B4DFF] h-9 text-sm"
                        />
                        <div
                          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ background: `linear-gradient(90deg, transparent, ${palette.lightViolet}, transparent)` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="password" className="text-xs font-semibold text-gray-700">{t.password}</Label>
                      <div className="relative group">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t.passwordPlaceholder}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          disabled={isLoading}
                          className="bg-white/85 border-gray-200 focus:border-[#9B4DFF] focus:ring-2 focus:ring-[#9B4DFF]/25 rounded-xl transition-all duration-200 group-hover:border-[#9B4DFF] pr-10 h-9 text-sm"
                        />
                        <div
                          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ background: `linear-gradient(90deg, transparent, ${palette.lightMagenta}, transparent)` }}
                        ></div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 transition-colors duration-200"
                          style={{ color: palette.violet }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = palette.magenta)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = palette.violet)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage('forgot-password')}
                        className="text-xs p-1 rounded-lg transition-all duration-200 h-7"
                        style={{ color: palette.magenta }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = palette.lightMagenta)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {t.forgotPassword}
                      </Button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm h-10"
                      style={{ background: '#000000' }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/80 mr-2"></div>
                          {t.signIn}
                        </div>
                      ) : (
                        t.signIn
                      )}
                    </Button>
                  </form>

                  <div className="text-center text-xs text-gray-600">
                    {t.noAccount}{' '}
                    <button
                      onClick={() => setCurrentPage('signup')}
                        className="underline font-medium transition-all duration-200"
                        style={{ color: palette.violet }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = palette.magenta)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = palette.violet)}
                    >
                      {t.createAccount}
                    </button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-10 lg:h-screen">
        <div className="w-full max-w-lg text-center space-y-6">
          <img 
            src="./ChatGPT Image Nov 11, 2025, 10_31_00 PM (1).png" 
            alt="Studious Panda with Imtehaan.ai" 
            className="w-full max-w-sm xl:max-w-md mx-auto"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {'Welcome to AI-Powered Learning'}
            </h2>
            <p className="text-gray-600">
              {true 
                ? 'Join thousands of students excelling with our intelligent tutoring platform'
                : 'انضم إلى آلاف الطلاب المتفوقين مع منصة التدريس الذكية لدينا'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}