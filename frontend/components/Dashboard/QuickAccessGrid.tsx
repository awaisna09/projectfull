/**
 * Quick Access Grid Component
 * 
 * Grid of quick access buttons for main learning features
 */

import React from 'react';
import { Button } from '../ui/button';
import { 
  Brain, 
  Target, 
  Zap, 
  BookOpen, 
  FileText,
  Video,
  BarChart3 
} from 'lucide-react';

export type PageType = 'ai-tutor-topic-selection' | 'mock-exam-selection' | 'practice' | 'flashcard-selection' | 'visual-learning' | 'study-plan' | 'analytics';

interface QuickAccessGridProps {
  onNavigate: (page: PageType) => void;
}

interface QuickAccessButton {
  id: PageType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  hoverGradient: string;
  iconColor: string;
}

const quickAccessButtons: QuickAccessButton[] = [
  {
    id: 'ai-tutor-topic-selection',
    title: 'AI Tutor',
    description: 'Interactive lessons',
    icon: Brain,
    gradient: 'from-blue-500 to-purple-500',
    hoverGradient: 'from-blue-600 to-purple-600',
    iconColor: 'text-blue-100',
  },
  {
    id: 'mock-exam-selection',
    title: 'Mock Exams',
    description: 'Practice papers',
    icon: FileText,
    gradient: 'from-green-500 to-emerald-500',
    hoverGradient: 'from-green-600 to-emerald-600',
    iconColor: 'text-green-100',
  },
  {
    id: 'practice',
    title: 'Practice',
    description: 'Exam-style questions',
    icon: Target,
    gradient: 'from-orange-500 to-red-500',
    hoverGradient: 'from-orange-600 to-red-600',
    iconColor: 'text-orange-100',
  },
  {
    id: 'flashcard-selection',
    title: 'Flashcards',
    description: 'Quick revision',
    icon: Zap,
    gradient: 'from-purple-500 to-pink-500',
    hoverGradient: 'from-purple-600 to-pink-600',
    iconColor: 'text-purple-100',
  },
  {
    id: 'visual-learning',
    title: 'Visual Learning',
    description: 'Video lessons',
    icon: Video,
    gradient: 'from-cyan-500 to-blue-500',
    hoverGradient: 'from-cyan-600 to-blue-600',
    iconColor: 'text-cyan-100',
  },
  {
    id: 'study-plan',
    title: 'Study Planner',
    description: 'Plan your studies',
    icon: BookOpen,
    gradient: 'from-indigo-500 to-purple-500',
    hoverGradient: 'from-indigo-600 to-purple-600',
    iconColor: 'text-indigo-100',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Track progress',
    icon: BarChart3,
    gradient: 'from-pink-500 to-rose-500',
    hoverGradient: 'from-pink-600 to-rose-600',
    iconColor: 'text-pink-100',
  },
];

export function QuickAccessGrid({ onNavigate }: QuickAccessGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {quickAccessButtons.map((button) => {
        const Icon = button.icon;
        
        return (
          <Button
            key={button.id}
            onClick={() => onNavigate(button.id)}
            className={`h-auto p-6 flex flex-col items-center gap-3 bg-gradient-to-br ${button.gradient} hover:${button.hoverGradient} text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0`}
          >
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Icon className={`h-7 w-7 ${button.iconColor}`} />
            </div>
            <div className="text-center">
              <div className="font-semibold text-base mb-1">{button.title}</div>
              <div className="text-xs opacity-90">{button.description}</div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}

