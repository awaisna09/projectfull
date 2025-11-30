/**
 * Performance Metrics Component
 * 
 * Displays key performance indicators with safe number formatting
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface PerformanceMetricsProps {
  accuracy: number;
  questionsAttempted: number;
  questionsCorrect: number;
  improvementRate: number;
  timeSpent: number;
  isLoading?: boolean;
}

export function PerformanceMetrics({
  accuracy,
  questionsAttempted,
  questionsCorrect,
  improvementRate,
  timeSpent,
  isLoading = false
}: PerformanceMetricsProps) {
  const safeNumber = (value: number | null | undefined, decimals = 0): number => {
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
      return 0;
    }
    return Number(value.toFixed(decimals));
  };

  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return 'text-green-600';
    if (acc >= 60) return 'text-blue-600';
    if (acc >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImprovementIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rate < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[180px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const safeAccuracy = safeNumber(accuracy, 1);
  const safeImprovement = safeNumber(improvementRate, 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Accuracy */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Overall Accuracy</span>
            <span className={`text-2xl font-bold ${getAccuracyColor(safeAccuracy)}`}>
              {safeAccuracy}%
            </span>
          </div>
          <Progress value={safeAccuracy} className="h-3" />
          <p className="text-xs text-gray-500">
            {questionsCorrect} correct out of {questionsAttempted} attempted
          </p>
        </div>

        {/* Improvement Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Improvement Rate</span>
            <div className="flex items-center gap-1">
              {getImprovementIcon(safeImprovement)}
              <span className={`text-lg font-bold ${
                safeImprovement > 0 ? 'text-green-600' :
                safeImprovement < 0 ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {safeImprovement > 0 ? '+' : ''}{safeImprovement}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {safeImprovement > 0 ? 'Great progress! Keep it up!' :
             safeImprovement < 0 ? 'Review weak areas to improve' :
             'Consistent performance'}
          </p>
        </div>

        {/* Time Spent */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Study Time Today</span>
            <span className="text-lg font-bold text-blue-600">
              {Math.floor(timeSpent / 60)} min
            </span>
          </div>
          <Progress value={Math.min((timeSpent / 3600) * 100, 100)} className="h-3" />
          <p className="text-xs text-gray-500">
            Daily goal: 60 minutes
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

