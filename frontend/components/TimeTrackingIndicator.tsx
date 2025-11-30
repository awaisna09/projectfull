import React from 'react';
import { Clock } from 'lucide-react';

interface TimeTrackingIndicatorProps {
  timeSpent: number;
  savedTimeRef: React.MutableRefObject<number>;
}

export function TimeTrackingIndicator({ timeSpent, savedTimeRef }: TimeTrackingIndicatorProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const unsavedTime = timeSpent - savedTimeRef.current;
  const isSaving = unsavedTime < 5; // Just saved if unsaved time is small

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border-2 border-blue-500 shadow-lg rounded-lg px-4 py-2 flex items-center gap-3">
        <div className="relative">
          <Clock className={`h-5 w-5 ${isSaving ? 'text-green-500' : 'text-blue-500'}`} />
          {!isSaving && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-600">Study Time</p>
          <p className="text-sm font-bold text-gray-900">{formatTime(timeSpent)}</p>
        </div>
        {isSaving ? (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600">Saved</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-orange-600">Tracking...</span>
          </div>
        )}
      </div>
    </div>
  );
}

