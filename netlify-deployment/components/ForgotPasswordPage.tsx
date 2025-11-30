import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader } from './ui/card';
import { Label } from './ui/label';
import { useApp } from '../App';
import { AuthService } from '../utils/supabase/auth-service';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const translations = {
  en: {
    title: "Reset Your Password",
    subtitle: "Enter your email address and we'll send you a link to reset your password",
    email: "Email Address",
    emailPlaceholder: "Enter your email address",
    sendResetLink: "Send Reset Link",
    backToSignIn: "Back to Sign In",
    backToHome: "Back to Home",
    successTitle: "Check Your Email",
    successMessage: "If an account exists with that email, we've sent you a password reset link.",
    errors: {
      emailRequired: "Email address is required",
      invalidEmail: "Please enter a valid email address"
    }
  }
};

export function ForgotPasswordPage() {
  const { setCurrentPage } = useApp();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const t = translations.en;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError(t.errors.emailRequired);
      return;
    }

    if (!validateEmail(email)) {
      setError(t.errors.invalidEmail);
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await AuthService.resetPasswordForEmail(email);

      if (resetError) {
        setError(resetError.message || 'Failed to send reset email. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-teal-light/20">
      <div className="flex h-full">
        {/* Left side - Forgot Password Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl text-black mb-2">{t.title}</h1>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>

            {/* Forgot Password Card */}
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-teal-50/30 rounded-2xl"></div>
              <div className="relative z-10">
                <CardHeader className="space-y-1 pb-4 bg-gradient-to-r from-teal-50/50 to-blue-50/50 border-b border-teal-100/50">
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentPage('login')}
                      className="text-gray-600 hover:text-teal-600 hover:bg-teal-50/50 p-2 rounded-lg transition-all duration-200"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t.backToSignIn}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 p-6">
                  {error && (
                    <Alert className="border-red-200/50 text-red-700 bg-red-50/80 backdrop-blur-sm rounded-xl">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success ? (
                    <div className="space-y-6">
                      <Alert className="border-green-200/50 text-green-700 bg-green-50/80 backdrop-blur-sm rounded-xl">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold mb-1">{t.successTitle}</h3>
                            <AlertDescription>{t.successMessage}</AlertDescription>
                          </div>
                        </div>
                      </Alert>
                      
                      <Button
                        onClick={() => setCurrentPage('login')}
                        className="w-full bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 hover:from-teal-600 hover:via-teal-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {t.backToSignIn}
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">{t.email}</Label>
                        <div className="relative group">
                          <Input
                            id="email"
                            type="email"
                            placeholder={t.emailPlaceholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="bg-white/80 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all duration-200 group-hover:border-teal-300 pl-10"
                          />
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-teal-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 hover:from-teal-600 hover:via-teal-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {t.sendResetLink}
                          </div>
                        ) : (
                          t.sendResetLink
                        )}
                      </Button>
                    </form>
                  )}
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
                {'Forgot Your Password?'}
              </h2>
              <p className="text-gray-600">
                No worries! We'll help you get back into your account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

