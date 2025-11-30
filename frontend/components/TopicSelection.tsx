import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useApp } from '../App';
import { topicsService } from '../utils/supabase/services';
import { 
  ArrowLeft,
  BookOpen,
  Target,
  Brain,
  Building2,
  ArrowRight,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

interface Topic {
  topic_id: number;
  title: string;
  description?: string;
}

const translations = {
  en: {
    topicSelection: "Choose Your Topic",
    backToDashboard: "Back to Dashboard",
    selectTopic: "Select a topic to start learning",
    businessStudies: "Business Studies",
    startLearning: "Start Learning",
    loadingTopics: "Loading topics...",
    debugTopics: "Debug Topic Fetching",
    noTopicsFound: "No topics found. Please try again.",
    topicDescription: "Select a topic to access interactive lessons, AI tutor sessions, and comprehensive learning materials.",
    continueToLessons: "Continue to Lessons"
  }};
export function TopicSelection() {
  const {setCurrentPage} = useApp();
  const t = translations.en;
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [learningMode, setLearningMode] = useState<string>('ai-tutor');

  useEffect(() => {
    // Detect learning mode from localStorage
    const mode = localStorage.getItem('learningMode') || 'ai-tutor';
    setLearningMode(mode);
    fetchTopics();
  }, []);

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
    console.log('✅ Topic selected:', topic);
  };

  const handleStartLearning = () => {
    if (selectedTopic) {
      // Store selected topic in localStorage for the next page
      localStorage.setItem('selectedTopic', JSON.stringify(selectedTopic));
      localStorage.setItem('selectedTopicId', selectedTopic.topic_id.toString());
      
      // Redirect to appropriate page based on learning mode
      if (learningMode === 'ai-tutor') {
        setCurrentPage('ai-tutor-topic-selection');
      } else if (learningMode === 'visual-learning') {
        setCurrentPage('visual-learning');
      } else if (learningMode === 'practice') {
        setCurrentPage('practice');
      } else if (learningMode === 'flashcards') {
        setCurrentPage('flashcards');
      } else {
        setCurrentPage('ai-tutor-topic-selection'); // Default fallback
      }
    }
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b shadow-sm backdrop-blur-md sticky top-0 z-40" style={{ background: 'linear-gradient(90deg, rgba(155,77,255,0.12), rgba(255,77,145,0.1), rgba(255,108,108,0.1))', borderColor: 'rgba(155,77,255,0.2)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={handleBackToDashboard}
                className="rounded-xl px-4 py-2 transition-all duration-300"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, rgba(155,77,255,0.15), rgba(255,77,145,0.15), rgba(255,108,108,0.15))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t.backToDashboard}
              </Button>
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <h1 className="text-3xl font-bold" style={{ color: '#FF7FA3' }}>
                  {t.topicSelection}
                </h1>
              </div>
            </div>
            
            {/* Right - Start Learning Button */}
            <Button 
              size="lg"
              className={`px-6 py-2 font-semibold shadow-lg transition-all duration-300 rounded-xl ${
                selectedTopic
                  ? 'bg-black hover:opacity-90 text-white hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              onClick={handleStartLearning}
              disabled={!selectedTopic}
            >
              {learningMode === 'practice' ? <Target className="h-5 w-5 mr-2" style={{ color: selectedTopic ? '#FF4D91' : 'inherit' }} /> : 
               learningMode === 'flashcards' ? <Brain className="h-5 w-5 mr-2" style={{ color: selectedTopic ? '#FF4D91' : 'inherit' }} /> :
               <Brain className="h-5 w-5 mr-2" style={{ color: selectedTopic ? '#FF4D91' : 'inherit' }} />}
              {t.startLearning}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-7.5rem)] overflow-hidden">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 h-full">
          {/* Left Column - Subject Info */}
          <div className="lg:col-span-1 h-full">
            <Card className="h-full border-2 border-gray-200 bg-white/90 backdrop-blur-sm overflow-hidden" style={{ borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(255, 77, 145, 0.15), 0 4px 6px -2px rgba(255, 77, 145, 0.1)' }}>
              <div className="p-4" style={{ background: 'linear-gradient(90deg, rgba(155,77,255,0.12), rgba(255,77,145,0.1), rgba(255,108,108,0.1))', borderColor: 'rgba(155,77,255,0.2)' }}>
                <div className="flex items-center space-x-3 mb-3">
                  {learningMode === 'ai-tutor' ? <Brain className="h-5 w-5" style={{ color: '#9B4DFF' }} /> :
                   learningMode === 'visual-learning' ? <Building2 className="h-5 w-5" style={{ color: '#9B4DFF' }} /> :
                   learningMode === 'practice' ? <Target className="h-5 w-5" style={{ color: '#9B4DFF' }} /> :
                   learningMode === 'flashcards' ? <BookOpen className="h-5 w-5" style={{ color: '#9B4DFF' }} /> :
                   <Building2 className="h-5 w-5" style={{ color: '#9B4DFF' }} />}
                  <h2 className="text-lg font-bold text-gray-800">
                    {learningMode === 'ai-tutor' ? 'AI Learning' :
                     learningMode === 'visual-learning' ? 'Business Studies' :
                     learningMode === 'practice' ? 'Practice Mode' :
                     learningMode === 'flashcards' ? 'Flashcards' :
                     'Business Studies'}
                  </h2>
                </div>
                <p className="text-xs text-gray-600">
                  {learningMode === 'ai-tutor' ? 'Master topics through AI-powered tutoring sessions' :
                   learningMode === 'visual-learning' ? 'Master business concepts through interactive video lessons' :
                   learningMode === 'practice' ? 'Practice and improve with targeted exercises' :
                   learningMode === 'flashcards' ? 'Reinforce learning with interactive flashcards' :
                   'Master business concepts through interactive lessons'}
                </p>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Comprehensive curriculum</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">Interactive lessons</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Expert instructors</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Topic Selection */}
          <div className="lg:col-span-2 h-full">
            <Card className="h-full border-2 border-gray-200 bg-white/90 backdrop-blur-sm overflow-hidden flex flex-col" style={{ borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(255, 77, 145, 0.15), 0 4px 6px -2px rgba(255, 77, 145, 0.1)' }}>
              <CardHeader className="p-4 flex-shrink-0 border-b" style={{ borderColor: 'rgba(155,77,255,0.2)', background: 'linear-gradient(90deg, rgba(155,77,255,0.12), rgba(255,77,145,0.1), rgba(255,108,108,0.1))' }}>
                <CardTitle className="flex items-center space-x-3 text-lg text-gray-800">
                  <Target className="h-5 w-5" style={{ color: '#9B4DFF' }} />
                  <span>Select Topic</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-4 flex-1 overflow-y-auto bg-white">
                {loadingTopics ? (
                  <div className="text-center py-8">
                    <div className="text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3" style={{ color: '#9B4DFF' }} />
                      <p className="text-gray-600 text-sm">{t.loadingTopics}</p>
                    </div>
                  </div>
                ) : topics.length > 0 ? (
                  <div className="space-y-2">
                    {topics.map((topic, index) => (
                      <button
                        key={topic.topic_id}
                        className={`group w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedTopic?.topic_id === topic.topic_id
                            ? 'border-[#9B4DFF] shadow-md bg-gradient-to-r from-[#9B4DFF]/5 via-[#FF4D91]/5 to-[#FF6C6C]/5' 
                            : 'border-gray-200 hover:border-[#9B4DFF]/50 bg-white hover:bg-gradient-to-r hover:from-[#9B4DFF]/5 hover:via-[#FF4D91]/5 hover:to-[#FF6C6C]/5'
                        }`}
                        onClick={() => handleTopicSelect(topic)}
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
                  <div className="text-center py-8">
                    <div className="text-center">
                      <p className="text-gray-600 mb-3 text-sm">{t.noTopicsFound}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchTopics}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
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
