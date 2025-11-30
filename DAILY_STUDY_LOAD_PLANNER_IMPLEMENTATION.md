# Daily Study Load Planner Implementation

## Overview

The Daily Study Load Planner has been successfully implemented as an adaptive system that calculates required daily study minutes based on student mastery levels, unit difficulty, and target dates. The planner integrates seamlessly with existing analytics and provides a clear, student-facing experience.

## What Was Implemented

### 1. Database Schema

**New Tables Created:**
- `unit_time_profiles` - Stores time requirements configuration per unit/topic
- `study_plan_units` - Junction table linking study plans to units with required minutes
- `study_plan_daily_logs` - Daily tracking of planned vs actual study time

**Enhanced Table:**
- `study_plans` - Extended with new fields:
  - `target_date` - When the student needs to be prepared
  - `study_days_per_week` - How many days per week they can study
  - `max_daily_minutes` - Maximum realistic daily study time
  - `total_required_minutes` - Total minutes needed for all units
  - `total_study_days` - Calculated study days available
  - `daily_minutes_required` - Required minutes per study day
  - `subject_id` - Reference to subject
  - `metadata` - JSONB for additional data

**SQL Files:**
- `supabase/create-unit-time-profiles.sql` - Creates unit time profiles table
- `supabase/create-study-plan-tables.sql` - Creates new planner tables and enhances study_plans
- `supabase/seed-unit-time-profiles.sql` - Seeds default IGCSE Business Studies time profiles

### 2. Backend Service

**File:** `utils/supabase/study-planner-service.ts`

**Key Functions:**
- `createStudyPlan()` - Creates plan with mastery-based calculations
- `getActiveStudyPlanForStudent()` - Fetches active plan and today's log
- `logStudyActivity()` - Updates daily logs when activities complete
- `recalculatePlan()` - Weekly recalculation based on updated mastery
- `prePopulateDailyLogs()` - Creates daily log entries for all study days

**Core Algorithms:**
- **Mastery Factor Calculation:**
  - 0-40 mastery → 1.0 (full time needed)
  - 40-70 mastery → 0.7 (30% reduction)
  - 70-90 mastery → 0.4 (60% reduction)
  - 90-100 mastery → 0.2 (80% reduction)

- **Unit Required Minutes:**
  ```
  unit_required_minutes = (first_pass_or_revision) × difficulty_multiplier × mastery_factor
  ```

- **Study Days Calculation:**
  ```
  effective_study_days = round(total_calendar_days × (study_days_per_week / 7.0))
  ```

- **Daily Minutes Split:**
  - 50% questions
  - 30% lessons
  - 20% flashcards

### 3. Frontend Components

**New Components:**
- `components/StudyPlanWizard.tsx` - 5-step plan creation wizard
  - Step 1: Select Subject
  - Step 2: Select Units/Topics
  - Step 3: Timeline & Availability
  - Step 4: Max Daily Minutes
  - Step 5: Plan Preview with warnings

- `components/DailyPlanView.tsx` - Today's plan display with:
  - Progress bar showing actual vs planned minutes
  - Activity breakdown (questions, lessons, flashcards)
  - Status indicators (pending, partial, done, missed)

- `components/StudyPlannerPage.tsx` - Main planner dashboard
  - Shows active plan summary
  - Displays today's plan via DailyPlanView
  - Create plan CTA when no active plan
  - Plan statistics and quick stats

### 4. Integration with Activity Trackers

**Enhanced Files:**
- `utils/supabase/enhanced-analytics-tracker.ts` - Added `logToStudyPlan()` method
- `utils/supabase/learning-activity-tracker.ts` - Added `logToStudyPlan()` method

**How It Works:**
- When students complete questions, lessons, or flashcards, the activity is automatically logged to their active study plan
- Time is converted from seconds to minutes
- Daily logs are updated with actual time spent
- Status is automatically updated (pending → partial → done)

### 5. App Integration

**Updated:**
- `App.tsx` - Now uses `StudyPlannerPage` instead of old `StudyPlanPage` for 'study-plan' route
- `utils/supabase/services.ts` - Exports `studyPlannerService`

## Setup Instructions

### 1. Run Database Migrations

Execute these SQL files in your Supabase SQL Editor in order:

```sql
-- 1. Create unit time profiles table
\i supabase/create-unit-time-profiles.sql

-- 2. Create study plan tables and enhance existing table
\i supabase/create-study-plan-tables.sql

-- 3. Seed default time profiles
\i supabase/seed-unit-time-profiles.sql
```

### 2. Verify Tables

Check that all tables exist:
- `unit_time_profiles`
- `study_plan_units`
- `study_plan_daily_logs`
- `study_plans` (with new columns)

### 3. Configure Unit Time Profiles

For each subject/unit combination, ensure `unit_time_profiles` has entries with:
- `base_minutes_first_pass` - Time for first-time learning
- `base_minutes_revision` - Time for revision (typically 50-60% of first pass)
- `difficulty_multiplier` - Difficulty adjustment (1.0 = normal, 1.2-1.5 = hard)

### 4. Access the Planner

Navigate to the Study Plan page in your app. The new planner will:
- Show active plan if one exists
- Allow creating a new plan via the wizard
- Automatically track activities and update progress

## Usage Flow

### Creating a Study Plan

1. Student navigates to Study Plan page
2. Clicks "Create Study Plan"
3. Completes 5-step wizard:
   - Selects subject (e.g., IGCSE Business Studies)
   - Selects units/topics to cover
   - Sets target date and study days per week
   - Enters max daily minutes they can realistically study
   - Reviews plan preview (with warnings if needed)
4. Plan is created with:
   - Calculated total required minutes
   - Daily minutes required
   - Pre-populated daily logs for all study days

### Daily Tracking

1. Student sees "Today's Plan" with:
   - Target minutes for the day
   - Breakdown by activity type
   - Progress bar
2. As student completes activities:
   - Questions, lessons, flashcards are automatically logged
   - Daily log updates in real-time
   - Status changes: pending → partial → done
3. Progress is visible immediately

### Weekly Recalculation

The `recalculatePlan()` function should be called weekly (via scheduled job or manual trigger) to:
- Fetch updated mastery scores
- Recalculate required minutes per unit
- Adjust daily minutes required
- Update future daily logs

## Key Features

✅ **Adaptive Planning** - Adjusts based on student mastery level
✅ **Real-time Tracking** - Automatically logs activities as they happen
✅ **Clear Progress** - Visual progress bars and status indicators
✅ **Activity Breakdown** - Shows time spent on questions, lessons, flashcards
✅ **Warning System** - Alerts if daily requirement exceeds student's capacity
✅ **Integration** - Seamlessly works with existing analytics system

## Configuration

### Mastery Thresholds

Currently hardcoded in `study-planner-service.ts`:
```typescript
0-40 → 1.0 factor
40-70 → 0.7 factor
70-90 → 0.4 factor
90-100 → 0.2 factor
```

### Activity Split

Currently hardcoded:
- Questions: 50%
- Lessons: 30%
- Flashcards: 20%

These can be made configurable via the `metadata` JSONB field in study_plans.

## Future Enhancements

1. **Weekly Recalculation Job** - Set up automated weekly recalculation
2. **Multiple Plans** - Support multiple active plans per student
3. **Plan History** - View past plans and performance
4. **Custom Splits** - Allow students to customize activity time splits
5. **Notifications** - Remind students of daily targets
6. **Analytics Dashboard** - Show plan performance over time

## Notes

- The system treats topics as units (no separate units table exists)
- Mastery is aggregated from `learning_activities` table based on accuracy
- Time tracking uses minutes (converted from seconds in analytics)
- The planner only tracks questions, lessons, and flashcards (not mock exams or other activities)

## Troubleshooting

**No time profiles found:**
- Ensure `unit_time_profiles` table has entries for selected subjects/topics
- Run the seed script or manually insert profiles

**Activities not logging:**
- Check that student has an active plan for the subject
- Verify activity trackers are calling `logToStudyPlan()`
- Check browser console for errors

**Plan not showing:**
- Verify `study_plans` table has active plan for student
- Check that `subject_id` matches
- Ensure RLS policies allow access

