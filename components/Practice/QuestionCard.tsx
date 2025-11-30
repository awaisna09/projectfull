/**
 * Question Card Component
 * 
 * Displays a practice question with context, hints, and metadata
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Lightbulb, X, CheckCircle } from 'lucide-react';

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  context?: string;
  difficulty?: string;
  marks?: number;
  skill?: string;
  hint?: string;
  showHint: boolean;
  onToggleHint: () => void;
  explanation?: string;
  showExplanation: boolean;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  context,
  difficulty = 'medium',
  marks,
  skill,
  hint,
  showHint,
  onToggleHint,
  explanation,
  showExplanation
}: QuestionCardProps) {
  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg px-1 py-0.5">
              {questionNumber}
            </div>
            <span className="text-xl font-semibold">Question {questionNumber}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm font-medium">
              {difficulty}
            </Badge>
            {marks && (
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm font-medium">
                {marks} marks
              </Badge>
            )}
            {skill && (
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm font-medium">
                {skill}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8 p-8">
        {/* Context Section */}
        {context && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200/50 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h4 className="font-semibold text-blue-800 text-lg">Context</h4>
            </div>
            <p className="text-blue-700 leading-relaxed">{context}</p>
          </div>
        )}

        {/* Question */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 rounded-2xl border border-gray-200/50 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
              Q
            </div>
            <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {question}
            </h3>
          </div>
        </div>

        {/* Hint Section */}
        {hint && showHint && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-2xl border border-yellow-200/50 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-800 text-lg">Hint</h4>
            </div>
            <p className="text-yellow-700 leading-relaxed">{hint}</p>
          </div>
        )}

        {/* Explanation Section */}
        {showExplanation && explanation && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200/50 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-800 text-lg">Explanation</h4>
            </div>
            <p className="text-green-700 leading-relaxed">{explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

