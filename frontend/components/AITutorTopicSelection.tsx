import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useApp } from '../App';
import { topicsService } from '../utils/supabase/services';
import { 
  ArrowLeft,
  Brain,
  Bot,
  Sparkles,
  Target,
  BookOpen,
  Zap,
  Lightbulb,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Calculator,
  Atom,
  FlaskConical,
  Building2
} from 'lucide-react';

const palette = {
  violet: '#9B4DFF',
  magenta: '#FF4D91',
  coral: '#FF6C6C',
  lightViolet: 'rgba(155, 77, 255, 0.1)',
  lightMagenta: 'rgba(255, 77, 145, 0.1)',
  lightCoral: 'rgba(255, 108, 108, 0.1)'
};

interface Topic {
  topic_id: number;
  title: string;
  description?: string;
}

const translations = {
  en: {
    lessons: "Lessons",
    backToDashboard: "Back to Dashboard",
    selectTopic: "Select a topic to start your AI-powered learning session",
    businessStudies: "Business Studies",
    startAISession: "Start Learning",
    loadingTopics: "Loading topics...",
    noTopicsFound: "No topics found. Please try again.",
    aiTutorDescription: "Your personal AI tutor is ready to help you master any topic through interactive conversations and personalized explanations.",
    continueToAITutor: "Continue to AI Tutor",
    aiFeatures: "AI Features",
    personalizedLearning: "Personalized Learning",
    interactiveConversations: "Interactive Conversations",
    instantFeedback: "Instant Feedback",
    adaptiveExplanations: "Adaptive Explanations"
  }};
export function AITutorTopicSelection() {
  const { setCurrentPage } = useApp();
  const t = translations.en;
  
  const [selectedSubject, setSelectedSubject] = useState('businessStudies'); // Default to Business Studies
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  // Fetch topics when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      fetchTopics();
    }
  }, [selectedSubject]);

  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      const { data, error } = await topicsService.getTopicsBySubject('businessStudies');
      
      if (error) {
        throw error;
      }
      
      setTopics(data || []);
    } catch (error) {
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    console.log('✅ Topic selected for AI Tutor:', topic);
  };

  const handleStartAISession = () => {
    if (selectedTopic) {
      // Store selected topic in localStorage for the AI Tutor page
      localStorage.setItem('selectedTopic', JSON.stringify(selectedTopic));
      localStorage.setItem('selectedTopicId', selectedTopic.topic_id.toString());
      
      // Redirect to AI Tutor page
      setCurrentPage('ai-tutor');
    }
  };

  const handleBackToDashboard = () => {
    setIsNavigatingBack(true);
    setTimeout(() => {
      setCurrentPage('dashboard');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b shadow-sm backdrop-blur-md" style={{ background: 'linear-gradient(90deg, rgba(155,77,255,0.12), rgba(255,77,145,0.1), rgba(255,108,108,0.1))', borderColor: 'rgba(155,77,255,0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left - Back Button */}
            <Button 
              size="sm"
              onClick={handleBackToDashboard}
              className="rounded-full px-4 py-2 text-white font-medium shadow-md transition-all duration-300 hover:shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${palette.violet}, ${palette.magenta})`,
                opacity: isNavigatingBack ? 0.7 : 1,
                transform: isNavigatingBack ? 'scale(0.95) translateX(-8px)' : 'scale(1) translateX(0)',
                pointerEvents: isNavigatingBack ? 'none' : 'auto'
              }}
              onMouseEnter={(e) => {
                if (!isNavigatingBack) {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${palette.magenta}, ${palette.coral})`;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isNavigatingBack) {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${palette.violet}, ${palette.magenta})`;
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <ArrowLeft 
                className="h-4 w-4 mr-2 transition-transform duration-300 inline-block" 
                style={{ 
                  transform: isNavigatingBack ? 'translateX(-4px) rotate(-45deg)' : 'translateX(0) rotate(0deg)'
                }}
              />
              {t.backToDashboard}
            </Button>

            {/* Center - Lessons Heading */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-3xl font-bold" style={{ color: '#FF7FA3' }}>
                {t.lessons}
              </h1>
            </div>
            
            {/* Right - Start Learning Button */}
            <Button 
              size="lg"
              className={`px-6 py-2 font-semibold shadow-lg transition-all duration-300 rounded-xl ${
                selectedTopic
                  ? 'bg-black hover:opacity-90 text-white hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              onClick={handleStartAISession}
              disabled={!selectedTopic}
            >
              <Brain className="h-5 w-5 mr-2" style={{ color: selectedTopic ? '#FF4D91' : 'inherit' }} />
              {t.startAISession}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-7rem)] overflow-hidden">
        <div className="flex gap-6 h-full">
          {/* Left Panel - Subject Selection */}
          <div className="w-64 flex-shrink-0 h-full">
            <Card className="h-full border-2 border-gray-200 bg-white/90 backdrop-blur-sm flex flex-col overflow-hidden" style={{ borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(255, 77, 145, 0.15), 0 4px 6px -2px rgba(255, 77, 145, 0.1)' }}>
              <CardHeader className="pb-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(155,77,255,0.2)', background: 'linear-gradient(90deg, rgba(155,77,255,0.12), rgba(255,77,145,0.1), rgba(255,108,108,0.1))' }}>
                <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                  <BookOpen className="h-5 w-5" style={{ color: '#9B4DFF' }} />
                  Subjects
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 overflow-y-auto flex-1">
                {/* Mathematics - Disabled */}
                <div className="relative group">
                  <div className="p-3 border-2 border-gray-200 rounded-xl cursor-not-allowed opacity-40 bg-gray-50">
                    <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">Mathematics</span>
                    </div>
                  </div>
                  <div className="absolute top-full mt-2 left-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Coming Soon
                  </div>
                </div>
                
                {/* Physics - Disabled */}
                <div className="relative group">
                  <div className="p-3 border-2 border-gray-200 rounded-xl cursor-not-allowed opacity-40 bg-gray-50">
                    <div className="flex items-center gap-3">
                    <Atom className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">Physics</span>
                    </div>
                  </div>
                  <div className="absolute top-full mt-2 left-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Coming Soon
                  </div>
                </div>
                
                {/* Chemistry - Disabled */}
                <div className="relative group">
                  <div className="p-3 border-2 border-gray-200 rounded-xl cursor-not-allowed opacity-40 bg-gray-50">
                    <div className="flex items-center gap-3">
                    <FlaskConical className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">Chemistry</span>
                    </div>
                  </div>
                  <div className="absolute top-full mt-2 left-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Coming Soon
                  </div>
                </div>
                
                {/* Business Studies - Active */}
                <div 
                  className={`p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedSubject === 'businessStudies' 
                      ? 'border-[#9B4DFF] bg-gradient-to-br from-[#9B4DFF]/10 via-[#FF4D91]/10 to-[#FF6C6C]/10 shadow-md'
                      : 'border-gray-200 hover:border-[#9B4DFF]/50 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedSubject('businessStudies')}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className={`h-5 w-5 ${
                      selectedSubject === 'businessStudies' ? 'text-[#9B4DFF]' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      selectedSubject === 'businessStudies' ? 'text-[#9B4DFF]' : 'text-gray-700'
                    }`}>
                      Business Studies
                    </span>
                  </div>
                  {selectedSubject === 'businessStudies' && (
                    <div className="mt-2 ml-8">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#9B4DFF' }}></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Topic Selection */}
          <div className="flex-1 h-full">
            <Card className="h-full border-2 border-gray-200 bg-white/90 backdrop-blur-sm flex flex-col overflow-hidden" style={{ borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(255, 77, 145, 0.15), 0 4px 6px -2px rgba(255, 77, 145, 0.1)' }}>
              <CardHeader className="pb-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(155,77,255,0.2)', background: 'linear-gradient(90deg, rgba(155,77,255,0.12), rgba(255,77,145,0.1), rgba(255,108,108,0.1))' }}>
                <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                  <Brain className="h-5 w-5" style={{ color: '#9B4DFF' }} />
                  Select Your Topic
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto bg-white">
                {loadingTopics ? (
                  <div className="flex items-center justify-center py-20 text-gray-500">
                    <RefreshCw className="h-6 w-6 animate-spin mr-3" />
                    <span className="text-lg">Loading topics...</span>
                  </div>
                ) : topics.length > 0 ? (
                  <div className="space-y-2">
                    {topics.map((topic, index) => (
                      <button
                        key={topic.topic_id}
                        onClick={() => handleTopicSelect(topic)}
                        className={`group w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedTopic?.topic_id === topic.topic_id
                            ? 'border-[#9B4DFF] shadow-md bg-gradient-to-r from-[#9B4DFF]/5 via-[#FF4D91]/5 to-[#FF6C6C]/5'
                            : 'border-gray-200 hover:border-[#9B4DFF]/50 bg-white hover:bg-gradient-to-r hover:from-[#9B4DFF]/5 hover:via-[#FF4D91]/5 hover:to-[#FF6C6C]/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                            selectedTopic?.topic_id === topic.topic_id
                              ? 'bg-gradient-to-br from-[#9B4DFF] via-[#FF4D91] to-[#FF6C6C] text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 group-hover:bg-gradient-to-br group-hover:from-[#9B4DFF]/20 group-hover:via-[#FF4D91]/20 group-hover:to-[#FF6C6C]/20'
                          }`}>
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-sm font-semibold transition-colors ${
                              selectedTopic?.topic_id === topic.topic_id
                                ? 'text-[#9B4DFF]'
                                : 'text-gray-700 group-hover:text-[#9B4DFF]'
                            }`}>
                              {topic.title}
                            </h3>
                          </div>
                          {selectedTopic?.topic_id === topic.topic_id && (
                            <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#9B4DFF' }} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Brain className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-center">No topics available for this subject</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
