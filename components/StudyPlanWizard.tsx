import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ArrowLeft, 
  ArrowRight,
  Calendar,
  Clock,
  BookOpen,
  Target,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { studyPlannerService, CreateStudyPlanInput } from '../utils/supabase/study-planner-service';
import { topicsService } from '../utils/supabase/services';
import { supabase } from '../utils/supabase/client';
import { cn } from './ui/utils';

interface StudyPlanWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function StudyPlanWizard({ onComplete, onCancel }: StudyPlanWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1: Subject selection
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<Array<{ subject_id: number; subject_name: string }>>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  
  // Step 2: Unit selection
  const [availableTopics, setAvailableTopics] = useState<Array<{ topic_id: number; title: string }>>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  
  // Step 3: Timeline and Availability
  const [targetDate, setTargetDate] = useState('');
  const [studyDaysPerWeek, setStudyDaysPerWeek] = useState(7);
  const [maxDailyMinutes, setMaxDailyMinutes] = useState<number | undefined>(undefined);
  
  // Step 4: Plan Preview
  const [previewData, setPreviewData] = useState<{
    totalRequiredMinutes: number;
    totalStudyDays: number;
    dailyMinutesRequired: number;
    warning?: string;
  } | null>(null);
  
  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);
  
  // Fetch topics when subject changes
  useEffect(() => {
    if (selectedSubjectId) {
      fetchTopics(selectedSubjectId);
      setSelectedTopicIds([]); // Reset selection
    }
  }, [selectedSubjectId]);
  
  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      console.log('📚 Fetching subjects from database...');
      
      // Check authentication first
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Session status:', session ? 'Authenticated' : 'Not authenticated');
      
      const { data, error } = await supabase
        .from('subjects')
        .select('subject_id, subject_name')
        .order('subject_name');
      
      if (error) {
        console.error('❌ Error fetching subjects:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // If it's an RLS/permission error, try without auth or use fallback
        if (error.message?.includes('permission') || error.message?.includes('RLS') || error.code === 'PGRST301') {
          console.warn('⚠️ RLS/permission issue detected, using fallback subjects');
          throw new Error('RLS_BLOCKED');
        }
        throw error;
      }
      
      console.log('✅ Subjects fetched successfully:', data);
      console.log('📊 Number of subjects:', data?.length || 0);
      
      if (data && data.length > 0) {
        // Map subject_id if needed (in case database has 1,2,3 but we need 101,102,103)
        const mappedSubjects = data.map(subject => {
          // If subject_id is 1, map to 101 (Business Studies)
          // This handles the case where database has old IDs
          if (subject.subject_id === 1) {
            return { subject_id: 101, subject_name: subject.subject_name };
          }
          return subject;
        });
        setAvailableSubjects(mappedSubjects);
      } else {
        // Fallback: Use default subjects if table is empty
        console.warn('⚠️ No subjects found in database, using fallback subjects');
        setAvailableSubjects([
          { subject_id: 101, subject_name: 'Business Studies' },
          { subject_id: 102, subject_name: 'Mathematics' },
          { subject_id: 103, subject_name: 'Physics' },
          { subject_id: 104, subject_name: 'Chemistry' }
        ]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching subjects, using fallback:', error);
      // Fallback subjects based on constants
      setAvailableSubjects([
        { subject_id: 101, subject_name: 'Business Studies' },
        { subject_id: 102, subject_name: 'Mathematics' },
        { subject_id: 103, subject_name: 'Physics' },
        { subject_id: 104, subject_name: 'Chemistry' }
      ]);
    } finally {
      setLoadingSubjects(false);
    }
  };
  
  const fetchTopics = async (subjectId: number) => {
    try {
      // Map subject_id to subject string for topicsService
      // Using actual subject IDs from constants (101, 102, etc.)
      const subjectMap: Record<number, string> = {
        101: 'businessStudies',
        102: 'mathematics',
        103: 'physics',
        104: 'chemistry'
      };
      
      const subjectString = subjectMap[subjectId] || 'businessStudies';
      const { data, error } = await topicsService.getTopicsBySubject(subjectString);
      if (error) throw error;
      
      // Transform data to match expected format
      const topics = (data || []).map((item: any) => ({
        topic_id: item.topic_id || item.id,
        title: item.topic || item.title || 'Unknown Topic'
      }));
      
      setAvailableTopics(topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setAvailableTopics([]);
    }
  };
  
  const handleNext = async () => {
    // Validate current step
    if (currentStep === 1 && !selectedSubjectId) {
      setError('Please select a subject');
      return;
    }
    
    if (currentStep === 2 && selectedTopicIds.length === 0) {
      setError('Please select at least one unit/topic');
      return;
    }
    
    if (currentStep === 3) {
      if (!targetDate) {
        setError('Please select a target date');
        return;
      }
      const date = new Date(targetDate);
      if (date <= new Date()) {
        setError('Target date must be in the future');
        return;
      }
      if (!maxDailyMinutes || maxDailyMinutes < 15) {
        setError('Please enter a realistic daily study time (minimum 15 minutes)');
        return;
      }
      // Calculate preview before moving to step 4
      await calculatePreview();
    }
    
    if (currentStep === 4) {
      // Step 4 is preview - validation already done, just proceed to submit
    }
    
    if (currentStep < 4) {
      setError('');
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handlePrevious = () => {
    setError('');
    setCurrentStep(prev => Math.max(1, prev - 1));
  };
  
  const calculatePreview = async () => {
    if (!selectedSubjectId || selectedTopicIds.length === 0 || !targetDate || !maxDailyMinutes) {
      console.error('Missing required data for preview:', {
        selectedSubjectId,
        selectedTopicIds: selectedTopicIds.length,
        targetDate,
        maxDailyMinutes
      });
      setError('Please complete all fields before proceeding');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      console.log('📊 Calculating preview with:', {
        subjectId: selectedSubjectId,
        topicIds: selectedTopicIds,
        targetDate,
        studyDaysPerWeek,
        maxDailyMinutes
      });
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Not authenticated');
      }
      
      // Use the actual service to calculate - we'll create a temporary plan
      const input: CreateStudyPlanInput = {
        studentId: session.user.id,
        subjectId: selectedSubjectId,
        targetDate: targetDate,
        studyDaysPerWeek: studyDaysPerWeek,
        maxDailyMinutes: maxDailyMinutes,
        unitIds: selectedTopicIds,
        planName: `Study Plan for ${availableSubjects.find(s => s.subject_id === selectedSubjectId)?.subject_name}`
      };
      
      console.log('📝 Calling studyPlannerService.createStudyPlan...');
      
      // Call the service to get accurate calculations
      const { data: plan, error: planError } = await studyPlannerService.createStudyPlan(input);
      
      if (planError) {
        console.warn('⚠️ Service error, using fallback calculation:', planError);
        // If creation fails, estimate based on typical values
        const estimatedMinutesPerUnit = 180; // Average
        const totalRequired = selectedTopicIds.length * estimatedMinutesPerUnit;
        
        const today = new Date();
        const target = new Date(targetDate);
        const totalDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const effectiveStudyDays = Math.round(totalDays * (studyDaysPerWeek / 7.0));
        const dailyRequired = Math.ceil(totalRequired / Math.max(1, effectiveStudyDays));
        
        const warning = maxDailyMinutes && dailyRequired > maxDailyMinutes
          ? `To reach your goal by this date, you actually need about ${dailyRequired} minutes per study day, which is more than the ${maxDailyMinutes} minutes you set. You can either accept this higher target or change your target date.`
          : undefined;
        
        console.log('✅ Fallback preview calculated:', {
          totalRequired,
          effectiveStudyDays,
          dailyRequired
        });
        
        setPreviewData({
          totalRequiredMinutes: totalRequired,
          totalStudyDays: effectiveStudyDays,
          dailyMinutesRequired: dailyRequired,
          warning
        });
      } else if (plan) {
        console.log('✅ Preview calculated from service:', plan);
        // Use actual calculated values
        const warning = maxDailyMinutes && plan.daily_minutes_required > maxDailyMinutes
          ? `To reach your goal by this date, you actually need about ${plan.daily_minutes_required} minutes per study day, which is more than the ${maxDailyMinutes} minutes you set. You can either accept this higher target or change your target date.`
          : undefined;
        
        setPreviewData({
          totalRequiredMinutes: plan.total_required_minutes,
          totalStudyDays: plan.total_study_days,
          dailyMinutesRequired: plan.daily_minutes_required,
          warning
        });
        
        // Delete the temporary plan - we'll create it again on submit
        // This is a bit inefficient but ensures accurate preview
        if (plan.plan_id) {
          console.log('🗑️ Deleting temporary plan:', plan.plan_id);
          const { error: deleteError } = await supabase.from('study_plans').delete().eq('plan_id', plan.plan_id);
          if (deleteError) {
            console.warn('⚠️ Error deleting temporary plan:', deleteError);
          }
        }
      } else {
        throw new Error('No plan data returned from service');
      }
      
    } catch (error) {
      console.error('❌ Error calculating preview:', error);
      setError(`Error calculating plan preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Still show a basic preview with estimates
      const estimatedMinutesPerUnit = 180;
      const totalRequired = selectedTopicIds.length * estimatedMinutesPerUnit;
      const today = new Date();
      const target = new Date(targetDate);
      const totalDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const effectiveStudyDays = Math.round(totalDays * (studyDaysPerWeek / 7.0));
      const dailyRequired = Math.ceil(totalRequired / Math.max(1, effectiveStudyDays));
      
      setPreviewData({
        totalRequiredMinutes: totalRequired,
        totalStudyDays: effectiveStudyDays,
        dailyMinutesRequired: dailyRequired,
        warning: undefined
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!selectedSubjectId || selectedTopicIds.length === 0 || !targetDate || !maxDailyMinutes || !previewData) {
      setError('Please complete all steps');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Not authenticated');
      }
      
      const input: CreateStudyPlanInput = {
        studentId: session.user.id,
        subjectId: selectedSubjectId,
        targetDate: targetDate,
        studyDaysPerWeek: studyDaysPerWeek,
        maxDailyMinutes: maxDailyMinutes,
        unitIds: selectedTopicIds,
        planName: `Study Plan - ${availableSubjects.find(s => s.subject_id === selectedSubjectId)?.subject_name}`
      };
      
      const { data: plan, error: planError } = await studyPlannerService.createStudyPlan(input);
      
      if (planError) {
        throw planError;
      }
      
      if (!plan) {
        throw new Error('Failed to create study plan');
      }
      
      onComplete();
      
    } catch (error) {
      console.error('Error creating study plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to create study plan');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleTopic = (topicId: number) => {
    setSelectedTopicIds(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Step {currentStep} of 4</span>
          <span>{Math.round((currentStep / 4) * 100)}%</span>
        </div>
        <Progress value={(currentStep / 4) * 100} className="h-2" />
      </div>
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Step 1: Subject Selection */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Select Subject
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Choose the subject you want to create a study plan for
            </p>
            {loadingSubjects ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading subjects...</p>
              </div>
            ) : availableSubjects.length === 0 ? (
              <div className="text-center py-8">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No subjects found. Please ensure the subjects table has data.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableSubjects.map(subject => (
                  <Button
                    key={subject.subject_id}
                    variant={selectedSubjectId === subject.subject_id ? "default" : "outline"}
                    className="h-auto py-4 flex flex-col items-start"
                    onClick={() => setSelectedSubjectId(subject.subject_id)}
                  >
                    <span className="font-semibold">{subject.subject_name}</span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Step 2: Unit Selection */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Select Units/Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Select the units or topics you want to cover in this study plan
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {availableTopics.map(topic => (
                <div
                  key={topic.topic_id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedTopicIds.includes(topic.topic_id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => toggleTopic(topic.topic_id)}
                >
                  <Checkbox
                    checked={selectedTopicIds.includes(topic.topic_id)}
                    onCheckedChange={() => toggleTopic(topic.topic_id)}
                  />
                  <Label className="cursor-pointer flex-1">{topic.title}</Label>
                </div>
              ))}
            </div>
            {selectedTopicIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTopicIds.map(id => {
                  const topic = availableTopics.find(t => t.topic_id === id);
                  return (
                    <Badge key={id} variant="secondary">
                      {topic?.title}
                    </Badge>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Step 3: Timeline and Availability */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline & Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="targetDate">Prepared By Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500">
                When do you need to be prepared? (Usually your exam date)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studyDays">Study Days Per Week</Label>
              <select
                id="studyDays"
                value={studyDaysPerWeek}
                onChange={(e) => setStudyDaysPerWeek(Number(e.target.value))}
                className="w-full h-10 px-3 border border-gray-300 rounded-md"
              >
                <option value={7}>7 days (Every day)</option>
                <option value={6}>6 days</option>
                <option value={5}>5 days (Weekdays)</option>
                <option value={4}>4 days</option>
                <option value={3}>3 days</option>
              </select>
              <p className="text-xs text-gray-500">
                How many days per week can you study?
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxMinutes">Maximum Daily Minutes</Label>
              <Input
                id="maxMinutes"
                type="number"
                min={15}
                max={480}
                value={maxDailyMinutes || ''}
                onChange={(e) => setMaxDailyMinutes(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g., 30, 45, 60"
              />
              <p className="text-xs text-gray-500">
                Realistic maximum minutes you can study per day (15-480 minutes)
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[30, 45, 60, 90, 120].map(minutes => (
                <Button
                  key={minutes}
                  variant={maxDailyMinutes === minutes ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMaxDailyMinutes(minutes)}
                >
                  {minutes} min
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 4: Plan Preview */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Plan Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Calculating your study plan...</p>
              </div>
            ) : !previewData ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Unable to calculate preview. Please go back and ensure all fields are filled correctly.
                  </AlertDescription>
                </Alert>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Required information:</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Subject selected: {selectedSubjectId ? '✅' : '❌'}</li>
                    <li>Topics selected: {selectedTopicIds.length > 0 ? `✅ (${selectedTopicIds.length})` : '❌'}</li>
                    <li>Target date: {targetDate ? '✅' : '❌'}</li>
                    <li>Max daily minutes: {maxDailyMinutes ? `✅ (${maxDailyMinutes})` : '❌'}</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                {previewData.warning && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{previewData.warning}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(previewData.totalRequiredMinutes / 60)}h
                    </div>
                    <div className="text-sm text-gray-600">Total Required</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {previewData.totalStudyDays}
                    </div>
                    <div className="text-sm text-gray-600">Study Days</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {previewData.dailyMinutesRequired}
                    </div>
                    <div className="text-sm text-gray-600">Minutes/Day</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Questions (50%)</span>
                    <span className="font-semibold">{Math.round(previewData.dailyMinutesRequired * 0.5)} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Lessons (30%)</span>
                    <span className="font-semibold">{Math.round(previewData.dailyMinutesRequired * 0.3)} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Flashcards (20%)</span>
                    <span className="font-semibold">{Math.round(previewData.dailyMinutesRequired * 0.2)} min</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>
        
        {currentStep < 4 ? (
          <Button onClick={handleNext} disabled={loading}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading || !previewData}>
            {loading ? 'Creating...' : 'Confirm & Create Plan'}
            <CheckCircle2 className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

