import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useApp } from '../App';
import { useAuth } from '../utils/supabase/AuthContext';
import { userSettingsService, UserSettings } from '../utils/supabase/user-settings-service';
import { ChangePasswordModal } from './modals/ChangePasswordModal';
import { DataManagementModal } from './modals/DataManagementModal';

const palette = {
  violet: '#9B4DFF',
  magenta: '#FF4D91',
  coral: '#FF6C6C',
  lightViolet: 'rgba(155, 77, 255, 0.1)',
  lightMagenta: 'rgba(255, 77, 145, 0.1)',
  lightCoral: 'rgba(255, 108, 108, 0.1)'
};
import { 
  ArrowLeft, 
  User,
  Bell,
  Palette,
  Globe,
  BookOpen,
  Shield,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Volume2,
  VolumeX,
  Eye,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  Languages,
  Clock,
  Target,
  Brain,
  Zap,
  HelpCircle,
  Mail,
  Lock,
  Key,
  LogOut,
  CheckCircle,
  AlertCircle,
  Info,
  Settings as SettingsIcon
} from 'lucide-react';

export function SettingsPage() {
  const {setCurrentPage, user} = useApp();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const translations = {
    en: {
      title: "Settings",
      subtitle: "Customize your learning experience",
      backToDashboard: "Back to Dashboard",
      
      // Tabs
      general: "General",
      study: "Study",
      notifications: "Notifications",
      privacy: "Privacy",
      accessibility: "Accessibility",
      account: "Account",
      data: "Data",
      
      // General Settings
      themeTitle: "Theme & Appearance",
      themeDesc: "Choose how Imtehaan looks and feels",
      theme: "Theme",
      themeLight: "Light",
      themeDark: "Dark",
      themeSystem: "System",
      languageTitle: "Language",
      languageDesc: "Select your preferred language",
      
      // Study Settings
      studyPrefsTitle: "Study Preferences",
      studyPrefsDesc: "Customize your learning experience",
      autoPlay: "Auto-play flashcards",
      autoPlayDesc: "Automatically advance to next card",
      showHints: "Show hints",
      showHintsDesc: "Display helpful hints during study",
      soundEffects: "Sound effects",
      soundEffectsDesc: "Play sounds for interactions",
      vibration: "Vibration feedback",
      vibrationDesc: "Haptic feedback on mobile devices",
      dailyGoal: "Daily study goal (minutes)",
      sessionDuration: "Default session duration (minutes)",
      
      // Notifications
      notificationTitle: "Notification Preferences",
      notificationDesc: "Choose what notifications you want to receive",
      pushNotifications: "Push notifications",
      emailNotifications: "Email notifications",
      studyReminders: "Study reminders",
      achievements: "Achievement notifications",
      weeklyReports: "Weekly progress reports",
      
      // Privacy
      privacyTitle: "Privacy & Security",
      privacyDesc: "Control your data and privacy settings",
      dataSharing: "Share data for improvements",
      analytics: "Usage analytics",
      profileVisibility: "Profile visibility",
      profilePublic: "Public",
      profilePrivate: "Private",
      
      // Accessibility
      accessibilityTitle: "Accessibility",
      accessibilityDesc: "Make Imtehaan more accessible",
      fontSize: "Text size",
      fontSizeSmall: "Small",
      fontSizeMedium: "Medium",
      fontSizeLarge: "Large",
      highContrast: "High contrast mode",
      reducedMotion: "Reduce animations",
      
      // Account
      accountTitle: "Account Information",
      accountDesc: "Manage your account details",
      changePassword: "Change password",
      twoFactor: "Two-factor authentication",
      deleteAccount: "Delete account",
      signOut: "Sign out",
      accountCreated: "Account created",
      lastSignIn: "Last sign in",
      
      // Data
      dataTitle: "Data Management",
      dataDesc: "Export, import, or reset your data",
      exportData: "Export my data",
      importData: "Import data",
      resetProgress: "Reset all progress",
      clearCache: "Clear cache",
      
      // Actions
      save: "Save Changes",
      cancel: "Cancel",
      reset: "Reset to defaults",
      
      // Status messages
      saving: "Saving...",
      saved: "Settings saved successfully!",
      error: "Failed to save settings. Please try again.",
      loading: "Loading settings...",
      noUser: "Please sign in to access settings",
      
      // Descriptions
      exportDesc: "Download all your study data",
      importDesc: "Upload previously exported data",
      resetDesc: "This will delete all your progress permanently",
      cacheDesc: "Clear temporary files and cached data"
    }};
const t = translations.en;

  const tabs = [
    { id: 'general', label: t.general, icon: Monitor },
    { id: 'study', label: t.study, icon: BookOpen },
    { id: 'notifications', label: t.notifications, icon: Bell },
    { id: 'privacy', label: t.privacy, icon: Shield },
    { id: 'accessibility', label: t.accessibility, icon: Eye },
    { id: 'account', label: t.account, icon: User },
    { id: 'data', label: t.data, icon: Database }
  ];

  // Load user settings on component mount
  useEffect(() => {
    if (user?.id) {
      loadUserSettings();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadUserSettings = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await userSettingsService.getUserSettings(user.id);
      
      if (result.error) {
        throw result.error;
      }
      
      if (result.data) {
        setSettings(result.data);
        // Language is always English now
        if (result.data.language !== 'en') {
        }
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({ ...prev!, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!user?.id || !settings) return;
    
    setSaveStatus('saving');
    setError(null);
    
    try {
      const result = await userSettingsService.updateUserSettings(user.id, settings);
      
      if (result.error) {
        throw result.error;
      }
      
      // Language is always English now
      if (settings.language !== 'en') {
      }
      
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setError('Failed to save settings');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = async () => {
    if (!user?.id) return;
    
    if (!confirm('Are you sure you want to reset all settings to default?')) return;
    
    try {
      await userSettingsService.createDefaultSettings(user.id);
      await loadUserSettings();
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error resetting settings:', error);
      setError('Failed to reset settings');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setCurrentPage('login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    
    try {
      const result = await userSettingsService.deleteUserAccount(user.id);
      if (result.success) {
        setCurrentPage('login');
      } else {
        setError('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: `linear-gradient(135deg, ${palette.violet}, ${palette.lightCoral})`
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: palette.violet }}></div>
          <p className="text-black">{t.loading}</p>
        </div>
      </div>
    );
  }

  // Show error if no user
  if (!user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: `linear-gradient(135deg, ${palette.violet}, ${palette.lightCoral})`
      }}>
        <div className="text-center">
          <SettingsIcon className="h-16 w-16 mx-auto mb-4" style={{ color: palette.violet }} />
          <h2 className="text-xl font-semibold text-black mb-2">{t.noUser}</h2>
          <Button onClick={() => setCurrentPage('login')} style={{ 
            background: `linear-gradient(135deg, ${palette.violet}, ${palette.magenta})`,
            color: 'white'
          }}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Show error if settings failed to load
  if (error && !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: `linear-gradient(135deg, ${palette.violet}, ${palette.lightCoral})`
      }}>
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4" style={{ color: palette.coral }} />
          <h2 className="text-xl font-semibold text-black mb-2">Error Loading Settings</h2>
          <p className="text-black/70 mb-4">{error}</p>
          <Button onClick={loadUserSettings} style={{ 
            background: `linear-gradient(135deg, ${palette.violet}, ${palette.magenta})`,
            color: 'white'
          }}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" style={{ color: palette.violet }} />
            General Settings
          </CardTitle>
          <p className="text-sm text-black/70">General application settings</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-black/70">Other general settings will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderStudySettings = () => (
    <div className="space-y-6">
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" style={{ color: palette.magenta }} />
            {t.studyPrefsTitle}
          </CardTitle>
          <p className="text-sm text-black/70">{t.studyPrefsDesc}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Study Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-black">{t.autoPlay}</Label>
                <p className="text-sm text-black/70">{t.autoPlayDesc}</p>
              </div>
              <Switch 
                checked={settings.auto_play_flashcards}
                onCheckedChange={(checked) => handleSettingChange('auto_play_flashcards', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-black">{t.showHints}</Label>
                <p className="text-sm text-black/70">{t.showHintsDesc}</p>
              </div>
              <Switch 
                checked={settings.show_hints}
                onCheckedChange={(checked) => handleSettingChange('show_hints', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-black">{t.soundEffects}</Label>
                <p className="text-sm text-black/70">{t.soundEffectsDesc}</p>
              </div>
              <Switch 
                checked={settings.sound_effects}
                onCheckedChange={(checked) => handleSettingChange('sound_effects', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-black">{t.vibration}</Label>
                <p className="text-sm text-black/70">{t.vibrationDesc}</p>
              </div>
              <Switch 
                checked={settings.vibration}
                onCheckedChange={(checked) => handleSettingChange('vibration', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Time Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-black">{t.dailyGoal}</Label>
              <Input
                type="number"
                min="10"
                max="180"
                value={settings.daily_goal_minutes}
                onChange={(e) => handleSettingChange('daily_goal_minutes', parseInt(e.target.value))}
                className="w-32"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black">{t.sessionDuration}</Label>
              <Input
                type="number"
                min="5"
                max="60"
                value={settings.session_duration_minutes}
                onChange={(e) => handleSettingChange('session_duration_minutes', parseInt(e.target.value))}
                className="w-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" style={{ color: palette.coral }} />
            {t.notificationTitle}
          </CardTitle>
          <p className="text-sm text-black/70">{t.notificationDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-black">{t.pushNotifications}</Label>
            </div>
            <Switch 
              checked={settings.push_notifications}
              onCheckedChange={(checked) => handleSettingChange('push_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-black">{t.emailNotifications}</Label>
            </div>
            <Switch 
              checked={settings.email_notifications}
              onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-black">{t.studyReminders}</Label>
            </div>
            <Switch 
              checked={settings.study_reminders}
              onCheckedChange={(checked) => handleSettingChange('study_reminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-black">{t.achievements}</Label>
            </div>
            <Switch 
              checked={settings.achievement_notifications}
              onCheckedChange={(checked) => handleSettingChange('achievement_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-black">{t.weeklyReports}</Label>
            </div>
            <Switch 
              checked={settings.weekly_reports}
              onCheckedChange={(checked) => handleSettingChange('weekly_reports', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" style={{ color: palette.violet }} />
            {t.privacyTitle}
          </CardTitle>
          <p className="text-sm text-black/70">{t.privacyDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-black">{t.dataSharing}</Label>
            </div>
            <Switch 
              checked={settings.data_sharing}
              onCheckedChange={(checked) => handleSettingChange('data_sharing', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-black">{t.analytics}</Label>
            </div>
            <Switch 
              checked={settings.analytics_enabled}
              onCheckedChange={(checked) => handleSettingChange('analytics_enabled', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black">{t.profileVisibility}</Label>
            <Select 
              value={settings.profile_visibility} 
              onValueChange={(value) => handleSettingChange('profile_visibility', value as 'public' | 'private')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">{t.profilePublic}</SelectItem>
                <SelectItem value="private">{t.profilePrivate}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccessibilitySettings = () => (
    <div className="space-y-6">
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" style={{ color: palette.magenta }} />
            {t.accessibilityTitle}
          </CardTitle>
          <p className="text-sm text-black/70">{t.accessibilityDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-black">{t.fontSize}</Label>
            <Select 
              value={settings.font_size} 
              onValueChange={(value) => handleSettingChange('font_size', value as 'small' | 'medium' | 'large')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">{t.fontSizeSmall}</SelectItem>
                <SelectItem value="medium">{t.fontSizeMedium}</SelectItem>
                <SelectItem value="large">{t.fontSizeLarge}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-black">{t.highContrast}</Label>
            </div>
            <Switch 
              checked={settings.high_contrast}
              onCheckedChange={(checked) => handleSettingChange('high_contrast', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-black">{t.reducedMotion}</Label>
            </div>
            <Switch 
              checked={settings.reduced_motion}
              onCheckedChange={(checked) => handleSettingChange('reduced_motion', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" style={{ color: palette.violet }} />
            {t.accountTitle}
          </CardTitle>
          <p className="text-sm text-black/70">{t.accountDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Account Info */}
          <div className="p-4 rounded-lg space-y-2" style={{ backgroundColor: palette.lightViolet }}>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-black">Email:</span>
              <span className="text-sm text-black/70">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-black">Name:</span>
              <span className="text-sm text-black/70">{user.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-black">User ID:</span>
              <span className="text-sm text-black/70 font-mono text-xs">{user.id.slice(0, 8)}...</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full justify-start text-black border-black/20 hover:bg-violet-50 hover:text-black"
            onClick={() => setShowChangePassword(true)}
          >
            <Key className="h-4 w-4 mr-2" />
            {t.changePassword}
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start text-black border-black/20 hover:bg-violet-50 hover:text-black"
            disabled
          >
            <Lock className="h-4 w-4 mr-2" />
            {t.twoFactor} (Coming Soon)
          </Button>

          <Separator />

          <Button 
            variant="outline" 
            className="w-full justify-start hover:text-black"
            style={{ 
              color: palette.coral,
              borderColor: palette.coral
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'black';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = palette.coral;
            }}
            onClick={handleDeleteAccount}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t.deleteAccount}
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start text-black border-black/20 hover:bg-violet-50 hover:text-black"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t.signOut}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" style={{ color: palette.violet }} />
            {t.dataTitle}
          </CardTitle>
          <p className="text-sm text-black/70">{t.dataDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-black border-black/20 hover:bg-violet-50 hover:text-black"
              onClick={() => setShowDataManagement(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              {t.exportData}
            </Button>
            <p className="text-xs text-black/60">{t.exportDesc}</p>
          </div>

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-black border-black/20 hover:bg-violet-50 hover:text-black"
              onClick={() => setShowDataManagement(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {t.importData}
            </Button>
            <p className="text-xs text-black/60">{t.importDesc}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-black border-black/20 hover:bg-violet-50 hover:text-black"
              onClick={() => setShowDataManagement(true)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.clearCache}
            </Button>
            <p className="text-xs text-black/60">{t.cacheDesc}</p>
          </div>

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start hover:text-black"
              style={{ 
                color: palette.coral,
                borderColor: palette.coral
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'black';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = palette.coral;
              }}
              onClick={() => setShowDataManagement(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t.resetProgress}
            </Button>
            <p className="text-xs" style={{ color: palette.coral }}>{t.resetDesc}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'study':
        return renderStudySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'accessibility':
        return renderAccessibilitySettings();
      case 'account':
        return renderAccountSettings();
      case 'data':
        return renderDataSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen" style={{ 
      background: `linear-gradient(135deg, ${palette.violet}, ${palette.lightCoral})`
    }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm" style={{ 
        borderColor: 'rgba(155, 77, 255, 0.2)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentPage('dashboard')}
                className="text-black hover:text-black"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToDashboard}
              </Button>
              <div>
                <h1 className="text-xl font-bold text-black">
                  {t.title}
                </h1>
                <p className="text-sm text-black/70">{t.subtitle}</p>
              </div>
            </div>

            {/* Save Status */}
            {saveStatus !== 'idle' && (
              <div className="flex items-center space-x-2">
                {saveStatus === 'saving' && (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" style={{ color: palette.violet }} />
                    <span className="text-sm" style={{ color: palette.violet }}>{t.saving}</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <CheckCircle className="h-4 w-4" style={{ color: palette.magenta }} />
                    <span className="text-sm" style={{ color: palette.magenta }}>{t.saved}</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertCircle className="h-4 w-4" style={{ color: palette.coral }} />
                    <span className="text-sm" style={{ color: palette.coral }}>{t.error}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-white/90">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          activeTab === tab.id 
                            ? "text-white" 
                            : "text-black hover:bg-violet-50 hover:text-black"
                        }`}
                        style={activeTab === tab.id ? {
                          background: `linear-gradient(135deg, ${palette.violet}, ${palette.magenta})`
                        } : {}}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.label}
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {renderTabContent()}

              {/* Action Buttons */}
              <Card className="bg-white/90">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={saveStatus === 'saving'}
                      className="text-black border-black/20 hover:bg-violet-50 hover:text-black"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {t.reset}
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saveStatus === 'saving' || !hasUnsavedChanges}
                      className="text-white"
                      style={{ 
                        background: `linear-gradient(135deg, ${palette.violet}, ${palette.magenta})`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${palette.magenta}, ${palette.coral})`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${palette.violet}, ${palette.magenta})`;
                      }}
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          {t.saving}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {t.save}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Unsaved Changes Indicator */}
                  {hasUnsavedChanges && (
                    <div className="mt-4 p-3 rounded-lg border" style={{ 
                      backgroundColor: palette.lightCoral,
                      borderColor: palette.coral
                    }}>
                      <div className="flex items-center gap-2" style={{ color: palette.coral }}>
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">You have unsaved changes</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        userId={user.id}
        language="en"
      />

      <DataManagementModal
        isOpen={showDataManagement}
        onClose={() => setShowDataManagement(false)}
        userId={user.id}
        language="en"
      />
    </div>
  );
}