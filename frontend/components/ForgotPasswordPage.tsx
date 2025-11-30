import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader } from './ui/card';
import { Label } from './ui/label';
import { useApp } from '../App';
import { AuthService } from '../utils/supabase/auth-service';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Logo } from './Logo';

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

  const backgroundGradient = `linear-gradient(135deg, ${palette.lightViolet}, ${palette.lightMagenta}, ${palette.lightCoral})`;
  const cardOverlayGradient = 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.9))';
  const headerBarGradient = `linear-gradient(90deg, ${palette.lightViolet}, ${palette.lightMagenta})`;
  const primaryGradient = `linear-gradient(90deg, ${palette.violet}, ${palette.magenta}, ${palette.coral})`;

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ background: backgroundGradient }}
    >
      {/* Left side - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-10 lg:py-16">
        <Logo size="md" showText className="mb-6" />
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-black mb-2">{t.title}</h1>
            <p className="text-gray-600 text-sm">{t.subtitle}</p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
            <div
              className="absolute inset-0 rounded-2xl"
              style={{ background: cardOverlayGradient }}
            ></div>
            <div className="relative z-10">
              <CardHeader
                className="space-y-1 pb-4 border-b"
                style={{ background: headerBarGradient, borderColor: 'rgba(155,77,255,0.2)' }}
              >
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCurrentPage('login')}
                    className="text-gray-600 p-2 rounded-lg transition-all duration-200"
                    style={{ color: palette.violet }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = palette.lightViolet)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
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
                      className="w-full text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      style={{ background: '#000000' }}
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
                          className="bg-white/85 border-gray-200 focus:border-[#9B4DFF] focus:ring-2 focus:ring-[#9B4DFF]/25 rounded-xl transition-all duration-200 group-hover:border-[#9B4DFF] pl-10"
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <div
                          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ background: `linear-gradient(90deg, transparent, ${palette.lightMagenta}, transparent)` }}
                        ></div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      style={{ background: '#000000' }}
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

      {/* Right side - Illustration */}
      <div className="flex-1 hidden lg:flex items-center justify-center p-10">
        <div className="max-w-md text-center space-y-6">
          <img 
            src="./ChatGPT Image Nov 11, 2025, 10_31_00 PM (1).png" 
            alt="Studious Panda with Imtehaan.ai" 
            className="w-full max-w-md mx-auto"
          />
          <div>
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
  );
}

