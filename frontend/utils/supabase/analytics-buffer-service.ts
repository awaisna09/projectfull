import { supabase } from './client';
import { withDatabaseRetry } from '../retry-wrapper';
import { TABLE_NAMES, LEARNING_PAGES, PAGE_DISPLAY_NAMES } from '../../constants/database';
import { SYNC_INTERVALS, TRACKING_INTERVALS } from '../../constants/timeouts';

/**
 * Analytics Buffer Service
 * 
 * This service acts as a buffer between the app and Supabase,
 * storing all analytics data in localStorage first, then syncing
 * to Supabase periodically. This ensures:
 * - No data loss on page refresh
 * - Offline capability
 * - Accumulated tracking (new data adds to old)
 * - Reliable data persistence
 */

interface BufferedAnalytic {
  id: string;
  userId: string;
  type: 'time' | 'activity' | 'accuracy' | 'session';
  data: any;
  timestamp: string;
  synced: boolean;
}

interface TimeTrackingBuffer {
  userId: string;
  page: string;
  seconds: number;
  startTime: string;
  lastUpdate: string;
}

class AnalyticsBufferService {
  private static instance: AnalyticsBufferService;
  private readonly BUFFER_KEY = 'imtehaan_analytics_buffer';
  private readonly TIME_BUFFER_KEY = 'imtehaan_time_buffer';
  private readonly SYNC_INTERVAL = SYNC_INTERVALS.NORMAL; // 60 seconds
  private readonly MAX_BUFFER_SIZE = 1000; // Max 1000 buffered events
  private readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB max storage
  private readonly MAX_TIME_BUFFERS = 50; // Max 50 time tracking buffers
  private syncTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.startAutoSync();
    this.syncOnVisibilityChange();
  }

  public static getInstance(): AnalyticsBufferService {
    if (!AnalyticsBufferService.instance) {
      AnalyticsBufferService.instance = new AnalyticsBufferService();
    }
    return AnalyticsBufferService.instance;
  }

  /**
   * Buffer time tracking data
   */
  public bufferTimeTracking(userId: string, page: string, seconds: number): void {
    try {
      // Clear old buffers from previous days
      this.clearOldBuffers();
      
      // Enforce storage limits before adding new data
      this.enforceStorageLimits();
      
      const existingBuffer = this.getTimeBuffer(userId, page);
      const now = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0];

      // Check if existing buffer is from today
      const existingDate = existingBuffer?.startTime?.split('T')[0];
      const isFromToday = existingDate === today;
      
      // Track if this is a new session (no existing buffer from today)
      const isNewSession = !isFromToday;

      const buffer: TimeTrackingBuffer = {
        userId,
        page,
        seconds: isFromToday ? (existingBuffer?.seconds || 0) + seconds : seconds, // Reset if from previous day
        startTime: isFromToday ? (existingBuffer?.startTime || now) : now,
        lastUpdate: now
      };

      const allBuffers = this.getAllTimeBuffers();
      const key = `${userId}_${page}`;
      allBuffers[key] = buffer;

      localStorage.setItem(this.TIME_BUFFER_KEY, JSON.stringify(allBuffers));
      console.log(`📦 Buffered ${seconds}s for ${page}. Total: ${buffer.seconds}s${isNewSession ? ' (NEW SESSION)' : ''}`);
      
      // If this is a new session, increment session count and log page visit
      if (isNewSession) {
        this.incrementSessionCount(userId);
        this.logPageVisit(userId, page, now);
      } else {
        // Update last visited page
        this.updateLastPageVisit(userId, page, now);
      }
    } catch (error) {
      console.error('❌ Error buffering time tracking:', error);
    }
  }

  /**
   * Log page visit for recent activities
   */
  private logPageVisit(userId: string, page: string, timestamp: string): void {
    try {
      const visitsKey = `page_visits_${userId}`;
      const visits = JSON.parse(localStorage.getItem(visitsKey) || '[]');
      
      const visit = {
        page,
        pageName: PAGE_DISPLAY_NAMES[page as keyof typeof PAGE_DISPLAY_NAMES] || page,
        timestamp,
        type: 'page_visit'
      };
      
      // Add to beginning of array (most recent first)
      visits.unshift(visit);
      
      // Keep only last 20 visits
      const trimmedVisits = visits.slice(0, 20);
      
      localStorage.setItem(visitsKey, JSON.stringify(trimmedVisits));
      console.log(`📝 Logged page visit: ${visit.pageName}`);
    } catch (error) {
      console.error('❌ Error logging page visit:', error);
    }
  }

  /**
   * Update last page visit timestamp
   */
  private updateLastPageVisit(userId: string, page: string, timestamp: string): void {
    try {
      const visitsKey = `page_visits_${userId}`;
      const visits = JSON.parse(localStorage.getItem(visitsKey) || '[]');
      
      // Find and update the most recent visit for this page
      const recentVisit = visits.find((v: any) => v.page === page);
      if (recentVisit) {
        recentVisit.timestamp = timestamp;
        localStorage.setItem(visitsKey, JSON.stringify(visits));
      }
    } catch (error) {
      console.error('❌ Error updating page visit:', error);
    }
  }

  /**
   * Get recent page visits for a user
   */
  public getRecentPageVisits(userId: string, limit: number = 5): any[] {
    try {
      const visitsKey = `page_visits_${userId}`;
      const visits = JSON.parse(localStorage.getItem(visitsKey) || '[]');
      return visits.slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting recent page visits:', error);
      return [];
    }
  }

  /**
   * Increment session count for today
   */
  private incrementSessionCount(userId: string): void {
    try {
      const today = new Date().toISOString().split('T')[0];
      const sessionKey = `session_count_${userId}_${today}`;
      const currentCount = parseInt(localStorage.getItem(sessionKey) || '0');
      const newCount = currentCount + 1;
      
      localStorage.setItem(sessionKey, newCount.toString());
      console.log(`📊 Session count incremented to ${newCount} for ${today}`);
    } catch (error) {
      console.error('❌ Error incrementing session count:', error);
    }
  }

  /**
   * Get today's session count
   */
  public getTodaySessionCount(userId: string): number {
    try {
      const today = new Date().toISOString().split('T')[0];
      const sessionKey = `session_count_${userId}_${today}`;
      return parseInt(localStorage.getItem(sessionKey) || '0');
    } catch (error) {
      return 0;
    }
  }

  /**
   * Clear buffers from previous days
   */
  private clearOldBuffers(): void {
    try {
      const allBuffers = this.getAllTimeBuffers();
      const today = new Date().toISOString().split('T')[0];
      let cleared = false;

      Object.keys(allBuffers).forEach(key => {
        const buffer = allBuffers[key];
        const bufferDate = buffer.startTime?.split('T')[0];
        
        if (bufferDate && bufferDate !== today) {
          delete allBuffers[key];
          cleared = true;
          console.log(`🗑️ Cleared old buffer for ${buffer.page} from ${bufferDate}`);
        }
      });

      if (cleared) {
        localStorage.setItem(this.TIME_BUFFER_KEY, JSON.stringify(allBuffers));
      }
    } catch (error) {
      console.error('❌ Error clearing old buffers:', error);
    }
  }

  /**
   * Buffer any analytics event
   */
  public bufferAnalytic(userId: string, type: string, data: any): void {
    try {
      const buffer = this.getBuffer();
      const analytic: BufferedAnalytic = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: type as any,
        data,
        timestamp: new Date().toISOString(),
        synced: false
      };

      buffer.push(analytic);
      localStorage.setItem(this.BUFFER_KEY, JSON.stringify(buffer));
      console.log(`📦 Buffered ${type} analytics`);
    } catch (error) {
      console.error('❌ Error buffering analytic:', error);
    }
  }

  /**
   * Get time buffer for specific user and page
   */
  private getTimeBuffer(userId: string, page: string): TimeTrackingBuffer | null {
    const allBuffers = this.getAllTimeBuffers();
    const key = `${userId}_${page}`;
    return allBuffers[key] || null;
  }

  /**
   * Get all time buffers
   */
  private getAllTimeBuffers(): { [key: string]: TimeTrackingBuffer } {
    try {
      const stored = localStorage.getItem(this.TIME_BUFFER_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ Error getting time buffers:', error);
      return {};
    }
  }

  /**
   * Get analytics buffer
   */
  private getBuffer(): BufferedAnalytic[] {
    try {
      const stored = localStorage.getItem(this.BUFFER_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error getting buffer:', error);
      return [];
    }
  }

  /**
   * Sync all buffered data to Supabase
   */
  public async syncToSupabase(): Promise<{ success: boolean; synced: number; failed: number }> {
    console.log('🔄 Starting analytics sync to Supabase...');
    
    let syncedCount = 0;
    let failedCount = 0;

    try {
      // 1. Sync time tracking buffers
      const timeBuffers = this.getAllTimeBuffers();
      const timeBufferKeys = Object.keys(timeBuffers);

      for (const key of timeBufferKeys) {
        const buffer = timeBuffers[key];
        if (buffer.seconds > 0) {
          try {
            await this.syncTimeToSupabase(buffer);
            delete timeBuffers[key]; // Remove from buffer after successful sync
            syncedCount++;
            console.log(`✅ Synced ${buffer.seconds}s for ${buffer.page}`);
          } catch (error) {
            console.error(`❌ Failed to sync time for ${buffer.page}:`, error);
            failedCount++;
          }
        }
      }

      // Update time buffers in localStorage
      localStorage.setItem(this.TIME_BUFFER_KEY, JSON.stringify(timeBuffers));

      // 2. Sync other analytics events
      const buffer = this.getBuffer();
      const unsyncedEvents = buffer.filter(event => !event.synced);

      for (const event of unsyncedEvents) {
        try {
          await this.syncEventToSupabase(event);
          event.synced = true;
          syncedCount++;
          console.log(`✅ Synced ${event.type} event`);
        } catch (error) {
          console.error(`❌ Failed to sync ${event.type} event:`, error);
          failedCount++;
        }
      }

      // Remove synced events from buffer
      const remainingBuffer = buffer.filter(event => !event.synced);
      localStorage.setItem(this.BUFFER_KEY, JSON.stringify(remainingBuffer));

      console.log(`✅ Sync complete: ${syncedCount} synced, ${failedCount} failed`);
      return { success: true, synced: syncedCount, failed: failedCount };
    } catch (error) {
      console.error('❌ Error during sync:', error);
      return { success: false, synced: syncedCount, failed: failedCount };
    }
  }

  /**
   * Sync time tracking to Supabase
   */
  private async syncTimeToSupabase(buffer: TimeTrackingBuffer): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Get current analytics for today with retry
    const { data: currentAnalytics, error: fetchError } = await withDatabaseRetry(async () =>
      await supabase
        .from(TABLE_NAMES.DAILY_ANALYTICS)
        .select('*')
        .eq('user_id', buffer.userId)
        .eq('date', today)
        .single()
    ) as any;

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Calculate new values
    const currentTime = currentAnalytics?.total_time_spent || 0;
    const newTotalTime = currentTime + buffer.seconds;
    
    // Get session count from localStorage (properly tracked)
    const sessionCount = this.getTodaySessionCount(buffer.userId) || currentAnalytics?.session_count || 1;
    const avgSessionLength = sessionCount > 0 ? Math.round(newTotalTime / sessionCount) : buffer.seconds;

    console.log(`📊 Syncing: ${buffer.seconds}s | Total: ${newTotalTime}s | Sessions: ${sessionCount} | Avg: ${avgSessionLength}s`);

    // Upsert the data with retry
    const { error: upsertError } = await withDatabaseRetry(() =>
      supabase
        .from(TABLE_NAMES.DAILY_ANALYTICS)
        .upsert({
          user_id: buffer.userId,
          date: today,
          total_time_spent: newTotalTime,
          session_count: sessionCount,
          average_session_length: avgSessionLength,
          total_activities: (currentAnalytics?.total_activities || 0) + 1, // Count buffer sync as activity
        }, {
          onConflict: 'date,user_id'
        })
    );

    if (upsertError) {
      throw upsertError;
    }

    console.log(`✅ Synced to DB: ${newTotalTime}s total (was ${currentTime}s, added ${buffer.seconds}s) | ${sessionCount} sessions`);
  }

  /**
   * Sync individual event to Supabase
   */
  private async syncEventToSupabase(event: BufferedAnalytic): Promise<void> {
    // Handle different event types
    switch (event.type) {
      case 'activity':
        await this.syncActivityEvent(event);
        break;
      case 'accuracy':
        await this.syncAccuracyEvent(event);
        break;
      case 'session':
        await this.syncSessionEvent(event);
        break;
      default:
        console.warn(`Unknown event type: ${event.type}`);
    }
  }

  /**
   * Sync activity event
   */
  private async syncActivityEvent(event: BufferedAnalytic): Promise<void> {
    const { error } = await supabase
      .from('learning_activities')
      .insert({
        user_id: event.userId,
        activity_type: event.data.activityType,
        subject_id: event.data.subjectId,
        topic_id: event.data.topicId,
        time_spent: event.data.timeSpent,
        questions_attempted: event.data.questionsAttempted || 0,
        accuracy: event.data.accuracy || 0,
        timestamp: event.timestamp
      });

    if (error) throw error;
  }

  /**
   * Sync accuracy event
   */
  private async syncAccuracyEvent(event: BufferedAnalytic): Promise<void> {
    // Update daily analytics with accuracy data
    const today = new Date(event.timestamp).toISOString().split('T')[0];
    
    const { data: currentAnalytics } = await supabase
      .from('daily_analytics')
      .select('*')
      .eq('user_id', event.userId)
      .eq('date', today)
      .single();

    const questionsAttempted = (currentAnalytics?.questions_attempted || 0) + event.data.questionsAttempted;
    const questionsCorrect = (currentAnalytics?.questions_correct || 0) + event.data.questionsCorrect;

    const { error } = await supabase
      .from('daily_analytics')
      .upsert({
        user_id: event.userId,
        date: today,
        questions_attempted: questionsAttempted,
        questions_correct: questionsCorrect,
      }, {
        onConflict: 'date,user_id'
      });

    if (error) throw error;
  }

  /**
   * Sync session event
   */
  private async syncSessionEvent(event: BufferedAnalytic): Promise<void> {
    const { error } = await supabase
      .from('page_sessions')
      .insert({
        user_id: event.userId,
        page_title: event.data.pageTitle,
        page_url: event.data.pageUrl,
        session_start: event.data.sessionStart,
        session_end: event.data.sessionEnd,
        time_spent: event.data.timeSpent
      });

    if (error) throw error;
  }

  /**
   * Start automatic sync every 60 seconds
   */
  private startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      this.syncToSupabase();
    }, this.SYNC_INTERVAL);

    console.log('🔄 Auto-sync started (every 60 seconds)');
  }

  /**
   * Sync when page visibility changes (user switches tabs or closes)
   */
  private syncOnVisibilityChange(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          console.log('📤 Page hidden, syncing analytics...');
          this.syncToSupabase();
        }
      });

      // Sync before page unload
      window.addEventListener('beforeunload', () => {
        console.log('📤 Page unloading, syncing analytics...');
        // Use synchronous method for beforeunload
        const timeBuffers = this.getAllTimeBuffers();
        const buffer = this.getBuffer();
        
        if (Object.keys(timeBuffers).length > 0 || buffer.length > 0) {
          // Store flag that sync is needed
          localStorage.setItem('imtehaan_needs_sync', 'true');
        }
      });
    }
  }

  /**
   * Check if there's pending data to sync on page load
   */
  public async syncPendingData(): Promise<void> {
    // First, clear old buffers from previous days
    this.clearOldBuffers();
    
    const needsSync = localStorage.getItem('imtehaan_needs_sync');
    
    if (needsSync === 'true') {
      console.log('🔄 Found pending analytics, syncing...');
      await this.syncToSupabase();
      localStorage.removeItem('imtehaan_needs_sync');
    }
  }

  /**
   * Initialize fresh day - should be called on first app load of the day
   */
  public async initializeFreshDay(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const lastDay = localStorage.getItem(`last_analytics_day_${userId}`);
    
    if (lastDay !== today) {
      console.log('🌅 New day detected, initializing fresh analytics...');
      
      // 1. Sync any remaining buffers from yesterday FIRST
      console.log('📤 Syncing yesterday\'s remaining data...');
      await this.syncToSupabase();
      
      // 2. Calculate study streak based on yesterday's activity
      let newStreak = 0;
      try {
        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];
        
        // Check if user studied yesterday with retry
        const { data: yesterdayData, error: yesterdayError } = await withDatabaseRetry(async () =>
          await supabase
            .from(TABLE_NAMES.DAILY_ANALYTICS)
            .select('total_time_spent, study_streak')
            .eq('user_id', userId)
            .eq('date', yesterdayDate)
            .single()
        ) as any;
        
        if (!yesterdayError && yesterdayData) {
          // If user studied yesterday (spent any time), increment their streak
          if (yesterdayData.total_time_spent > 0) {
            newStreak = (yesterdayData.study_streak || 0) + 1;
            console.log(`🔥 Study streak continues! New streak: ${newStreak} days`);
          } else {
            // User didn't study yesterday, streak breaks
            newStreak = 0;
            console.log('📉 Study streak broken (no study time yesterday)');
          }
        } else {
          // No data for yesterday, check if they have any previous streak with retry
          const { data: latestData, error: latestError } = await withDatabaseRetry(async () =>
            await supabase
              .from(TABLE_NAMES.DAILY_ANALYTICS)
              .select('date, total_time_spent, study_streak')
              .eq('user_id', userId)
              .order('date', { ascending: false })
              .limit(1)
              .single()
          ) as any;
          
          if (!latestError && latestData && latestData.total_time_spent > 0) {
            // Check if the latest data is from yesterday or continuous days
            const latestDate = new Date(latestData.date);
            const daysDiff = Math.floor((new Date(today).getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
              // Continuous streak
              newStreak = (latestData.study_streak || 0) + 1;
              console.log(`🔥 Study streak continues! New streak: ${newStreak} days`);
            } else if (daysDiff > 1) {
              // Gap in studying, streak breaks
              newStreak = 0;
              console.log(`📉 Study streak broken (${daysDiff} days gap)`);
            }
          } else {
            newStreak = 0;
            console.log('🆕 Starting fresh streak');
          }
        }
      } catch (error) {
        console.error('❌ Error calculating study streak:', error);
        newStreak = 0;
      }
      
      // 3. Clear all buffers for this user from previous days
      const allBuffers = this.getAllTimeBuffers();
      Object.keys(allBuffers).forEach(key => {
        if (key.startsWith(userId)) {
          delete allBuffers[key];
        }
      });
      localStorage.setItem(this.TIME_BUFFER_KEY, JSON.stringify(allBuffers));
      console.log('✅ Yesterday\'s buffers cleared');
      
      // 4. Clear yesterday's session count
      const sessionKey = `session_count_${userId}_${lastDay}`;
      localStorage.removeItem(sessionKey);
      console.log('✅ Yesterday\'s session count cleared');
      
      // 5. Initialize fresh database record for today with calculated streak
      try {
        const { error } = await withDatabaseRetry(() =>
          supabase
            .from(TABLE_NAMES.DAILY_ANALYTICS)
            .upsert({
              user_id: userId,
              date: today,
              total_time_spent: 0,
              session_count: 0,
              average_session_length: 0,
              total_activities: 0,
              questions_attempted: 0,
              questions_correct: 0,
              study_streak: newStreak,
              productivity_score: 0,
              lessons_completed: 0,
              video_lessons_completed: 0,
              flashcards_reviewed: 0,
              mock_exams_taken: 0,
              ai_tutor_interactions: 0,
              dashboard_visits: 0,
              topic_selections: 0
            }, {
              onConflict: 'date,user_id',
              ignoreDuplicates: true // Don't overwrite if already exists
            })
        );
        
        if (error) {
          console.log('⚠️ Could not initialize fresh DB record:', error);
        } else {
          console.log(`✅ Fresh database record ready for today (streak: ${newStreak})`);
        }
      } catch (error) {
        console.log('⚠️ Error initializing fresh day in DB:', error);
      }
      
      // 6. Mark today as initialized
      localStorage.setItem(`last_analytics_day_${userId}`, today);
      console.log('✅ Fresh day fully initialized');
    } else {
      console.log('📅 Same day, no initialization needed');
    }
  }

  /**
   * Get buffer status
   */
  public getBufferStatus(): { 
    timeBuffers: number; 
    events: number; 
    totalSeconds: number;
  } {
    const timeBuffers = this.getAllTimeBuffers();
    const buffer = this.getBuffer();
    
    const totalSeconds = Object.values(timeBuffers).reduce(
      (sum, b) => sum + b.seconds, 
      0
    );

    return {
      timeBuffers: Object.keys(timeBuffers).length,
      events: buffer.filter(e => !e.synced).length,
      totalSeconds
    };
  }

  /**
   * Enforce storage limits to prevent unbounded growth
   */
  private enforceStorageLimits(): void {
    try {
      const buffer = this.getBuffer();
      const timeBuffers = this.getAllTimeBuffers();
      
      // Check event buffer size
      if (buffer.length > this.MAX_BUFFER_SIZE) {
        console.warn(`⚠️ Event buffer size (${buffer.length}) exceeded limit (${this.MAX_BUFFER_SIZE}). Forcing sync...`);
        this.syncToSupabase();
        return;
      }
      
      // Check time buffer count
      const timeBufferCount = Object.keys(timeBuffers).length;
      if (timeBufferCount > this.MAX_TIME_BUFFERS) {
        console.warn(`⚠️ Time buffer count (${timeBufferCount}) exceeded limit (${this.MAX_TIME_BUFFERS}). Forcing sync...`);
        this.syncToSupabase();
        return;
      }
      
      // Check total storage size
      try {
        const totalSize = new Blob([
          JSON.stringify(buffer),
          JSON.stringify(timeBuffers)
        ]).size;
        
        if (totalSize > this.MAX_STORAGE_SIZE) {
          console.warn(`⚠️ Storage size (${Math.round(totalSize / 1024)}KB) exceeded limit (${this.MAX_STORAGE_SIZE / 1024}KB). Forcing sync...`);
          this.syncToSupabase();
          return;
        }
      } catch (error) {
        console.error('❌ Error checking storage size:', error);
      }
      
      // If we're approaching limits, log a warning
      if (buffer.length > this.MAX_BUFFER_SIZE * 0.8) {
        console.warn(`⚠️ Event buffer at ${Math.round((buffer.length / this.MAX_BUFFER_SIZE) * 100)}% capacity`);
      }
      
      if (timeBufferCount > this.MAX_TIME_BUFFERS * 0.8) {
        console.warn(`⚠️ Time buffer at ${Math.round((timeBufferCount / this.MAX_TIME_BUFFERS) * 100)}% capacity`);
      }
    } catch (error) {
      console.error('❌ Error enforcing storage limits:', error);
    }
  }

  /**
   * Get storage usage statistics
   */
  public getStorageStats(): {
    bufferCount: number;
    timeBufferCount: number;
    totalSize: number;
    sizeFormatted: string;
    percentUsed: number;
    health: 'good' | 'warning' | 'critical';
  } {
    const buffer = this.getBuffer();
    const timeBuffers = this.getAllTimeBuffers();
    
    let totalSize = 0;
    try {
      totalSize = new Blob([
        JSON.stringify(buffer),
        JSON.stringify(timeBuffers)
      ]).size;
    } catch (error) {
      console.error('Error calculating size:', error);
    }
    
    const percentUsed = (totalSize / this.MAX_STORAGE_SIZE) * 100;
    let health: 'good' | 'warning' | 'critical';
    
    if (percentUsed < 70) {
      health = 'good';
    } else if (percentUsed < 90) {
      health = 'warning';
    } else {
      health = 'critical';
    }
    
    const sizeFormatted = totalSize < 1024 
      ? `${totalSize}B`
      : totalSize < 1024 * 1024
      ? `${Math.round(totalSize / 1024)}KB`
      : `${(totalSize / (1024 * 1024)).toFixed(2)}MB`;
    
    return {
      bufferCount: buffer.length,
      timeBufferCount: Object.keys(timeBuffers).length,
      totalSize,
      sizeFormatted,
      percentUsed: Math.round(percentUsed),
      health
    };
  }

  /**
   * Force immediate sync
   */
  public async forceSync(): Promise<void> {
    console.log('🔄 Force syncing analytics...');
    await this.syncToSupabase();
  }

  /**
   * Clear all buffers (use with caution)
   */
  public clearAllBuffers(): void {
    localStorage.removeItem(this.BUFFER_KEY);
    localStorage.removeItem(this.TIME_BUFFER_KEY);
    localStorage.removeItem('imtehaan_needs_sync');
    console.log('🗑️ All analytics buffers cleared');
  }
}

export const analyticsBufferService = AnalyticsBufferService.getInstance();

