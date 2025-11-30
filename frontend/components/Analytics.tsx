import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { supabase } from '../utils/supabase/client';
import { analyticsBufferService } from '../utils/supabase/analytics-buffer-service';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Logo } from './Logo';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle, 
  TrendingUp, 
  Trophy, 
  Target, 
  RefreshCw, 
  Lightbulb, 
  BarChart3,
  AlertCircle,
  Calendar,
  Clock,
  Zap,
  Star,
  Award,
  LogOut,
  Settings
} from 'lucide-react';
import { comprehensiveAnalyticsService, RealTimeAnalytics } from '../utils/supabase/comprehensive-analytics-service';
import { useAutoTracking } from '../hooks/useAutoTracking';

// Translations
const translations = {
    analytics: "Analytics",
    backToDashboard: "Back to Dashboard",
    refresh: "Refresh",
    lastActivity: "Last Updated",
    overview: "Overview",
    insights: "Insights",
    progress: "Progress",
    streakDays: "day streak",
  noData: "No Data Available",
    startStudying: "Start studying to see your progress",
  loading: "Loading analytics...",
    errorLoading: "Error Loading Analytics",
    retry: "Try Again",
    minutes: "min",
    hours: "h",
    weeklyProgress: "Weekly Progress",
    studyStreaks: "Study Streaks",
    performanceMetrics: "Performance Metrics",
    learningPatterns: "Learning Patterns",
    currentStreak: "Current Streak",
    longestStreak: "Longest Streak",
    averageDailyTime: "Avg Daily Time",
    mostProductiveDay: "Most Productive Day",
    overallAccuracy: "Overall Accuracy",
    improvementRate: "Improvement Rate",
    weakAreas: "Weak Areas",
    strongAreas: "Strong Areas",
    todayProgress: "Today's Progress",
    dailyStats: "Daily Statistics",
    nextMilestone: "Next Milestone",
    achievements: "Achievements",
    recommendations: "Recommendations",
    studyTime: "Study Time",
    activitiesCompleted: "Activities Completed",
    currentAccuracy: "Current Accuracy",
    sessionCount: "Session Count",
    averageSession: "Average Session",
    monthlyProgress: "Monthly Progress",
    aiTutorInteractions: "AI Tutor Interactions",
    topicSelections: "Topic Selections",
    lessonsCompleted: "Lessons Completed",
    videoLessonsCompleted: "Video Lessons Completed",
  flashcardsReviewed: "Flashcards Reviewed",
  questions: "Questions",
  productivityScore: "Productivity Score",
  noUser: "Please sign in to view analytics"
};

export default function Analytics() {
  const { setCurrentPage, user } = useApp();
  const t = translations;
  
  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState<RealTimeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [bufferSize, setBufferSize] = useState(0);
  const [weeklyTrendData, setWeeklyTrendData] = useState<any>(null);
  const [studyInsights, setStudyInsights] = useState<{
    insights: string[];
    recommendations: string[];
    nextMilestone: string;
  } | null>(null);
  const [recentPageVisits, setRecentPageVisits] = useState<any[]>([]);

  // Auto-tracking for analytics page
  const { forceFlush, getBufferSize } = useAutoTracking({
    pageTitle: 'Analytics Dashboard',
    pageUrl: '/analytics',
    trackClicks: true,
    trackTime: true,
    trackScroll: true
  });

  // Helper functions
  const formatDuration = (minutes: number) => {
    if (!minutes || minutes < 0) return '0 min';
    if (minutes < 60) {
      return `${minutes} ${t.minutes}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} ${t.hours}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  const safePercentage = (value: number, total: number) => {
    if (!total || total === 0 || !value || value < 0) return 0;
    return Math.min(Math.max(Math.round((value / total) * 100), 0), 100);
  };

  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : Math.max(0, num);
  };

  const safeString = (value: any, fallback: string = 'No data'): string => {
    return value && String(value).trim() ? String(value).trim() : fallback;
  };

  const getMasteryColor = (masteryLevel: string) => {
    switch (masteryLevel) {
      case 'expert': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'beginner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'easy': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch weekly trend data for charts
  const fetchWeeklyTrendData = async () => {
    if (!user?.id) return;

    try {
      const today = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const { data, error } = await supabase
        .from('daily_analytics')
        .select('date, total_time_spent')
        .eq('user_id', user.id)
        .in('date', last7Days)
        .order('date', { ascending: true });

      if (error) throw error;

      // Fill in missing days with zero
      const trendMap = new Map(data?.map(d => [d.date, Math.round(d.total_time_spent / 60)]) || []);
      const studyTimes = last7Days.map(date => trendMap.get(date) || 0);
      const labels = last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' }));

      setWeeklyTrendData({
        labels,
        datasets: [{
          label: 'Study Time (minutes)',
          data: studyTimes,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      });
    } catch (error) {
      console.error('Error fetching weekly trend:', error);
    }
  };


  // Fetch real-time analytics data
  const fetchAnalyticsData = async () => {
    if (!user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

    try {
      setLoading(true);
      setError(null);

      // Track analytics page visit
      try {
        await comprehensiveAnalyticsService.trackPlatformActivity(
          user.id,
          'analytics_visit',
          0,
          'Analytics',
          'General'
        );
      } catch (error) {
        // Silently handle tracking errors
        console.log('⚠️ Tracking error (non-critical):', error);
      }

      // Get comprehensive real-time analytics (force fresh data)
      const realTimeAnalytics = await comprehensiveAnalyticsService.forceRefreshAnalytics(user.id);
      
      // Fetch additional data for charts and insights
      const [insightsData] = await Promise.all([
        comprehensiveAnalyticsService.getStudyInsights(user.id),
        fetchWeeklyTrendData()
      ]);
      
      setStudyInsights(insightsData);
      
      // Get recent page visits
      if (user?.id) {
        const visits = analyticsBufferService.getRecentPageVisits(user.id, 10);
        setRecentPageVisits(visits);
      }
      
      // Validate and set default values for missing data
      if (realTimeAnalytics) {
        // Ensure all required properties exist with default values
        const validatedAnalytics = {
          ...realTimeAnalytics,
          today: {
            ...realTimeAnalytics.today,
            totalActivities: realTimeAnalytics.today?.totalActivities || 0,
            studyTimeMinutes: realTimeAnalytics.today?.studyTimeMinutes || 0,
            dailyAccuracy: realTimeAnalytics.today?.dailyAccuracy || 0,
            productivityScore: realTimeAnalytics.today?.productivityScore || 0,
            sessionCount: realTimeAnalytics.today?.sessionCount || 0,
            avgSessionMinutes: realTimeAnalytics.today?.avgSessionMinutes || 0,
            questionsAttempted: realTimeAnalytics.today?.questionsAttempted || 0,
            questionsCorrect: realTimeAnalytics.today?.questionsCorrect || 0,
            lessonsCompleted: realTimeAnalytics.today?.lessonsCompleted || 0,
            videoLessonsCompleted: realTimeAnalytics.today?.videoLessonsCompleted || 0,
            flashcardsReviewed: realTimeAnalytics.today?.flashcardsReviewed || 0,
            aiTutorInteractions: realTimeAnalytics.today?.aiTutorInteractions || 0,
            topicSelections: realTimeAnalytics.today?.topicSelections || 0
          },
          thisWeek: {
            ...realTimeAnalytics.thisWeek,
            totalActivities: realTimeAnalytics.thisWeek?.totalActivities || 0,
            totalTimeSpent: realTimeAnalytics.thisWeek?.totalTimeSpent || 0,
            averageDailyAccuracy: realTimeAnalytics.thisWeek?.averageDailyAccuracy || 0,
            mostProductiveDay: realTimeAnalytics.thisWeek?.mostProductiveDay || 'No data',
            weakAreas: realTimeAnalytics.thisWeek?.weakAreas || [],
            strongAreas: realTimeAnalytics.thisWeek?.strongAreas || [],
            recommendations: realTimeAnalytics.thisWeek?.recommendations || ['Keep up the great work!']
          },
          thisMonth: {
            ...realTimeAnalytics.thisMonth,
            totalActivities: realTimeAnalytics.thisMonth?.totalActivities || 0,
            totalTimeSpent: realTimeAnalytics.thisMonth?.totalTimeSpent || 0,
            longestStreak: realTimeAnalytics.thisMonth?.longestStreak || 0,
            improvementRate: realTimeAnalytics.thisMonth?.improvementRate || 0,
            studyPatterns: {
              preferredStudyTime: realTimeAnalytics.thisMonth?.studyPatterns?.preferredStudyTime || 'Morning',
              averageSessionLength: realTimeAnalytics.thisMonth?.studyPatterns?.averageSessionLength || 0,
              peakStudyDays: realTimeAnalytics.thisMonth?.studyPatterns?.peakStudyDays || []
            }
          },
          currentStreak: realTimeAnalytics.currentStreak || 0,
          nextMilestone: realTimeAnalytics.nextMilestone || 'Complete your first lesson',
          focusAreas: realTimeAnalytics.focusAreas || [],
          achievements: realTimeAnalytics.achievements || []
        };
        
        setAnalyticsData(validatedAnalytics);
        setLastUpdated(new Date());
      } else {
        throw new Error('No analytics data received');
      }

    } catch (err) {
      console.error('❌ Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  // Load data when user is available
  useEffect(() => {
    if (user?.id) {
    fetchAnalyticsData();
    }
  }, [user?.id]);

  // Real-time subscription for analytics updates
  useEffect(() => {
    if (!user?.id) return;

    console.log('📡 Setting up real-time analytics subscription for user:', user.id);
    
    const channel = supabase
      .channel('analytics-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_analytics',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📊 Real-time analytics update received:', payload);
          // Refetch analytics data when database changes
          fetchAnalyticsData();
        }
      )
      .subscribe();

    return () => {
      console.log('📡 Unsubscribing from analytics updates');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Update buffer size periodically
  useEffect(() => {
    const updateBufferSize = () => {
      setBufferSize(getBufferSize());
    };

    // Update immediately
    updateBufferSize();

    // Update every 10 seconds
    const interval = setInterval(updateBufferSize, 10000);

    return () => clearInterval(interval);
  }, [getBufferSize]);

  // Manual refresh with auto-tracking flush
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null); // Clear any existing errors
    try {
      // First flush any pending activities
      console.log('🔄 Flushing pending activities...');
      await forceFlush();
      
      // Wait a moment for database consistency
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Then fetch fresh analytics data (this will force refresh without cache)
      console.log('🔄 Fetching fresh analytics data...');
      await fetchAnalyticsData();
      
      // Update buffer size
      setBufferSize(getBufferSize());
      
      console.log('✅ Refresh completed successfully');
    } catch (error) {
      console.error('❌ Error during refresh:', error);
      setError('Failed to refresh analytics data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Show error if no user
  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">{t.noUser}</p>
          <Button onClick={() => setCurrentPage('login')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">{t.errorLoading}</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={handleRefresh} variant="outline">
              {t.retry}
            </Button>
            <Button onClick={() => setCurrentPage('dashboard')} variant="outline">
              {t.backToDashboard}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">{t.noData}</p>
          <p className="text-sm text-gray-600">{t.startStudying}</p>
          <Button onClick={handleRefresh} variant="outline" className="mt-4">
            {t.refresh}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage('dashboard')}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToDashboard}
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
            </div>
                <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {t.analytics}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : t.refresh}</span>
                {bufferSize > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {bufferSize}
                  </Badge>
                )}
              </Button>

              {/* Last Updated */}
              {lastUpdated && (
                <span className="text-xs text-gray-500 hidden md:block">
                  {t.lastActivity}: {lastUpdated.toLocaleTimeString()}
                </span>
              )}

              {/* Settings */}
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage('settings')} className="hover:bg-gray-100/80 transition-colors">
                <Settings className="h-4 w-4" />
              </Button>

              {/* Logout */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  localStorage.removeItem('imtehaan_current_page');
                  setCurrentPage('landing');
                }}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t.overview}
            </TabsTrigger>
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t.todayProgress}
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t.progress}
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              {t.insights}
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              {t.achievements}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Today's Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.activitiesCompleted}</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{safeNumber(analyticsData.today.totalActivities)}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.todayProgress}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.studyTime}</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDuration(safeNumber(analyticsData.today.studyTimeMinutes))}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.todayProgress}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.currentAccuracy}</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{safeNumber(analyticsData.today.dailyAccuracy)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {t.todayProgress}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.currentStreak}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{safeNumber(analyticsData.currentStreak)}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.streakDays}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  {t.weeklyProgress}
                  </CardTitle>
                  <div className="text-sm text-gray-500">
                  {analyticsData.thisWeek.weekStart} - {analyticsData.thisWeek.weekEnd}
                  </div>
                </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.thisWeek.totalActivities}
                          </div>
                    <div className="text-sm text-blue-700">{t.activitiesCompleted}</div>
                            </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatDuration(Math.round(analyticsData.thisWeek.totalTimeSpent / 60))}
                          </div>
                    <div className="text-sm text-green-700">{t.studyTime}</div>
                        </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analyticsData.thisWeek.averageDailyAccuracy}%
                            </div>
                    <div className="text-sm text-purple-700">{t.overallAccuracy}</div>
                          </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {analyticsData.thisWeek.mostProductiveDay}
                            </div>
                    <div className="text-sm text-orange-700">{t.mostProductiveDay}</div>
                          </div>
                            </div>
              </CardContent>
            </Card>

            {/* Monthly Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  {t.monthlyProgress}
                </CardTitle>
                <div className="text-sm text-gray-500">
                  {analyticsData.thisMonth.month}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.thisMonth.totalActivities}
                  </div>
                    <div className="text-sm text-green-700">{t.activitiesCompleted}</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatDuration(Math.round(analyticsData.thisMonth.totalTimeSpent / 60))}
                  </div>
                    <div className="text-sm text-blue-700">{t.studyTime}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analyticsData.thisMonth.longestStreak}
                  </div>
                    <div className="text-sm text-purple-700">{t.longestStreak}</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {analyticsData.thisMonth.improvementRate}%
                    </div>
                    <div className="text-sm text-orange-700">{t.improvementRate}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Study Time Trend Chart */}
            {weeklyTrendData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Study Time Trend (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Line
                      data={weeklyTrendData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => `${context.parsed.y} minutes`
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Minutes'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

          </TabsContent>

          {/* Today's Progress Tab */}
          <TabsContent value="today" className="space-y-6">
            {/* Daily Goal Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Daily Study Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-lg font-bold text-blue-600">
                      {safeNumber(analyticsData.today.studyTimeMinutes)} / 60 minutes
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 flex items-center justify-end pr-2" 
                      style={{ width: `${Math.min((safeNumber(analyticsData.today.studyTimeMinutes) / 60) * 100, 100)}%` }}
                    >
                      {safeNumber(analyticsData.today.studyTimeMinutes) >= 6 && (
                        <span className="text-xs font-bold text-white">
                          {Math.round((safeNumber(analyticsData.today.studyTimeMinutes) / 60) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                  {safeNumber(analyticsData.today.studyTimeMinutes) >= 60 ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Goal achieved! Great work!
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {60 - safeNumber(analyticsData.today.studyTimeMinutes)} minutes remaining to reach your goal
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Today's Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.activitiesCompleted}</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                   <div className="text-2xl font-bold">{analyticsData.today.totalActivities}</div>
                   <p className="text-xs text-muted-foreground">
                     {t.todayProgress}
                   </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.studyTime}</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDuration(safeNumber(analyticsData.today.studyTimeMinutes))}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.todayProgress}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.currentAccuracy}</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{safeNumber(analyticsData.today.dailyAccuracy)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {t.todayProgress}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.productivityScore}</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.today.productivityScore}</div>
                  <p className="text-xs text-muted-foreground">
                    {t.todayProgress}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Today's Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    {t.dailyStats}
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.questions}</span>
                      <span className="text-lg font-bold text-blue-600">
                        {analyticsData.today.questionsCorrect} / {analyticsData.today.questionsAttempted}
                        </span>
                      </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-600 transition-all duration-300" 
                        style={{ width: `${safeNumber(analyticsData.today.dailyAccuracy)}%` }}
                      ></div>
                    </div>
                    
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.lessonsCompleted}</span>
                      <span className="text-lg font-bold text-green-600">
                        {analyticsData.today.lessonsCompleted}
                        </span>
                      </div>
                    
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.videoLessonsCompleted}</span>
                      <span className="text-lg font-bold text-purple-600">
                        {analyticsData.today.videoLessonsCompleted}
                        </span>
                      </div>
                    
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.flashcardsReviewed}</span>
                      <span className="text-lg font-bold text-orange-600">
                        {analyticsData.today.flashcardsReviewed}
                        </span>
                      </div>
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    {t.sessionCount}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.sessionCount}</span>
                      <span className="text-lg font-bold text-green-600">
                        {analyticsData.today.sessionCount}
                      </span>
                  </div>
                    
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.averageSession}</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatDuration(analyticsData.today.avgSessionMinutes)}
                        </span>
                      </div>
                    
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.aiTutorInteractions}</span>
                      <span className="text-lg font-bold text-purple-600">
                        {analyticsData.today.aiTutorInteractions}
                        </span>
                      </div>
                    
                      <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.topicSelections}</span>
                      <span className="text-lg font-bold text-orange-600">
                        {analyticsData.today.topicSelections}
                        </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {/* Study Streaks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  {t.studyStreaks}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.currentStreak}
                    </div>
                    <div className="text-sm text-green-700">{t.currentStreak}</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.thisMonth.longestStreak}
                    </div>
                    <div className="text-sm text-blue-700">{t.longestStreak}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatDuration(Math.round(analyticsData.thisWeek.totalTimeSpent / 7 / 60))}
                    </div>
                    <div className="text-sm text-purple-700">{t.averageDailyTime}</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {analyticsData.thisWeek.mostProductiveDay}
                    </div>
                    <div className="text-sm text-orange-700">{t.mostProductiveDay}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {t.performanceMetrics}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Overall Accuracy */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      {t.overallAccuracy}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Weekly Average</span>
                        <span className={`text-2xl font-bold ${
                          safeNumber(analyticsData.thisWeek?.averageDailyAccuracy) >= 70 
                            ? 'text-green-600' 
                            : safeNumber(analyticsData.thisWeek?.averageDailyAccuracy) >= 50 
                            ? 'text-orange-600' 
                            : 'text-red-600'
                        }`}>
                          {safeNumber(analyticsData.thisWeek?.averageDailyAccuracy)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all duration-500 ${
                            safeNumber(analyticsData.thisWeek?.averageDailyAccuracy) >= 70 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : safeNumber(analyticsData.thisWeek?.averageDailyAccuracy) >= 50 
                              ? 'bg-gradient-to-r from-orange-500 to-yellow-500' 
                              : 'bg-gradient-to-r from-red-500 to-pink-500'
                          }`}
                          style={{ width: `${Math.min(safeNumber(analyticsData.thisWeek?.averageDailyAccuracy), 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {safeNumber(analyticsData.thisWeek?.averageDailyAccuracy) === 0 
                          ? 'Complete practice questions to see your accuracy' 
                          : safeNumber(analyticsData.thisWeek?.averageDailyAccuracy) >= 70 
                          ? '🎯 Great accuracy! Keep it up!' 
                          : safeNumber(analyticsData.thisWeek?.averageDailyAccuracy) >= 50 
                          ? '📚 Good progress, aim for 70%+' 
                          : '💪 Practice more to improve accuracy'}
                      </p>
                    </div>
                  </div>

                  {/* Improvement Rate */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      {t.improvementRate}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Monthly Growth</span>
                        <span className={`text-2xl font-bold ${
                          safeNumber(analyticsData.thisMonth?.improvementRate) > 0 
                            ? 'text-green-600' 
                            : safeNumber(analyticsData.thisMonth?.improvementRate) < 0 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                        }`}>
                          {safeNumber(analyticsData.thisMonth?.improvementRate) > 0 ? '+' : ''}
                          {safeNumber(analyticsData.thisMonth?.improvementRate)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all duration-500 ${
                            safeNumber(analyticsData.thisMonth?.improvementRate) > 0 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : 'bg-gradient-to-r from-gray-400 to-gray-500'
                          }`}
                          style={{ 
                            width: `${Math.min(Math.max(safeNumber(analyticsData.thisMonth?.improvementRate), 0) + 10, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {safeNumber(analyticsData.thisMonth?.improvementRate) === 0 
                          ? 'Keep studying to track your improvement' 
                          : safeNumber(analyticsData.thisMonth?.improvementRate) > 5 
                          ? '🚀 Excellent growth this month!' 
                          : safeNumber(analyticsData.thisMonth?.improvementRate) > 0 
                          ? '📈 Steady improvement, keep going!' 
                          : '⚠️ Focus on weak areas to improve'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Debug Info */}
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600 font-mono">
                  <div className="font-semibold mb-1">Performance Data:</div>
                  <div>Weekly Accuracy: {safeNumber(analyticsData.thisWeek?.averageDailyAccuracy)}%</div>
                  <div>Monthly Improvement: {safeNumber(analyticsData.thisMonth?.improvementRate)}%</div>
                  <div>Questions Attempted (Today): {safeNumber(analyticsData.today?.questionsAttempted)}</div>
                  <div>Questions Correct (Today): {safeNumber(analyticsData.today?.questionsCorrect)}</div>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {/* Time of Day Analysis */}
            {analyticsData.thisMonth.timeOfDayAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    Study Time by Period
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium">Morning (6am-12pm)</span>
                        </div>
                      <span className="text-sm font-bold text-yellow-700">
                        {analyticsData.thisMonth.timeOfDayAnalysis.morningMinutes} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium">Afternoon (12pm-6pm)</span>
                      </div>
                      <span className="text-sm font-bold text-orange-700">
                        {analyticsData.thisMonth.timeOfDayAnalysis.afternoonMinutes} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Evening (6pm-10pm)</span>
                      </div>
                      <span className="text-sm font-bold text-blue-700">
                        {analyticsData.thisMonth.timeOfDayAnalysis.eveningMinutes} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                        <span className="text-sm font-medium">Night (10pm-6am)</span>
                      </div>
                      <span className="text-sm font-bold text-indigo-700">
                        {analyticsData.thisMonth.timeOfDayAnalysis.nightMinutes} min
                      </span>
                    </div>
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-semibold text-purple-900">Most Productive Time</p>
                          <p className="text-lg font-bold text-purple-700">
                            {analyticsData.thisMonth.timeOfDayAnalysis.mostProductiveTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Personalized Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Next Milestone */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {t.nextMilestone}
                    </h4>
                    <p className="text-blue-800 font-medium">
                      {studyInsights?.nextMilestone || analyticsData.nextMilestone}
                    </p>
                  </div>
                  
                  {/* Key Insights */}
                  {studyInsights && studyInsights.insights.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Key Insights
                      </h4>
                    <div className="space-y-2">
                        {studyInsights.insights.map((insight, index) => (
                          <p key={index} className="text-purple-800 text-sm flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>{insight}</span>
                          </p>
                      ))}
                  </div>
                  </div>
                  )}
                  
                  {/* Recommendations */}
                  {studyInsights && studyInsights.recommendations.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {t.recommendations}
                      </h4>
                      <div className="space-y-2">
                        {studyInsights.recommendations.map((rec, index) => (
                          <p key={index} className="text-green-800 text-sm flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">→</span>
                            <span>{rec}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Learning Patterns */}
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      {t.learningPatterns}
                    </h4>
                    <div className="space-y-2 text-sm text-orange-800">
                      <p>• Preferred study time: <span className="font-semibold">{analyticsData.thisMonth.studyPatterns?.preferredStudyTime || 'Not enough data'}</span></p>
                      <p>• Average session: <span className="font-semibold">{formatDuration(analyticsData.thisMonth.studyPatterns?.averageSessionLength || 0)}</span></p>
                      <p>• Total sessions today: <span className="font-semibold">{analyticsData.today.sessionCount}</span></p>
                      <p>• Avg session length: <span className="font-semibold">{formatDuration(analyticsData.today.avgSessionMinutes * 60)}</span></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            {/* Today's Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Today's Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.achievements.length > 0 && analyticsData.achievements[0] !== '🎯 Complete your first activity to earn achievements' && analyticsData.achievements[0] !== 'Complete your first activity to earn achievements' && analyticsData.achievements[0] !== '🎯 Keep studying to earn achievements!' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analyticsData.achievements.map((achievement, index) => {
                      // Determine achievement type for styling
                      const isGold = achievement.includes('🏆') || achievement.includes('Legendary') || achievement.includes('Perfect');
                      const isSilver = achievement.includes('⭐') || achievement.includes('💎') || achievement.includes('Excellence');
                      const isBronze = achievement.includes('✅') || achievement.includes('📈');
                      
                      const bgColor = isGold ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400' :
                                     isSilver ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-400' :
                                     isBronze ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-400' :
                                     'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-400';
                      
                      return (
                        <div 
                          key={index} 
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 ${bgColor} shadow-sm hover:shadow-md transition-shadow`}
                        >
                          <div className="text-3xl">
                            {achievement.split(':')[0].trim()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">
                              {achievement.split(':')[0].replace(/[🏆⭐✅📚📝🎓🧠🏅💪🔥⚡💬💎📈🌟🎯]/g, '').trim()}
                            </p>
                            <p className="text-xs text-gray-600">
                              {achievement.split(':')[1]?.trim() || achievement}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-700 mb-2">No achievements yet today</p>
                    <p className="text-sm text-gray-500 mb-4">Complete activities to earn badges!</p>
                    <div className="max-w-md mx-auto grid grid-cols-2 gap-3 text-xs text-gray-600">
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">📚 Study 30+ minutes</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">📝 Answer 10+ questions</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">🎯 Get 85%+ accuracy</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">🔥 Build a streak</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Achievement Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Study Time Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Study Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className={`p-2 rounded ${analyticsData.today.studyTimeMinutes >= 120 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-50 text-gray-500'}`}>
                      🏆 Ultra: 2+ hours
                    </div>
                    <div className={`p-2 rounded ${analyticsData.today.studyTimeMinutes >= 90 && analyticsData.today.studyTimeMinutes < 120 ? 'bg-gray-100 text-gray-800' : 'bg-gray-50 text-gray-500'}`}>
                      ⭐ Power: 90+ min
                    </div>
                    <div className={`p-2 rounded ${analyticsData.today.studyTimeMinutes >= 60 && analyticsData.today.studyTimeMinutes < 90 ? 'bg-orange-100 text-orange-800' : 'bg-gray-50 text-gray-500'}`}>
                      ✅ Goal: 60+ min
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accuracy Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className={`p-2 rounded ${analyticsData.today.dailyAccuracy >= 95 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-50 text-gray-500'}`}>
                      🌟 Perfect: 95%+
                    </div>
                    <div className={`p-2 rounded ${analyticsData.today.dailyAccuracy >= 90 && analyticsData.today.dailyAccuracy < 95 ? 'bg-gray-100 text-gray-800' : 'bg-gray-50 text-gray-500'}`}>
                      💎 Excellence: 90%+
                    </div>
                    <div className={`p-2 rounded ${analyticsData.today.dailyAccuracy >= 85 && analyticsData.today.dailyAccuracy < 90 ? 'bg-orange-100 text-orange-800' : 'bg-gray-50 text-gray-500'}`}>
                      🎯 High: 85%+
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Streak Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className={`p-2 rounded ${analyticsData.currentStreak >= 30 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-50 text-gray-500'}`}>
                      🔥🔥🔥 Legend: 30 days
                    </div>
                    <div className={`p-2 rounded ${analyticsData.currentStreak >= 14 && analyticsData.currentStreak < 30 ? 'bg-gray-100 text-gray-800' : 'bg-gray-50 text-gray-500'}`}>
                      🔥🔥 Epic: 14 days
                    </div>
                    <div className={`p-2 rounded ${analyticsData.currentStreak >= 7 && analyticsData.currentStreak < 14 ? 'bg-orange-100 text-orange-800' : 'bg-gray-50 text-gray-500'}`}>
                      🔥 Master: 7 days
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* All Achievements List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  All Achievements Earned Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.achievements.length > 0 && analyticsData.achievements[0] !== '🎯 Complete your first activity to earn achievements' && analyticsData.achievements[0] !== 'Complete your first activity to earn achievements' && analyticsData.achievements[0] !== '🎯 Keep studying to earn achievements!' ? (
                  <div className="space-y-2">
                    {analyticsData.achievements.map((achievement, index) => {
                      // Extract emoji and text separately to avoid duplication
                      const emoji = achievement.split(':')[0].split(' ')[0];
                      const text = achievement.replace(emoji, '').trim();
                      
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                          <div className="text-2xl mt-0.5">
                            {emoji}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {text}
                            </p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Complete activities to start earning achievements!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Recent Learning Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentPageVisits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">Start studying to see your activity history</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentPageVisits.map((visit: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-lg">
                            {visit.page === 'ai-tutor' ? '💬' :
                             visit.page === 'practice' ? '📖' :
                             visit.page === 'flashcards' ? '🧠' :
                             visit.page === 'visual-learning' ? '🎥' :
                             visit.page === 'mock-exam-p1' ? '🏆' :
                             visit.page === 'mock-exam-p2' ? '🏆' : '📚'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {visit.pageName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(visit.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {(() => {
                            const minutes = Math.floor((new Date().getTime() - new Date(visit.timestamp).getTime()) / 60000);
                            if (minutes < 1) return 'Just now';
                            if (minutes < 60) return `${minutes}m ago`;
                            const hours = Math.floor(minutes / 60);
                            if (hours < 24) return `${hours}h ago`;
                            const days = Math.floor(hours / 24);
                            return `${days}d ago`;
                          })()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-1">
              <div className="mb-4">
                <Logo size="md" showText={false} />
              </div>
              <p className="text-sm text-gray-600">
                AI-powered learning platform for IGCSE, A-Levels & IB students.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className="text-sm text-gray-600 hover:text-imtehaan-primary transition-colors"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentPage('ai-tutor')}
                    className="text-sm text-gray-600 hover:text-imtehaan-primary transition-colors"
                  >
                    Lessons
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentPage('practice')}
                    className="text-sm text-gray-600 hover:text-imtehaan-primary transition-colors"
                  >
                    Practice
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentPage('analytics')}
                    className="text-sm text-gray-600 hover:text-imtehaan-primary transition-colors"
                  >
                    Analytics
                  </button>
                </li>
              </ul>
            </div>

            {/* Learning */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Learning</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setCurrentPage('mock-exam-selection')}
                    className="text-sm text-gray-600 hover:text-imtehaan-primary transition-colors"
                  >
                    Mock Exams
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentPage('flashcards')}
                    className="text-sm text-gray-600 hover:text-imtehaan-primary transition-colors"
                  >
                    Flashcards
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentPage('study-plan')}
                    className="text-sm text-gray-600 hover:text-imtehaan-primary transition-colors"
                  >
                    Study Plans
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setCurrentPage('settings')}
                    className="text-sm text-gray-600 hover:text-imtehaan-primary transition-colors"
                  >
                    Settings
                  </button>
                </li>
                <li>
                  <a 
                    href="mailto:support@imtehaan.com"
                    className="text-sm text-gray-600 hover:text-imtehaan-primary transition-colors"
                  >
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Imtehaan AI EdTech Platform. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm text-gray-600 hover:text-imtehaan-primary transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-imtehaan-primary transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}