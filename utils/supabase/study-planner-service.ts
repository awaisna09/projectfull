import { supabase } from './client';

/**
 * Study Planner Service
 * Handles adaptive daily study load planning based on mastery, unit difficulty, and target dates
 */

export interface UnitTimeProfile {
  id: string;
  subject_id: number;
  topic_id: number;
  base_minutes_first_pass: number;
  base_minutes_revision: number;
  difficulty_multiplier: number;
  notes?: string;
}

export interface StudyPlanUnit {
  id: string;
  plan_id: number;
  topic_id: number;
  unit_required_minutes: number;
}

export interface StudyPlanDailyLog {
  id: string;
  plan_id: number;
  date: string;
  planned_minutes: number;
  planned_questions_minutes: number;
  planned_lessons_minutes: number;
  planned_flashcards_minutes: number;
  actual_total_minutes: number;
  actual_questions_minutes: number;
  actual_lessons_minutes: number;
  actual_flashcards_minutes: number;
  status: 'pending' | 'partial' | 'done' | 'missed';
}

export interface StudyPlan {
  plan_id: number;
  user_id: string;
  plan_name?: string;
  subject?: string;
  subject_id?: number;
  target_date: string;
  study_days_per_week: number;
  max_daily_minutes?: number;
  total_required_minutes: number;
  total_study_days: number;
  daily_minutes_required: number;
  status: 'active' | 'completed' | 'paused' | 'archived' | 'cancelled' | 'expired';
  exam_date?: string;
  study_date?: string;
  study_time_minutes?: number;
  metadata?: Record<string, any>;
}

export interface CreateStudyPlanInput {
  studentId: string;
  subjectId: number;
  targetDate: string;
  studyDaysPerWeek: number;
  maxDailyMinutes?: number;
  unitIds: number[]; // topic_ids
  planName?: string;
}

export interface MasteryData {
  topic_id: number;
  mastery_score: number; // 0-100
}

/**
 * Calculate mastery factor based on mastery score
 * 0-40 → 1.0 (full time needed)
 * 40-70 → 0.7 (30% reduction)
 * 70-90 → 0.4 (60% reduction)
 * 90-100 → 0.2 (80% reduction)
 */
function calculateMasteryFactor(masteryScore: number): number {
  if (masteryScore < 40) {
    return 1.0;
  } else if (masteryScore < 70) {
    return 0.7;
  } else if (masteryScore < 90) {
    return 0.4;
  } else {
    return 0.2;
  }
}

/**
 * Determine if this is first-time learning based on mastery
 * If mastery is very low (< 30), treat as first time
 */
function isFirstTime(masteryScore: number): boolean {
  return masteryScore < 30;
}

/**
 * Calculate required minutes for a unit
 */
function calculateUnitRequiredMinutes(
  profile: UnitTimeProfile,
  masteryScore: number
): number {
  const masteryFactor = calculateMasteryFactor(masteryScore);
  const isFirst = isFirstTime(masteryScore);
  
  const baseMinutes = isFirst 
    ? profile.base_minutes_first_pass 
    : profile.base_minutes_revision;
  
  return Math.ceil(
    baseMinutes * profile.difficulty_multiplier * masteryFactor
  );
}

/**
 * Calculate total study days from today to target date
 * Accounts for study_days_per_week
 */
function calculateStudyDays(
  targetDate: string,
  studyDaysPerWeek: number
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  const totalCalendarDays = Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (totalCalendarDays <= 0) {
    return 1; // Minimum 1 day
  }
  
  // Calculate effective study days
  // For v1: simplified approach using ratio
  const effectiveStudyDays = Math.round(
    totalCalendarDays * (studyDaysPerWeek / 7.0)
  );
  
  return Math.max(1, effectiveStudyDays);
}

/**
 * Split daily minutes into activity types
 * 50% questions, 30% lessons, 20% flashcards
 */
function splitDailyMinutes(totalMinutes: number): {
  questions: number;
  lessons: number;
  flashcards: number;
} {
  const questions = Math.round(totalMinutes * 0.5);
  const lessons = Math.round(totalMinutes * 0.3);
  const flashcards = totalMinutes - questions - lessons; // Remainder to ensure total matches
  
  return { questions, lessons, flashcards };
}

/**
 * Fetch mastery data for student and units
 * Uses learning_activities and daily_analytics for comprehensive mastery calculation
 */
async function fetchMasteryData(
  studentId: string,
  topicIds: number[]
): Promise<Map<number, number>> {
  const masteryMap = new Map<number, number>();
  
  try {
    console.log('📊 Fetching mastery data for topics:', topicIds);
    
    // Fetch from learning_activities - primary source for accuracy/mastery
    const { data: activities, error: activitiesError } = await supabase
      .from('learning_activities')
      .select('topic_id, correct_answers, total_questions, accuracy, activity_type')
      .eq('user_id', studentId)
      .in('topic_id', topicIds);
    
    if (activitiesError) {
      console.warn('⚠️ Error fetching learning activities:', activitiesError);
    }
    
    // Also check daily_analytics for overall performance trends
    const { data: dailyAnalytics } = await supabase
      .from('daily_analytics')
      .select('questions_attempted, questions_correct')
      .eq('user_id', studentId)
      .order('date', { ascending: false })
      .limit(30); // Last 30 days
    
    // Calculate mastery per topic based on accuracy from learning_activities
    const topicStats = new Map<number, { correct: number; total: number; accuracySum: number; count: number }>();
    
    activities?.forEach(activity => {
      if (!activity.topic_id) return;
      
      const topicId = activity.topic_id;
      const current = topicStats.get(topicId) || { correct: 0, total: 0, accuracySum: 0, count: 0 };
      
      // Use accuracy if available, otherwise calculate from correct/total
      if (activity.accuracy !== null && activity.accuracy !== undefined) {
        current.accuracySum += activity.accuracy;
        current.count++;
      } else if (activity.total_questions && activity.total_questions > 0) {
        current.correct += activity.correct_answers || 0;
        current.total += activity.total_questions;
      }
      
      topicStats.set(topicId, current);
    });
    
    // Calculate mastery score (0-100) for each topic
    topicStats.forEach((stats, topicId) => {
      let masteryScore = 0;
      
      // Prefer accuracy average if available
      if (stats.count > 0) {
        masteryScore = Math.round(stats.accuracySum / stats.count);
      } else if (stats.total > 0) {
        masteryScore = Math.round((stats.correct / stats.total) * 100);
      }
      
      // Clamp between 0-100
      masteryScore = Math.max(0, Math.min(100, masteryScore));
      masteryMap.set(topicId, masteryScore);
    });
    
    // If we have daily_analytics but no topic-specific data, use overall accuracy
    if (dailyAnalytics && dailyAnalytics.length > 0) {
      const totalAttempted = dailyAnalytics.reduce((sum, day) => sum + (day.questions_attempted || 0), 0);
      const totalCorrect = dailyAnalytics.reduce((sum, day) => sum + (day.questions_correct || 0), 0);
      const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
      
      // Apply overall accuracy to topics with no specific data
      topicIds.forEach(topicId => {
        if (!masteryMap.has(topicId)) {
          masteryMap.set(topicId, overallAccuracy);
        }
      });
    } else {
      // Set default 0 for topics with no data
      topicIds.forEach(topicId => {
        if (!masteryMap.has(topicId)) {
          masteryMap.set(topicId, 0);
        }
      });
    }
    
    console.log('✅ Mastery data calculated:', Array.from(masteryMap.entries()));
    
  } catch (error) {
    console.error('❌ Error in fetchMasteryData:', error);
    // Default to 0 mastery on error
    topicIds.forEach(topicId => masteryMap.set(topicId, 0));
  }
  
  return masteryMap;
}

export const studyPlannerService = {
  /**
   * Create a new study plan with mastery-based calculations
   */
  async createStudyPlan(input: CreateStudyPlanInput): Promise<{
    data: StudyPlan | null;
    error: Error | null;
  }> {
    try {
      console.log('Creating study plan:', input);
      
      // Step 1: Fetch unit time profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('unit_time_profiles')
        .select('*')
        .eq('subject_id', input.subjectId)
        .in('topic_id', input.unitIds);
      
      if (profilesError) {
        throw new Error(`Failed to fetch unit time profiles: ${profilesError.message}`);
      }
      
      if (!profiles || profiles.length === 0) {
        throw new Error('No time profiles found for selected units. Please ensure unit_time_profiles are configured.');
      }
      
      // Step 2: Fetch student mastery data
      const masteryMap = await fetchMasteryData(input.studentId, input.unitIds);
      
      // Step 3: Calculate unit required minutes
      const unitRequiredMinutes: Array<{ topic_id: number; minutes: number }> = [];
      let totalRequiredMinutes = 0;
      
      profiles.forEach(profile => {
        const masteryScore = masteryMap.get(profile.topic_id) || 0;
        const requiredMinutes = calculateUnitRequiredMinutes(profile, masteryScore);
        
        unitRequiredMinutes.push({
          topic_id: profile.topic_id,
          minutes: requiredMinutes
        });
        
        totalRequiredMinutes += requiredMinutes;
      });
      
      // Step 4: Calculate study days and daily minutes
      const totalStudyDays = calculateStudyDays(input.targetDate, input.studyDaysPerWeek);
      const idealDailyMinutes = Math.ceil(totalRequiredMinutes / totalStudyDays);
      const dailyMinutesRequired = idealDailyMinutes;
      
      // Step 5: Create study plan record
      const planData: any = {
        user_id: input.studentId,
        subject_id: input.subjectId,
        target_date: input.targetDate,
        study_days_per_week: input.studyDaysPerWeek,
        max_daily_minutes: input.maxDailyMinutes,
        total_required_minutes: totalRequiredMinutes,
        total_study_days: totalStudyDays,
        daily_minutes_required: dailyMinutesRequired,
        status: 'active',
        exam_date: input.targetDate, // For backward compatibility
        study_date: new Date().toISOString().split('T')[0],
        study_time_minutes: dailyMinutesRequired, // For backward compatibility
      };
      
      if (input.planName) {
        planData.plan_name = input.planName;
      }
      
      const { data: plan, error: planError } = await supabase
        .from('study_plans')
        .insert(planData)
        .select()
        .single();
      
      if (planError) {
        throw new Error(`Failed to create study plan: ${planError.message}`);
      }
      
      // Step 6: Create study_plan_units records
      const unitRecords = unitRequiredMinutes.map(unit => ({
        plan_id: plan.plan_id,
        topic_id: unit.topic_id,
        unit_required_minutes: unit.minutes
      }));
      
      const { error: unitsError } = await supabase
        .from('study_plan_units')
        .insert(unitRecords);
      
      if (unitsError) {
        console.error('Error creating study plan units:', unitsError);
        // Continue even if units fail - plan is created
      }
      
      // Step 7: Pre-populate daily logs for each study day
      await this.prePopulateDailyLogs(plan.plan_id, input.targetDate, input.studyDaysPerWeek, dailyMinutesRequired);
      
      return { data: plan as StudyPlan, error: null };
      
    } catch (error) {
      console.error('Error creating study plan:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error creating study plan')
      };
    }
  },
  
  /**
   * Pre-populate daily logs for all study days in the plan
   */
  async prePopulateDailyLogs(
    planId: number,
    targetDate: string,
    studyDaysPerWeek: number,
    dailyMinutesRequired: number
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const target = new Date(targetDate);
      target.setHours(0, 0, 0, 0);
      
      const logs: Array<{
        plan_id: number;
        date: string;
        planned_minutes: number;
        planned_questions_minutes: number;
        planned_lessons_minutes: number;
        planned_flashcards_minutes: number;
        status: string;
      }> = [];
      
      const split = splitDailyMinutes(dailyMinutesRequired);
      
      // Generate logs for each day from today to target date
      const currentDate = new Date(today);
      let studyDayCount = 0;
      const totalDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const daysPerWeek = studyDaysPerWeek;
      
      while (currentDate <= target && studyDayCount < totalDays) {
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Simple logic: if studyDaysPerWeek is 7, include all days
        // If 5, assume Mon-Fri (1-5)
        // If other, use proportional approach
        let isStudyDay = false;
        
        if (daysPerWeek === 7) {
          isStudyDay = true;
        } else if (daysPerWeek === 5) {
          isStudyDay = dayOfWeek >= 1 && dayOfWeek <= 5; // Mon-Fri
        } else {
          // Proportional: include day if we haven't hit the weekly limit
          const weekStart = new Date(currentDate);
          weekStart.setDate(currentDate.getDate() - dayOfWeek);
          const daysInWeek = Math.min(7, Math.ceil((target.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)));
          const studyDaysInWeek = Math.ceil(daysInWeek * (daysPerWeek / 7));
          isStudyDay = studyDayCount % 7 < studyDaysInWeek;
        }
        
        if (isStudyDay) {
          logs.push({
            plan_id: planId,
            date: currentDate.toISOString().split('T')[0],
            planned_minutes: dailyMinutesRequired,
            planned_questions_minutes: split.questions,
            planned_lessons_minutes: split.lessons,
            planned_flashcards_minutes: split.flashcards,
            status: 'pending'
          });
          studyDayCount++;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      if (logs.length > 0) {
        const { error } = await supabase
          .from('study_plan_daily_logs')
          .upsert(logs, { onConflict: 'plan_id,date' });
        
        if (error) {
          console.error('Error pre-populating daily logs:', error);
        }
      }
      
    } catch (error) {
      console.error('Error in prePopulateDailyLogs:', error);
    }
  },
  
  /**
   * Get active study plan for a student and subject
   * Syncs with daily_analytics and learning_activities for accurate tracking
   */
  async getActiveStudyPlanForStudent(
    studentId: string,
    subjectId: number
  ): Promise<{
    plan: StudyPlan | null;
    todayLog: StudyPlanDailyLog | null;
    error: Error | null;
  }> {
    try {
      // Get active plan
      const { data: plan, error: planError } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', studentId)
        .eq('subject_id', subjectId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (planError) {
        if (planError.code === 'PGRST116') {
          // No rows returned - no active plan
          return { plan: null, todayLog: null, error: null };
        }
        throw planError;
      }
      
      // Sync today's log with analytics before returning
      const today = new Date().toISOString().split('T')[0];
      await this.syncDailyLogFromAnalytics(plan.plan_id, today, studentId, subjectId);
      
      // Get today's log (after syncing)
      const { data: todayLog, error: logError } = await supabase
        .from('study_plan_daily_logs')
        .select('*')
        .eq('plan_id', plan.plan_id)
        .eq('date', today)
        .single();
      
      if (logError && logError.code !== 'PGRST116') {
        console.warn('Error fetching today log:', logError);
      }
      
      return {
        plan: plan as StudyPlan,
        todayLog: todayLog as StudyPlanDailyLog | null,
        error: null
      };
      
    } catch (error) {
      console.error('Error getting active study plan:', error);
      return {
        plan: null,
        todayLog: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  },
  
  /**
   * Sync daily log from daily_analytics and learning_activities
   * This ensures the study plan uses actual tracked time and activities
   */
  async syncDailyLogFromAnalytics(
    planId: number,
    date: string,
    userId: string,
    subjectId: number
  ): Promise<void> {
    try {
      const today = date || new Date().toISOString().split('T')[0];
      
      // Get plan to get planned values
      const { data: plan } = await supabase
        .from('study_plans')
        .select('daily_minutes_required, subject_id')
        .eq('plan_id', planId)
        .single();
      
      if (!plan) return;
      
      const split = splitDailyMinutes(plan.daily_minutes_required || 0);
      
      // Get today's analytics from daily_analytics for total time
      const { data: dailyAnalytics } = await supabase
        .from('daily_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();
      
      // Get time tracking data for activity breakdown from time_tracking table
      // Query for the specific date (using start_time or created_at)
      const dateStart = `${today}T00:00:00`;
      const dateEnd = `${today}T23:59:59`;
      
      const { data: timeTrackingData } = await supabase
        .from('time_tracking')
        .select('page_type, duration_seconds')
        .eq('user_id', userId)
        .gte('start_time', dateStart)
        .lt('start_time', dateEnd);
      
      // Calculate actual minutes from time_tracking by page_type
      let actualQuestionsMinutes = 0;
      let actualLessonsMinutes = 0;
      let actualFlashcardsMinutes = 0;
      let actualTotalMinutes = 0;
      
      // Map page_type to activity categories
      // Questions: 'topical_exam', 'mock_exam', 'practice'
      // Lessons: 'lessons', 'ai-tutor', 'visual-learning'
      // Flashcards: 'flashcards'
      if (timeTrackingData && timeTrackingData.length > 0) {
        timeTrackingData.forEach(track => {
          const minutes = Math.round((track.duration_seconds || 0) / 60);
          const pageType = track.page_type?.toLowerCase() || '';
          
          // Questions category
          if (pageType === 'topical_exam' || pageType === 'mock_exam' || 
              pageType === 'practice' || pageType === 'practice_mode' ||
              pageType === 'questions') {
            actualQuestionsMinutes += minutes;
          }
          // Lessons category
          else if (pageType === 'lessons' || pageType === 'ai-tutor' || 
                   pageType === 'visual-learning' || pageType === 'lesson' ||
                   pageType === 'video_lesson') {
            actualLessonsMinutes += minutes;
          }
          // Flashcards category
          else if (pageType === 'flashcards' || pageType === 'flashcard') {
            actualFlashcardsMinutes += minutes;
          }
        });
      }
      
      // Calculate total from time_tracking breakdown
      actualTotalMinutes = actualQuestionsMinutes + actualLessonsMinutes + actualFlashcardsMinutes;
      
      // If no time_tracking data but we have daily_analytics, use that as fallback
      if (actualTotalMinutes === 0 && dailyAnalytics) {
        // Convert seconds to minutes from daily_analytics
        actualTotalMinutes = Math.round((dailyAnalytics.total_time_spent || 0) / 60);
        
        // If we have total but no breakdown, estimate using planned split percentages
        if (actualTotalMinutes > 0) {
          actualQuestionsMinutes = Math.round(actualTotalMinutes * 0.5);
          actualLessonsMinutes = Math.round(actualTotalMinutes * 0.3);
          actualFlashcardsMinutes = actualTotalMinutes - actualQuestionsMinutes - actualLessonsMinutes;
        }
      }
      
      // If we still have no data, try learning_activities as a last resort
      if (actualTotalMinutes === 0) {
        const { data: learningActivities } = await supabase
          .from('learning_activities')
          .select('activity_type, duration')
          .eq('user_id', userId)
          .eq('subject_id', subjectId)
          .gte('created_at', dateStart)
          .lt('created_at', dateEnd);
        
        if (learningActivities && learningActivities.length > 0) {
          learningActivities.forEach(activity => {
            const activityMinutes = Math.round((activity.duration || 0) / 60);
            
            if (activity.activity_type === 'question' || activity.activity_type === 'practice_session') {
              actualQuestionsMinutes += activityMinutes;
            } else if (activity.activity_type === 'lesson' || activity.activity_type === 'video_lesson') {
              actualLessonsMinutes += activityMinutes;
            } else if (activity.activity_type === 'flashcard') {
              actualFlashcardsMinutes += activityMinutes;
            }
          });
          
          actualTotalMinutes = actualQuestionsMinutes + actualLessonsMinutes + actualFlashcardsMinutes;
        }
      }
      
      // Get or create daily log
      const { data: existingLog } = await supabase
        .from('study_plan_daily_logs')
        .select('*')
        .eq('plan_id', planId)
        .eq('date', today)
        .single();
      
      const plannedMinutes = plan.daily_minutes_required || 0;
      
      // Determine status
      let status: 'pending' | 'partial' | 'done' | 'missed' = 'pending';
      if (actualTotalMinutes >= plannedMinutes * 0.9) {
        status = 'done';
      } else if (actualTotalMinutes > 0) {
        status = 'partial';
      } else {
        // Check if date has passed
        const logDate = new Date(today);
        const now = new Date();
        if (logDate < now && logDate.toDateString() !== now.toDateString()) {
          status = 'missed';
        }
      }
      
      const logData = {
        plan_id: planId,
        date: today,
        planned_minutes: plannedMinutes,
        planned_questions_minutes: split.questions,
        planned_lessons_minutes: split.lessons,
        planned_flashcards_minutes: split.flashcards,
        actual_total_minutes: actualTotalMinutes,
        actual_questions_minutes: actualQuestionsMinutes,
        actual_lessons_minutes: actualLessonsMinutes,
        actual_flashcards_minutes: actualFlashcardsMinutes,
        status: status,
        updated_at: new Date().toISOString()
      };
      
      if (existingLog) {
        // Update existing log
        await supabase
          .from('study_plan_daily_logs')
          .update(logData)
          .eq('id', existingLog.id);
      } else {
        // Create new log
        await supabase
          .from('study_plan_daily_logs')
          .insert(logData);
      }
      
      console.log('✅ Synced daily log from time_tracking & analytics:', {
        date: today,
        actualTotalMinutes,
        actualQuestionsMinutes,
        actualLessonsMinutes,
        actualFlashcardsMinutes,
        status,
        timeTrackingEntries: timeTrackingData?.length || 0,
        source: timeTrackingData && timeTrackingData.length > 0 ? 'time_tracking' : 
                (dailyAnalytics ? 'daily_analytics' : 'learning_activities')
      });
      
    } catch (error) {
      console.error('Error syncing daily log from analytics:', error);
      // Don't throw - this is a background sync operation
    }
  },
  
  /**
   * Log study activity and update daily log
   * Now also syncs with analytics tables for accuracy
   */
  async logStudyActivity(
    planId: number,
    date: string,
    activityType: 'question' | 'lesson' | 'flashcard',
    minutesSpent: number
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Get plan to get user_id and subject_id for syncing
      const { data: plan } = await supabase
        .from('study_plans')
        .select('user_id, subject_id, daily_minutes_required')
        .eq('plan_id', planId)
        .single();
      
      if (!plan) {
        throw new Error('Plan not found');
      }
      
      // Sync from analytics first to get most accurate data
      await this.syncDailyLogFromAnalytics(planId, date, plan.user_id, plan.subject_id);
      
      // Get the synced log
      const { data: log, error: fetchError } = await supabase
        .from('study_plan_daily_logs')
        .select('*')
        .eq('plan_id', planId)
        .eq('date', date)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      // If log still doesn't exist after sync, create it
      if (!log) {
        const split = splitDailyMinutes(plan.daily_minutes_required || 0);
        
        const { data: newLog, error: createError } = await supabase
          .from('study_plan_daily_logs')
          .insert({
            plan_id: planId,
            date: date,
            planned_minutes: plan.daily_minutes_required || 0,
            planned_questions_minutes: split.questions,
            planned_lessons_minutes: split.lessons,
            planned_flashcards_minutes: split.flashcards,
            status: 'pending',
            actual_total_minutes: 0,
            actual_questions_minutes: 0,
            actual_lessons_minutes: 0,
            actual_flashcards_minutes: 0
          })
          .select()
          .single();
        
        if (createError) {
          throw createError;
        }
        
        // Add the new activity
        const updates: any = {
          updated_at: new Date().toISOString()
        };
        
        if (activityType === 'question') {
          updates.actual_questions_minutes = minutesSpent;
        } else if (activityType === 'lesson') {
          updates.actual_lessons_minutes = minutesSpent;
        } else if (activityType === 'flashcard') {
          updates.actual_flashcards_minutes = minutesSpent;
        }
        
        updates.actual_total_minutes = minutesSpent;
        updates.status = minutesSpent > 0 ? 'partial' : 'pending';
        
        await supabase
          .from('study_plan_daily_logs')
          .update(updates)
          .eq('id', newLog.id);
      } else {
        // Log exists - add to existing values (in case sync didn't catch this activity yet)
        const updates: any = {
          updated_at: new Date().toISOString()
        };
        
        if (activityType === 'question') {
          updates.actual_questions_minutes = (log.actual_questions_minutes || 0) + minutesSpent;
        } else if (activityType === 'lesson') {
          updates.actual_lessons_minutes = (log.actual_lessons_minutes || 0) + minutesSpent;
        } else if (activityType === 'flashcard') {
          updates.actual_flashcards_minutes = (log.actual_flashcards_minutes || 0) + minutesSpent;
        }
        
        updates.actual_total_minutes = (log.actual_total_minutes || 0) + minutesSpent;
        
        // Update status based on progress
        const plannedMinutes = log.planned_minutes || 0;
        const actualMinutes = updates.actual_total_minutes;
        
        if (actualMinutes >= plannedMinutes * 0.9) {
          updates.status = 'done';
        } else if (actualMinutes > 0) {
          updates.status = 'partial';
        } else {
          updates.status = 'pending';
        }
        
        await supabase
          .from('study_plan_daily_logs')
          .update(updates)
          .eq('id', log.id);
      }
      
      return { success: true, error: null };
      
    } catch (error) {
      console.error('Error logging study activity:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  },
  
  /**
   * Sync all daily logs for a plan from analytics
   * Useful for bulk updates or when analytics are updated
   */
  async syncAllDailyLogsFromAnalytics(planId: number): Promise<{
    success: boolean;
    syncedDays: number;
    error: Error | null;
  }> {
    try {
      const { data: plan } = await supabase
        .from('study_plans')
        .select('user_id, subject_id, target_date')
        .eq('plan_id', planId)
        .single();
      
      if (!plan) {
        throw new Error('Plan not found');
      }
      
      const today = new Date().toISOString().split('T')[0];
      const targetDate = new Date(plan.target_date).toISOString().split('T')[0];
      
      // Get all dates from plan start to target date
      const dates: string[] = [];
      const currentDate = new Date(today);
      const endDate = new Date(targetDate);
      
      while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      let syncedCount = 0;
      
      // Sync each date
      for (const date of dates) {
        await this.syncDailyLogFromAnalytics(planId, date, plan.user_id, plan.subject_id);
        syncedCount++;
      }
      
      return { success: true, syncedDays: syncedCount, error: null };
      
    } catch (error) {
      console.error('Error syncing all daily logs:', error);
      return {
        success: false,
        syncedDays: 0,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  },
  
  /**
   * Recalculate plan based on updated mastery
   * This should be called weekly or when mastery changes significantly
   */
  async recalculatePlan(planId: number): Promise<{
    success: boolean;
    error: Error | null;
  }> {
    try {
      // Get plan
      const { data: plan, error: planError } = await supabase
        .from('study_plans')
        .select('*')
        .eq('plan_id', planId)
        .single();
      
      if (planError) {
        throw planError;
      }
      
      if (plan.status !== 'active') {
        return { success: false, error: new Error('Plan is not active') };
      }
      
      // Get plan units
      const { data: units, error: unitsError } = await supabase
        .from('study_plan_units')
        .select('topic_id')
        .eq('plan_id', planId);
      
      if (unitsError) {
        throw unitsError;
      }
      
      const topicIds = units.map(u => u.topic_id);
      
      // Fetch updated mastery
      const masteryMap = await fetchMasteryData(plan.user_id, topicIds);
      
      // Fetch time profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('unit_time_profiles')
        .select('*')
        .eq('subject_id', plan.subject_id)
        .in('topic_id', topicIds);
      
      if (profilesError) {
        throw profilesError;
      }
      
      // Recalculate required minutes per unit
      let totalRequiredMinutes = 0;
      const unitUpdates: Array<{ topic_id: number; minutes: number }> = [];
      
      profiles.forEach(profile => {
        const masteryScore = masteryMap.get(profile.topic_id) || 0;
        const requiredMinutes = calculateUnitRequiredMinutes(profile, masteryScore);
        
        unitUpdates.push({
          topic_id: profile.topic_id,
          minutes: requiredMinutes
        });
        
        totalRequiredMinutes += requiredMinutes;
      });
      
      // Calculate remaining study days
      const today = new Date();
      const target = new Date(plan.target_date);
      const remainingDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (remainingDays <= 0) {
        // Plan expired
        await supabase
          .from('study_plans')
          .update({ status: 'expired' })
          .eq('plan_id', planId);
        
        return { success: true, error: null };
      }
      
      const remainingStudyDays = calculateStudyDays(plan.target_date, plan.study_days_per_week);
      const newDailyMinutes = Math.ceil(totalRequiredMinutes / remainingStudyDays);
      
      // Update plan
      await supabase
        .from('study_plans')
        .update({
          total_required_minutes: totalRequiredMinutes,
          daily_minutes_required: newDailyMinutes,
          study_time_minutes: newDailyMinutes,
          updated_at: new Date().toISOString()
        })
        .eq('plan_id', planId);
      
      // Update unit required minutes
      for (const update of unitUpdates) {
        await supabase
          .from('study_plan_units')
          .update({ unit_required_minutes: update.minutes })
          .eq('plan_id', planId)
          .eq('topic_id', update.topic_id);
      }
      
      // Update future daily logs with new planned minutes
      const split = splitDailyMinutes(newDailyMinutes);
      await supabase
        .from('study_plan_daily_logs')
        .update({
          planned_minutes: newDailyMinutes,
          planned_questions_minutes: split.questions,
          planned_lessons_minutes: split.lessons,
          planned_flashcards_minutes: split.flashcards
        })
        .eq('plan_id', planId)
        .gte('date', today.toISOString().split('T')[0])
        .eq('status', 'pending');
      
      return { success: true, error: null };
      
    } catch (error) {
      console.error('Error recalculating plan:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }
};

