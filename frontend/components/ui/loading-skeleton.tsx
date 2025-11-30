/**
 * Loading Skeleton Components
 * 
 * Provides skeleton screens for better perceived performance
 * while data is loading.
 */

import React from 'react';
import { Card, CardContent, CardHeader } from './card';
import { Skeleton } from './skeleton';

/**
 * Dashboard Card Skeleton
 */
export function DashboardCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[180px]" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-8 w-[120px]" />
      </CardContent>
    </Card>
  );
}

/**
 * Analytics Chart Skeleton
 */
export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between h-48">
          {[...Array(7)].map((_, i) => (
            <Skeleton 
              key={i} 
              className="w-12" 
              style={{ height: `${Math.random() * 100 + 50}px` }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-8" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Stats Grid Skeleton
 */
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Topic List Skeleton
 */
export function TopicListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <div 
          key={i}
          className="p-4 border-2 border-gray-200 rounded-xl bg-white"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[70%]" />
              <Skeleton className="h-3 w-[50%]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Question Card Skeleton
 */
export function QuestionCardSkeleton() {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-[150px] bg-white/20" />
          <Skeleton className="h-6 w-20 bg-white/20" />
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[90%]" />
        </div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Activity Feed Skeleton
 */
export function ActivityFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div 
          key={i}
          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-3 w-[40%]" />
            </div>
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 p-4 border-b">
        <div className="flex gap-4">
          {[...Array(cols)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 border-b last:border-b-0">
          <div className="flex gap-4">
            {[...Array(cols)].map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Flashcard Skeleton
 */
export function FlashcardSkeleton() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-12 space-y-6">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-[200px] mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%] mx-auto" />
          <Skeleton className="h-4 w-[85%] mx-auto" />
        </div>
        <div className="flex justify-center gap-3 pt-6">
          <Skeleton className="h-12 w-32 rounded-lg" />
          <Skeleton className="h-12 w-32 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Mock Exam Skeleton
 */
export function MockExamSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-[150px] bg-white/20" />
            <Skeleton className="h-6 w-24 bg-white/20" />
          </div>
        </CardHeader>
      </Card>
      
      {/* Case Study Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[120px]" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[98%]" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[96%]" />
        </CardContent>
      </Card>
      
      {/* Questions Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[100px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Generic List Skeleton
 */
export function ListSkeleton({ 
  count = 5, 
  itemHeight = 16 
}: { 
  count?: number; 
  itemHeight?: number;
}) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} className={`h-${itemHeight} w-full`} />
      ))}
    </div>
  );
}

/**
 * Page Header Skeleton
 */
export function PageHeaderSkeleton() {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Skeleton className="h-8 w-[200px]" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

