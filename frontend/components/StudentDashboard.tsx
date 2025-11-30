import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import type { Curriculum } from '../App';
import { Checkbox } from './ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Logo } from './Logo';
import { useApp, StudySession } from '../App';
import { useAuth } from '../utils/supabase/AuthContext';
import { learningActivityTracker, ActivityAnalytics } from '../utils/supabase/learning-activity-tracker';
import { comprehensiveAnalyticsService, RealTimeAnalytics } from '../utils/supabase/comprehensive-analytics-service';
import { analyticsBufferService } from '../utils/supabase/analytics-buffer-service';
import { supabase } from '../utils/supabase/client';
import { useAutoTracking } from '../hooks/useAutoTracking';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  Play,
  Brain,
  Plus,
  Users,
  Flame,
  Award,
  CreditCard,
  Settings,
  Globe,
  Home,
  CreditCard as CardIcon,
  User,
  LogOut,
  MessageCircle,
  Zap,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  FileText,
  Video,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const translations = {
    nav: {
      dashboard: "Dashboard",
    learning: "Learning",
      practice: "Practice", 
      analytics: "Analytics",
      account: "Account",
    aiTutor: "AI Tutor",
    // Learning menu options
    lessons: "Interactive Lessons",
    lessonsDesc: "Structured lessons with AI-powered explanations",
    visualLearning: "Visual Learning", 
    visualLearningDesc: "Learn through videos and visual content",
    // Practice menu options
    practiceMode: "Topical Practice",
    practiceModeDesc: "Practice questions with instant feedback",
    mockExams: "Mock Exams",
    mockExamsDesc: "Full-length exams with detailed grading",
    flashcards: "Flashcards",
    flashcardsDesc: "Quick review with flashcards"
    },
    welcome: "Welcome back",
    teacherTasks: "Teacher Assigned Tasks",
    createStudyPlan: "Create New Study Plan",
    studySchedule: "Study Schedule",
    date: "Date",
    studyTime: "Study Time",
    topics: "Topics",
    questions: "Questions",
    status: "Status",
    planned: "Planned",
    completed: "Completed",
    missed: "Missed",
    hours: "hours",
    minutes: "minutes",
    expandQuestions: "Show Questions",
    collapseQuestions: "Hide Questions",
    resumePractice: "Resume Practice",
    suggestedForYou: "Suggested for You",
    studyRecommendations: "Study Recommendations",
    recentActivity: "Recent Activity",
    achievements: "Achievements",
    studyStreak: "Study Streak",
    weeklyGoal: "Weekly Goal",
    upcomingDeadlines: "Upcoming Deadlines",
    viewAll: "View All",
    startPractice: "Start Practice",
    continue: "Continue",
    newBadge: "New Badge!",
    consecutiveDays: "{count} consecutive days",
    hoursThisWeek: "{count} hours this week",
    questionsCompleted: "{count} questions completed today",
    mockExam: "Mock Exam",
    visualLearning: "Visual Learning",
    aiTutor: "AI Tutor Session",
    askAI: "Ask AI Tutor",
    aiTutorDescription: "Get instant help with any topic",
    curriculum: {
      label: "Curriculum",
      igcse: "IGCSE",
      oLevels: "O Levels",
      aLevels: "A Levels", 
      edexcel: "Edexcel",
      ib: "IB System"
  }
};

export function StudentDashboard() {
  const { setCurrentPage, user, setUser, curriculum, setCurriculum, studySessions, setStudySessions } = useApp();
  const { signOut } = useAuth();
  
  // Auto-tracking for dashboard time
  useAutoTracking({
    pageTitle: 'Student Dashboard',
    pageUrl: '/dashboard',
    trackClicks: true,
    trackTime: true,
    trackScroll: true
  });
  
  // Handle logout properly
  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentPage('login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Current time state for Pakistan timezone
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second (with seconds display)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  // Format date for Pakistan timezone
  const getPakistanDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Karachi',
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(currentTime);
  };

  // Format time for Pakistan timezone
  const getPakistanTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Karachi',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(currentTime);
  };
  
  const [expandedQuestions, setExpandedQuestions] = useState<{[key: string]: boolean}>({});
  const [studyPlans, setStudyPlans] = useState<any[]>([]);
  const [loadingStudyPlans, setLoadingStudyPlans] = useState(false);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  
  // New state for real-time learning analytics
  const [userAnalytics, setUserAnalytics] = useState<ActivityAnalytics[]>([]);
  const [studyStreaks, setStudyStreaks] = useState({ currentStreak: 0, longestStreak: 0 });
  const [learningPatterns, setLearningPatterns] = useState({
    preferredStudyTime: 'Morning',
    averageSessionLength: 30,
    topicsPerSession: 1,
    retentionRate: 0
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [dailyAnalytics, setDailyAnalytics] = useState<RealTimeAnalytics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [confirmingPlanId, setConfirmingPlanId] = useState<string | null>(null);
  
  // Auto-refresh recent activities every 30 seconds
  useEffect(() => {
    if (!user?.id) return;
    
    const refreshActivities = async () => {
      const activities = await getRecentActivities();
      setRecentActivities(activities);
      console.log('🔄 Auto-refreshed recent activities:', activities.length);
    };
    
    // Initial fetch
    refreshActivities();
    
    // Set up interval for fetching new activities
    const interval = setInterval(refreshActivities, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [user?.id]);

  // Force re-render every minute to update "time ago" displays
  const [, setTimeUpdateTrigger] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUpdateTrigger(prev => prev + 1);
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  const [bufferStatus, setBufferStatus] = useState({ timeBuffers: 0, events: 0, totalSeconds: 0 });
  
  // Midnight reset system for daily analytics and study streaks (Pakistan timezone)
  useEffect(() => {
    if (!user?.id) return;

    const performDailyReset = async (currentDate: string, yesterday: Date) => {
      try {
        const yesterdayDate = yesterday.toISOString().split('T')[0];
        
        // Check yesterday's study time
        const { data: yesterdayAnalytics, error } = await supabase
          .from('daily_analytics')
          .select('total_time_spent, study_streak')
          .eq('user_id', user.id)
          .eq('date', yesterdayDate)
          .single();
        
        let newStreak = 0;
        if (!error && yesterdayAnalytics) {
          if (yesterdayAnalytics.total_time_spent > 0) {
            // User studied yesterday - increment streak
            newStreak = (yesterdayAnalytics.study_streak || 0) + 1;
            console.log(`🔥 Study streak incremented! New streak: ${newStreak} days`);
          } else {
            console.log('📉 Study streak broken - no study time yesterday');
          }
        } else {
          // Check if there was any study session yesterday to maintain streak
          const { data: latestAnalytics } = await supabase
            .from('daily_analytics')
            .select('date, total_time_spent, study_streak')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(1)
            .single();
          
          if (latestAnalytics && latestAnalytics.total_time_spent > 0) {
            const latestDate = new Date(latestAnalytics.date);
            const daysDiff = Math.floor((new Date(currentDate).getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
              newStreak = (latestAnalytics.study_streak || 0) + 1;
              console.log(`🔥 Continuous streak! New streak: ${newStreak} days`);
            } else if (daysDiff > 1) {
              newStreak = 0;
              console.log(`📉 Streak broken - ${daysDiff} days gap`);
            }
          }
        }
        
        // Check if today's record already exists
        const { data: existingToday } = await supabase
          .from('daily_analytics')
          .select('date')
          .eq('user_id', user.id)
          .eq('date', currentDate)
          .single();
        
        if (!existingToday) {
          // Create today's analytics record with the new streak
          const { error: insertError } = await supabase
            .from('daily_analytics')
            .insert([{
              user_id: user.id,
              date: currentDate,
              total_time_spent: 0,
              total_activities: 0,
              questions_attempted: 0,
              questions_correct: 0,
              daily_accuracy: 0,
              study_streak: newStreak,
              productivity_score: 0,
              session_count: 0,
              lessons_completed: 0,
              video_lessons_completed: 0,
              flashcards_reviewed: 0,
              mock_exams_taken: 0,
              ai_tutor_interactions: 0,
              dashboard_visits: 1,
              topic_selections: 0
            }]);
          
          if (!insertError) {
            console.log('✅ Daily analytics reset complete for:', currentDate);
            
            // Update localStorage to prevent duplicate resets
            localStorage.setItem('imtehaan_last_reset_date', currentDate);
            
            // Refresh analytics display
            const freshAnalytics = await comprehensiveAnalyticsService.forceRefreshAnalytics(user.id);
            setDailyAnalytics(freshAnalytics);
            setStudyStreaks(prev => ({ ...prev, currentStreak: newStreak }));
            
            console.log('🎉 Daily reset complete! New streak:', newStreak);
          } else {
            console.error('❌ Error creating daily analytics:', insertError);
          }
        } else {
          // Today's record exists, just update localStorage
          localStorage.setItem('imtehaan_last_reset_date', currentDate);
          console.log('ℹ️ Daily record already exists for today');
        }
      } catch (error) {
        console.error('❌ Error in daily reset:', error);
      }
    };

    const checkMidnightReset = async () => {
      try {
        // Get current date and time in Pakistan timezone
        const pakistanTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' });
        const now = new Date(pakistanTime);
        
        // Get stored last reset date
        const lastResetDate = localStorage.getItem('imtehaan_last_reset_date');
        const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Check if it's a new day and we haven't reset yet today
        if (lastResetDate !== currentDate) {
          const hours = now.getHours();
          const minutes = now.getMinutes();
          
          // Trigger reset if:
          // 1. It's between midnight and 00:15 (real-time midnight reset)
          // 2. OR it's a new day and user just logged in (missed midnight reset)
          const isMidnightWindow = hours === 0 && minutes < 15;
          const isNewDay = lastResetDate !== null && lastResetDate !== currentDate;
          
          if (isMidnightWindow || isNewDay) {
            console.log(`🌙 ${isMidnightWindow ? 'Midnight' : 'New day'} detected in Pakistan timezone - triggering daily reset...`);
            
            // Get yesterday's date
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            
            await performDailyReset(currentDate, yesterday);
          }
        }
      } catch (error) {
        console.error('❌ Error in midnight reset check:', error);
      }
    };

    // Check immediately on load
    checkMidnightReset();
    
    // Check every minute for midnight
    const interval = setInterval(checkMidnightReset, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [user?.id]);
  
  const t = translations;
  
  // Fetch study plans from database
  useEffect(() => {
    console.log('Dashboard mounted, user:', user);
    if (user?.id) {
      console.log('User authenticated, fetching study plans for:', user.id);
      fetchStudyPlans();
    } else {
      console.log('No authenticated user yet, skipping study plans fetch');
    }
  }, [user?.id]);
  
  // Fetch analytics when user changes - OPTIMIZED FOR SPEED
  useEffect(() => {
    if (user?.id) {
      console.log('⚡ Dashboard: Quick load starting...');
      
      const quickLoadDashboard = async () => {
        try {
          // Set loading to false immediately - show UI with cached/zero data
          setLoadingAnalytics(false);
          
          // Fetch only essential data in parallel (no blocking)
          const [freshAnalytics, activities] = await Promise.all([
            comprehensiveAnalyticsService.forceRefreshAnalytics(user.id),
            getRecentActivities()
          ]);
          
          // Update immediately with fresh data
          setDailyAnalytics(freshAnalytics);
          setRecentActivities(activities);
          setLastUpdated(new Date());
          console.log('⚡ Quick load complete:', freshAnalytics.today.studyTimeMinutes, 'minutes');
          
          // Fetch less critical data in background (non-blocking)
          setTimeout(async () => {
            try {
          const [analytics, streaks, patterns] = await Promise.all([
            learningActivityTracker.getUserAnalytics(user.id),
            learningActivityTracker.getStudyStreaks(user.id),
            learningActivityTracker.getLearningPatterns(user.id)
          ]);
          
          setUserAnalytics(analytics);
          setStudyStreaks(streaks);
          setLearningPatterns(patterns);
              console.log('📊 Background data loaded');
            } catch (bgError) {
              console.log('⚠️ Background fetch error (non-critical):', bgError);
            }
          }, 100);
          
          // Track dashboard visit (non-blocking)
          trackDashboardVisit();
          
        } catch (error) {
          console.log('⚠️ Dashboard: Quick load error:', error);
          setLoadingAnalytics(false);
        }
      };
      
      quickLoadDashboard();
    } else {
      // User logged out, clear analytics state
      setDailyAnalytics(null);
      setUserAnalytics([]);
      setStudyStreaks({ currentStreak: 0, longestStreak: 0 });
      setLearningPatterns({
        preferredStudyTime: 'Morning',
        averageSessionLength: 30,
        topicsPerSession: 1,
        retentionRate: 0
      });
      setLoadingAnalytics(false);
    }
  }, [user?.id]);

  // Real-time subscription for analytics updates on dashboard
  useEffect(() => {
    if (!user?.id) return;

    console.log('📡 Dashboard: Setting up real-time analytics subscription');
    
    const channel = supabase
      .channel('dashboard-analytics-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_analytics',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📊 Dashboard: Real-time analytics update received:', payload);
          // Refetch analytics without resetting
          comprehensiveAnalyticsService.forceRefreshAnalytics(user.id).then(freshData => {
            setDailyAnalytics(freshData);
            setLastUpdated(new Date());
          });
        }
      )
      .subscribe();

    return () => {
      console.log('📡 Dashboard: Unsubscribing from analytics updates');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Update buffer status periodically
  useEffect(() => {
    if (!user?.id) return;

    const updateStatus = () => {
      const status = analyticsBufferService.getBufferStatus();
      setBufferStatus(status);
    };

    updateStatus(); // Initial update
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [user?.id]);

  // Removed - No longer needed with optimized loading

  // Removed - Excessive logging slows down rendering

  // Removed - No longer needed with instant UI display



  
  // Optimized analytics refresh - only called manually
  const fetchLearningAnalytics = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 Manual refresh...');
      
      // Fetch only essential data quickly
      const [daily, recent] = await Promise.all([
        comprehensiveAnalyticsService.forceRefreshAnalytics(user.id),
        getRecentActivities()
      ]);
      
      setDailyAnalytics(daily);
      setRecentActivities(recent);
      setLastUpdated(new Date());
      console.log('✅ Refresh complete');
    } catch (error) {
      console.error('❌ Refresh error:', error);
    }
  }, [user?.id]);

  // Force refresh function that bypasses loading state
  const forceRefreshAnalytics = React.useCallback(async () => {
    if (!user?.id) return;
    
    console.log('🔄 Force refreshing analytics...');
    setLoadingAnalytics(true);
    
    try {
      // Use the new reset and fresh analytics function
      const freshAnalytics = await comprehensiveAnalyticsService.resetAndGetFreshAnalytics(user.id);
      
      // Set the fresh analytics data directly
      setDailyAnalytics(freshAnalytics);
      setLastUpdated(new Date());
      console.log('✅ Analytics force refreshed, study time:', freshAnalytics.today.studyTimeMinutes);
      
    } catch (error) {
      console.error('❌ Failed to force refresh analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [user?.id]);

  
  const fetchStudyPlans = async () => {
    if (!user?.id) {
      console.log('No authenticated user, skipping study plans fetch');
      setStudyPlans([]);
      return;
    }

    setLoadingStudyPlans(true);
    try {
      const { studyPlansService } = await import('../utils/supabase/services');
      const { data, error } = await studyPlansService.getUserStudyPlans(user.id);
      
      if (error) {
        console.error('Error fetching study plans:', error);
        setStudyPlans([]);
      } else {
        console.log('Study plans fetched successfully:', data);
        setStudyPlans(data || []);
      }
    } catch (error) {
      console.error('Error importing study plans service:', error);
      setStudyPlans([]);
    } finally {
      setLoadingStudyPlans(false);
    }
  };
  
  // Function to refresh study plans (can be called from other components)
  const refreshStudyPlans = () => {
    fetchStudyPlans();
  };

  // Function to refresh all analytics including daily analytics
  const refreshAllAnalytics = () => {
    console.log('🔄 Manual refresh triggered by user');
    fetchLearningAnalytics();
  };

  // Track dashboard visit for analytics
  const trackDashboardVisit = async () => {
    if (!user?.id) return;
    
    try {
      // Track dashboard visit using comprehensive analytics service
      await comprehensiveAnalyticsService.trackPlatformActivity(
        user.id,
        'dashboard_visit',
        0,
        'Dashboard',
        'General'
      );
      console.log('📊 Dashboard visit tracked');
    } catch (error) {
      // Silently handle tracking errors
      console.log('Dashboard visit tracking failed:', error);
    }
  };

  // Helper functions for study sessions
  const toggleQuestionExpansion = (sessionId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  // Helper functions for real-time analytics
  const calculateOverallProgress = () => {
    if (userAnalytics.length === 0) return 0;
    const totalProgress = userAnalytics.reduce((sum, topic) => sum + topic.completionPercentage, 0);
    return Math.round(totalProgress / userAnalytics.length);
  };

  const calculateTotalTimeSpent = () => {
    return userAnalytics.reduce((sum, topic) => sum + topic.timeSpent, 0);
  };

  const calculateAverageAccuracy = () => {
    if (userAnalytics.length === 0) return 0;
    const totalAccuracy = userAnalytics.reduce((sum, topic) => sum + topic.accuracy, 0);
    return Math.round(totalAccuracy / userAnalytics.length);
  };

  const getTopPerformingTopics = (limit: number = 3) => {
    return userAnalytics
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, limit);
  };

  const getTopicsNeedingReview = (limit: number = 3) => {
    return userAnalytics
      .filter((topic: any) => topic.accuracy < 70)
      .sort((a: any, b: any) => a.accuracy - b.accuracy)
      .slice(0, limit);
  };

  const getRecentActivities = async () => {
    try {
      if (!user?.id) {
        console.log('⚠️ No user ID for recent activities');
        return [];
      }

      console.log('🔄 Fetching recent page visits and activities for user:', user.id);

      // Get recent page visits from buffer service (shows what pages user was on)
      const pageVisits = analyticsBufferService.getRecentPageVisits(user.id, 20);
      console.log('📦 Page visits from buffer:', pageVisits.length, pageVisits);
      
      // Get recent learning activities from database
      const { data: learningActivities, error: dbError } = await supabase
          .from('learning_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        .limit(10);

      if (dbError) {
        console.log('⚠️ Database query error (non-critical):', dbError);
      } else {
        console.log('📊 Learning activities from DB:', learningActivities?.length || 0);
      }

      const allActivities: any[] = [];

      // Process page visits from buffer (most accurate - shows what pages user was on)
      if (pageVisits && pageVisits.length > 0) {
        pageVisits.forEach(visit => {
          allActivities.push({
            id: `visit_${visit.timestamp}`,
            type: 'page_visit',
            subject: visit.pageName,
            topic: visit.pageName,
            score: 0,
            timestampRaw: visit.timestamp, // Store raw timestamp
            activityType: visit.page,
            timestamp: new Date(visit.timestamp).getTime(),
            pageName: visit.pageName,
            description: `Studied on ${visit.pageName}`,
            pageKey: visit.page
          });
        });
        console.log('✅ Added page visits to activities:', pageVisits.length);
      } else {
        console.log('⚠️ No page visits found in buffer');
      }

      // Process learning activities
      if (learningActivities && learningActivities.length > 0) {
        learningActivities.forEach(activity => {
          allActivities.push({
            id: `learning_${activity.id}`,
            type: 'learning_activity',
            subject: activity.subject_name || 'Unknown Subject',
            topic: activity.topic_name || 'Unknown Topic',
            score: activity.accuracy || 0,
            timestampRaw: activity.created_at, // Store raw timestamp
            activityType: activity.activity_type,
            duration: activity.duration,
            metadata: activity.metadata,
            timestamp: new Date(activity.created_at).getTime(),
            pageName: getPageNameFromActivityType(activity.activity_type),
            description: getActivityDescription(activity.activity_type, activity.topic_name, activity.accuracy)
          });
        });
        console.log('✅ Added learning activities:', learningActivities.length);
      }

      // Sort by timestamp (most recent first)
      allActivities.sort((a, b) => b.timestamp - a.timestamp);

      // Get top 10 for dashboard display
      const recentActivities = allActivities.slice(0, 10);

      console.log('📊 FINAL Recent activities:', recentActivities.length);
      console.log('📊 Activities detail:', recentActivities);
      recentActivities.forEach(activity => {
        console.log(`  - ${activity.pageName || activity.activityType}: ${activity.time}`);
      });

      return recentActivities;

    } catch (error) {
      console.error('❌ Error in getRecentActivities:', error);
      // Return empty array on error, don't fallback
      return [];
    }
  };

  // Fallback for when no activities found
  const getFallbackActivities = () => {
    if (!userAnalytics || userAnalytics.length === 0) return [];
    
    return userAnalytics
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .slice(0, 5)
      .map(topic => ({
          id: `topic_${topic.topicId}`,
        type: 'topic',
        subject: topic.subjectName,
        topic: topic.topicName,
        score: topic.accuracy,
          timestampRaw: topic.lastActivity, // Store raw timestamp for dynamic calculation
          activityType: 'topic_review',
          description: `Reviewed ${topic.topicName}`
        }));
  };

  // Helper function to get page name from activity type
  const getPageNameFromActivityType = (activityType: string): string => {
    const pageNames: { [key: string]: string } = {
      'ai-tutor': 'AI Tutor & Lessons',
      'practice': 'Practice Mode',
      'flashcards': 'Flashcards',
      'visual-learning': 'Visual Learning',
      'mock-exam-p1': 'Mock Exam Paper 1',
      'mock-exam-p2': 'Mock Exam Paper 2',
      'question': 'Practice Mode',
      'lesson': 'AI Tutor & Lessons',
      'video_lesson': 'Visual Learning',
      'flashcard': 'Flashcards',
      'mock_exam': 'Mock Exams',
      'practice_session': 'Practice Mode',
      'ai_tutor': 'AI Tutor'
    };
    
    return pageNames[activityType] || 'Study Activity';
  };

  // Helper function to get page route from activity
  const getPageRoute = (activity: any): string => {
    const pageRoutes: { [key: string]: string } = {
      'ai-tutor': 'ai-tutor-topic-selection',
      'practice': 'topic-selection',
      'flashcards': 'flashcard-selection',
      'visual-learning': 'visual-learning',
      'mock-exam-p1': 'mock-exam-selection',
      'mock-exam-p2': 'mock-exam-selection',
      'question': 'topic-selection',
      'lesson': 'ai-tutor-topic-selection',
      'video_lesson': 'visual-learning',
      'flashcard': 'flashcard-selection',
      'mock_exam': 'mock-exam-selection',
      'ai_tutor': 'ai-tutor-topic-selection',
      'page_visit': activity.pageKey || 'dashboard'
    };
    
    return pageRoutes[activity.pageKey || activity.activityType] || 'dashboard';
  };

  // Helper function to get activity description
  const getActivityDescription = (activityType: string, topicName: string, accuracy?: number): string => {
    switch (activityType) {
      case 'question':
        return accuracy ? `Answered questions on ${topicName} (${accuracy}% accuracy)` : `Practiced questions on ${topicName}`;
      case 'lesson':
        return `Studied lesson: ${topicName}`;
      case 'video_lesson':
        return `Watched video lesson: ${topicName}`;
      case 'flashcard':
        return accuracy ? `Reviewed flashcards on ${topicName} (${accuracy}% mastery)` : `Reviewed flashcards on ${topicName}`;
      case 'mock_exam':
        return accuracy ? `Completed mock exam: ${topicName} (${accuracy}% score)` : `Completed mock exam: ${topicName}`;
      case 'practice_session':
        return `Completed practice session on ${topicName}`;
      case 'ai_tutor':
        return `Used AI tutor for ${topicName}`;
      default:
        return `Activity on ${topicName}`;
    }
  };

  // Helper function to check if a page is learning-related
  const isLearningPage = (pageName: string): boolean => {
    const learningPages = [
      'Practice Mode', 'Flashcards', 'AI Tutor & Lessons', 'Visual Learning', 
      'Mock Exams', 'Analytics', 'AI Tutor', 'Lessons', 'Practice'
    ];
    return learningPages.some(page => pageName.includes(page));
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return true 
        ? `${hours}h ${minutes}m`
        : `${hours}س ${minutes}د`;
    }
    return true ? `${minutes}m` : `${minutes}د`;
  };

  const updateSessionStatus = (sessionId: string, newStatus: 'planned' | 'completed' | 'missed') => {
    const updatedSessions = studySessions.map((session: any) =>
      session.id === sessionId ? { ...session, status: newStatus } : session
    );
    setStudySessions(updatedSessions);
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return true 
        ? `${hours} ${hours === 1 ? 'hour' : t.hours}${mins > 0 ? ` ${mins} ${t.minutes}` : ''}`
        : `${hours} ${t.hours}${mins > 0 ? ` ${mins} ${t.minutes}` : ''}`;
    }
    return `${mins} ${t.minutes}`;
  };

  const getStatusBadge = (status: 'planned' | 'completed' | 'missed') => {
    const statusConfig = {
      planned: { 
        text: t.planned, 
        className: 'bg-[#9B4DFF]/15 text-[#6B21FF] border-[#9B4DFF]/30' 
      },
      completed: { 
        text: t.completed, 
        className: 'bg-success-light text-success-dark border-success' 
      },
      missed: { 
        text: t.missed, 
        className: 'bg-red-100 text-red-800 border-red-200' 
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant="outline" className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const getSubjectsForCurriculum = () => {
    const getCurriculumName = () => {
      // Always return IGCSE
      return 'IGCSE';
    };

    const getTopicName = (subject: string) => {
      // Get first topic from user's analytics for this subject
      const subjectTopics = userAnalytics.filter((topic: any) => 
        topic.subjectName.toLowerCase().includes(subject.toLowerCase())
      );
      return subjectTopics.length > 0 ? subjectTopics[0].topicName : 'Start learning';
    };

    const getChapterCount = (subject: string) => {
      // Get actual topic count from user's analytics
      const subjectTopics = userAnalytics.filter((topic: any) => 
        topic.subjectName.toLowerCase().includes(subject.toLowerCase())
      );
      return subjectTopics.length || 0;
    };

    const curriculumName = getCurriculumName();

    // Get real analytics data for subjects
    const getSubjectAnalytics = (subjectName: string) => {
      const subjectTopics = userAnalytics.filter((topic: any) => 
        topic.subjectName.toLowerCase().includes(subjectName.toLowerCase())
      );
      
      if (subjectTopics.length === 0) {
        return {
          progress: 0,
          completed: 0,
          accuracy: 0,
          timeSpent: 0
        };
      }
      
      const progress = Math.round(
        subjectTopics.reduce((sum: any, topic: any) => sum + topic.completionPercentage, 0) / subjectTopics.length
      );
      const completed = Math.round(
        subjectTopics.reduce((sum: any, topic: any) => sum + topic.lessonsCompleted, 0)
      );
      const accuracy = Math.round(
        subjectTopics.reduce((sum: any, topic: any) => sum + topic.accuracy, 0) / subjectTopics.length
      );
      const timeSpent = subjectTopics.reduce((sum: any, topic: any) => sum + topic.timeSpent, 0);
      
      return { progress, completed, accuracy, timeSpent };
    };

    const baseSubjects = [
      {
        name: 'Mathematics',
        progress: getSubjectAnalytics('Mathematics').progress,
        nextTopic: getTopicName('Mathematics'),
        color: 'bg-imtehaan-accent',
        chapters: getChapterCount('Mathematics'),
        completed: getSubjectAnalytics('Mathematics').completed,
        level: curriculumName,
        accuracy: getSubjectAnalytics('Mathematics').accuracy,
        timeSpent: getSubjectAnalytics('Mathematics').timeSpent
      },
      {
        name: 'Physics',
        progress: getSubjectAnalytics('Physics').progress,
        nextTopic: getTopicName('Physics'),
        color: 'bg-imtehaan-secondary',
        chapters: getChapterCount('Physics'),
        completed: getSubjectAnalytics('Physics').completed,
        level: curriculumName,
        accuracy: getSubjectAnalytics('Physics').accuracy,
        timeSpent: getSubjectAnalytics('Physics').timeSpent
      },
      {
        name: 'Chemistry',
        progress: getSubjectAnalytics('Chemistry').progress,
        nextTopic: getTopicName('Chemistry'),
        color: 'bg-imtehaan-warning',
        chapters: getChapterCount('Chemistry'),
        completed: getSubjectAnalytics('Chemistry').completed,
        level: curriculumName,
        accuracy: getSubjectAnalytics('Chemistry').accuracy,
        timeSpent: getSubjectAnalytics('Chemistry').timeSpent
      },
      {
        name: 'Biology',
        progress: getSubjectAnalytics('Biology').progress,
        nextTopic: getTopicName('Biology'),
        color: 'bg-imtehaan-primary',
        chapters: getChapterCount('Biology'),
        completed: getSubjectAnalytics('Biology').completed,
        level: curriculumName,
        accuracy: getSubjectAnalytics('Biology').accuracy,
        timeSpent: getSubjectAnalytics('Biology').timeSpent
      }
    ];

    // Helper function to get the weakest subject based on accuracy
    const getWeakestSubject = () => {
      const subjects = ['Mathematics', 'Physics', 'Chemistry'];
      let weakestSubject = subjects[0];
      let lowestAccuracy = 100;
      
      subjects.forEach(subject => {
        const analytics = getSubjectAnalytics(subject);
        if (analytics.accuracy < lowestAccuracy) {
          lowestAccuracy = analytics.accuracy;
          weakestSubject = subject;
        }
      });
      
      return true ? weakestSubject : 
        weakestSubject === 'Mathematics' ? 'الرياضيات' :
        weakestSubject === 'Physics' ? 'الفيزياء' : 'الكيمياء';
    };

    return baseSubjects;
  };

  const subjects = getSubjectsForCurriculum();

  // Helper function to get the weakest subject based on accuracy
  const getWeakestSubject = () => {
    const subjects = ['Mathematics', 'Physics', 'Chemistry'];
    let weakestSubject = subjects[0];
    let lowestAccuracy = 100;
    
    subjects.forEach(subject => {
      const subjectData = userAnalytics.filter(t => t.subjectName === subject);
      if (subjectData.length > 0) {
        const totalQuestions = subjectData.reduce((sum, t) => sum + t.questionsAttempted, 0);
        const correctAnswers = subjectData.reduce((sum, t) => sum + t.questionsCorrect, 0);
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        if (accuracy < lowestAccuracy) {
          lowestAccuracy = accuracy;
          weakestSubject = subject;
        }
      }
    });
    
    return true ? weakestSubject : 
      weakestSubject === 'Mathematics' ? 'الرياضيات' :
      weakestSubject === 'Physics' ? 'الفيزياء' : 'الكيمياء';
  };

  // Recent activities are now fetched and stored in state

  // Generate real achievements based on analytics
  const achievements = [
    {
      icon: Flame,
      title: true ? `${studyStreaks.currentStreak}-Day Streak` : `سلسلة ${studyStreaks.currentStreak} أيام`,
      description: 'Studied every day this week',
      isNew: studyStreaks.currentStreak >= 7
    },
    {
      icon: Target,
      title: 'Perfect Score',
      description: true ? `Got ${calculateAverageAccuracy()}% average accuracy` : `حصلت على ${calculateAverageAccuracy()}% متوسط الدقة`,
      isNew: calculateAverageAccuracy() >= 90
    },
    {
      icon: Trophy,
      title: 'Quick Learner',
      description: true ? `Completed ${userAnalytics.reduce((sum, t) => sum + t.questionsAttempted, 0)} questions total` : `أكملت ${userAnalytics.reduce((sum, t) => sum + t.questionsAttempted, 0)} سؤال إجمالي`,
      isNew: userAnalytics.reduce((sum, t) => sum + t.questionsAttempted, 0) >= 50
    }
  ];

  const palette = {
    violet: '#9B4DFF',
    magenta: '#FF4D91',
    coral: '#FF6C6C',
    lightViolet: 'rgba(155, 77, 255, 0.1)',
    lightMagenta: 'rgba(255, 77, 145, 0.1)',
    lightCoral: 'rgba(255, 108, 108, 0.1)'
  };

  const syncBuffer = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('buffer_status')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching buffer status:', error);
        setTopicsError('Failed to fetch buffer status');
      } else {
        setBufferStatus(data);
        setTopicsError(null);
      }
    } catch (error) {
      console.error('Error syncing buffer:', error);
      setTopicsError('Failed to sync buffer');
    }
  }, [user?.id]);

  useEffect(() => {
    syncBuffer();
  }, [syncBuffer]);

  const handleDeleteStudyPlan = useCallback(async (planId: number | string) => {
    if (!studyPlans.length) return;

    const planIdStr = String(planId);
    setDeletingPlanId(planIdStr);

    try {
      const { studyPlansService } = await import('../utils/supabase/services');
      const { success, error } = await studyPlansService.deleteStudyPlan(planId);
      if (!success || error) {
        throw error || new Error('Unable to delete study plan');
      }

      setStudyPlans(prevPlans => {
        const updatedPlans = prevPlans.filter(plan => String(plan.plan_id) !== planIdStr);
        setCurrentPlanIndex(prevIndex => {
          if (!updatedPlans.length) return 0;
          return Math.min(prevIndex, updatedPlans.length - 1);
        });
        return updatedPlans;
      });
      setConfirmingPlanId(null);
    } catch (error) {
      console.error('Failed to delete study plan:', error);
    } finally {
      setDeletingPlanId(null);
    }
  }, [studyPlans.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Navigation Header */}
      <nav
        className="sticky top-0 z-40 shadow-sm backdrop-blur-md border-b"
        style={{
          background: 'linear-gradient(90deg, rgba(155,77,255,0.12), rgba(255,77,145,0.1), rgba(255,108,108,0.1))',
          borderColor: 'rgba(155,77,255,0.2)'
        }}
      >
        <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-3">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <Logo size="md" showText={true} className="-mt-0.5" />
              <div className="ml-4 hidden sm:block">
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="hidden md:block ml-8">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className="flex items-center px-4 py-2 font-medium text-white rounded-lg transition-all duration-200 shadow-sm hover:opacity-90"
                  style={{
                    background: '#000000',
                    border: '1px solid rgba(0,0,0,0.2)'
                  }}
                >
                  <Home className="h-4 w-4 mr-2" />
                  {t.nav.dashboard}
                </button>
                
                {/* Learning Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center px-4 py-2 font-medium rounded-lg transition-all duration-200 text-gray-700 hover:text-white hover:shadow-sm"
                      style={{ border: '1px solid transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155,77,255,0.85), rgba(255,77,145,0.85))';
                        e.currentTarget.style.borderColor = 'rgba(155,77,255,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      {t.nav.learning}
                      <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="start">
                    <DropdownMenuLabel className="font-semibold">Choose Learning Mode</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => setCurrentPage('ai-tutor-topic-selection')}
                      className="p-0 hover:bg-transparent cursor-default"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-lg transition-colors w-full cursor-pointer" style={{ background: 'transparent' }}>
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                          style={{ background: 'linear-gradient(135deg, #9B4DFF, #FF4D91)' }}
                        >
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{t.nav.lessons}</h4>
                          <p className="text-sm text-gray-600">{t.nav.lessonsDesc}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                  onClick={() => setCurrentPage('visual-learning')}
                      className="p-0 hover:bg-transparent cursor-default"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-lg transition-colors w-full cursor-pointer" style={{ background: 'transparent' }}>
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                          style={{ background: 'linear-gradient(135deg, #FF4D91, #FF6C6C)' }}
                        >
                          <Video className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{t.nav.visualLearning}</h4>
                          <p className="text-sm text-gray-600">{t.nav.visualLearningDesc}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Practice Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center px-4 py-2 font-medium rounded-lg transition-all duration-200 text-gray-700 hover:text-white hover:shadow-sm"
                      style={{ border: '1px solid transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,77,145,0.85), rgba(255,108,108,0.85))';
                        e.currentTarget.style.borderColor = 'rgba(255,77,145,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      {t.nav.practice}
                      <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="start">
                    <DropdownMenuLabel className="font-semibold">Choose Practice Mode</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => setCurrentPage('practice')}
                      className="p-0 hover:bg-transparent cursor-default"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-lg transition-colors w-full cursor-pointer" style={{ background: 'transparent' }}>
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                          style={{ background: 'linear-gradient(135deg, #FF6C6C, #FF4D91)' }}
                        >
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{t.nav.practiceMode}</h4>
                          <p className="text-sm text-gray-600">{t.nav.practiceModeDesc}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => setCurrentPage('mock-exam-selection')}
                      className="p-0 hover:bg-transparent cursor-default"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-lg transition-colors w-full cursor-pointer" style={{ background: 'transparent' }}>
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                          style={{ background: 'linear-gradient(135deg, #9B4DFF, #FF6C6C)' }}
                        >
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{t.nav.mockExams}</h4>
                          <p className="text-sm text-gray-600">{t.nav.mockExamsDesc}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => setCurrentPage('flashcard-selection')}
                      className="p-0 hover:bg-transparent cursor-default"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-lg transition-colors w-full cursor-pointer" style={{ background: 'transparent' }}>
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                          style={{ background: 'linear-gradient(135deg, #FF4D91, #9B4DFF)' }}
                        >
                          <CardIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{t.nav.flashcards}</h4>
                          <p className="text-sm text-gray-600">{t.nav.flashcardsDesc}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button 
                  onClick={() => setCurrentPage('analytics')}
                  className="flex items-center px-4 py-2 font-medium rounded-lg transition-all duration-200 text-gray-700 hover:text-white hover:shadow-sm"
                  style={{ border: '1px solid transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155,77,255,0.85), rgba(255,108,108,0.85))';
                    e.currentTarget.style.borderColor = 'rgba(155,77,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t.nav.analytics}
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Pakistan Date & Time */}
              <div className="hidden lg:flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0" style={{ color: palette.magenta }} />
                <span className="text-sm font-medium text-gray-700">
                  {getPakistanDate()} • {getPakistanTime()}
                </span>
              </div>

              {/* IGCSE Badge */}
              <div className="hidden sm:flex items-center">
                <div
                  className="px-3 py-1.5 text-white text-xs font-semibold rounded-full shadow-sm"
                  style={{ background: '#000000' }}
                >
                  {t.curriculum.igcse}
                </div>
              </div>
              
              {/* Settings */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentPage('settings')}
                className="text-gray-600 hover:text-imtehaan-primary hover:bg-[#9B4DFF]/10 rounded-lg transition-all duration-200"
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* Logout */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-3 py-2">
        {/* Welcome Section */}
        <div className="mb-4 mt-6">
          <div className="mb-4">
              <h1 className="text-3xl font-bold text-black mb-2">
                {t.welcome}, {user?.full_name || user?.email?.split('@')[0] || 'Student'}!
              </h1>
              <p className="text-gray-600">
                {true 
                  ? "Ready to continue your learning journey?" 
                  : "مستعد لمتابعة رحلة التعلم؟"
                }
              </p>
              
              {/* Buffer Status & Refresh Button */}
              <div className="mt-4 flex items-center justify-between gap-2">
                {/* Buffer Status Indicator */}
                {bufferStatus.totalSeconds > 0 && (
                  <div
                    className="flex items-center gap-2 px-3 py-1 rounded-lg"
                    style={{
                      background: palette.lightMagenta,
                      border: '1px solid rgba(255,77,145,0.3)'
                    }}
                  >
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: palette.magenta }}></div>
                    <span className="text-xs font-medium" style={{ color: palette.magenta }}>
                      {bufferStatus.totalSeconds}s buffered • Syncing...
                    </span>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={forceRefreshAnalytics}
                  disabled={loadingAnalytics}
                  className="flex items-center gap-2 ml-auto hover:brightness-110"
                  style={{
                    borderColor: 'rgba(155,77,255,0.35)',
                    color: palette.violet
                  }}
                >
                  {loadingAnalytics ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: palette.violet }}></div>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Refresh Analytics
                    </>
                  )}
                </Button>
              </div>
              
              {/* Real-time Progress Summary */}
              {!loadingAnalytics && userAnalytics.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Overall Progress</p>
                        <p className="text-2xl font-bold text-imtehaan-primary">{calculateOverallProgress()}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-imtehaan-primary" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Study Streak</p>
                        <p className="text-2xl font-bold text-imtehaan-error">{studyStreaks.currentStreak} days</p>
                      </div>
                      <Flame className="h-8 w-8 text-imtehaan-error" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Average Accuracy</p>
                        <p className="text-2xl font-bold text-imtehaan-success">{calculateAverageAccuracy()}%</p>
                      </div>
                      <Target className="h-8 w-8 text-imtehaan-success" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Time Spent</p>
                        <p className="text-2xl font-bold text-imtehaan-accent">
                          {isResetting ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-imtehaan-accent"></div>
                          ) : (
                            formatDuration(dailyAnalytics?.today?.studyTimeMinutes ? dailyAnalytics.today.studyTimeMinutes * 60 : 0)
                          )}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-imtehaan-accent" />
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Study Schedule Container */}
        <div className="mb-8">
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardContent className="p-6">
              {loadingStudyPlans ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200 mx-auto mb-4" style={{ borderTopColor: palette.magenta }}></div>
                    <p className="text-gray-600">Loading your study schedule...</p>
            </div>
          </div>
              ) : studyPlans.length > 0 ? (
                <div>
                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {studyPlans.length > 1 && (
                        <>
                <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPlanIndex((prev) => (prev === 0 ? studyPlans.length - 1 : prev - 1))}
                            disabled={studyPlans.length === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ArrowLeft className="h-4 w-4" />
                </Button>
                          <span className="text-sm text-gray-600 font-medium px-2">
                            {currentPlanIndex + 1} / {studyPlans.length}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPlanIndex((prev) => (prev === studyPlans.length - 1 ? 0 : prev + 1))}
                            disabled={studyPlans.length === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
              </div>
                    {studyPlans.length === 1 && <div></div>}
                  <Button 
                      onClick={() => setCurrentPage('study-plan')}
                    className="text-white hover:opacity-90"
                    style={{ background: '#000000', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  >
                      <Plus className="mr-2 h-4 w-4" />
                      Create New
                  </Button>
        </div>

                  {/* Current Plan Display */}
                  {(() => {
                    const plan = studyPlans[currentPlanIndex];
                    const studyHours = Math.floor(plan.study_time_minutes / 60);
                    const studyMins = plan.study_time_minutes % 60;
                    
                    return (
                      <div key={plan.plan_id} className="relative overflow-hidden bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-white/85 border border-gray-200 rounded-lg flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-gray-700" />
                  </div>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900 mb-1">{plan.plan_name}</h4>
                              <p className="text-gray-600">
                                Subject: <span className="font-medium">{plan.subject || 'Business Studies'}</span>
                              </p>
                            </div>
                          </div>
                          <Badge 
                            className={`text-xs px-3 py-1 ${
                              plan.status === 'completed' 
                                ? 'bg-green-500 text-white' 
                                : plan.status === 'missed' 
                                ? 'bg-red-500 text-white'
                                : 'bg-[#9B4DFF] text-white'
                            }`}
                          >
                            {plan.status || 'active'}
                          </Badge>
                          <button
                            onClick={() => setConfirmingPlanId(String(plan.plan_id))}
                            disabled={deletingPlanId === String(plan.plan_id)}
                            className="rounded-full p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                            aria-label="Delete study plan"
                          >
                            {deletingPlanId === String(plan.plan_id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Exam Date</p>
                            <p className="font-semibold text-gray-900">
                              {plan.exam_date 
                                ? new Date(plan.exam_date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })
                                : 'Not set'}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Daily Study Time</p>
                            <p className="font-semibold text-gray-900 flex items-center gap-1">
                              <Clock className="h-4 w-4" style={{ color: palette.magenta }} />
                              {studyHours > 0 ? `${studyHours}h` : ''} {studyMins > 0 ? `${studyMins}m` : '0m'}
                            </p>
                          </div>
                          </div>

                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" style={{ color: palette.violet }} />
                            Total Topics: <span style={{ color: palette.violet }}>{plan.total_topics || 0}</span>
                          </p>
                          </div>
                        
                        {/* Topics to Cover */}
                        {plan.topics_to_cover && plan.topics_to_cover.length > 0 && (
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Target className="h-4 w-4" style={{ color: palette.coral }} />
                              Topics to Cover:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {plan.topics_to_cover.map((topic: string, index: number) => (
                                <div 
                                  key={index} 
                                  className="px-3 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                                  style={{
                                    backgroundColor: palette.lightViolet,
                                    border: '1px solid rgba(155,77,255,0.25)',
                                    color: palette.violet
                                  }}
                                >
                                  {topic}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {confirmingPlanId === String(plan.plan_id) && (
                          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 p-4">
                            <div className="max-w-xs w-full rounded-2xl border border-red-200 bg-white shadow-lg p-5 text-center space-y-4">
                              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500">
                                <Trash2 className="h-5 w-5" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-900">Delete this study plan?</p>
                                <p className="text-xs text-gray-600">This action can&rsquo;t be undone.</p>
                              </div>
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  className="px-4 py-2 text-xs rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                                  onClick={() => setConfirmingPlanId(null)}
                                  disabled={deletingPlanId === String(plan.plan_id)}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="px-4 py-2 text-xs rounded-full text-white transition disabled:opacity-60"
                                  style={{ background: 'linear-gradient(90deg, #FF4D91, #FF6C6C)' }}
                                  onClick={() => handleDeleteStudyPlan(plan.plan_id)}
                                  disabled={deletingPlanId === String(plan.plan_id)}
                                >
                                  {deletingPlanId === String(plan.plan_id) ? 'Deleting…' : 'Delete'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  </div>
                ) : (
                  <div className="text-center py-8">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">No Study Schedule Yet</h3>
                  <p className="text-gray-600 mb-4">Create a study plan to track your learning progress</p>
                    <Button 
                      onClick={() => setCurrentPage('study-plan')}
                    className="text-white hover:opacity-90"
                    style={{ background: '#000000', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Study Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">


            {/* Daily Analytics Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      {true ? 'Today\'s Progress' : 'تقدم اليوم'}
                    </CardTitle>
                    <div className="text-sm text-gray-500">
                      {'Real-time daily analytics'}
                      {lastUpdated && (
                        <div className="text-xs text-gray-400 mt-1">
                          {'Last updated: '}
                          {lastUpdated.toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshAllAnalytics}
                    disabled={loadingAnalytics}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingAnalytics ? 'animate-spin' : ''}`} />
                    {'Refresh'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {dailyAnalytics ? (
                  <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg"
                      style={{ background: `linear-gradient(135deg, ${palette.lightViolet}, rgba(255,255,255,0.95))` }}
                    >
                      <div className="text-2xl font-bold" style={{ color: palette.violet }}>
                        {dailyAnalytics.today.totalActivities}
                      </div>
                      <div className="text-sm" style={{ color: palette.violet }}>
                        {'Activities'}
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-lg"
                      style={{ background: `linear-gradient(135deg, ${palette.lightMagenta}, rgba(255,255,255,0.95))` }}
                    >
                      <div className="text-2xl font-bold" style={{ color: palette.magenta }}>
                        {isResetting ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: palette.magenta }}></div>
                        ) : (
                          Math.round(dailyAnalytics.today.studyTimeMinutes)
                        )}
                      </div>
                      <div className="text-sm" style={{ color: palette.magenta }}>
                        {isResetting ? (
                          'Resetting...'
                        ) : (
                          'Minutes'
                        )}
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-lg"
                      style={{ background: `linear-gradient(135deg, ${palette.lightCoral}, rgba(255,255,255,0.95))` }}
                    >
                      <div className="text-2xl font-bold" style={{ color: palette.coral }}>
                        {dailyAnalytics.today.dailyAccuracy}%
                      </div>
                      <div className="text-sm" style={{ color: palette.coral }}>
                        {'Accuracy'}
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-lg"
                      style={{ background: `linear-gradient(135deg, ${palette.lightViolet}, ${palette.lightCoral})` }}
                    >
                      <div className="text-2xl font-bold" style={{ color: palette.violet }}>
                        {dailyAnalytics.today.sessionCount}
                      </div>
                      <div className="text-sm" style={{ color: palette.violet }}>
                        {'Sessions'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Detailed Daily Stats */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3 text-gray-900">
                        {'Learning Activities'}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {'Questions Attempted'}
                          </span>
                          <span className="font-medium">{dailyAnalytics.today.questionsAttempted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {'Questions Correct'}
                          </span>
                          <span className="font-medium" style={{ color: palette.magenta }}>{dailyAnalytics.today.questionsCorrect}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {'Lessons Completed'}
                          </span>
                          <span className="font-medium">{dailyAnalytics.today.lessonsCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {'Flashcards Reviewed'}
                          </span>
                          <span className="font-medium">{dailyAnalytics.today.flashcardsReviewed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {'Mock Exams Taken'}
                          </span>
                          <span className="font-medium">{dailyAnalytics.today.mockExamsTaken}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3 text-gray-900">
                        {'Platform Usage'}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {'AI Tutor Interactions'}
                          </span>
                          <span className="font-medium">{dailyAnalytics.today.aiTutorInteractions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {'Topic Selections'}
                          </span>
                          <span className="font-medium">{dailyAnalytics.today.topicSelections}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {'Productivity Score'}
                          </span>
                          <span className="font-medium">{dailyAnalytics.today.productivityScore}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage('analytics')}
                      className="flex-1"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      {'View Full Analytics'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage('practice')}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {'Start Practice'}
                    </Button>
                  </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {'No Daily Data Yet'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {true 
                        ? 'Start learning to see your daily progress here.'
                        : 'ابدأ التعلم لرؤية تقدمك اليومي هنا.'
                      }
                    </p>
                    <Button
                      onClick={() => setCurrentPage('practice')}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {'Start Learning'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resume Practice - Recent Learning Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="text-base">Recent Learning Activity</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCurrentPage('analytics')}
                  >
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(recentActivities && recentActivities.length > 0) ? (
                  <div className="space-y-2">
                    {recentActivities.slice(0, 10).map((activity, index) => {
                      // Determine icon and color based on page/activity type
                      const getIcon = () => {
                        if (activity.pageKey === 'ai-tutor' || activity.activityType === 'ai-tutor' || activity.activityType === 'lesson') {
                          return <MessageCircle className="h-4 w-4" style={{ color: palette.violet }} />;
                        } else if (activity.pageKey === 'practice' || activity.activityType === 'practice' || activity.activityType === 'question') {
                          return <BookOpen className="h-4 w-4" style={{ color: palette.magenta }} />;
                        } else if (activity.pageKey === 'flashcards' || activity.activityType === 'flashcard') {
                          return <Brain className="h-4 w-4" style={{ color: palette.coral }} />;
                        } else if (activity.pageKey === 'visual-learning' || activity.activityType === 'video_lesson') {
                          return <Video className="h-4 w-4" style={{ color: palette.violet }} />;
                        } else if (activity.pageKey === 'mock-exam-p1' || activity.pageKey === 'mock-exam-p2' || activity.activityType === 'mock_exam') {
                          return <Trophy className="h-4 w-4" style={{ color: palette.magenta }} />;
                        } else {
                          return <Play className="h-4 w-4 text-gray-600" />;
                        }
                      };

                      const getBgColor = () => {
                        if (activity.pageKey === 'ai-tutor' || activity.activityType === 'ai-tutor') return 'bg-[#9B4DFF]/10';
                        if (activity.pageKey === 'practice' || activity.activityType === 'practice') return 'bg-[#FF4D91]/10';
                        if (activity.pageKey === 'flashcards' || activity.activityType === 'flashcard') return 'bg-[#FF6C6C]/10';
                        if (activity.pageKey === 'visual-learning' || activity.activityType === 'video_lesson') return 'bg-[#9B4DFF]/10';
                        if (activity.pageKey === 'mock-exam-p1' || activity.pageKey === 'mock-exam-p2') return 'bg-[#FF4D91]/10';
                        return 'bg-gray-50';
                      };

                      return (
                        <div 
                          key={activity.id || index} 
                          className={`flex items-center justify-between p-2.5 rounded-lg border border-gray-200 ${getBgColor()} hover:shadow-md transition-all cursor-pointer`}
                          onClick={() => {
                            const route = getPageRoute(activity);
                            setCurrentPage(route as any);
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex-shrink-0">
                              {getIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">
                                {activity.pageName || getPageNameFromActivityType(activity.activityType)}
                              </p>
                              {activity.type === 'page_visit' ? (
                                <p className="text-[10px] text-gray-600">
                                  You studied on this page
                                </p>
                              ) : (
                                <p className="text-[10px] text-gray-600 truncate">
                                  {activity.description || `${activity.subject} - ${activity.topic}`}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-gray-500">
                                  {formatTimeAgo(activity.timestampRaw || activity.timestamp)}
                                </span>
                                {activity.score > 0 && (
                                  <Badge 
                                    className={`text-[10px] px-1.5 py-0 ${
                                      activity.score >= 80 ? 'bg-green-100 text-green-800' : 
                                      activity.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {activity.score}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const route = getPageRoute(activity);
                              setCurrentPage(route as any);
                            }}
                            className="flex-shrink-0 hover:brightness-110 h-6 w-6 p-0"
                            style={{ color: palette.violet }}
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                      </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <BookOpen className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                    <p className="text-xs font-medium mb-1">No recent activity yet</p>
                    <p className="text-[10px]">Start studying to see your recent pages here</p>
                          <Button
                      onClick={() => setCurrentPage('topic-selection')}
                            size="sm"
                      className="mt-3 text-xs text-white hover:brightness-110"
                      style={{ background: 'linear-gradient(90deg, #9B4DFF, #FF4D91)' }}
                          >
                      Start Studying
                          </Button>
                        </div>
                )}
              </CardContent>
            </Card>

            {/* Legacy Section - Only show if userAnalytics available but no recentActivities */}
            {!loadingAnalytics && (!recentActivities || recentActivities.length === 0) && userAnalytics.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-gray-600" />
                    Topic-Based Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userAnalytics.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Top Performing Topic */}
                    {(() => {
                      const topTopic = getTopPerformingTopics(1)[0];
                      if (!topTopic) return null;
                      
                      return (
                        <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                             onClick={() => setCurrentPage('practice')}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {topTopic.topicName} Practice
                            </span>
                            <Badge variant="outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
                              {topTopic.accuracy}%
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div className="h-2 rounded-full transition-all duration-300" 
                                 style={{ 
                                   width: `${topTopic.completionPercentage}%`,
                                   background: 'linear-gradient(90deg, var(--teal-medium), var(--success))'
                                 }}></div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {topTopic.questionsAttempted} questions completed • {formatDuration(topTopic.timeSpent)}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); setCurrentPage('ai-tutor-topic-selection'); }}
                            style={{ borderColor: 'rgba(155,77,255,0.4)', color: palette.violet }}
                            className="hover:brightness-110"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {'Get Help'}
                          </Button>
                        </div>
                      );
                    })()}

                    {/* Topic Needing Review */}
                    {(() => {
                      const reviewTopic = getTopicsNeedingReview(1)[0];
                      if (!reviewTopic) return null;
                      
                      return (
                        <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                             onClick={() => setCurrentPage('practice')}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {reviewTopic.topicName} Review
                            </span>
                            <Badge variant="outline" className="border-imtehaan-warning text-imtehaan-warning">
                              {reviewTopic.accuracy}%
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div className="bg-imtehaan-gradient-secondary h-2 rounded-full transition-all duration-300" 
                                 style={{ width: `${reviewTopic.completionPercentage}%` }}></div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {reviewTopic.questionsAttempted} questions • {formatDuration(reviewTopic.timeSpent)}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); setCurrentPage('ai-tutor-topic-selection'); }}
                            style={{ borderColor: 'rgba(155,77,255,0.4)', color: palette.violet }}
                            className="hover:brightness-110"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {'Get Help'}
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Daily Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  {true ? 'Today\'s Summary' : 'ملخص اليوم'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {dailyAnalytics ? (
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {dailyAnalytics.today.totalActivities}
                      </div>
                      <div className="text-sm text-green-700">
                        {'Activities Today'}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {'Study Time'}
                        </span>
                        <span className="font-medium">
                          {Math.round(dailyAnalytics.today.studyTimeMinutes)}m
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {'Accuracy'}
                        </span>
                        <span className="font-medium">
                          {dailyAnalytics.today.dailyAccuracy}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {'Sessions'}
                        </span>
                        <span className="font-medium">
                          {dailyAnalytics.today.sessionCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>


            {/* Study Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Flame className="h-5 w-5 text-imtehaan-error mr-2" />
                      <span className="font-medium">{t.studyStreak}</span>
                    </div>
                    <span className="text-2xl font-bold text-imtehaan-error">
                      {loadingAnalytics ? '...' : studyStreaks.currentStreak}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {loadingAnalytics 
                      ? 'Loading...' 
                      : t.consecutiveDays.replace('{count}', studyStreaks.currentStreak.toString())
                    }
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{t.weeklyGoal}</span>
                      <span className="text-sm text-gray-600">
                        {loadingAnalytics ? '...' : formatDuration(calculateTotalTimeSpent())}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${loadingAnalytics ? 0 : Math.min(calculateOverallProgress(), 100)}%`,
                          background: 'linear-gradient(90deg, var(--emerald), var(--success))'
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {loadingAnalytics 
                        ? 'Loading...' 
                        : `${calculateOverallProgress()}% overall progress`
                      }
                    </div>
                  </div>

                  {/* Additional Real-time Metrics */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Average Accuracy</span>
                      <span className="text-sm text-gray-600">
                        {loadingAnalytics ? '...' : `${calculateAverageAccuracy()}%`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${loadingAnalytics ? 0 : calculateAverageAccuracy()}%`,
                          background: calculateAverageAccuracy() >= 80 
                            ? 'linear-gradient(90deg, var(--emerald), var(--success))'
                            : calculateAverageAccuracy() >= 60
                            ? 'linear-gradient(90deg, var(--teal-medium), var(--emerald))'
                            : 'linear-gradient(90deg, var(--teal-light), var(--teal-medium))'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-imtehaan-accent" />
                  Learning Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Preferred Study Time</span>
                    <span className="font-medium">
                      {loadingAnalytics ? '...' : learningPatterns.preferredStudyTime}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Session Length</span>
                    <span className="font-medium">
                      {loadingAnalytics ? '...' : formatDuration(learningPatterns.averageSessionLength)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Topics per Session</span>
                    <span className="font-medium">
                      {loadingAnalytics ? '...' : learningPatterns.topicsPerSession}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Retention Rate</span>
                    <span className="font-medium">
                      {loadingAnalytics ? '...' : `${learningPatterns.retentionRate}%`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick AI Access */}
            <Card style={{ background: 'linear-gradient(135deg, var(--ai-blue-light), var(--ai-blue-accent))', borderColor: 'var(--ai-blue)' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" 
                     style={{ backgroundColor: 'var(--ai-blue)' }}>
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{'Need Help?'}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {true 
                    ? 'Ask our AI tutor anything about your studies'
                    : 'اسأل مدرسنا الذكي أي شيء عن دراستك'
                  }
                </p>
                <Button 
                  onClick={() => setCurrentPage('ai-tutor-topic-selection')}
                  className="w-full text-white"
                  style={{ backgroundColor: 'var(--ai-blue)', borderColor: 'var(--ai-blue)' }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {t.askAI}
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-imtehaan-warning" />
                  {t.achievements}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <achievement.icon className="h-5 w-5 text-imtehaan-primary mr-3" />
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium text-sm">{achievement.title}</span>
                            {achievement.isNew && (
                              <Badge className="ml-2 text-xs bg-imtehaan-primary text-white">{t.newBadge}</Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg text-gray-600 mb-2">
                      {'No Achievements Yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {true 
                        ? 'Start learning to earn your first achievements.'
                        : 'ابدأ التعلم لكسب إنجازاتك الأولى.'
                      }
                    </p>
                    <Button
                      onClick={() => setCurrentPage('practice')}
                      className="bg-imtehaan-primary hover:bg-imtehaan-primary-dark text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

                  </div>
                          </div>
                        </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-3 py-2">
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
            <div className="mt-6">
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
            <div className="mt-6">
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
            <div className="mt-6">
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