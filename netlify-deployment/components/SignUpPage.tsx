import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { useApp } from '../App';
import { useAuth } from '../utils/supabase/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowLeft, 
  Globe,
  User,
  GraduationCap
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const translations = {
  en: {
    title: "Create Your Account",
    subtitle: "",
    fullName: "Full Name",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",

    signUp: "Create Account",
    signUpWithGoogle: "Sign up with Google",
    orContinueWith: "or continue with",
    haveAccount: "Already have an account?",
    signInHere: "Sign in here",
    backToHome: "Back to Home",
    fullNamePlaceholder: "Enter your full name",
    emailPlaceholder: "Enter your email address",
    passwordPlaceholder: "Create a password (min. 8 characters)",
    confirmPasswordPlaceholder: "Confirm your password",
    agreeToTerms: "I agree to the Terms of Service and Privacy Policy",
    newsletterOptIn: "Send me updates about new features and study tips",

    errors: {
      nameRequired: "Full name is required",
      emailRequired: "Email address is required",
      passwordRequired: "Password is required",
      passwordTooShort: "Password must be at least 8 characters",
      passwordMismatch: "Passwords do not match",
      termsRequired: "You must agree to the terms",
      emailExists: "Email already exists"
    }
  },};

export function SignUpPage() {
  const {setCurrentPage, setUser} = useApp();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    newsletterOptIn: false
  });

  const t = translations.en;

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError(t.errors.nameRequired);
      return false;
    }
    if (!formData.email.trim()) {
      setError(t.errors.emailRequired);
      return false;
    }
    if (!formData.password) {
      setError(t.errors.passwordRequired);
      return false;
    }
    if (formData.password.length < 8) {
      setError(t.errors.passwordTooShort);
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t.errors.passwordMismatch);
      return false;
    }

    if (!formData.agreeToTerms) {
      setError(t.errors.termsRequired);
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      // Sign up with metadata for users table
      const metadata = {
        full_name: formData.fullName,
        user_type: 'student',
        curriculum: 'igcse', // Default curriculum
        grade: null, // Will be set during onboarding
        subjects: [], // Will be set during onboarding
        preferences: {
          language: 'en',
          notifications: formData.newsletterOptIn,
          darkMode: false,
          theme: 'light',
          autoPlayFlashcards: true,
          showHints: true,
          soundEffects: true,
          studyReminders: true,
          dailyGoal: 60
        }
      };
      
      const { data, error } = await signUp(formData.email, formData.password, metadata);

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Set flag to show success message on login page
        sessionStorage.setItem('justSignedUp', 'true');
        setCurrentPage('login');
      }
    } catch (error) {
      setError(t.errors.emailExists);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-background via-background to-teal-light/20">
      {/* Main content container */}
      <div className="flex h-full">
        {/* Left side - Sign Up Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-3">
              <h1 className="text-xl text-black mb-1">{t.title}</h1>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>

            {/* Sign Up Card */}
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-teal-50/30 rounded-2xl"></div>
              <div className="relative z-10">
                <CardHeader className="space-y-1 pb-2 bg-gradient-to-r from-teal-50/50 to-blue-50/50 border-b border-teal-100/50">
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentPage('landing')}
                      className="text-gray-600 hover:text-teal-600 hover:bg-teal-50/50 p-1.5 rounded-lg transition-all duration-200 text-sm"
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

                  <form onSubmit={handleSignUp} className="space-y-2.5">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <Label htmlFor="fullName" className="text-xs font-semibold text-gray-700">{t.fullName}</Label>
                      <div className="relative group">
                        <Input
                          id="fullName"
                          type="text"
                          placeholder={t.fullNamePlaceholder}
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          disabled={isLoading}
                          className="bg-white/80 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all duration-200 group-hover:border-teal-300 h-9 text-sm"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-teal-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Email */}
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
                          className="bg-white/80 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all duration-200 group-hover:border-teal-300 h-9 text-sm"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-teal-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Password */}
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
                          className="bg-white/80 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all duration-200 group-hover:border-teal-300 pr-10 h-9 text-sm"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-teal-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors duration-200"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700">{t.confirmPassword}</Label>
                      <div className="relative group">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t.confirmPasswordPlaceholder}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          disabled={isLoading}
                          className="bg-white/80 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all duration-200 group-hover:border-teal-300 pr-10 h-9 text-sm"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-teal-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors duration-200"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Terms and Newsletter */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-teal-200 transition-all duration-200">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked === true)}
                          className="text-teal-600 border-gray-300 hover:border-teal-400 focus:ring-teal-200 h-4 w-4"
                        />
                        <Label htmlFor="terms" className="text-xs text-gray-700 cursor-pointer leading-tight">
                          {t.agreeToTerms}
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-2 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-teal-200 transition-all duration-200">
                        <Checkbox
                          id="newsletter"
                          checked={formData.newsletterOptIn}
                          onCheckedChange={(checked) => handleInputChange('newsletterOptIn', checked === true)}
                          className="text-teal-600 border-gray-300 hover:border-teal-400 focus:ring-teal-200 h-4 w-4"
                        />
                        <Label htmlFor="newsletter" className="text-xs text-gray-600 cursor-pointer leading-tight">
                          {t.newsletterOptIn}
                        </Label>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 hover:from-teal-600 hover:via-teal-700 hover:to-blue-700 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm h-9"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t.signUp}
                        </div>
                      ) : (
                        t.signUp
                      )}
                    </Button>
                  </form>

                  <div className="text-center text-xs text-gray-600">
                    {t.haveAccount}{' '}
                    <button
                      onClick={() => setCurrentPage('login')}
                      className="text-teal-600 hover:text-teal-700 underline font-medium hover:no-underline transition-all duration-200"
                    >
                      {t.signInHere}
                    </button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>

        {/* Right side - Panda Image */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <div className="max-w-md text-center">
            <img 
              src="./ChatGPT Image Nov 11, 2025, 10_31_00 PM (1).png" 
              alt="Studious Panda with Imtehaan.ai" 
              className="w-full max-w-md mx-auto"
            />
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {'Start Your Learning Journey'}
              </h2>
              <p className="text-gray-600">
                Join our AI-powered platform and discover a new way to excel in your studies
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
