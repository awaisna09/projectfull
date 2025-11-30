import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader } from './ui/card';
import { Label } from './ui/label';
import { Logo } from './Logo';
import { useApp } from '../App';
import { AuthService } from '../utils/supabase/auth-service';
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../utils/supabase/client';

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
    title: "Set New Password",
    subtitle: "Enter your new password below",
    password: "New Password",
    confirmPassword: "Confirm New Password",
    passwordPlaceholder: "Enter your new password (min. 8 characters)",
    confirmPasswordPlaceholder: "Confirm your new password",
    resetPassword: "Reset Password",
    backToSignIn: "Back to Sign In",
    successTitle: "Password Reset Successful",
    successMessage: "Your password has been reset successfully. You can now sign in with your new password.",
    errors: {
      passwordRequired: "Password is required",
      passwordTooShort: "Password must be at least 8 characters",
      passwordMismatch: "Passwords do not match",
      invalidToken: "Invalid or expired reset link. Please request a new one.",
      resetFailed: "Failed to reset password. Please try again."
    }
  }
};

export function ResetPasswordPage() {
  const { setCurrentPage } = useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  
  const t = translations.en;

  // Verify the reset token from URL hash
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Check if we have hash params (Supabase handles this via URL hash fragments)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (type === 'recovery' && accessToken) {
          // Set the session using the access token
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || ''
          });

          if (sessionError) {
            setError(t.errors.invalidToken);
            setIsTokenValid(false);
          } else {
            setIsTokenValid(true);
          }
        } else {
          // Try to get existing session
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setIsTokenValid(true);
          } else {
            setError(t.errors.invalidToken);
            setIsTokenValid(false);
          }
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setError(t.errors.invalidToken);
        setIsTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, []);

  const validateForm = () => {
    if (!password.trim()) {
      setError(t.errors.passwordRequired);
      return false;
    }
    if (password.length < 8) {
      setError(t.errors.passwordTooShort);
      return false;
    }
    if (password !== confirmPassword) {
      setError(t.errors.passwordMismatch);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { error: updateError } = await AuthService.updatePassword(password);

      if (updateError) {
        setError(updateError.message || t.errors.resetFailed);
      } else {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          setCurrentPage('login');
        }, 2000);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError(t.errors.resetFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundGradient = `linear-gradient(135deg, ${palette.lightViolet}, ${palette.lightMagenta}, ${palette.lightCoral})`;
  const cardOverlayGradient = 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.9))';
  const headerBarGradient = `linear-gradient(90deg, ${palette.lightViolet}, ${palette.lightMagenta})`;
  const primaryGradient = `linear-gradient(90deg, ${palette.violet}, ${palette.magenta}, ${palette.coral})`;

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: backgroundGradient }}>
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md rounded-2xl p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: palette.violet }}></div>
            <span className="text-gray-600">Verifying reset link...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: backgroundGradient }}>
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md rounded-2xl max-w-md w-full">
          <CardContent className="p-6">
            <Alert className="border-red-200/50 text-red-700 bg-red-50/80 backdrop-blur-sm rounded-xl mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <Button
                onClick={() => setCurrentPage('forgot-password')}
                className="w-full text-white font-semibold py-3 rounded-xl"
                style={{ background: primaryGradient }}
              >
                Request New Reset Link
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage('login')}
                className="w-full border-gray-200 text-gray-700 rounded-xl"
                style={{ borderColor: 'rgba(155,77,255,0.25)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(155,77,255,0.45)';
                  e.currentTarget.style.backgroundColor = palette.lightViolet;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(155,77,255,0.25)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {t.backToSignIn}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ background: backgroundGradient }}
    >
      {/* Left side - Reset Password Form */}
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
                  <Alert className="border-green-200/50 text-green-700 bg-green-50/80 backdrop-blur-sm rounded-xl">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">{t.successTitle}</h3>
                        <AlertDescription>{t.successMessage}</AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700">{t.password}</Label>
                      <div className="relative group">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t.passwordPlaceholder}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          className="bg-white/85 border-gray-200 focus:border-[#9B4DFF] focus:ring-2 focus:ring-[#9B4DFF]/25 rounded-xl transition-all duration-200 group-hover:border-[#9B4DFF] pr-10 pl-10"
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                          style={{ color: palette.violet }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = palette.magenta)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = palette.violet)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <div
                          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ background: `linear-gradient(90deg, transparent, ${palette.lightViolet}, transparent)` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">{t.confirmPassword}</Label>
                      <div className="relative group">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t.confirmPasswordPlaceholder}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isLoading}
                          className="bg-white/85 border-gray-200 focus:border-[#9B4DFF] focus:ring-2 focus:ring-[#9B4DFF]/25 rounded-xl transition-all duration-200 group-hover:border-[#9B4DFF] pr-10 pl-10"
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                          style={{ color: palette.violet }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = palette.magenta)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = palette.violet)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
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
                          {t.resetPassword}
                        </div>
                      ) : (
                        t.resetPassword
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
              {'Set a Strong Password'}
            </h2>
            <p className="text-gray-600">
              Choose a password that's at least 8 characters long
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

