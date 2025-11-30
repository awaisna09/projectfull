import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Clock, BookOpen, Target, FileText, RefreshCw } from 'lucide-react';
import { StudyPlanDailyLog, studyPlannerService } from '../utils/supabase/study-planner-service';
import { supabase } from '../utils/supabase/client';
import { Button } from './ui/button';

interface DailyPlanViewProps {
  plan: {
    plan_id?: number;
    plan_name?: string;
    subject_id?: number;
    daily_minutes_required: number;
    target_date: string;
    user_id?: string;
  };
  todayLog: StudyPlanDailyLog | null;
}

export function DailyPlanView({ plan, todayLog }: DailyPlanViewProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  
  // Auto-sync on mount and every 30 seconds
  useEffect(() => {
    if (!plan.plan_id || !plan.user_id || !plan.subject_id) return;
    
    const syncData = async () => {
      try {
        setSyncing(true);
        await studyPlannerService.syncDailyLogFromAnalytics(
          plan.plan_id!,
          new Date().toISOString().split('T')[0],
          plan.user_id!,
          plan.subject_id!
        );
        setLastSynced(new Date());
      } catch (error) {
        console.error('Error syncing data:', error);
      } finally {
        setSyncing(false);
      }
    };
    
    // Sync immediately
    syncData();
    
    // Then sync every 30 seconds
    const interval = setInterval(syncData, 30000);
    
    return () => clearInterval(interval);
  }, [plan.plan_id, plan.user_id, plan.subject_id]);
  
  const handleManualSync = async () => {
    if (!plan.plan_id || !plan.user_id || !plan.subject_id) return;
    
    setSyncing(true);
    try {
      await studyPlannerService.syncDailyLogFromAnalytics(
        plan.plan_id,
        new Date().toISOString().split('T')[0],
        plan.user_id,
        plan.subject_id
      );
      setLastSynced(new Date());
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(false);
    }
  };
  const plannedMinutes = todayLog?.planned_minutes || plan.daily_minutes_required;
  const actualMinutes = todayLog?.actual_total_minutes || 0;
  const progressPercentage = plannedMinutes > 0 
    ? Math.min(100, Math.round((actualMinutes / plannedMinutes) * 100))
    : 0;
  
  const questionsPlanned = todayLog?.planned_questions_minutes || Math.round(plannedMinutes * 0.5);
  const lessonsPlanned = todayLog?.planned_lessons_minutes || Math.round(plannedMinutes * 0.3);
  const flashcardsPlanned = todayLog?.planned_flashcards_minutes || Math.round(plannedMinutes * 0.2);
  
  const questionsActual = todayLog?.actual_questions_minutes || 0;
  const lessonsActual = todayLog?.actual_lessons_minutes || 0;
  const flashcardsActual = todayLog?.actual_flashcards_minutes || 0;
  
  const status = todayLog?.status || 'pending';
  
  const getStatusColor = () => {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'missed': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'done': return 'Completed';
      case 'partial': return 'In Progress';
      case 'missed': return 'Missed';
      default: return 'Not Started';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Today's Study Plan
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualSync}
              disabled={syncing}
              title="Sync from analytics"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            </Button>
            <Badge className={getStatusColor()}>{getStatusText()}</Badge>
          </div>
        </div>
        {lastSynced && (
          <p className="text-xs text-gray-500 mt-1">
            Synced from analytics {lastSynced.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Daily Target</span>
            <span className="text-lg font-bold">
              {actualMinutes} / {plannedMinutes} minutes
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{progressPercentage}% complete</span>
            <span>{Math.max(0, plannedMinutes - actualMinutes)} minutes remaining</span>
          </div>
        </div>
        
        {/* Activity breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Activity Breakdown</h4>
          
          {/* Questions */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Questions</span>
              </div>
              <span className="font-medium">
                {questionsActual} / {questionsPlanned} min
              </span>
            </div>
            <Progress 
              value={questionsPlanned > 0 ? Math.min(100, (questionsActual / questionsPlanned) * 100) : 0} 
              className="h-2" 
            />
          </div>
          
          {/* Lessons */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-500" />
                <span>Lessons</span>
              </div>
              <span className="font-medium">
                {lessonsActual} / {lessonsPlanned} min
              </span>
            </div>
            <Progress 
              value={lessonsPlanned > 0 ? Math.min(100, (lessonsActual / lessonsPlanned) * 100) : 0} 
              className="h-2" 
            />
          </div>
          
          {/* Flashcards */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <span>Flashcards</span>
              </div>
              <span className="font-medium">
                {flashcardsActual} / {flashcardsPlanned} min
              </span>
            </div>
            <Progress 
              value={flashcardsPlanned > 0 ? Math.min(100, (flashcardsActual / flashcardsPlanned) * 100) : 0} 
              className="h-2" 
            />
          </div>
        </div>
        
        {/* Plan info */}
        <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Plan:</span>
            <span className="font-medium">{plan.plan_name || 'Study Plan'}</span>
          </div>
          <div className="flex justify-between">
            <span>Target Date:</span>
            <span className="font-medium">
              {new Date(plan.target_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

