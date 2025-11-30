/**
 * Grading Results Component
 * 
 * Displays AI grading feedback with scores, strengths, and improvements
 */

import React from 'react';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, MessageCircle, Zap } from 'lucide-react';

interface GradingResult {
  overall_score: number;
  percentage: number;
  grade: string;
  strengths?: string[];
  areas_for_improvement?: string[];
  specific_feedback?: string;
  suggestions?: string[];
}

interface GradingResultsProps {
  result: GradingResult;
}

export function GradingResults({ result }: GradingResultsProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200/50 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="h-5 w-5 text-blue-600" />
        <h4 className="font-semibold text-blue-800 text-lg">AI Grading Results</h4>
      </div>
      
      {/* Score and Grade */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/50 p-4 rounded-xl text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {result.overall_score}/50
          </div>
          <div className="text-sm text-blue-500 font-medium">Score</div>
        </div>
        <div className="bg-white/50 p-4 rounded-xl text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {result.percentage}%
          </div>
          <div className="text-sm text-blue-500 font-medium">Percentage</div>
        </div>
      </div>
      
      {/* Grade Badge */}
      <div className="text-center mb-6">
        <Badge className={`text-xl px-6 py-3 rounded-xl font-bold shadow-lg ${
          result.grade === 'A' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' :
          result.grade === 'B' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200' :
          result.grade === 'C' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200' :
          result.grade === 'D' ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200' :
          'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200'
        }`}>
          Grade: {result.grade}
        </Badge>
      </div>

      {/* Strengths */}
      {result.strengths && result.strengths.length > 0 && (
        <div className="mb-6 bg-green-50/50 p-4 rounded-xl border border-green-200/50">
          <h5 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Strengths
          </h5>
          <ul className="space-y-2">
            {result.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-green-600 leading-relaxed">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {result.areas_for_improvement && result.areas_for_improvement.length > 0 && (
        <div className="mb-6 bg-orange-50/50 p-4 rounded-xl border border-orange-200/50">
          <h5 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Areas for Improvement
          </h5>
          <ul className="space-y-2">
            {result.areas_for_improvement.map((area, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-orange-600 leading-relaxed">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Specific Feedback */}
      {result.specific_feedback && (
        <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-200/50">
          <h5 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Specific Feedback
          </h5>
          <p className="text-sm text-blue-600 leading-relaxed">{result.specific_feedback}</p>
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions && result.suggestions.length > 0 && (
        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200/50">
          <h5 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Suggestions for Improvement
          </h5>
          <ul className="space-y-2">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-purple-600 leading-relaxed">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

