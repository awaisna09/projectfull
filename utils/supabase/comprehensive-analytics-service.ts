import { supabase } from './client';
import { analyticsBufferService } from './analytics-buffer-service';

export interface DailyProgressData {
  date: string;
  totalActivities: number;
  totalTimeSpent: number;
  questionsAttempted: number;
  questionsCorrect: number;
  dailyAccuracy: number;
  studyStreak: number;
  productivityScore: number;
  studyTimeMinutes: number;
  sessionCount: number;
  avgSessionMinutes: number;
  lessonsCompleted: number;
  videoLessonsCompleted: number;
  flashcardsReviewed: number;
  mockExamsTaken: number;
  aiTutorInteractions: number;
  dashboardVisits: number;
  topicSelections: number;
}

export interface WeeklyProgressData {
  weekStart: string;
  weekEnd: string;
  totalActivities: number;
  totalTimeSpent: number;
  averageDailyAccuracy: number;
  studyStreak: number;
  mostProductiveDay: string;
  topicsStudied: string[];
  weakAreas: string[];
  strongAreas: string[];
  recommendations: string[];
}

export interface MonthlyProgressData {
  month: string;
  totalActivities: number;
  totalTimeSpent: number;
  averageDailyAccuracy: number;
  longestStreak: number;
  totalTopicsStudied: number;
  improvementRate: number;
  studyPatterns: {
    preferredStudyTime: string;
    averageSessionLength: number;
    peakStudyDays: string[];
  };
  timeOfDayAnalysis?: {
    morningMinutes: number;
    afternoonMinutes: number;
    eveningMinutes: number;
    nightMinutes: number;
    mostProductiveTime: string;
  };
  examReadiness?: {
    percentReady: number;
    daysNeeded: number;
    recommendedDailyTime: number;
    onTrack: boolean;
  };
}

export interface RealTimeAnalytics {
  today: DailyProgressData;
  thisWeek: WeeklyProgressData;
  thisMonth: MonthlyProgressData;
  currentStreak: number;
  nextMilestone: string;
  focusAreas: string[];
  achievements: string[];
}

export class ComprehensiveAnalyticsService {
  private static instance: ComprehensiveAnalyticsService;
  private analyticsCache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds for real-time feel

  private constructor() {}

  public static getInstance(): ComprehensiveAnalyticsService {
    if (!ComprehensiveAnalyticsService.instance) {
      ComprehensiveAnalyticsService.instance = new ComprehensiveAnalyticsService();
    }
    return ComprehensiveAnalyticsService.instance;
  }

  /**
   * Get comprehensive real-time analytics for a user
   * Time data comes only from daily_analytics which is fed by the timer system.
   */
  async getRealTimeAnalytics(userId: string): Promise<RealTimeAnalytics> {
    try {
      const cacheKey = `realtime_${userId}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const [today, thisWeek, thisMonth] = await Promise.all([
        this.getTodayProgress(userId),
        this.getWeeklyProgress(userId),
        this.getMonthlyProgress(userId)
      ]);

      const currentStreak = await this.getCurrentStreak(userId);
      const nextMilestone = this.calculateNextMilestone(today);
      const focusAreas = await this.getFocusAreas(userId);
      const achievements = await this.getRecentAchievements(userId);

      const analytics: RealTimeAnalytics = {
        today,
        thisWeek,
        thisMonth,
        currentStreak,
        nextMilestone,
        focusAreas,
        achievements
      };

      this.cacheData(cacheKey, analytics);
      return analytics;
    } catch (error) {
      console.error('❌ Error getting real-time analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate real accuracy from mock exams, practice, and flashcards
   */
  private async calculateRealAccuracy(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    questionsAttempted: number;
    questionsCorrect: number;
    accuracy: number;
  }> {
    let totalAttempted = 0;
    let totalCorrect = 0;

    try {
      // 1. Get mock exam results
      const { data: mockExams } = await supabase
        .from('mock_exam_attempts')
        .select('score, total_marks')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (mockExams) {
        mockExams.forEach(exam => {
          if (exam.total_marks > 0) {
            totalAttempted += exam.total_marks;
            totalCorrect += exam.score || 0;
          }
        });
      }

      // 2. Get practice results from learning_activities
      const { data: practiceResults } = await supabase
        .from('learning_activities')
        .select('accuracy, questions_attempted')
        .eq('user_id', userId)
        .eq('activity_type', 'practice')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (practiceResults) {
        practiceResults.forEach(result => {
          const attempted = result.questions_attempted || 0;
          const accuracy = result.accuracy || 0;
          totalAttempted += attempted;
          totalCorrect += Math.round((attempted * accuracy) / 100);
        });
      }

      // 3. Get flashcard results
      const { data: flashcardResults } = await supabase
        .from('learning_activities')
        .select('accuracy, questions_attempted')
        .eq('user_id', userId)
        .eq('activity_type', 'flashcard')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (flashcardResults) {
        flashcardResults.forEach(result => {
          const attempted = result.questions_attempted || 0;
          const accuracy = result.accuracy || 0;
          totalAttempted += attempted;
          totalCorrect += Math.round((attempted * accuracy) / 100);
        });
      }

      const overallAccuracy =
        totalAttempted > 0
          ? Math.round((totalCorrect / totalAttempted) * 100)
          : 0;

      console.log(
        `📊 Real Accuracy: ${totalCorrect}/${totalAttempted} = ${overallAccuracy}%`
      );

      return {
        questionsAttempted: totalAttempted,
        questionsCorrect: totalCorrect,
        accuracy: overallAccuracy
      };
    } catch (error) {
      console.error('❌ Error calculating real accuracy:', error);
      return {
        questionsAttempted: 0,
        questionsCorrect: 0,
        accuracy: 0
      };
    }
  }

  /**
   * Get today's progress data
   * Time is taken from daily_analytics.total_time_spent which is fed by the timer system.
   */
  async getTodayProgress(userId: string): Promise<DailyProgressData> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayStart = new Date(today + 'T00:00:00Z').toISOString();
      const todayEnd = new Date(today + 'T23:59:59Z').toISOString();

      // Get from daily_analytics table
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      // Calculate real accuracy from actual performance
      const accuracyData = await this.calculateRealAccuracy(
        userId,
        todayStart,
        todayEnd
      );

      if (dailyData && !dailyError) {
        console.log('📊 Using daily analytics data for today:', dailyData);
        console.log(
          '📊 Raw database data - total_time_spent:',
          dailyData.total_time_spent
        );
        console.log(
          '📊 Calculated study_time_minutes:',
          Math.round((dailyData.total_time_spent || 0) / 60)
        );
        const mappedData = this.mapDailyAnalyticsToProgress(dailyData);

        // Override with real accuracy data
        mappedData.questionsAttempted = accuracyData.questionsAttempted;
        mappedData.questionsCorrect = accuracyData.questionsCorrect;
        mappedData.dailyAccuracy = accuracyData.accuracy;

        console.log(
          '📊 Mapped data with real accuracy - dailyAccuracy:',
          mappedData.dailyAccuracy
        );
        return mappedData;
      }

      // If no data in daily_analytics table, return empty progress with real accuracy
      console.log(
        '📊 No daily analytics data found, returning empty progress with real accuracy'
      );
      const emptyProgress = this.getEmptyDailyProgress(today);
      emptyProgress.questionsAttempted = accuracyData.questionsAttempted;
      emptyProgress.questionsCorrect = accuracyData.questionsCorrect;
      emptyProgress.dailyAccuracy = accuracyData.accuracy;
      return emptyProgress;
    } catch (error) {
      console.error('❌ Error getting today progress:', error);
      return this.getEmptyDailyProgress(
        new Date().toISOString().split('T')[0]
      );
    }
  }

  /**
   * Get weekly progress data
   * Uses only daily_analytics (which comes from timer system). No fallback systems.
   */
  async getWeeklyProgress(userId: string): Promise<WeeklyProgressData> {
    try {
      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - 7 * 24 * 60 * 60 * 1000
      );

      const { data: weeklyData, error } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      if (weeklyData && weeklyData.length > 0) {
        return this.calculateWeeklyProgressWithAccuracy(userId, weeklyData);
      }

      // No data means empty weekly progress, no guesses from other trackers
      return this.getEmptyWeeklyProgress();
    } catch (error) {
      console.error('❌ Error getting weekly progress:', error);
      return this.getEmptyWeeklyProgress();
    }
  }

  private calculateWeeklyProgress(data: any[]): WeeklyProgressData {
    // Deprecated in favor of calculateWeeklyProgressWithAccuracy
    return this.getEmptyWeeklyProgress();
  }

  /**
   * Calculate weekly progress with real accuracy from mock exams, practice, and flashcards
   */
  private async calculateWeeklyProgressWithAccuracy(
    userId: string,
    weeklyData: any[]
  ): Promise<WeeklyProgressData> {
    try {
      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - 7 * 24 * 60 * 60 * 1000
      );
      const weekStart = startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const weekEnd = endDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      // Calculate real accuracy for the week
      const accuracyData = await this.calculateRealAccuracy(
        userId,
        startDate.toISOString(),
        endDate.toISOString()
      );

      // Aggregate weekly data
      const totalActivities = weeklyData.reduce(
        (sum, day) => sum + (day.total_activities || 0),
        0
      );
      const totalTimeSpent = weeklyData.reduce(
        (sum, day) => sum + (day.total_time_spent || 0),
        0
      );
      const studyStreak =
        weeklyData[weeklyData.length - 1]?.study_streak || 0;

      // Find most productive day
      let mostProductiveDay = 'No data';
      if (weeklyData.length > 0) {
        const mostProductiveData = weeklyData.reduce((max, day) =>
          (day.total_time_spent || 0) > (max.total_time_spent || 0)
            ? day
            : max
        );
        mostProductiveDay = new Date(
          mostProductiveData.date
        ).toLocaleDateString('en-US', { weekday: 'long' });
      }

      return {
        weekStart,
        weekEnd,
        totalActivities,
        totalTimeSpent,
        averageDailyAccuracy: accuracyData.accuracy,
        studyStreak,
        mostProductiveDay,
        topicsStudied: [],
        weakAreas: [],
        strongAreas: [],
        recommendations: []
      };
    } catch (error) {
      console.error(
        '❌ Error calculating weekly progress with accuracy:',
        error
      );
      return this.getEmptyWeeklyProgress();
    }
  }

  /**
   * Calculate monthly progress with real accuracy from mock exams, practice, and flashcards
   */
  private async calculateMonthlyProgressWithAccuracy(
    userId: string,
    monthlyData: any[]
  ): Promise<MonthlyProgressData> {
    try {
      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - 30 * 24 * 60 * 60 * 1000
      );
      const month = endDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });

      // Calculate real accuracy for the month
      const accuracyData = await this.calculateRealAccuracy(
        userId,
        startDate.toISOString(),
        endDate.toISOString()
      );

      // Aggregate monthly data
      const totalActivities = monthlyData.reduce(
        (sum, day) => sum + (day.total_activities || 0),
        0
      );
      const totalTimeSpent = monthlyData.reduce(
        (sum, day) => sum + (day.total_time_spent || 0),
        0
      );
      const longestStreak = Math.max(
        ...monthlyData.map(day => day.study_streak || 0),
        0
      );

      // Study patterns
      const totalMinutes = Math.round(totalTimeSpent / 60);
      const daysWithData = monthlyData.filter(
        day => (day.total_time_spent || 0) > 0
      ).length;
      const averageSessionLength =
        daysWithData > 0
          ? Math.round(totalMinutes / daysWithData)
          : 0;

      // Peak study days
      const sortedDays = [...monthlyData]
        .filter(day => (day.total_time_spent || 0) > 0)
        .sort(
          (a, b) =>
            (b.total_time_spent || 0) - (a.total_time_spent || 0)
        )
        .slice(0, 3);
      const peakStudyDays = sortedDays.map(day =>
        new Date(day.date).toLocaleDateString('en-US', {
          weekday: 'long'
        })
      );

      // Exam readiness (simple heuristic)
      const percentReady = Math.min(
        Math.round((accuracyData.accuracy + totalMinutes / 18) / 2),
        100
      );
      const daysNeeded = Math.max(
        20 - Math.floor(totalMinutes / 90),
        0
      );
      const onTrack = percentReady >= 70;

      return {
        month,
        totalActivities,
        totalTimeSpent,
        averageDailyAccuracy: accuracyData.accuracy,
        longestStreak,
        totalTopicsStudied: 0,
        improvementRate: 0,
        studyPatterns: {
          preferredStudyTime: 'Morning',
          averageSessionLength,
          peakStudyDays
        },
        timeOfDayAnalysis: {
          morningMinutes: 0,
          afternoonMinutes: 0,
          eveningMinutes: 0,
          nightMinutes: 0,
          mostProductiveTime: 'Morning (6am-12pm)'
        },
        examReadiness: {
          percentReady,
          daysNeeded,
          recommendedDailyTime: 90,
          onTrack
        }
      };
    } catch (error) {
      console.error(
        '❌ Error calculating monthly progress with accuracy:',
        error
      );
      return this.getEmptyMonthlyProgress();
    }
  }

  /**
   * Get monthly progress data
   * Uses only daily_analytics (from timer system). No fallback systems.
   */
  async getMonthlyProgress(userId: string): Promise<MonthlyProgressData> {
    try {
      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - 30 * 24 * 60 * 60 * 1000
      );

      const { data: monthlyData, error } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      if (monthlyData && monthlyData.length > 0) {
        return this.calculateMonthlyProgressWithAccuracy(
          userId,
          monthlyData
        );
      }

      // No data means empty monthly progress, no guesses
      return this.getEmptyMonthlyProgress();
    } catch (error) {
      console.error('❌ Error getting monthly progress:', error);
      return this.getEmptyMonthlyProgress();
    }
  }

  /**
   * Get current study streak
   * Uses only data from database. No fallback trackers.
   */
  async getCurrentStreak(userId: string): Promise<number> {
    try {
      const { data: streakData, error } = await supabase
        .rpc('get_user_daily_progress', { user_uuid: userId })
        .limit(30);

      if (error) throw error;

      if (streakData && streakData.length > 0) {
        return this.calculateCurrentStreak(streakData);
      }

      // No data means no streak
      return 0;
    } catch (error) {
      console.error('❌ Error getting current streak:', error);
      return 0;
    }
  }

  /**
   * Get focus areas for improvement
   */
  async getFocusAreas(userId: string): Promise<string[]> {
    try {
      const { data: weakAreas, error } = await supabase
        .from('daily_analytics')
        .select('weak_areas')
        .eq('user_id', userId)
        .gte(
          'date',
          new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString().split('T')[0]
        )
        .order('date', { ascending: false })
        .limit(7);

      if (error) throw error;

      if (weakAreas && weakAreas.length > 0) {
        const allWeakAreas = weakAreas.flatMap(
          day => day.weak_areas || []
        );
        return [...new Set(allWeakAreas)].slice(0, 5);
      }

      return ['Start studying to identify weak areas'];
    } catch (error) {
      console.error('❌ Error getting focus areas:', error);
      return ['Start studying to identify weak areas'];
    }
  }

  /**
   * Get recent achievements (enhanced with real performance data)
   */
  async getRecentAchievements(userId: string): Promise<string[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayStart = new Date(today + 'T00:00:00Z').toISOString();
      const todayEnd = new Date(today + 'T23:59:59Z').toISOString();

      const { data: todayData, error } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      // Get real accuracy data
      const accuracyData = await this.calculateRealAccuracy(
        userId,
        todayStart,
        todayEnd
      );

      if (error || !todayData)
        return ['🎯 Complete your first activity to earn achievements'];

      const achievements: string[] = [];

      // Study Time Achievements
      const studyMinutes = Math.round(
        (todayData.total_time_spent || 0) / 60
      );
      if (studyMinutes >= 120) {
        achievements.push(
          '🏆 Ultra Studious: 2+ hours of focused study today!'
        );
      } else if (studyMinutes >= 90) {
        achievements.push(
          '⭐ Power Learner: 90+ minutes of study today!'
        );
      } else if (studyMinutes >= 60) {
        achievements.push(
          '✅ Daily Goal: Completed your 60-minute target!'
        );
      } else if (studyMinutes >= 30) {
        achievements.push(
          '📚 Half Way There: 30+ minutes completed!'
        );
      }

      // Accuracy Achievements (from real performance)
      if (accuracyData.questionsAttempted >= 5) {
        if (accuracyData.accuracy >= 95) {
          achievements.push(
            '🌟 Perfect Score: 95%+ accuracy achieved!'
          );
        } else if (accuracyData.accuracy >= 90) {
          achievements.push(
            '💎 Excellence: 90%+ accuracy on real tests!'
          );
        } else if (accuracyData.accuracy >= 85) {
          achievements.push(
            '🎯 High Achiever: 85%+ accuracy!'
          );
        } else if (accuracyData.accuracy >= 75) {
          achievements.push(
            '📈 On Track: 75%+ accuracy maintained!'
          );
        }
      }

      // Question Practice Achievements
      if (accuracyData.questionsAttempted >= 50) {
        achievements.push(
          '📝 Question Pro: 50+ questions attempted today!'
        );
      } else if (accuracyData.questionsAttempted >= 25) {
        achievements.push(
          '📝 Practice Warrior: 25+ questions attempted!'
        );
      } else if (accuracyData.questionsAttempted >= 10) {
        achievements.push(
          '📝 Question Master: 10+ questions attempted!'
        );
      }

      // Activity Achievements
      if (todayData.lessons_completed >= 5) {
        achievements.push(
          '🎓 Knowledge Seeker: 5+ lessons completed!'
        );
      } else if (todayData.lessons_completed >= 3) {
        achievements.push(
          '🎓 Lesson Learner: 3+ lessons completed!'
        );
      }

      if (todayData.flashcards_reviewed >= 30) {
        achievements.push(
          '🧠 Memory Master: 30+ flashcards reviewed!'
        );
      } else if (todayData.flashcards_reviewed >= 15) {
        achievements.push(
          '🧠 Flashcard Pro: 15+ flashcards reviewed!'
        );
      }

      if (todayData.mock_exams_taken >= 2) {
        achievements.push(
          '🏅 Exam Ready: 2+ mock exams completed!'
        );
      } else if (todayData.mock_exams_taken >= 1) {
        achievements.push(
          '🏅 Test Taker: Mock exam completed!'
        );
      }

      // Session Achievements
      if (todayData.session_count >= 5) {
        achievements.push(
          '💪 Super Focused: 5+ study sessions today!'
        );
      } else if (todayData.session_count >= 3) {
        achievements.push(
          '💪 Multi-Session: 3+ study sessions!'
        );
      }

      // Streak Achievements
      if (todayData.study_streak >= 30) {
        achievements.push('🔥🔥🔥 Legendary: 30-day study streak!');
      } else if (todayData.study_streak >= 14) {
        achievements.push('🔥🔥 Unstoppable: 2-week study streak!');
      } else if (todayData.study_streak >= 7) {
        achievements.push('🔥 Streak Master: 7-day study streak!');
      } else if (todayData.study_streak >= 3) {
        achievements.push('🔥 Building Momentum: 3-day streak!');
      }

      // Productivity Achievements
      if (todayData.productivity_score >= 90) {
        achievements.push(
          '⚡ Peak Performance: 90+ productivity score!'
        );
      } else if (todayData.productivity_score >= 80) {
        achievements.push(
          '⚡ Productivity Pro: 80+ productivity!'
        );
      }

      // AI Tutor Achievements
      if (todayData.ai_tutor_interactions >= 20) {
        achievements.push(
          '💬 Curious Mind: 20+ AI tutor interactions!'
        );
      } else if (todayData.ai_tutor_interactions >= 10) {
        achievements.push(
          '💬 Active Learner: 10+ AI tutor questions!'
        );
      }

      return achievements.length > 0
        ? achievements
        : ['🎯 Keep studying to earn achievements!'];
    } catch (error) {
      console.error('❌ Error getting achievements:', error);
      return ['🎯 Complete your first activity to earn achievements'];
    }
  }

  /**
   * Track platform activity
   * Does not affect time. Time is handled only by timer system + buffer.
   */
  async trackPlatformActivity(
    userId: string,
    activityType: string,
    topicId: number = 0,
    topicName: string = 'General',
    subjectName: string = 'General',
    metadata: any = {}
  ): Promise<void> {
    try {
      console.log(
        `📊 Platform activity tracked: ${activityType} for user ${userId}`
      );

      // Clear cache to ensure fresh data
      this.clearUserCache(userId);
    } catch (error) {
      console.error('❌ Error tracking platform activity:', error);
    }
  }

  /**
   * Add study time for a user
   * This is the only path that contributes time, via the buffer system -> backend -> daily_analytics.
   */
  async addStudyTime(
    userId: string,
    timeInSeconds: number,
    page: string = 'general'
  ): Promise<void> {
    try {
      if (!userId || timeInSeconds <= 0) {
        console.warn('⚠️ Invalid parameters for addStudyTime');
        return;
      }

      console.log(
        `🕒 Buffering ${timeInSeconds} seconds of study time for user ${userId} on ${page}`
      );

      // Buffer the time tracking first (localStorage) so refresh does not lose time
      analyticsBufferService.bufferTimeTracking(
        userId,
        page,
        timeInSeconds
      );

      console.log(
        `✅ Buffered ${timeInSeconds}s - will sync automatically`
      );

      // Clear cache so next fetch gets fresh data
      this.clearUserCache(userId);
    } catch (error) {
      console.error('❌ Error adding study time:', error);
      throw error;
    }
  }

  /**
   * DEPRECATED: Direct database update
   * This should not be used with the new time tracking system.
   */
  private async addStudyTimeDirectly(
    userId: string,
    timeInSeconds: number
  ): Promise<void> {
    try {
      console.warn(
        '⚠️ addStudyTimeDirectly is deprecated and should not be used with the timer system'
      );
      // Intentionally left in place for admin or one-off fixes if ever needed.
    } catch (error) {
      console.error('❌ Error in legacy addStudyTime:', error);
      throw error;
    }
  }

  /**
   * Calculate productivity score
   */
  private calculateProductivityScore(analytics: any): number {
    let score = 0;

    // Base score from activities
    score += analytics.total_activities * 2;

    // Time efficiency bonus
    if (analytics.total_time_spent > 0) {
      const timeEfficiency =
        analytics.total_activities /
        (analytics.total_time_spent / 60);
      score += timeEfficiency * 10;
    }

    // Accuracy bonus
    if (analytics.questions_attempted > 0) {
      const accuracy =
        (analytics.questions_correct /
          analytics.questions_attempted) *
        100;
      score += accuracy * 0.5;
    }

    // Completion bonus
    score += analytics.lessons_completed * 5;
    score += analytics.ai_tutor_interactions * 2;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Get study insights and recommendations (enhanced with real data)
   */
  async getStudyInsights(
    userId: string
  ): Promise<{
    insights: string[];
    recommendations: string[];
    nextMilestone: string;
  }> {
    try {
      const analytics = await this.getRealTimeAnalytics(userId);
      const insights: string[] = [];
      const recommendations: string[] = [];

      // Study Time Insights
      if (analytics.today.studyTimeMinutes === 0) {
        insights.push('🎯 Start your learning journey today!');
        recommendations.push('Begin with a 15-minute study session');
      } else if (analytics.today.studyTimeMinutes < 30) {
        insights.push(
          `📚 Good start! You've studied for ${analytics.today.studyTimeMinutes} minutes today`
        );
        recommendations.push(
          'Try to reach your 60-minute daily goal'
        );
      } else if (analytics.today.studyTimeMinutes >= 60) {
        insights.push(
          `🏆 Excellent! You've achieved your daily goal (${analytics.today.studyTimeMinutes} minutes)`
        );
        recommendations.push(
          'Consider challenging yourself with mock exams'
        );
      } else {
        insights.push(
          `⏰ ${analytics.today.studyTimeMinutes} minutes completed - ${
            60 - analytics.today.studyTimeMinutes
          } minutes to goal`
        );
        recommendations.push('Keep up the momentum!');
      }

      // Accuracy Insights
      if (analytics.today.questionsAttempted > 0) {
        if (analytics.today.dailyAccuracy < 60) {
          insights.push(
            `⚠️ Accuracy at ${analytics.today.dailyAccuracy}% - needs improvement`
          );
          recommendations.push(
            'Review fundamentals and practice more questions'
          );
          recommendations.push(
            'Focus on understanding concepts, not memorizing'
          );
        } else if (analytics.today.dailyAccuracy < 75) {
          insights.push(
            `📈 Accuracy at ${analytics.today.dailyAccuracy}% - making progress`
          );
          recommendations.push(
            'Keep practicing to reach 85%+ target'
          );
        } else if (analytics.today.dailyAccuracy < 90) {
          insights.push(
            `✅ Good accuracy at ${analytics.today.dailyAccuracy}%`
          );
          recommendations.push(
            "You're on track! Try harder practice questions"
          );
        } else {
          insights.push(
            `🌟 Outstanding ${analytics.today.dailyAccuracy}% accuracy!`
          );
          recommendations.push(
            'Challenge yourself with advanced mock exams'
          );
        }
      } else {
        recommendations.push(
          'Answer practice questions to track your accuracy'
        );
      }

      // Session Count Insights
      if (analytics.today.sessionCount === 0) {
        recommendations.push('Start your first study session today');
      } else if (analytics.today.sessionCount === 1) {
        insights.push('📖 1 study session completed today');
        recommendations.push(
          'Try multiple shorter sessions for better retention'
        );
      } else if (analytics.today.sessionCount >= 3) {
        insights.push(
          `💪 Great! ${analytics.today.sessionCount} study sessions today`
        );
        recommendations.push(
          'Spaced repetition is helping you learn better'
        );
      }

      // Streak Insights
      if (analytics.currentStreak === 0) {
        insights.push('🔥 Start building your study streak');
        recommendations.push(
          'Study at least 15 minutes daily to build consistency'
        );
      } else if (analytics.currentStreak < 3) {
        insights.push(
          `🔥 ${analytics.currentStreak}-day streak - keep it going!`
        );
        recommendations.push('Study tomorrow to extend your streak');
      } else if (analytics.currentStreak >= 7) {
        insights.push(
          `🔥🔥🔥 Amazing ${analytics.currentStreak}-day streak!`
        );
        recommendations.push(
          "You're building excellent study habits"
        );
      } else {
        insights.push(
          `🔥 ${analytics.currentStreak}-day streak building`
        );
        recommendations.push('Aim for a 7-day streak milestone');
      }

      // Exam Readiness Insights
      if (analytics.thisMonth.examReadiness) {
        const readiness = analytics.thisMonth.examReadiness;
        if (readiness.percentReady < 50) {
          insights.push(
            `📊 Exam readiness: ${readiness.percentReady}% - increase study time`
          );
          recommendations.push(
            `Study ${readiness.recommendedDailyTime} minutes daily to be ready in ${readiness.daysNeeded} days`
          );
        } else if (readiness.percentReady < 80) {
          insights.push(
            `📊 Exam readiness: ${readiness.percentReady}% - good progress`
          );
          recommendations.push(
            `${readiness.daysNeeded} more days of focused study needed`
          );
        } else {
          insights.push(
            `✅ Exam ready at ${readiness.percentReady}%!`
          );
          recommendations.push(
            'Focus on revision and mock exam practice'
          );
        }
      }

      return {
        insights: insights.slice(0, 5),
        recommendations: recommendations.slice(0, 5),
        nextMilestone: analytics.nextMilestone
      };
    } catch (error) {
      console.error('❌ Error getting study insights:', error);
      return {
        insights: ['Start studying to get personalized insights'],
        recommendations: ['Complete your first activity'],
        nextMilestone: 'First activity completion'
      };
    }
  }

  // Helper methods
  private mapDailyAnalyticsToProgress(data: any): DailyProgressData {
    console.log('🔄 Mapping daily analytics data:', data);

    // Study time in minutes from total_time_spent (seconds)
    const studyTimeMinutes = Math.round(
      (data.total_time_spent || 0) / 60
    );

    // Accuracy
    const questionsAttempted = data.questions_attempted || 0;
    const questionsCorrect = data.questions_correct || 0;
    const dailyAccuracy =
      questionsAttempted > 0
        ? Math.round((questionsCorrect / questionsAttempted) * 100)
        : 0;

    console.log('📊 Calculated studyTimeMinutes:', studyTimeMinutes);
    console.log(
      '📊 Calculated accuracy:',
      `${questionsCorrect}/${questionsAttempted} = ${dailyAccuracy}%`
    );

    return {
      date: data.date,
      totalActivities: data.total_activities || 0,
      totalTimeSpent: data.total_time_spent || 0,
      questionsAttempted: data.questions_attempted || 0,
      questionsCorrect: data.questions_correct || 0,
      dailyAccuracy: dailyAccuracy,
      studyStreak: data.study_streak || 0,
      productivityScore: data.productivity_score || 0,
      studyTimeMinutes: studyTimeMinutes,
      sessionCount: data.session_count || 0,
      avgSessionMinutes: data.average_session_length
        ? Math.round(data.average_session_length / 60)
        : 0,
      lessonsCompleted: data.lessons_completed || 0,
      videoLessonsCompleted: data.video_lessons_completed || 0,
      flashcardsReviewed: data.flashcards_reviewed || 0,
      mockExamsTaken: data.mock_exams_taken || 0,
      aiTutorInteractions: data.ai_tutor_interactions || 0,
      dashboardVisits: data.dashboard_visits || 0,
      topicSelections: data.topic_selections || 0
    };
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } catch {
      return dateString;
    }
  }

  private calculateCurrentStreak(data: any[]): number {
    if (!data || data.length === 0) return 0;

    // Sort by date descending
    const sortedData = data.sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < sortedData.length; i++) {
      const currentDate = new Date(sortedData[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (
        currentDate.toISOString().split('T')[0] ===
        expectedDate.toISOString().split('T')[0]
      ) {
        if (sortedData[i].total_activities > 0) {
          streak++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateNextMilestone(today: DailyProgressData): string {
    // Study time milestones
    if (today.studyTimeMinutes === 0)
      return '⏰ Start studying today - aim for 15 minutes';
    if (today.studyTimeMinutes < 15)
      return '⏰ Reach 15 minutes of study time today';
    if (today.studyTimeMinutes < 30)
      return '⏰ Study for 30 minutes today';
    if (today.studyTimeMinutes < 60)
      return '⏰ Complete your 60-minute daily goal';

    // Accuracy milestones
    if (today.questionsAttempted > 0 && today.dailyAccuracy < 70) {
      return '🎯 Improve accuracy to 70% through practice';
    }
    if (today.questionsAttempted > 0 && today.dailyAccuracy < 85) {
      return '🎯 Reach 85% accuracy in practice questions';
    }
    if (today.questionsAttempted > 0 && today.dailyAccuracy < 95) {
      return '🎯 Achieve 95% accuracy - excellence target';
    }

    // Activity milestones
    if (today.totalActivities < 5)
      return '📚 Complete 5 activities today';
    if (today.totalActivities < 10)
      return '📚 Complete 10 activities for the day';
    if (today.mockExamsTaken === 0)
      return '📝 Take your first mock exam';

    // Streak milestones
    if (today.studyStreak < 3)
      return '🔥 Build a 3-day study streak';
    if (today.studyStreak < 7)
      return '🔥 Achieve a 7-day study streak';
    if (today.studyStreak < 14)
      return '🔥 Reach a 2-week study streak';
    if (today.studyStreak < 30)
      return '🔥 Build a 30-day mastery streak';

    // Excellence milestones
    if (today.studyTimeMinutes < 120)
      return '⭐ Study for 2 hours today - go extra!';

    return '🌟 Maintain your excellent progress and consistency';
  }

  private getEmptyDailyProgress(date: string): DailyProgressData {
    return {
      date,
      totalActivities: 0,
      totalTimeSpent: 0,
      questionsAttempted: 0,
      questionsCorrect: 0,
      dailyAccuracy: 0,
      studyStreak: 0,
      productivityScore: 0,
      studyTimeMinutes: 0,
      sessionCount: 0,
      avgSessionMinutes: 0,
      lessonsCompleted: 0,
      videoLessonsCompleted: 0,
      flashcardsReviewed: 0,
      mockExamsTaken: 0,
      aiTutorInteractions: 0,
      dashboardVisits: 0,
      topicSelections: 0
    };
  }

  private getEmptyWeeklyProgress(): WeeklyProgressData {
    return {
      weekStart: '',
      weekEnd: '',
      totalActivities: 0,
      totalTimeSpent: 0,
      averageDailyAccuracy: 0,
      studyStreak: 0,
      mostProductiveDay: '',
      topicsStudied: [],
      weakAreas: [],
      strongAreas: [],
      recommendations: []
    };
  }

  private getEmptyMonthlyProgress(): MonthlyProgressData {
    return {
      month: new Date().toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      }),
      totalActivities: 0,
      totalTimeSpent: 0,
      averageDailyAccuracy: 0,
      longestStreak: 0,
      totalTopicsStudied: 0,
      improvementRate: 0,
      studyPatterns: {
        preferredStudyTime: 'Morning',
        averageSessionLength: 0,
        peakStudyDays: []
      },
      timeOfDayAnalysis: {
        morningMinutes: 0,
        afternoonMinutes: 0,
        eveningMinutes: 0,
        nightMinutes: 0,
        mostProductiveTime: 'Morning (6am-12pm)'
      },
      examReadiness: {
        percentReady: 0,
        daysNeeded: 20,
        recommendedDailyTime: 90,
        onTrack: false
      }
    };
  }

  private getCachedData(key: string): any | null {
    const cached = this.analyticsCache.get(key);
    const expiry = this.cacheExpiry.get(key);

    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    return null;
  }

  private cacheData(key: string, data: any): void {
    this.analyticsCache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  public clearUserCache(userId: string): void {
    const keysToDelete = Array.from(this.analyticsCache.keys()).filter(
      key => key.includes(userId)
    );

    keysToDelete.forEach(key => {
      this.analyticsCache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }

  /**
   * Force refresh analytics data without cache
   */
  public async forceRefreshAnalytics(
    userId: string
  ): Promise<RealTimeAnalytics> {
    this.clearUserCache(userId);
    return this.getRealTimeAnalyticsNoCache(userId);
  }

  /**
   * DEPRECATED: Manual reset for admin/testing only
   * Does not replace timer system logic.
   */
  public async manualResetDailyAnalytics(
    userId: string
  ): Promise<void> {
    try {
      console.warn(
        '⚠️ MANUAL RESET: This should only be used for admin/testing purposes'
      );

      if (!userId || userId.trim() === '') {
        throw new Error('Invalid userId');
      }

      const today = new Date().toISOString().split('T')[0];

      // Clear localStorage buffers for this user
      const allBuffers = analyticsBufferService['getAllTimeBuffers']();
      Object.keys(allBuffers).forEach(key => {
        if (key.startsWith(userId)) {
          delete allBuffers[key];
        }
      });
      localStorage.setItem(
        'imtehaan_time_buffer',
        JSON.stringify(allBuffers)
      );
      console.log('✅ Cleared localStorage buffers');

      // Delete database record
      await supabase
        .from('daily_analytics')
        .delete()
        .eq('user_id', userId)
        .eq('date', today);

      // Clear all caches
      this.clearUserCache(userId);

      console.log('✅ Manual reset completed');
    } catch (error) {
      console.error('❌ Error in manual reset:', error);
      throw error;
    }
  }

  /**
   * DEPRECATED: No longer resets, just fetches fresh data
   * Kept for backward compatibility.
   */
  public async resetAndGetFreshAnalytics(
    userId: string
  ): Promise<RealTimeAnalytics> {
    try {
      console.log('🔄 Fetching fresh analytics (no reset)...');

      const freshAnalytics =
        await this.getRealTimeAnalyticsNoCache(userId);

      console.log('✅ Fresh analytics fetched');
      console.log(
        '📊 Fresh analytics study time:',
        freshAnalytics.today.studyTimeMinutes
      );

      return freshAnalytics;
    } catch (error) {
      console.error('❌ Error fetching fresh analytics:', error);
      throw error;
    }
  }

  /**
   * Get real-time analytics with page session data included
   * Page sessions are only for context, not for time totals.
   */
  public async getRealTimeAnalyticsWithSessions(
    userId: string
  ): Promise<RealTimeAnalytics> {
    try {
      // Clear cache first
      this.clearUserCache(userId);

      // Get fresh analytics without caching
      const analytics =
        await this.getRealTimeAnalyticsNoCache(userId);

      // Optional context: recent page_sessions
      const { data: recentSessions } = await supabase
        .from('page_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte(
          'start_time',
          new Date(
            Date.now() - 24 * 60 * 60 * 1000
          ).toISOString()
        )
        .order('start_time', { ascending: false })
        .limit(10);

      if (recentSessions && recentSessions.length > 0) {
        console.log(
          `📊 Found ${recentSessions.length} recent page sessions for user ${userId}`
        );
      }

      return analytics;
    } catch (error) {
      console.error(
        '❌ Error getting real-time analytics with sessions:',
        error
      );
      throw error;
    }
  }

  /**
   * Get real-time analytics without caching (for fresh data)
   */
  private async getRealTimeAnalyticsNoCache(
    userId: string
  ): Promise<RealTimeAnalytics> {
    try {
      console.log(
        '🔄 Getting fresh analytics without cache for user:',
        userId
      );

      const [today, thisWeek, thisMonth] = await Promise.all([
        this.getTodayProgress(userId),
        this.getWeeklyProgress(userId),
        this.getMonthlyProgress(userId)
      ]);

      const currentStreak = await this.getCurrentStreak(userId);
      const nextMilestone = this.calculateNextMilestone(today);
      const focusAreas = await this.getFocusAreas(userId);
      const achievements = await this.getRecentAchievements(userId);

      const analytics: RealTimeAnalytics = {
        today,
        thisWeek,
        thisMonth,
        currentStreak,
        nextMilestone,
        focusAreas,
        achievements
      };

      console.log('📊 Fresh analytics data:', analytics);
      return analytics;
    } catch (error) {
      console.error(
        '❌ Error getting real-time analytics without cache:',
        error
      );
      throw error;
    }
  }
}

// Export singleton instance
export const comprehensiveAnalyticsService =
  ComprehensiveAnalyticsService.getInstance();
