import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useApp } from '../App';
import { topicsService, flashcardsService } from '../utils/supabase/services';
import { enhancedAnalyticsTracker } from '../utils/supabase/enhanced-analytics-tracker';
import { learningActivityTracker } from '../utils/supabase/learning-activity-tracker';
import { usePageTracking } from '../hooks/usePageTracking';
import { usePageTimer } from '../hooks/usePageTimer';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Star, 
  Filter,
  Home,
  Brain,
  CheckCircle,
  XCircle,
  Trophy,
  Flame,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Shuffle,
  SkipForward,
  Eye,
  EyeOff,
  Volume2,
  Settings,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

const palette = {
  violet: '#9B4DFF',
  magenta: '#FF4D91',
  coral: '#FF6C6C',
  lightViolet: 'rgba(155, 77, 255, 0.1)',
  lightMagenta: 'rgba(255, 77, 145, 0.1)',
  lightCoral: 'rgba(255, 108, 108, 0.1)'
};

interface Flashcard {
  id: number;
  front: string;
  back: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
  explanation?: string;
  mastered?: boolean;
  lastReviewed?: Date;
  reviewCount?: number;
  // Individual options for better display
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: string;
}

interface StudyStats {
  cardsStudied: number;
  correctAnswers: number;
  streak: number;
  xpEarned: number;
  level: number;
}

export function FlashcardPage() {
  const { language, setCurrentPage, user: currentUser } = useApp();
  
  // Page tracking hook
  const { trackFlashcardReview, trackEngagement, trackError } = usePageTracking({
    pageName: 'Flashcards',
    pageCategory: 'flashcards',
    metadata: { 
      subject: 'Business Studies', 
      topic: 'General',
      studyMode: 'learn'
    }
  });

  // Page timer tracking
  const { stopTracking } = usePageTimer({
    userId: currentUser?.id,
    pageType: 'flashcards'
  });
  
  const [currentCard, setCurrentCard] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'hard' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [studyMode, setStudyMode] = useState<'learn' | 'review' | 'test'>('learn');
  const [showHint, setShowHint] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('businessStudies');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [currentTopicId, setCurrentTopicId] = useState<number | null>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [stats, setStats] = useState<StudyStats>({
    cardsStudied: 0,
    correctAnswers: 0,
    streak: 0,
    xpEarned: 0,
    level: 1
  });
  const [correctCards, setCorrectCards] = useState<number>(0);
  const [wrongCards, setWrongCards] = useState<number>(0);
  const [attemptedCards, setAttemptedCards] = useState<number>(0);
  const [cardsCompleted, setCardsCompleted] = useState<number>(0);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  // Fetch topics when component mounts
  useEffect(() => {
    fetchTopics();
  }, []);

  // Reset current card when topic changes
  useEffect(() => {
    setCurrentCard(0);
    setDifficulty(null);
    setSelectedOption(null);
    setShowHint(false);
    setCardsCompleted(0);
  }, [selectedTopic]);

  // Fetch topics from database
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

  // Fetch flashcards when topic changes
  const fetchFlashcards = async (topicId: number, topicTitle?: string) => {
    setLoadingFlashcards(true);
    try {
      const { data, error } = await flashcardsService.getFlashcardsByTopic(topicId);
      
      if (error) {
        throw error;
      }

      // Use the provided topic title or fall back to selectedTopic
      const topicName = topicTitle || selectedTopic;

      // Transform database flashcards to match our interface
      const transformedFlashcards = (data || []).map((dbCard: any, index: number) => {
        const transformed = {
          id: dbCard.card_id,
          front: dbCard.question,
          back: `Correct Answer: ${dbCard.correct_option}\n\nOptions:\nA) ${dbCard.option_a}\nB) ${dbCard.option_b}\nC) ${dbCard.option_c}\nD) ${dbCard.option_d}`,
          subject: "Business Studies",
          topic: topicName,
          difficulty: dbCard.difficulty || 'medium',
          hint: dbCard.hint || '',
          explanation: dbCard.explanation || '',
          mastered: false,
          reviewCount: 0,
          // Individual options for better display
          optionA: dbCard.option_a,
          optionB: dbCard.option_b,
          optionC: dbCard.option_c,
          optionD: dbCard.option_d,
          correctOption: dbCard.correct_option
        };
        return transformed;
      });
      
      setFlashcards(transformedFlashcards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setFlashcards([]);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  // Handle topic change
  const handleTopicChange = async (topic: string) => {
    setSelectedTopic(topic);
    
    if (topic === 'all') {
      setFlashcards([]);
      setLoadingFlashcards(false);
      setCurrentTopicId(null);
    } else {
      // Find the topic object to get the ID
      setLoadingFlashcards(true);
      const normalizeTitle = (title: string) => (title || '').toLowerCase().trim();
      const topicObj = topics.find(t => 
        normalizeTitle(t.title) === normalizeTitle(topic) ||
        normalizeTitle(t.topic_name) === normalizeTitle(topic)
      );
      if (topicObj) {
        const topicId = topicObj.topic_id || topicObj.id;
        if (topicId) {
          setCurrentTopicId(topicId);
          await fetchFlashcards(topicId, topic);
        } else {
          setFlashcards([]);
          setLoadingFlashcards(false);
          setCurrentTopicId(null);
        }
      } else {
        setFlashcards([]);
        setLoadingFlashcards(false);
        setCurrentTopicId(null);
      }
    }
  };

  // Check for flashcards data from localStorage (from FlashcardSelection)
  useEffect(() => {
    const storedFlashcards = localStorage.getItem('flashcardsData');
    const storedTopic = localStorage.getItem('flashcardTopic');
    const storedTopicId = localStorage.getItem('selectedTopicId');
    
    if (storedFlashcards && storedTopic && storedTopicId) {
      try {
        const parsedFlashcards = JSON.parse(storedFlashcards);
        
        // Transform database flashcards to match our interface
        const transformedFlashcards = parsedFlashcards.map((dbCard: any, index: number) => {
          const transformed = {
            id: dbCard.card_id,
            front: dbCard.question,
            back: `Correct Answer: ${dbCard.correct_option}\n\nOptions:\nA) ${dbCard.option_a}\nB) ${dbCard.option_b}\nC) ${dbCard.option_c}\nD) ${dbCard.option_d}`,
            subject: "Business Studies",
            topic: storedTopic,
            difficulty: dbCard.difficulty || 'medium',
            hint: dbCard.hint || '',
            explanation: dbCard.explanation || '',
            mastered: false,
            reviewCount: 0,
            // Individual options for better display
            optionA: dbCard.option_a,
            optionB: dbCard.option_b,
            optionC: dbCard.option_c,
            optionD: dbCard.option_d,
            correctOption: dbCard.correct_option
          };
          return transformed;
        });
        
        setFlashcards(transformedFlashcards);
        setSelectedTopic(storedTopic);
        if (storedTopicId) {
          setCurrentTopicId(Number(storedTopicId));
        }
        
        // Clear localStorage after loading
        localStorage.removeItem('flashcardsData');
        localStorage.removeItem('flashcardTopic');
        localStorage.removeItem('selectedTopicId');
        
      } catch (error) {
        console.error('❌ FlashcardPage: Error parsing flashcards from localStorage:', error);
      }
    } else {
      console.log('ℹ️ FlashcardPage: No flashcards data in localStorage, will fetch from database');
    }
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(() => {
        if (currentCard < flashcards.length - 1) {
          handleNext();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoPlay, currentCard, flashcards.length]);

  const accuracy = stats.cardsStudied > 0 ? Math.round((stats.correctAnswers / stats.cardsStudied) * 100) : 0;

  // Filter flashcards based on selected topic (now using database flashcards)
  const filteredFlashcards = selectedTopic === 'all' 
    ? flashcards 
    : flashcards.filter(card => card.topic === selectedTopic);

  const currentFlashcard = filteredFlashcards[currentCard];

  const handleNext = () => {
    if (currentCard < filteredFlashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setDifficulty(null);
      setSelectedOption(null);
      setShowFeedback(false);
      setShowHint(false);
    }
  };

  const handleNextTopic = async () => {
    if (topics.length === 0) {
      console.warn('⚠️ No topics available');
      return;
    }
    
    // Find the current topic index using multiple methods for robustness
    let currentTopicIndex = -1;
    
    // Method 1: Try to find by topic_id if we have it
    if (currentTopicId !== null) {
      currentTopicIndex = topics.findIndex(t => 
        (t.topic_id || t.id) === currentTopicId
      );
    }
    
    // Method 2: If not found by ID, try by title (normalized comparison)
    if (currentTopicIndex === -1) {
      const normalizeTitle = (title: string) => (title || '').toLowerCase().trim();
      currentTopicIndex = topics.findIndex(t => 
        normalizeTitle(t.title) === normalizeTitle(selectedTopic) ||
        normalizeTitle(t.topic_name) === normalizeTitle(selectedTopic)
      );
    }
    
    console.log('🔄 handleNextTopic - Current topic:', selectedTopic);
    console.log('🔄 handleNextTopic - Current topic ID:', currentTopicId);
    console.log('🔄 handleNextTopic - Current index:', currentTopicIndex);
    console.log('🔄 handleNextTopic - Total topics:', topics.length);
    console.log('🔄 handleNextTopic - Topics:', topics.map((t, i) => ({ index: i, title: t.title, id: t.topic_id || t.id })));
    
    // If there's a next topic, switch to it
    if (currentTopicIndex >= 0 && currentTopicIndex < topics.length - 1) {
      const nextTopic = topics[currentTopicIndex + 1];
      const nextTopicId = nextTopic.topic_id || nextTopic.id;
      const nextTopicTitle = nextTopic.title || nextTopic.topic_name || '';
      
      console.log('✅ Moving to next topic:', { title: nextTopicTitle, id: nextTopicId, index: currentTopicIndex + 1 });
      
      // Set loading state for smooth transition
      setLoadingFlashcards(true);
      
      // Reset card state immediately
      setCurrentCard(0);
      setDifficulty(null);
      setSelectedOption(null);
      setShowFeedback(false);
      setShowHint(false);
      setCardsCompleted(0);
      
      // Update topic state
      setSelectedTopic(nextTopicTitle);
      if (nextTopicId) {
        setCurrentTopicId(nextTopicId);
      }
      
      // Fetch flashcards for the next topic
      if (nextTopicId) {
        await fetchFlashcards(nextTopicId, nextTopicTitle);
      } else {
        console.error('❌ No topic ID found for next topic:', nextTopic);
        setFlashcards([]);
        setLoadingFlashcards(false);
      }
    } else {
      console.warn('⚠️ Cannot move to next topic:', {
        currentTopicIndex,
        topicsLength: topics.length,
        selectedTopic,
        currentTopicId
      });
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setDifficulty(null);
      setSelectedOption(null);
      setShowFeedback(false);
      setShowHint(false);
    }
  };

  const handleDifficulty = async (level: 'easy' | 'hard') => {
    setDifficulty(level);
    setAttemptedCards(prev => prev + 1);
    setCardsCompleted(prev => prev + 1);
    if (level === 'easy') {
      setCorrectCards(prev => prev + 1);
    } else {
      setWrongCards(prev => prev + 1);
    }
    setStats(prev => ({
      ...prev,
      cardsStudied: prev.cardsStudied + 1,
      correctAnswers: level === 'easy' ? prev.correctAnswers + 1 : prev.correctAnswers,
      xpEarned: prev.xpEarned + (level === 'easy' ? 10 : 5)
    }));
    
    // Track flashcard review for analytics
    if (currentUser?.id && currentFlashcard) {
      try {
        await trackFlashcardReview({
          subject: currentFlashcard.subject || 'Business Studies',
          topic: currentFlashcard.topic || 'General',
          difficulty: currentFlashcard.difficulty || 'medium',
          correct: level === 'easy',
          timeSpent: 0,
          cardId: currentFlashcard.id?.toString()
        });
      } catch (error) {
        console.error('Error tracking flashcard review:', error);
      }
    }
    
    // Track analytics for flashcard review
    try {
      if (currentUser?.id && currentFlashcard) {
        const isCorrect = level === 'easy';
        await enhancedAnalyticsTracker.trackActivity({
          userId: currentUser.id,
          activityType: 'flashcard',
          topicId: getTopicId(currentFlashcard.topic),
          subjectId: getSubjectId(currentFlashcard.subject),
          topicName: currentFlashcard.topic,
          subjectName: currentFlashcard.subject === 'businessStudies' ? 'Business Studies' : currentFlashcard.subject,
          duration: 0.5, // 30 seconds per flashcard
          timestamp: new Date().toISOString(),
          metadata: {
            flashcardId: String(currentFlashcard.id),
            isCorrect: isCorrect,
            difficulty: level === 'easy' ? 'easy' : 'hard',
            score: isCorrect ? 100 : 0
          }
        });
      }
    } catch (error) {
      // Silently handle analytics errors
    }
    
    // Auto advance after rating
    setTimeout(() => {
      if (currentCard < filteredFlashcards.length - 1) {
        handleNext();
      }
    }, 5000);
  };

  const handleOptionSelect = async (option: string) => {
    const isCorrect = option === currentFlashcard?.correctOption;
    
    // Set the selected option
    setSelectedOption(option);
    
    // Set difficulty based on correctness (for stats)
    setDifficulty(isCorrect ? 'easy' : 'hard');
    
    // Show feedback for wrong answers
    if (!isCorrect) {
      setShowFeedback(true);
    }
    
    // Update tracking stats
    setAttemptedCards(prev => prev + 1);
    setCardsCompleted(prev => prev + 1);
    if (isCorrect) {
      setCorrectCards(prev => prev + 1);
    } else {
      setWrongCards(prev => prev + 1);
    }
    
    // Update stats
    setStats(prev => ({
      ...prev,
      cardsStudied: prev.cardsStudied + 1,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      xpEarned: prev.xpEarned + (isCorrect ? 10 : 5)
    }));

    // Track flashcard activity
    try {
      if (currentUser?.id && currentFlashcard) {
        // Track with page tracking hook
        await trackFlashcardReview({
          subject: currentFlashcard.subject || 'Business Studies',
          topic: currentFlashcard.topic || 'General',
          difficulty: currentFlashcard.difficulty || 'medium',
          correct: isCorrect,
          timeSpent: 0,
          cardId: currentFlashcard.id?.toString()
        });
        
        // Find topic ID from selected topic
        const topicData = topics.find(t => t.title === selectedTopic);
        const topicId = Number(topicData?.topic_id) || 1;
        
        await learningActivityTracker.trackFlashcard(
          topicId,
          currentFlashcard.topic || 'General',
          currentFlashcard.subject || 'Business Studies',
          isCorrect,
          0,
          currentFlashcard.difficulty || 'medium'
        );
      }
    } catch (error) {
      // Silently handle analytics errors
    }

    // Show immediate feedback
    if (isCorrect) {
      // Correct answer feedback
    } else {
      // Wrong answer feedback
    }

    // Auto advance after selecting (longer delay for wrong answers to read feedback)
    const delay = isCorrect ? 2000 : 4000; // 4 seconds for wrong answers to read feedback
    setTimeout(() => {
      if (currentCard < filteredFlashcards.length - 1) {
        handleNext();
      }
    }, delay);
  };

  const getMotivationalMessage = () => {
    const progress = (currentCard + 1) / filteredFlashcards.length;
    if (progress >= 0.8) return "Almost there! Just a few more! 💪";
    if (progress >= 0.6) return "Well done! You're on fire! 🔥";
    return "Excellent work! You're improving! ⭐";
  };

  const translations = {
    en: {
      title: "Flashcards",
      subtitle: "Master Business Studies concepts",
      backToDashboard: "Back to Dashboard",
      learn: "Learn",
      review: "Review", 
      test: "Test",
      previous: "Previous",
      next: "Next",
      cardOf: "Card {current} of {total}",
      hint: "Hint",
      mastered: "Mastered!",
      reviewLater: "Review Later",
      easy: "Easy",
      hard: "Hard",
      cardsToday: "Cards Today",
      accuracy: "Accuracy",
      streak: "Streak",
      achievements: "Achievements",
      fireStreak: "Fire Streak",
      perfectScore: "Perfect Score",
      speedLearner: "Speed Learner"
    }
  };

  const t = translations.en;

  // Helper function to convert subject name to subject ID
  const getSubjectId = (subjectName: string): number => {
    const subjectMap: { [key: string]: number } = {
      'mathematics': 1,
      'physics': 2,
      'chemistry': 3,
      'biology': 4,
      'english': 5,
      'history': 6,
      'geography': 7,
      'economics': 8,
      'businessStudies': 9
    };
    return subjectMap[subjectName] || 0;
  };

  // Helper function to convert topic name to topic ID
  const getTopicId = (topicName: string): number => {
    // For now, return a default topic ID - you can implement actual topic mapping
    return 1;
  };

  const resetSession = () => {
    setCurrentCard(0);
    setDifficulty(null);
    setSelectedOption(null);
    setShowFeedback(false);
    setShowHint(false);
    setCorrectCards(0);
    setWrongCards(0);
    setAttemptedCards(0);
    setCardsCompleted(0);
    setStats({
      cardsStudied: 0,
      correctAnswers: 0,
      streak: 7,
      xpEarned: 0,
      level: 3
    });
  };

  return (
    <div className="h-screen relative overflow-hidden flex flex-col" style={{ 
      background: `linear-gradient(135deg, ${palette.violet}, ${palette.lightCoral})`
    }}>
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ 
          background: `radial-gradient(circle, ${palette.violet}, transparent)`,
          animation: 'float 20s ease-in-out infinite'
        }}></div>
        <div className="absolute top-40 right-20 w-96 h-96 rounded-full opacity-15 blur-3xl" style={{ 
          background: `radial-gradient(circle, ${palette.magenta}, transparent)`,
          animation: 'float 25s ease-in-out infinite reverse'
        }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ 
          background: `radial-gradient(circle, ${palette.coral}, transparent)`,
          animation: 'float 30s ease-in-out infinite'
        }}></div>
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at top, rgba(155,77,255,0.3), transparent 60%)' }} />
      </div>

      {/* Enhanced Header with Stats */}
      <div className="relative z-10 backdrop-blur-md border-b sticky top-0 bg-white/80" style={{ 
        borderColor: 'rgba(155, 77, 255, 0.2)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back Button */}
            <div className="flex items-center">
              <Button 
                size="sm"
                onClick={async () => {
                  setIsNavigatingBack(true);
                  await stopTracking(); // Stop timer before navigating
                  setTimeout(() => {
                    setCurrentPage('dashboard');
                  }, 300);
                }}
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
            </div>
            
            {/* Center: Title and Topic */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <h1 className="text-xl font-bold text-black">
                {selectedTopic && selectedTopic !== 'all' ? selectedTopic : t.title}
              </h1>
            </div>
            
            {/* Right: Accuracy Stats */}
            <div className="flex items-center space-x-3">
              {/* Accuracy Badge */}
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full" style={{ 
                backgroundColor: palette.lightMagenta,
                border: `1px solid ${palette.magenta}`
              }}>
                <Target className="h-4 w-4" style={{ color: palette.magenta }} />
                <span className="text-sm font-medium text-black">{accuracy}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
            {loadingFlashcards ? (
          <div className="text-center py-20 flex-1 flex items-center justify-center">
            <div>
              <RefreshCw className="h-16 w-16 mx-auto mb-4 animate-spin" style={{ color: palette.violet }} />
              <h3 className="text-xl font-semibold text-black mb-2">Loading Flashcards...</h3>
              <p className="text-black/70">Fetching questions from the database</p>
            </div>
              </div>
            ) : filteredFlashcards.length === 0 ? (
          <div className="text-center py-20 flex-1 flex items-center justify-center">
            <div>
              <BookOpen className="h-16 w-16 mx-auto mb-4" style={{ color: palette.violet }} />
              <h3 className="text-xl font-semibold text-black mb-2">No Flashcards Available</h3>
              <p className="text-black/70">
                  {selectedTopic === 'all' 
                    ? 'Please select a specific topic to view flashcards' 
                    : 'No flashcards found for this topic. Please try another topic or check the database.'
                  }
                </p>
            </div>
              </div>
            ) : (
          <Card className="relative backdrop-blur-xl border-0 shadow-2xl flex-1 flex flex-col overflow-hidden bg-white/90" style={{
            borderRadius: '24px',
            border: `1px solid ${palette.violet}20`
          }}>
            <CardContent className="p-8 flex flex-col flex-1 overflow-hidden">
              {/* Top Section: Progress Bar and Card Counter */}
              <div className="mb-6 flex items-center justify-between flex-shrink-0">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-black">
                      Progress
                    </span>
                    <span className="text-sm font-medium text-black">
                      {Math.round(((currentCard + 1) / filteredFlashcards.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: palette.lightViolet }}>
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${((currentCard + 1) / filteredFlashcards.length) * 100}%`,
                        background: `linear-gradient(90deg, ${palette.violet}, ${palette.magenta}, ${palette.coral})`
                      }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-black font-medium">
                  Card {currentCard + 1}/{filteredFlashcards.length}
                </div>
              </div>

              {/* Main Content Area with Right Sidebar */}
              <div className="flex-1 flex gap-6 overflow-hidden min-w-0">
                {/* Left: Main Flashcard Content */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                  {/* Question with Hint Button */}
                  <div className="mb-8 relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-black leading-relaxed">
                          {currentFlashcard?.front}
                        </h2>
                      </div>
                      {/* Hint Button */}
                  {currentFlashcard?.hint && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHint(!showHint)}
                          className="flex-shrink-0 border-2 rounded-lg px-4 py-2 transition-all"
                          style={{ 
                            borderColor: palette.violet,
                            backgroundColor: showHint ? palette.lightViolet : 'transparent',
                            color: palette.violet
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${palette.violet}30`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = showHint ? `${palette.violet}20` : 'transparent';
                          }}
                        >
                          <Lightbulb className="h-4 w-4 mr-2" style={{ color: palette.violet }} />
                          {showHint ? 'Hide Hint' : 'Hint'}
                      </Button>
                      )}
                    </div>
                    
                    {/* Hint Display */}
                    {showHint && currentFlashcard?.hint && (
                      <div className="mt-4 p-4 rounded-xl border-2" style={{ 
                        backgroundColor: palette.lightViolet,
                        borderColor: palette.violet
                      }}>
                            <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: palette.violet }} />
                          <div>
                            <h4 className="text-sm font-semibold text-black mb-1">Hint</h4>
                            <p className="text-sm text-black/80 leading-relaxed">
                                  {currentFlashcard.hint}
                                </p>
                              </div>
                          </div>
                        </div>
                      )}
                    </div>

                  {/* Options - Scrollable if needed */}
                  <div className="flex-1 overflow-y-auto mb-6 pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`
                      div::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>
                    <div className="space-y-4">
                      {['A', 'B', 'C', 'D'].map((option) => {
                            const optionText = currentFlashcard?.[`option${option}` as keyof typeof currentFlashcard] as string;
                            const isSelected = selectedOption === option;
                            const isCorrect = currentFlashcard?.correctOption === option;
                            const isWrong = isSelected && !isCorrect;
                            
                            return (
                              <button
                                key={option}
                                onClick={(e) => {
                                  e.stopPropagation();
                              if (selectedOption === null) {
                                  handleOptionSelect(option);
                              }
                                }}
                                className={`
                              w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left relative
                                  ${isSelected
                                    ? isCorrect
                                  ? 'border-green-400 bg-green-50 shadow-lg'
                                  : 'border-red-400 bg-red-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50'
                                  }
                                  ${selectedOption !== null ? 'cursor-not-allowed' : 'cursor-pointer'}
                                `}
                                disabled={selectedOption !== null}
                              >
                            <div className="flex items-center gap-4">
                              {/* Option Letter */}
                                <div className={`
                                w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0
                                  ${isSelected
                                    ? isCorrect
                                      ? 'bg-green-500 text-white'
                                      : 'bg-red-500 text-white'
                                  : 'text-white border'
                                }
                              `}
                              style={!isSelected ? {
                                background: `linear-gradient(135deg, ${palette.violet}, ${palette.magenta})`,
                                borderColor: palette.violet
                              } : {}}
                              >
                                  {option}
                                </div>
                                
                                {/* Option Text */}
                              <div className="flex-1">
                                <p className="text-black font-medium text-base">
                                    {optionText || `Option ${option}`}
                                  </p>
                                </div>
                                
                                {/* Status Icon */}
                                {isSelected && (
                                <div className="flex-shrink-0">
                                    {isCorrect ? (
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                    ) : (
                                    <XCircle className="h-6 w-6 text-red-500" />
                                    )}
                                  </div>
                                )}
                            </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                        
                  {/* Navigation */}
                  <div className="flex justify-between items-center flex-shrink-0">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentCard === 0}
                      className="rounded-full px-6 py-3 font-medium shadow-lg transition-all duration-300 hover:shadow-xl border-2"
                      style={{ 
                        borderColor: currentCard === 0 ? palette.violet : palette.violet,
                        backgroundColor: currentCard === 0 ? palette.lightViolet : 'transparent',
                        color: currentCard === 0 ? palette.violet : palette.violet
                      }}
                      onMouseEnter={(e) => {
                        if (currentCard !== 0) {
                          e.currentTarget.style.backgroundColor = palette.lightViolet;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = currentCard === 0 ? palette.lightViolet : 'transparent';
                      }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous Flashcard
              </Button>

              <Button 
                onClick={cardsCompleted >= 5 ? handleNextTopic : handleNext}
                disabled={cardsCompleted >= 5 ? false : currentCard === filteredFlashcards.length - 1}
                      className="rounded-full px-6 py-3 text-white font-medium shadow-lg transition-all duration-300 hover:shadow-xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${palette.violet}, ${palette.magenta})`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${palette.magenta}, ${palette.coral})`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${palette.violet}, ${palette.magenta})`;
                      }}
                    >
                      {cardsCompleted >= 5 ? "Next Topic" : "Next Flashcard"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

                {/* Right: Progress Stats and Explanation */}
                <div className="w-80 flex-shrink-0 flex flex-col gap-4 min-w-[320px]">
                  {/* Progress Stats Container */}
                  <div className="p-4 rounded-xl border backdrop-blur-sm flex-shrink-0 bg-white/80" style={{ 
                    borderColor: palette.violet
                  }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="h-4 w-4" style={{ color: palette.magenta }} />
                      <h3 className="text-sm font-semibold text-black">Your Progress</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Attempted */}
                      <div className="text-center p-3 rounded-lg" style={{ backgroundColor: palette.lightViolet }}>
                        <p className="text-xs text-black/60 mb-1">Attempted</p>
                        <p className="text-xl font-bold text-black">{attemptedCards || 0}</p>
                    </div>
                      {/* Correct */}
                      <div className="text-center p-3 rounded-lg" style={{ backgroundColor: palette.lightMagenta }}>
                        <p className="text-xs text-black/60 mb-1">Correct</p>
                        <p className="text-xl font-bold" style={{ color: palette.magenta }}>{correctCards || 0}</p>
                  </div>
                      {/* Incorrect */}
                      <div className="text-center p-3 rounded-lg" style={{ backgroundColor: palette.lightCoral }}>
                        <p className="text-xs text-black/60 mb-1">Incorrect</p>
                        <p className="text-xl font-bold" style={{ color: palette.coral }}>{wrongCards || 0}</p>
                </div>
                      {/* Accuracy */}
                      <div className="text-center p-3 rounded-lg" style={{ backgroundColor: palette.lightViolet }}>
                        <p className="text-xs text-black/60 mb-1">Accuracy</p>
                        <p className="text-xl font-bold" style={{ color: palette.violet }}>
                          {attemptedCards > 0 ? Math.round((correctCards / attemptedCards) * 100) : 0}%
                        </p>
                    </div>
                  </div>
                </div>

                  {/* Wrong Answer Reasoning - Show when wrong answer is selected */}
                  {showFeedback && selectedOption && selectedOption !== currentFlashcard?.correctOption && (
                    <div className="flex-1 p-4 rounded-xl border-2 overflow-y-auto bg-white/80" style={{ 
                      borderColor: palette.coral
                    }}>
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="h-5 w-5" style={{ color: palette.coral }} />
                        <h4 className="text-sm font-semibold" style={{ color: palette.coral }}>Incorrect Answer</h4>
                </div>

                      {/* Correct Answer Display */}
                      <div className="mb-3">
                        <p className="text-xs mb-2" style={{ color: palette.coral }}>Correct Answer:</p>
                        <div className="flex flex-col gap-2">
                          <Badge className="px-3 py-1 text-xs w-fit text-white" style={{ 
                            background: `linear-gradient(135deg, ${palette.violet}, ${palette.magenta})`
                          }}>
                            {currentFlashcard?.correctOption}
                          </Badge>
                          <span className="text-sm text-black">
                            {currentFlashcard?.correctOption === 'A' && currentFlashcard?.optionA}
                            {currentFlashcard?.correctOption === 'B' && currentFlashcard?.optionB}
                            {currentFlashcard?.correctOption === 'C' && currentFlashcard?.optionC}
                            {currentFlashcard?.correctOption === 'D' && currentFlashcard?.optionD}
                      </span>
                    </div>
                    </div>
                      
                      {/* Explanation */}
                      {currentFlashcard?.explanation && (
                        <div>
                          <p className="text-xs mb-2" style={{ color: palette.coral }}>Explanation:</p>
                          <p className="text-sm text-black/80 p-3 rounded-lg leading-relaxed" style={{ 
                            backgroundColor: palette.lightViolet
                          }}>
                            {currentFlashcard.explanation}
                          </p>
                  </div>
                )}
                  </div>
                )}
                </div>
              </div>
              </CardContent>
            </Card>
        )}
          </div>

      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
}