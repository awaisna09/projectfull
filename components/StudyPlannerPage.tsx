import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Logo } from './Logo';
import { useApp } from '../App';
import { studyPlannerService, StudyPlan } from '../utils/supabase/study-planner-service';
import { supabase } from '../utils/supabase/client';
import { StudyPlanWizard } from './StudyPlanWizard';
import { DailyPlanView } from './DailyPlanView';
import { PlanDetailView } from './PlanDetailView';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Target,
  TrendingUp,
  AlertCircle,
  Home,
  BookOpen,
  RefreshCw
} from 'lucide-react';

export function StudyPlannerPage() {
  const { setCurrentPage, user } = useApp();
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [todayLog, setTodayLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  
  // Check for selected plan from dashboard navigation or create new flag
  useEffect(() => {
    const storedPlanId = localStorage.getItem('selectedPlanId');
    const storedSubjectId = localStorage.getItem('selectedSubjectId');
    const createNew = localStorage.getItem('createNewPlan');
    
    // If createNew flag is set, show wizard
    if (createNew === 'true') {
      setShowWizard(true);
      localStorage.removeItem('createNewPlan');
      // Don't load any plan, just show wizard
      setLoading(false);
      return;
    }
    
    if (storedPlanId) {
      setSelectedPlanId(parseInt(storedPlanId, 10));
      // Clear it after reading
      localStorage.removeItem('selectedPlanId');
    }
    
    if (storedSubjectId) {
      setSelectedSubjectId(parseInt(storedSubjectId, 10));
      // Clear it after reading
      localStorage.removeItem('selectedSubjectId');
    } else {
      // Default to Business Studies if no subject selected
      setSelectedSubjectId(101);
    }
  }, []);
  
  useEffect(() => {
    // Don't load plan if wizard is showing
    if (showWizard) return;
    
    if (user && selectedSubjectId) {
      if (selectedPlanId) {
        // Load specific plan
        loadSpecificPlan(selectedPlanId);
      } else {
        // Load active plan for subject
        loadActivePlan();
      }
    }
  }, [user, selectedSubjectId, selectedPlanId, showWizard]);
  
  // Auto-refresh plan data every 30 seconds to sync with analytics
  useEffect(() => {
    if (!activePlan) return;
    
    const interval = setInterval(() => {
      if (selectedPlanId) {
        loadSpecificPlan(selectedPlanId);
      } else if (selectedSubjectId) {
        loadActivePlan();
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [activePlan, selectedPlanId, selectedSubjectId]);
  
  const loadActivePlan = async () => {
    if (!user?.id || !selectedSubjectId) return;
    
    try {
      setLoading(true);
      // This now automatically syncs with analytics
      const { plan, todayLog: log, error } = await studyPlannerService.getActiveStudyPlanForStudent(
        user.id,
        selectedSubjectId
      );
      
      if (error) {
        console.error('Error loading active plan:', error);
      }
      
      setActivePlan(plan);
      setTodayLog(log);
      
      // If no active plan and not showing wizard, show create button
      if (!plan && !showWizard) {
        // Optionally auto-show wizard or just show CTA
      }
      
    } catch (error) {
      console.error('Error in loadActivePlan:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadSpecificPlan = async (planId: number) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch the specific plan
      const { data: plan, error: planError } = await supabase
        .from('study_plans')
        .select('*')
        .eq('plan_id', planId)
        .eq('user_id', user.id)
        .single();
      
      if (planError) {
        console.error('Error loading specific plan:', planError);
        // Fallback to active plan
        if (selectedSubjectId) {
          await loadActivePlan();
        }
        return;
      }
      
      if (plan) {
        setActivePlan(plan as StudyPlan);
        setSelectedSubjectId(plan.subject_id || 101);
        
        // Get today's log for this plan
        const today = new Date().toISOString().split('T')[0];
        const { data: todayLogData } = await supabase
          .from('study_plan_daily_logs')
          .select('*')
          .eq('plan_id', planId)
          .eq('date', today)
          .single();
        
        setTodayLog(todayLogData);
        
        // Sync with analytics
        if (plan.subject_id) {
          await studyPlannerService.syncDailyLogFromAnalytics(
            planId,
            today,
            user.id,
            plan.subject_id
          );
          
          // Reload today's log after sync
          const { data: syncedLog } = await supabase
            .from('study_plan_daily_logs')
            .select('*')
            .eq('plan_id', planId)
            .eq('date', today)
            .single();
          
          setTodayLog(syncedLog);
        }
      }
      
    } catch (error) {
      console.error('Error in loadSpecificPlan:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Manual refresh function
  const handleRefresh = async () => {
    if (activePlan) {
      // Sync all logs from analytics
      await studyPlannerService.syncAllDailyLogsFromAnalytics(activePlan.plan_id);
      // Reload plan
      await loadActivePlan();
    }
  };
  
  const handleWizardComplete = () => {
    setShowWizard(false);
    loadActivePlan(); // Reload to show new plan
  };
  
  const handleWizardCancel = () => {
    setShowWizard(false);
  };
  
  if (showWizard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Logo size="md" showText={true} />
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowWizard(false)}
              >
                <Home className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </nav>
        <div className="py-8">
          <StudyPlanWizard 
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
          />
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study plan...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size="md" showText={true} />
            </div>
            <div className="flex items-center gap-3">
              {activePlan && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleRefresh}
                  title="Refresh from analytics"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentPage('dashboard')}
              >
                <Home className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Daily Study Load Planner
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Track your daily study progress and stay on target
              </p>
            </div>
            {!activePlan && (
              <Button 
                onClick={() => setShowWizard(true)}
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Study Plan
              </Button>
            )}
          </div>
        </div>
        
        {activePlan ? (
          <div className="space-y-6">
            {/* Create New Button - Show even when plan exists */}
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => setShowWizard(true)}
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Plan
              </Button>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content - Today's Plan */}
              <div className="lg:col-span-2">
                <DailyPlanView 
                  plan={{
                    plan_id: activePlan.plan_id,
                    plan_name: activePlan.plan_name,
                    subject_id: activePlan.subject_id,
                    daily_minutes_required: activePlan.daily_minutes_required,
                    target_date: activePlan.target_date,
                    user_id: activePlan.user_id
                  }} 
                  todayLog={todayLog} 
                />
              </div>
              
              {/* Sidebar - Plan Summary */}
              <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Plan Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Plan Name:</span>
                      <span className="font-medium">{activePlan.plan_name || 'Study Plan'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target Date:</span>
                      <span className="font-medium">
                        {new Date(activePlan.target_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Daily Target:</span>
                      <span className="font-medium">{activePlan.daily_minutes_required} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Study Days/Week:</span>
                      <span className="font-medium">{activePlan.study_days_per_week}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Total Required</span>
                      <span className="text-lg font-bold text-blue-600">
                        {Math.round(activePlan.total_required_minutes / 60)}h
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Study Days</span>
                      <span className="text-lg font-bold text-green-600">
                        {activePlan.total_study_days}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge 
                        variant={activePlan.status === 'active' ? 'default' : 'secondary'}
                      >
                        {activePlan.status}
                      </Badge>
                    </div>
                    {todayLog && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Today's Progress</span>
                          <span className="font-semibold">
                            {todayLog.actual_total_minutes || 0} / {todayLog.planned_minutes || 0} min
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <Badge 
                            variant={
                              todayLog.status === 'done' ? 'default' :
                              todayLog.status === 'partial' ? 'secondary' :
                              'outline'
                            }
                          >
                            {todayLog.status}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
            
            {/* Plan Detail View */}
            <PlanDetailView plan={activePlan} />
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">No Active Study Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-gray-600">
                Create a personalized study plan to track your daily progress and stay on target for your exams.
              </p>
              <div className="flex flex-col items-center gap-4 pt-4">
                <Button 
                  onClick={() => setShowWizard(true)}
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Study Plan
                </Button>
                <p className="text-sm text-gray-500">
                  The planner will calculate your daily study requirements based on your mastery level and target date.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

