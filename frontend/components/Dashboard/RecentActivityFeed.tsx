/**
 * Recent Activity Feed Component
 * 
 * Displays recent learning activities with routing
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, Brain, Target, Zap, BookOpen, FileText, Video, ArrowRight } from 'lucide-react';
import { ActivityFeedSkeleton } from '../ui/loading-skeleton';

export interface Activity {
  id: string;
  type: string;
  page?: string;
  pageKey?: string;
  pageName: string;
  description: string;
  timestamp: string;
  timestampRaw: string;
  score?: number;
  duration?: number;
}

interface RecentActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
  onNavigate: (page: string) => void;
}

export function RecentActivityFeed({ 
  activities, 
  isLoading = false,
  onNavigate 
}: RecentActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ai-tutor':
      case 'lesson':
        return Brain;
      case 'practice':
      case 'question':
        return Target;
      case 'flashcards':
      case 'flashcard':
        return Zap;
      case 'visual-learning':
      case 'video':
        return Video;
      case 'mock-exam-p1':
      case 'mock-exam-p2':
      case 'mock_exam':
        return FileText;
      default:
        return BookOpen;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'ai-tutor':
      case 'lesson':
        return 'from-blue-500 to-purple-500';
      case 'practice':
      case 'question':
        return 'from-orange-500 to-red-500';
      case 'flashcards':
      case 'flashcard':
        return 'from-purple-500 to-pink-500';
      case 'visual-learning':
      case 'video':
        return 'from-cyan-500 to-blue-500';
      case 'mock-exam-p1':
      case 'mock-exam-p2':
      case 'mock_exam':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    return activityTime.toLocaleDateString();
  };

  const getPageRoute = (activity: Activity) => {
    if (activity.pageKey) return activity.pageKey;
    if (activity.page) return activity.page;
    if (activity.type === 'page_visit') return activity.page || 'dashboard';
    
    const typeToPage: Record<string, string> = {
      'ai-tutor': 'ai-tutor-topic-selection',
      'practice': 'practice',
      'flashcards': 'flashcard-selection',
      'visual-learning': 'visual-learning',
      'mock-exam-p1': 'mock-exam-selection',
      'mock-exam-p2': 'mock-exam-selection',
      'lesson': 'ai-tutor-topic-selection',
      'question': 'practice',
      'flashcard': 'flashcard-selection',
      'video': 'visual-learning',
      'mock_exam': 'mock-exam-selection',
    };
    
    return typeToPage[activity.type] || 'dashboard';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Learning Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeedSkeleton count={5} />
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Learning Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No recent activities. Start learning to see your activity here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Learning Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.slice(0, 10).map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <div
                key={activity.id}
                className={`p-4 rounded-lg border border-gray-200 bg-gradient-to-r ${colorClass} bg-opacity-5 hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {activity.pageName}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestampRaw || activity.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {activity.score !== undefined && (
                      <Badge className={`
                        ${activity.score >= 80 ? 'bg-green-100 text-green-800' :
                          activity.score >= 60 ? 'bg-blue-100 text-blue-800' :
                          activity.score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}
                      `}>
                        {activity.score}%
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onNavigate(getPageRoute(activity))}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

