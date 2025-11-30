import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Calendar, Clock, TrendingUp, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { studyPlannerService, StudyPlan, StudyPlanDailyLog } from '../utils/supabase/study-planner-service';
import { supabase } from '../utils/supabase/client';

interface PlanDetailViewProps {
  plan: StudyPlan;
}

export function PlanDetailView({ plan }: PlanDetailViewProps) {
  const [dailyLogs, setDailyLogs] = useState<StudyPlanDailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'upcoming' | 'past'>('upcoming');
  
  useEffect(() => {
    loadDailyLogs();
  }, [plan.plan_id]);
  
  // Auto-refresh logs every 30 seconds to sync with analytics
  useEffect(() => {
    const interval = setInterval(() => {
      loadDailyLogs();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [plan.plan_id]);
  
  const loadDailyLogs = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Sync today's log from analytics first
      const { studyPlannerService } = await import('../utils/supabase/study-planner-service');
      const { data: planData } = await supabase
        .from('study_plans')
        .select('user_id, subject_id')
        .eq('plan_id', plan.plan_id)
        .single();
      
      if (planData) {
        await studyPlannerService.syncDailyLogFromAnalytics(
          plan.plan_id,
          today,
          planData.user_id,
          planData.subject_id
        );
      }
      
      // Get all logs for this plan
      const { data, error } = await supabase
        .from('study_plan_daily_logs')
        .select('*')
        .eq('plan_id', plan.plan_id)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      setDailyLogs(data || []);
    } catch (error) {
      console.error('Error loading daily logs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const today = new Date().toISOString().split('T')[0];
  const upcomingLogs = dailyLogs.filter(log => log.date >= today);
  const pastLogs = dailyLogs.filter(log => log.date < today).slice(-7); // Last 7 days
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'partial': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'missed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'missed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const calculateStats = () => {
    const completed = pastLogs.filter(log => log.status === 'done').length;
    const partial = pastLogs.filter(log => log.status === 'partial').length;
    const missed = pastLogs.filter(log => log.status === 'missed').length;
    const totalPlanned = pastLogs.reduce((sum, log) => sum + (log.planned_minutes || 0), 0);
    const totalActual = pastLogs.reduce((sum, log) => sum + (log.actual_total_minutes || 0), 0);
    const averageCompletion = pastLogs.length > 0 
      ? Math.round((totalActual / totalPlanned) * 100) 
      : 0;
    
    return { completed, partial, missed, averageCompletion, totalPlanned, totalActual };
  };
  
  const stats = calculateStats();
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading plan details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedView('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedView === 'upcoming'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Upcoming Days
        </button>
        <button
          onClick={() => setSelectedView('past')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedView === 'past'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last 7 Days
        </button>
      </div>
      
      {/* Upcoming Days View */}
      {selectedView === 'upcoming' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Study Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming study days scheduled</p>
            ) : (
              <div className="space-y-4">
                {upcomingLogs.map(log => {
                  const logDate = new Date(log.date);
                  const isToday = log.date === today;
                  const progress = log.planned_minutes > 0
                    ? Math.min(100, Math.round((log.actual_total_minutes / log.planned_minutes) * 100))
                    : 0;
                  
                  return (
                    <div
                      key={log.id}
                      className={`p-4 rounded-lg border ${
                        isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(log.status)}
                          <div>
                            <div className="font-semibold">
                              {isToday ? 'Today' : logDate.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {log.planned_minutes} minutes planned
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">
                            {log.actual_total_minutes} / {log.planned_minutes} min ({progress}%)
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      {log.planned_questions_minutes || log.planned_lessons_minutes || log.planned_flashcards_minutes ? (
                        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Questions:</span>
                            <span className="font-medium ml-1">{log.planned_questions_minutes} min</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Lessons:</span>
                            <span className="font-medium ml-1">{log.planned_lessons_minutes} min</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Flashcards:</span>
                            <span className="font-medium ml-1">{log.planned_flashcards_minutes} min</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Last 7 Days View */}
      {selectedView === 'past' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Last 7 Days Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.partial}</div>
                  <div className="text-sm text-gray-600">Partial</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.missed}</div>
                  <div className="text-sm text-gray-600">Missed</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.averageCompletion}%</div>
                  <div className="text-sm text-gray-600">Avg. Completion</div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Time</span>
                  <span className="font-semibold">
                    {stats.totalActual} / {stats.totalPlanned} minutes
                  </span>
                </div>
                <Progress 
                  value={stats.totalPlanned > 0 ? Math.min(100, (stats.totalActual / stats.totalPlanned) * 100) : 0} 
                  className="h-3" 
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {pastLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No past activity recorded</p>
              ) : (
                <div className="space-y-3">
                  {pastLogs.map(log => {
                    const logDate = new Date(log.date);
                    const progress = log.planned_minutes > 0
                      ? Math.min(100, Math.round((log.actual_total_minutes / log.planned_minutes) * 100))
                      : 0;
                    
                    return (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(log.status)}
                          <div>
                            <div className="font-medium">
                              {logDate.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: logDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.actual_total_minutes} / {log.planned_minutes} min
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24">
                            <Progress value={progress} className="h-2" />
                          </div>
                          <Badge className={getStatusColor(log.status)} variant="outline">
                            {log.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

