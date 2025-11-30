/**
 * Database Constants
 * 
 * Centralized constants for database operations
 * to avoid magic numbers and improve maintainability.
 */

/**
 * Subject IDs mapping
 */
export const SUBJECT_IDS = {
  BUSINESS_STUDIES: 101,
  MATHEMATICS: 102,
  PHYSICS: 103,
  CHEMISTRY: 104,
} as const;

export type SubjectId = typeof SUBJECT_IDS[keyof typeof SUBJECT_IDS];

/**
 * Subject name to ID mapping
 */
export const SUBJECT_NAME_TO_ID: Record<string, SubjectId> = {
  'businessStudies': SUBJECT_IDS.BUSINESS_STUDIES,
  'mathematics': SUBJECT_IDS.MATHEMATICS,
  'physics': SUBJECT_IDS.PHYSICS,
  'chemistry': SUBJECT_IDS.CHEMISTRY,
};

/**
 * Subject ID to name mapping
 */
export const SUBJECT_ID_TO_NAME: Record<SubjectId, string> = {
  [SUBJECT_IDS.BUSINESS_STUDIES]: 'Business Studies',
  [SUBJECT_IDS.MATHEMATICS]: 'Mathematics',
  [SUBJECT_IDS.PHYSICS]: 'Physics',
  [SUBJECT_IDS.CHEMISTRY]: 'Chemistry',
};

/**
 * Question marks values
 */
export const QUESTION_MARKS = {
  SHORT: 2,
  MEDIUM: 4,
  LONG: 6,
} as const;

export type QuestionMarks = typeof QUESTION_MARKS[keyof typeof QUESTION_MARKS];

/**
 * Question difficulty levels
 */
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS];

/**
 * Question types
 */
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  SHORT_ANSWER: 'short_answer',
  ESSAY: 'essay',
  CALCULATION: 'calculation',
} as const;

export type QuestionType = typeof QUESTION_TYPES[keyof typeof QUESTION_TYPES];

/**
 * Activity types for analytics
 */
export const ACTIVITY_TYPES = {
  QUESTION: 'question',
  LESSON: 'lesson',
  VIDEO: 'video',
  FLASHCARD: 'flashcard',
  MOCK_EXAM: 'mock_exam',
  PRACTICE_SESSION: 'practice_session',
} as const;

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];

/**
 * Learning page identifiers
 */
export const LEARNING_PAGES = {
  AI_TUTOR: 'ai-tutor',
  PRACTICE: 'practice',
  FLASHCARDS: 'flashcards',
  VISUAL_LEARNING: 'visual-learning',
  MOCK_EXAM_P1: 'mock-exam-p1',
  MOCK_EXAM_P2: 'mock-exam-p2',
} as const;

export type LearningPage = typeof LEARNING_PAGES[keyof typeof LEARNING_PAGES];

/**
 * Page display names
 */
export const PAGE_DISPLAY_NAMES: Record<LearningPage, string> = {
  [LEARNING_PAGES.AI_TUTOR]: 'AI Tutor & Lessons',
  [LEARNING_PAGES.PRACTICE]: 'Practice Mode',
  [LEARNING_PAGES.FLASHCARDS]: 'Flashcards',
  [LEARNING_PAGES.VISUAL_LEARNING]: 'Visual Learning',
  [LEARNING_PAGES.MOCK_EXAM_P1]: 'Mock Exam Paper 1',
  [LEARNING_PAGES.MOCK_EXAM_P2]: 'Mock Exam Paper 2',
};

/**
 * Grade thresholds
 */
export const GRADE_THRESHOLDS = {
  A: 80,
  B: 70,
  C: 60,
  D: 50,
  E: 40,
} as const;

/**
 * Get grade from percentage
 */
export function getGradeFromPercentage(percentage: number): string {
  if (percentage >= GRADE_THRESHOLDS.A) return 'A';
  if (percentage >= GRADE_THRESHOLDS.B) return 'B';
  if (percentage >= GRADE_THRESHOLDS.C) return 'C';
  if (percentage >= GRADE_THRESHOLDS.D) return 'D';
  if (percentage >= GRADE_THRESHOLDS.E) return 'E';
  return 'F';
}

/**
 * Database table names
 */
export const TABLE_NAMES = {
  USERS: 'users',
  TOPICS: 'topics',
  QUESTIONS: 'questions',
  BUSINESS_ACTIVITY_QUESTIONS: 'business_activity_questions',
  FLASHCARDS: 'flashcards',
  VIDEO_LESSONS: 'video_lessons',
  LESSONS: 'lessons',
  DAILY_ANALYTICS: 'daily_analytics',
  LEARNING_ACTIVITIES: 'learning_activities',
  PAGE_SESSIONS: 'page_sessions',
  MOCK_EXAM_ATTEMPTS: 'mock_exam_attempts',
  STUDY_PLANS: 'study_plans',
  STUDY_SESSIONS: 'study_sessions',
  CHAT_MESSAGES: 'chat_messages',
  P1_MOCK_EXAM: 'p1_mock_exam',
  P2_MOCK_EXAM: 'p2_mock_exam',
} as const;

export type TableName = typeof TABLE_NAMES[keyof typeof TABLE_NAMES];

/**
 * Query limits for pagination
 */
export const QUERY_LIMITS = {
  DEFAULT: 20,
  SMALL: 10,
  MEDIUM: 50,
  LARGE: 100,
  MAX: 1000,
} as const;

/**
 * Study streak thresholds
 */
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

/**
 * Check if a streak is at a milestone
 */
export function isStreakMilestone(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak as any);
}

/**
 * Get next streak milestone
 */
export function getNextStreakMilestone(currentStreak: number): number | null {
  for (const milestone of STREAK_MILESTONES) {
    if (milestone > currentStreak) {
      return milestone;
    }
  }
  return null;
}

