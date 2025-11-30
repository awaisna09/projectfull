import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader } from './ui/card';
import { Label } from './ui/label';
import { useApp } from '../App';
import { AuthService } from '../utils/supabase/auth-service';
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../utils/supabase/client';

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

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-teal-light/20 flex items-center justify-center">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
            <span className="text-gray-600">Verifying reset link...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-teal-light/20 flex items-center justify-center p-4">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl max-w-md w-full">
          <CardContent className="p-6">
            <Alert className="border-red-200/50 text-red-700 bg-red-50/80 backdrop-blur-sm rounded-xl mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <Button
                onClick={() => setCurrentPage('forgot-password')}
                className="w-full bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 hover:from-teal-600 hover:via-teal-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl"
              >
                Request New Reset Link
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage('login')}
                className="w-full border-gray-200 hover:border-teal-300 hover:bg-teal-50/30 text-gray-700 rounded-xl"
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-teal-light/20">
      <div className="flex h-full">
        {/* Left side - Reset Password Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl text-black mb-2">{t.title}</h1>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>

            {/* Reset Password Card */}
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
                            className="bg-white/80 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all duration-200 group-hover:border-teal-300 pr-10 pl-10"
                          />
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors duration-200"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-teal-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
                            className="bg-white/80 border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all duration-200 group-hover:border-teal-300 pr-10 pl-10"
                          />
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors duration-200"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
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
                {'Set a Strong Password'}
              </h2>
              <p className="text-gray-600">
                Choose a password that's at least 8 characters long
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

