/**
 * Dashboard Header Component
 * 
 * Extracted from StudentDashboard.tsx for better modularity
 */

import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LogOut, User as UserIcon } from 'lucide-react';

interface DashboardHeaderProps {
  userName: string;
  userEmail: string;
  bufferStatus?: {
    totalSeconds: number;
    bufferHealth: 'good' | 'warning' | 'critical';
  };
  onLogout: () => void;
}

export function DashboardHeader({ 
  userName, 
  userEmail, 
  bufferStatus,
  onLogout 
}: DashboardHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Welcome message */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Welcome back, {userName}!
              </h1>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
          </div>

          {/* Center: Buffer status indicator */}
          {bufferStatus && bufferStatus.totalSeconds > 0 && (
            <div className="hidden md:flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                bufferStatus.bufferHealth === 'good' ? 'bg-green-500' :
                bufferStatus.bufferHealth === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-xs text-gray-600">
                {bufferStatus.totalSeconds}s buffered • Syncing...
              </span>
            </div>
          )}

          {/* Right: Logout button */}
          <Button
            variant="outline"
            onClick={onLogout}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

