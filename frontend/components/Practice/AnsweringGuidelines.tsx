/**
 * Answering Guidelines Component
 * 
 * Dynamic guidelines based on question marks (2, 4, or 6)
 */

import React from 'react';
import { Button } from '../ui/button';
import { HelpCircle, X } from 'lucide-react';

interface AnsweringGuidelinesProps {
  marks: number;
  isOpen: boolean;
  onClose: () => void;
}

export function AnsweringGuidelines({ marks, isOpen, onClose }: AnsweringGuidelinesProps) {
  if (!isOpen) return null;

  const getGuidelinesForMarks = (marks: number) => {
    switch (marks) {
      case 2:
        return {
          title: '2 Mark Question Strategy',
          description: 'Brief, focused answers with key points. Aim for 2-3 sentences (30-50 words).',
          tips: [
            'State the main point or definition clearly',
            'Provide one brief example or explanation',
            'Use business terminology appropriately',
            'Be concise - avoid lengthy explanations',
            'Aim for approximately 1 mark per well-explained point'
          ]
        };
      case 4:
        return {
          title: '4 Mark Question Strategy',
          description: 'Detailed explanation with examples. Aim for 4-6 sentences (70-100 words).',
          tips: [
            'Make 2-4 distinct points addressing the question',
            'Explain each point with relevant business concepts',
            'Provide specific examples to support your points',
            'Use context from the question in your answer',
            'Structure with clear, separate points or short paragraphs',
            'Balance depth with breadth - cover multiple aspects'
          ]
        };
      case 6:
        return {
          title: '6 Mark Question Strategy',
          description: 'Comprehensive analysis with depth. Aim for 8-12 sentences (120-180 words).',
          tips: [
            'Provide a well-structured answer with introduction and development',
            'Make 3-6 detailed points with thorough explanations',
            'Analyze using business theory and apply to the context',
            'Include multiple relevant examples to illustrate points',
            'Discuss different perspectives or factors (advantages/disadvantages)',
            'Use proper paragraphs to organize your answer logically',
            'Conclude by linking back to the question or context provided'
          ]
        };
      default:
        return {
          title: 'General Answering Strategy',
          description: 'Write a comprehensive answer addressing all parts of the question.',
          tips: [
            'Address all parts of the question systematically',
            'Use relevant business terminology and concepts',
            'Provide examples where appropriate',
            'Structure your answer with clear paragraphs',
            'Ensure your answer length matches the marks allocated'
          ]
        };
    }
  };

  const guidelines = getGuidelinesForMarks(marks);

  return (
    <div className="absolute top-full left-0 mt-2 z-50 w-[450px] max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-200/50 p-6 animate-in slide-in-from-top-2 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800 text-lg">
              Answering Guidelines ({marks} marks)
            </h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Strategy Box */}
        <div className="bg-blue-50 p-3 rounded-lg mb-3">
          <p className="text-blue-800 text-sm font-semibold mb-1">{guidelines.title}:</p>
          <p className="text-blue-600 text-xs">{guidelines.description}</p>
        </div>
        
        {/* Guidelines List */}
        <div className="mb-4 space-y-3">
          {guidelines.tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-blue-700 text-sm">{tip}</span>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-300"
          >
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
}

