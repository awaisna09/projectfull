/**
 * Study Streak Card Component
 * 
 * Displays user's current study streak with visual indicators
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Flame, TrendingUp } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface StudyStreakCardProps {
  currentStreak: number;
  longestStreak?: number;
  isLoading?: boolean;
}

export function StudyStreakCard({ 
  currentStreak, 
  longestStreak = 0,
  isLoading = false 
}: StudyStreakCardProps) {
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'from-orange-500 to-red-500';
    if (streak >= 14) return 'from-yellow-500 to-orange-500';
    if (streak >= 7) return 'from-blue-500 to-purple-500';
    return 'from-gray-400 to-gray-500';
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your streak today!';
    if (streak === 1) return 'Great start!';
    if (streak < 7) return 'Keep it going!';
    if (streak < 14) return 'One week streak!';
    if (streak < 30) return 'Amazing consistency!';
    return 'Legendary streak!';
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <Skeleton className="h-6 w-[120px]" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-4 w-[80%]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Flame className="h-5 w-5 text-orange-500" />
          Study Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Streak */}
          <div className="flex items-baseline gap-2">
            <div className={`text-5xl font-bold bg-gradient-to-r ${getStreakColor(currentStreak)} bg-clip-text text-transparent`}>
              {currentStreak}
            </div>
            <div className="text-gray-600 text-lg">
              {currentStreak === 1 ? 'day' : 'days'}
            </div>
          </div>

          {/* Streak Message */}
          <p className="text-sm text-orange-700 font-medium">
            {getStreakMessage(currentStreak)}
          </p>

          {/* Longest Streak Badge */}
          {longestStreak > 0 && longestStreak !== currentStreak && (
            <div className="flex items-center gap-2 pt-2 border-t border-orange-200">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-xs text-orange-600">
                Personal best: {longestStreak} days
              </span>
            </div>
          )}

          {/* Milestone Indicator */}
          {currentStreak > 0 && (
            <div className="pt-2">
              <div className="flex justify-between text-xs text-orange-600 mb-1">
                <span>Next milestone</span>
                <span>
                  {currentStreak < 7 ? '7 days' :
                   currentStreak < 14 ? '14 days' :
                   currentStreak < 30 ? '30 days' :
                   currentStreak < 60 ? '60 days' :
                   '100 days'}
                </span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${
                      currentStreak < 7 ? (currentStreak / 7) * 100 :
                      currentStreak < 14 ? ((currentStreak - 7) / 7) * 100 :
                      currentStreak < 30 ? ((currentStreak - 14) / 16) * 100 :
                      currentStreak < 60 ? ((currentStreak - 30) / 30) * 100 :
                      ((currentStreak - 60) / 40) * 100
                    }%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

