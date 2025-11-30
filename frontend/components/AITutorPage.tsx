
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Logo } from './Logo';
import { useApp } from '../App';
import { lessonsService, topicsService } from '../utils/supabase/services';
import { enhancedAnalyticsTracker } from '../utils/supabase/enhanced-analytics-tracker';
import aiTutorService from '../utils/ai-tutor-service';
import { usePageTracking } from '../hooks/usePageTracking';
import { useAutoTracking } from '../hooks/useAutoTracking';
import { 
  Send, 
  Bot,
  User,
  BookOpen,
  Brain,
  Zap,
  RefreshCw,
  Home,
  Target,
  FileText,
  Play,
  Image,
  Video,
  Lightbulb,
  ArrowLeft,
  Volume2,
  VolumeX,
  Pause,
  History,
  Plus,
  Minus,
  MessageSquare,
  Trash2,
  Type
} from 'lucide-react';

const palette = {
  violet: '#9B4DFF',
  magenta: '#FF4D91',
  coral: '#FF6C6C',
  lightViolet: 'rgba(155, 77, 255, 0.1)',
  lightMagenta: 'rgba(255, 77, 145, 0.1)',
  lightCoral: 'rgba(255, 108, 108, 0.1)'
};

interface Lesson {
  lessons_id: number;
  title: string;
  content: string;
  media_type: string | null;
  reading_time_minutes: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    reasoningLabel?: string;
    relatedConcepts?: string[];
    readiness?: any;
    learningPath?: any;
  }>;
  createdAt: string;
  lastUpdated: string;
}

export function AITutorPage() {
  const { setCurrentPage, user } = useApp();
  
  // Page tracking hook
  const { trackLessonProgress, trackVideoProgress, trackAITutorInteraction, trackEngagement } = usePageTracking({
    pageName: 'AI Tutor & Lessons',
    pageCategory: 'lessons',
    metadata: { 
      topic: 'Unknown',
      lessonCount: 0
    }
  });

  // Auto-tracking hook
  const { trackAIInteraction, trackLessonStart, trackLessonComplete } = useAutoTracking({
    pageTitle: 'AI Tutor & Lessons',
    pageUrl: '/ai-tutor',
    trackClicks: true,
    trackTime: false,
    trackScroll: true
  });
  
  const [storedTopicData, setStoredTopicData] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [isPlaying, setIsPlaying] = useState(false); // Track speech state
  const [isPaused, setIsPaused] = useState(false); // Track if paused
  const [speechRate, setSpeechRate] = useState(1); // Fixed speech speed
  const [highlightedText, setHighlightedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [fontSize, setFontSize] = useState(14); // Default font size in pixels
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lessonContentRef = useRef<HTMLDivElement>(null);
  
  // AI Tutor chat state
  const [chatMessages, setChatMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    reasoningLabel?: string;
    relatedConcepts?: string[];
    readiness?: any;
    learningPath?: any;
  }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [relatedConcepts, setRelatedConcepts] = useState<string[]>([]);
  const [reasoningLabel, setReasoningLabel] = useState("");
  const [readiness, setReadiness] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any>(null);
  
  // Chat history state
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  
  // Load chat history from localStorage on mount
  useEffect(() => {
    loadChatHistory();
  }, [storedTopicData]);
  
  // Save chat to history when messages change
  useEffect(() => {
    if (chatMessages.length > 1 && currentChatId) { // More than just the welcome message
      saveChatToHistory();
    }
  }, [chatMessages]);
  
  const getStorageKey = () => {
    if (!storedTopicData) return 'ai_tutor_chat_history';
    return `ai_tutor_chat_history_${storedTopicData.topic_id}`;
  };
  
  const loadChatHistory = () => {
    const storageKey = getStorageKey();
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setChatHistory(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  };
  
  const saveChatHistory = (history: ChatHistory[]) => {
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(history));
    setChatHistory(history);
  };
  
  const saveChatToHistory = () => {
    if (!currentChatId || chatMessages.length <= 1) return;
    
    // Get the first user message as the title
    const firstUserMessage = chatMessages.find(msg => msg.role === 'user');
    const title = firstUserMessage?.content.slice(0, 50) || 'New Chat';
    
    const historyItem: ChatHistory = {
      id: currentChatId,
      title: title,
      messages: chatMessages,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    const updatedHistory = [...chatHistory];
    const existingIndex = updatedHistory.findIndex(h => h.id === currentChatId);
    
    if (existingIndex >= 0) {
      updatedHistory[existingIndex] = historyItem;
    } else {
      updatedHistory.unshift(historyItem);
    }
    
    // Keep only last 20 chats
    const trimmedHistory = updatedHistory.slice(0, 20);
    saveChatHistory(trimmedHistory);
  };
  
  const startNewChat = () => {
    if (!user?.id || !storedTopicData?.topic_id) return;
    
    const newChatId = `${user.id}_${storedTopicData.topic_id}`;
    setCurrentChatId(newChatId);
    setChatMessages([]);
    setRelatedConcepts([]);
    setReasoningLabel("");
    setReadiness(null);
    setLearningPath(null);
    
    // Initialize AI Tutor with welcome message
    const topicTitle = storedTopicData?.title || 'Business Studies';
    initializeAITutor(topicTitle);
    
    // Suggestions will come from backend responses
    setSuggestions([]);
  };
  
  const loadChatFromHistory = (chatId: string) => {
    const chat = chatHistory.find(h => h.id === chatId);
    if (chat) {
      setCurrentChatId(chat.id);
      setChatMessages(chat.messages);
      // Extract metadata from last assistant message if available
      const lastAssistantMsg = chat.messages.filter(m => m.role === 'assistant').pop();
      if (lastAssistantMsg) {
        setReasoningLabel((lastAssistantMsg as any).reasoningLabel || "");
        setRelatedConcepts((lastAssistantMsg as any).relatedConcepts || []);
        setReadiness((lastAssistantMsg as any).readiness || null);
        setLearningPath((lastAssistantMsg as any).learningPath || null);
      }
      setShowHistorySidebar(false);
    }
  };
  
  const deleteChatFromHistory = (chatId: string) => {
    const updatedHistory = chatHistory.filter(h => h.id !== chatId);
    saveChatHistory(updatedHistory);
    
    // If deleting current chat, start a new one
    if (currentChatId === chatId) {
      startNewChat();
    }
  };


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
      console.error('Error fetching topics:', error);
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  // Get selected topic from localStorage and fetch lessons
  
  useEffect(() => {
    // Fetch topics first
    fetchTopics();
    
    // Load selected topic from localStorage
    const storedTopic = localStorage.getItem('selectedTopic');
    const storedTopicId = localStorage.getItem('selectedTopicId');
    
    if (storedTopic && storedTopicId) {
      try {
        const topicData = JSON.parse(storedTopic);
        setStoredTopicData(topicData);
        
        // Initialize AI Tutor service
        const userId = user?.id || 'anonymous';
        aiTutorService.setUserId(userId);
        aiTutorService.setCurrentTopic(topicData.title);
        
        // Auto-generate conversation ID if not set
        if (!currentChatId && userId && topicData.topic_id) {
          const newChatId = `${userId}_${topicData.topic_id}`;
          setCurrentChatId(newChatId);
        }
        
        // Fetch lessons for this topic
        fetchLessons(topicData.topic_id);
        
        // Initialize AI Tutor with welcome message and generate new chat ID
        initializeAITutor(topicData.title, true);
      } catch (error) {
        // Silently handle parsing errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const fetchLessons = async (topicId: number) => {
    try {
      setLoadingLessons(true);
      
      const { data, error } = await lessonsService.getLessonsByTopic(topicId);
      
      if (error) {
        throw error;
      }
      
      setLessons(data || []);
      
      // Set first lesson as selected by default
      if (data && data.length > 0) {
        setSelectedLesson(data[0]);
      }
    } catch (error) {
      setLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };

  // Handle topic change
  const handleTopicChange = async (topicId: string) => {
    const selectedTopic = topics.find(t => t.topic_id.toString() === topicId);
    if (selectedTopic) {
      setStoredTopicData(selectedTopic);
      
      // Update AI Tutor service
      aiTutorService.setCurrentTopic(selectedTopic.title);
      
      // Fetch lessons for the new topic
      await fetchLessons(selectedTopic.topic_id);
      
      // Initialize AI Tutor with new topic
      initializeAITutor(selectedTopic.title, true);
      
      // Clear highlighting
      setHighlightedText('');
      setCurrentWordIndex(0);
    }
  };

  // Initialize AI Tutor with welcome message
  const initializeAITutor = async (topicTitle: string, generateNewChatId: boolean = false) => {
    try {
      // Generate new chat ID if requested - always use user_id_topic_id format
      if (generateNewChatId || !currentChatId) {
        if (user?.id && storedTopicData?.topic_id) {
          const newChatId = `${user.id}_${storedTopicData.topic_id}`;
          setCurrentChatId(newChatId);
        }
      }
      
      const welcomeMessage = `Hi! I'm here to help you understand ${topicTitle}. What would you like to know about this topic?`;
      
      setChatMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date().toISOString()
      }]);
      
      // Suggestions will come from backend responses
      setSuggestions([]);
      
    } catch (error) {
      console.error('Error initializing AI Tutor:', error);
    }
  };

  // Send message to AI Tutor
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = inputMessage.trim();
    
    // ===== DEBUG OUTPUT IN BROWSER CONSOLE =====
    console.log('='.repeat(60));
    console.log('[DEBUG] Sending Message to AI Tutor');
    console.log('='.repeat(60));
    console.log('[DEBUG] User Message:', userMessage);
    console.log('[DEBUG] Topic:', storedTopicData?.title);
    console.log('[DEBUG] Topic ID:', storedTopicData?.topic_id);
    console.log('[DEBUG] User ID:', user?.id);
    console.log('[DEBUG] Conversation ID:', currentChatId);
    console.log('='.repeat(60));
    console.log('');
    // ===== END DEBUG OUTPUT =====
    
    setInputMessage('');
    setIsLoading(true);
    
    // Add user message to chat
    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    
    try {
      // Get lesson content for context
      const lessonContent = selectedLesson?.content || '';
      
      // Track AI tutor interaction for analytics
      if (user?.id) {
        try {
          await trackAITutorInteraction({
            subject: storedTopicData?.subject || 'General',
            topic: storedTopicData?.title || 'Unknown',
            questionType: 'general_question',
            responseTime: 0, // Will be calculated after response
            helpful: false // Will be updated based on user feedback
          });
        } catch (error) {
          console.error('Error tracking AI tutor interaction:', error);
        }
      }

      // Track AI interaction for auto-tracking
      trackAIInteraction(userMessage, 0); // Response length will be updated after response
      
      // Get user ID - use from user object or fallback to 'anonymous'
      const userId = user?.id || 'anonymous';
      
      // Get topic ID - from storedTopicData or localStorage
      let topicId: string | number;
      if (storedTopicData?.topic_id) {
        topicId = storedTopicData.topic_id;
      } else {
        // Try to get from localStorage
        const storedTopicId = localStorage.getItem('selectedTopicId');
        if (storedTopicId) {
          topicId = storedTopicId;
        } else {
          throw new Error('Topic ID not found. Please select a topic first.');
        }
      }
      
      // Auto-generate conversation ID if not set
      let conversationId = currentChatId;
      if (!conversationId) {
        conversationId = `${userId}_${topicId}`;
        setCurrentChatId(conversationId);
      }
      
      // Send message to AI Tutor
      const response = await aiTutorService.sendMessage(
        userMessage,
        lessonContent,
        topicId,
        userId,
        conversationId
      );
      
      if (response.success && response.data) {
        // ===== DEBUG OUTPUT IN BROWSER CONSOLE =====
        console.log('='.repeat(60));
        console.log('[DEBUG] AI Tutor Response Received');
        console.log('='.repeat(60));
        console.log('[DEBUG] User Message:', userMessage);
        console.log('[DEBUG] Topic ID:', storedTopicData?.topic_id);
        console.log('[DEBUG] User ID:', user?.id);
        console.log('[DEBUG] Conversation ID:', currentChatId);
        console.log('');
        console.log('[DEBUG] Response Length:', response.data.response?.length || 0, 'chars');
        console.log('[DEBUG] Related Concepts:', response.data.related_concepts?.length || 0);
        if (response.data.related_concepts?.length > 0) {
          console.log('[DEBUG] Concept Names:', response.data.related_concepts);
        }
        console.log('[DEBUG] Reasoning Label:', response.data.reasoning_label || 'N/A');
        console.log('[DEBUG] Mastery Updates:', response.data.mastery_updates?.length || 0);
        if (response.data.mastery_updates?.length > 0) {
          console.log('[DEBUG] Mastery Details:', response.data.mastery_updates);
        }
        if (response.data.readiness) {
          console.log('[DEBUG] Readiness:', {
            overall: response.data.readiness.overall_readiness,
            avg_mastery: response.data.readiness.average_mastery,
            min_mastery: response.data.readiness.min_mastery,
            concept_readiness: response.data.readiness.concept_readiness
          });
        }
        if (response.data.learning_path) {
          console.log('[DEBUG] Learning Path:', {
            decision: response.data.learning_path.decision,
            recommended_concept: response.data.learning_path.recommended_concept,
            recommended_concept_name: response.data.learning_path.recommended_concept_name,
            details: response.data.learning_path.details
          });
        }
        if (response.data.token_usage) {
          console.log('[DEBUG] Token Usage:', {
            input: response.data.token_usage.prompt_tokens || 0,
            output: response.data.token_usage.completion_tokens || 0,
            total: response.data.token_usage.total_tokens || 0
          });
        }
        console.log('='.repeat(60));
        console.log('');
        // ===== END DEBUG OUTPUT =====
        
        // Store metadata from backend
        setRelatedConcepts(response.data.related_concepts || []);
        setReasoningLabel(response.data.reasoning_label || "");
        setReadiness(response.data.readiness || null);
        setLearningPath(response.data.learning_path || null);
        
        // Add AI response to chat with metadata
        const aiMessage = {
          role: 'assistant' as const,
          content: response.data.response,
          timestamp: new Date().toISOString(),
          reasoningLabel: response.data.reasoning_label || "",
          relatedConcepts: response.data.related_concepts || [],
          readiness: response.data.readiness || null,
          learningPath: response.data.learning_path || null
        };
        
        setChatMessages(prev => [...prev, aiMessage]);
        setSuggestions(response.data.suggestions || []);
      } else {
        // Handle error
        const errorMessage = {
          role: 'assistant' as const,
          content: 'I apologize, but I\'m having trouble processing your request. Please try again.',
          timestamp: new Date().toISOString()
        };
        
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        role: 'assistant' as const,
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  // Clear chat history and start new chat
  const clearChat = () => {
    startNewChat();
  };

  // Helper functions
  const trackLessonCompletion = async (lesson: Lesson) => {
    try {
      if (user?.id && storedTopicData) {
        await enhancedAnalyticsTracker.trackLesson(
          user.id,
          storedTopicData.topic_id,
          storedTopicData.title,
          'Business Studies',
          lesson.reading_time_minutes || 5,
          'completed'
        );
      }
    } catch (error) {
      // Silently handle errors
    }
  };

  const handleLessonSelect = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
    
    // Track lesson selection for analytics
    if (user?.id) {
      try {
        await trackLessonProgress({
          subject: storedTopicData?.subject || 'General',
          topic: storedTopicData?.title || 'Unknown',
          lessonType: (lesson.media_type === 'video' ? 'video' : lesson.media_type === 'interactive' ? 'interactive' : 'text'),
          progress: 0, // Starting the lesson
          timeSpent: 0 // Not tracking time, but required by hook
        });
      } catch (error) {
        console.error('Error tracking lesson selection:', error);
      }
    }
    
    trackLessonCompletion(lesson);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getMediaTypeIcon = (mediaType: string | null) => {
    switch (mediaType?.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4" style={{ color: palette.violet }} />;
      case 'audio':
        return <Play className="h-4 w-4" style={{ color: palette.magenta }} />;
      case 'image':
        return <Image className="h-4 w-4" style={{ color: palette.coral }} />;
      default:
        return <FileText className="h-4 w-4" style={{ color: palette.violet }} />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to split text into words for highlighting
  const splitTextIntoWords = (text: string) => {
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(word => word.length > 0);
  };

  // Helper function to highlight current word
  const highlightCurrentWord = (words: string[], currentIndex: number) => {
    return words.map((word, index) => {
      if (index === currentIndex) {
        return `<span class="highlighted-word" style="background-color: #fef08a; padding: 2px 4px; border-radius: 4px; transition: all 0.2s;">${word}</span>`;
      }
      return word;
    }).join(' ');
  };

  // Text-to-Speech functions
  const handlePlayLesson = () => {
    if (!selectedLesson) return;

    // Stop any existing speech
    window.speechSynthesis.cancel();

    // Clean the content - remove asterisks and HTML
    const cleanContent = selectedLesson.content
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/<[^>]*>/g, '');

    // Split content into words for highlighting
    const words = splitTextIntoWords(cleanContent);
    setCurrentWordIndex(0);

    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(cleanContent);
    utterance.lang = 'en-US';
    utterance.rate = speechRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Calculate approximate time per word for highlighting (more accurate)
    const wordsPerMinute = 150; // Average reading speed
    const timePerWord = (60 / wordsPerMinute) * 1000; // Convert to milliseconds

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentWordIndex(0);
      
      // Start highlighting animation immediately
      let wordIndex = 0;
      const highlightInterval = setInterval(() => {
        if (wordIndex < words.length && window.speechSynthesis.speaking) {
          setCurrentWordIndex(wordIndex);
          const highlightedContent = highlightCurrentWord(words, wordIndex);
          setHighlightedText(highlightedContent);
          console.log(`Highlighting word ${wordIndex}: ${words[wordIndex]}`);
          console.log('Highlighted content:', highlightedContent);
          wordIndex++;
        } else {
          clearInterval(highlightInterval);
        }
      }, timePerWord);
      
      // Store interval ID for cleanup
      (utterance as any).highlightInterval = highlightInterval;
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(0);
      setHighlightedText('');
      // Clear any remaining interval
      if ((utterance as any).highlightInterval) {
        clearInterval((utterance as any).highlightInterval);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(0);
      setHighlightedText('');
      // Clear any remaining interval
      if ((utterance as any).highlightInterval) {
        clearInterval((utterance as any).highlightInterval);
      }
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseLesson = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      // Clear highlighting interval when paused
      if (speechSynthesisRef.current && (speechSynthesisRef.current as any).highlightInterval) {
        clearInterval((speechSynthesisRef.current as any).highlightInterval);
      }
    }
  };

  const handleResumeLesson = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      // Restart highlighting when resumed
      if (selectedLesson) {
        const cleanContent = selectedLesson.content
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/<[^>]*>/g, '');
        const words = splitTextIntoWords(cleanContent);
        const wordsPerMinute = 150;
        const timePerWord = (60 / wordsPerMinute) * 1000;
        
        let wordIndex = currentWordIndex;
        const highlightInterval = setInterval(() => {
          if (wordIndex < words.length && window.speechSynthesis.speaking) {
            setCurrentWordIndex(wordIndex);
            const highlightedContent = highlightCurrentWord(words, wordIndex);
            setHighlightedText(highlightedContent);
            wordIndex++;
          } else {
            clearInterval(highlightInterval);
          }
        }, timePerWord);
        
        if (speechSynthesisRef.current) {
          (speechSynthesisRef.current as any).highlightInterval = highlightInterval;
        }
      }
    }
  };

  const handleStopLesson = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(0);
    setHighlightedText('');
    // Clear any highlighting interval
    if (speechSynthesisRef.current && (speechSynthesisRef.current as any).highlightInterval) {
      clearInterval((speechSynthesisRef.current as any).highlightInterval);
    }
  };


  // Cleanup speech on component unmount or lesson change
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedLesson]);

  // Clear highlighting when lesson changes
  useEffect(() => {
    setHighlightedText('');
    setCurrentWordIndex(0);
  }, [selectedLesson]);

  // Debug: Log when highlightedText changes
  useEffect(() => {
    console.log('highlightedText changed:', highlightedText);
  }, [highlightedText]);

  if (!storedTopicData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: `linear-gradient(135deg, ${palette.lightViolet}, ${palette.lightMagenta}, ${palette.lightCoral})` 
      }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ 
            borderColor: `${palette.lightViolet}`, 
            borderTopColor: palette.violet 
          }}></div>
          <p className="text-black">Loading topic data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: `linear-gradient(135deg, ${palette.lightViolet}, ${palette.lightMagenta}, ${palette.lightCoral})` 
    }}>
      {/* Header */}
      <div className="px-6 py-4" style={{ 
        background: `linear-gradient(90deg, ${palette.lightMagenta}, ${palette.lightViolet})`,
        backdropFilter: 'blur(12px)'
      }}>
        <div className="flex items-center justify-between relative">
          {/* Left - Back Button */}
          <Button 
            size="sm"
            onClick={() => {
              setIsNavigatingBack(true);
              setTimeout(() => {
                setCurrentPage('ai-tutor-topic-selection');
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
            Back to Topics
          </Button>

          {/* Center - Topic Selection Dropdown */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            {loadingTopics ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" style={{ color: palette.violet }} />
                <span className="text-sm text-black">Loading topics...</span>
              </div>
            ) : topics.length > 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-black">Topic:</span>
                <Select 
                  value={storedTopicData?.topic_id?.toString() || ''} 
                  onValueChange={handleTopicChange}
                >
                  <SelectTrigger className="w-[300px] h-9 bg-white shadow-sm hover:shadow-md transition-all" style={{ 
                    borderColor: palette.violet,
                    borderWidth: '2px'
                  }}>
                    <Target className="h-4 w-4 mr-2" style={{ color: palette.violet }} />
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto bg-white shadow-lg rounded-lg z-50" style={{ 
                    borderColor: palette.violet,
                    borderWidth: '2px'
                  }}>
                    {topics.map((topic, index) => (
                      <SelectItem 
                        key={topic.topic_id} 
                        value={topic.topic_id.toString()}
                        className="cursor-pointer transition-colors"
                        style={{ 
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = palette.lightViolet;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold" style={{ color: palette.violet }}>{index + 1}.</span>
                          <span className="text-sm text-black">{topic.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <h1 className="text-lg font-bold text-black">
                {storedTopicData?.title || 'AI Tutor'}
              </h1>
            )}
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Lessons Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
          {loadingLessons ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ 
                  borderColor: palette.lightViolet, 
                  borderTopColor: palette.violet 
                }}></div>
                <p className="text-sm text-black">Loading lessons...</p>
              </div>
            </div>
          ) : lessons.length > 0 ? (
              <div className="space-y-4">
              {/* Selected Lesson Content */}
              {selectedLesson && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getMediaTypeIcon(selectedLesson.media_type)}
                        <span className="text-sm font-medium">{selectedLesson.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Font Size Controls */}
                        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setFontSize(prev => Math.max(10, prev - 2))}
                            className="h-7 w-7 p-0 hover:bg-gray-100"
                            title="Decrease font size"
                          >
                            <Minus className="h-3.5 w-3.5 text-gray-600" />
                          </Button>
                          <div className="px-2 text-xs text-gray-600 font-medium">
                            <Type className="h-3.5 w-3.5" />
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                            className="h-7 w-7 p-0 hover:bg-gray-100"
                            title="Increase font size"
                          >
                            <Plus className="h-3.5 w-3.5 text-gray-600" />
                          </Button>
                        </div>

                        {/* Voice Controls */}
                        {!isPlaying ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handlePlayLesson}
                            className="flex items-center gap-1.5 text-xs"
                            style={{ 
                              borderColor: palette.violet,
                              color: palette.violet
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = palette.lightViolet;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Volume2 className="h-3.5 w-3.5" style={{ color: palette.violet }} />
                            Listen
                          </Button>
                        ) : isPaused ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleResumeLesson}
                              className="flex items-center gap-1.5 text-xs"
                              style={{ 
                                borderColor: palette.magenta,
                                color: palette.magenta
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = palette.lightMagenta;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Play className="h-3.5 w-3.5" style={{ color: palette.magenta }} />
                              Resume
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleStopLesson}
                              className="flex items-center gap-1.5 text-xs"
                              style={{ 
                                borderColor: palette.coral,
                                color: palette.coral
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = palette.lightCoral;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <VolumeX className="h-3.5 w-3.5" style={{ color: palette.coral }} />
                              Stop
                            </Button>
                          </div>
                        ) : (
              <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handlePauseLesson}
                              className="flex items-center gap-1.5 text-xs"
                              style={{ 
                                borderColor: palette.magenta,
                                color: palette.magenta
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = palette.lightMagenta;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <Pause className="h-3.5 w-3.5" style={{ color: palette.magenta }} />
                              Pause
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleStopLesson}
                              className="flex items-center gap-1.5 text-xs"
                              style={{ 
                                borderColor: palette.coral,
                                color: palette.coral
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = palette.lightCoral;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <VolumeX className="h-3.5 w-3.5" style={{ color: palette.coral }} />
                              Stop
                            </Button>
              </div>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {selectedLesson.media_type || 'text'}
                        </Badge>
                      </div>
            </div>
                  </div>
                  <div className="p-4">
                    <div className="prose prose-sm max-w-none">
                      <div 
                        ref={lessonContentRef}
                        className="text-gray-700 leading-relaxed"
                        style={{ fontSize: `${fontSize}px`, fontFamily: 'Nunito, sans-serif' }}
                        dangerouslySetInnerHTML={{
                          __html: (() => {
                            const content = highlightedText || selectedLesson.content
                              // Remove asterisks
                              .replace(/\*\*/g, '')
                              .replace(/\*/g, '');
                            
                            const lines = content.split('\n');
                            let html = '';
                            let inBulletList = false;
                            
                            for (let i = 0; i < lines.length; i++) {
                              const line = lines[i];
                              const trimmed = line.trim();
                              
                              // Check if this line starts with "-"
                              if (trimmed.startsWith('-')) {
                                // Start bullet list if not already in one
                                if (!inBulletList) {
                                  html += '<ul class="list-disc list-inside mb-2 space-y-1 ml-4">';
                                  inBulletList = true;
                                }
                                // Add bullet point (remove the dash and trim)
                                const bulletText = trimmed.substring(1).trim();
                                html += `<li class="text-gray-700">${bulletText}</li>`;
                              } else {
                                // Close bullet list if we were in one
                                if (inBulletList) {
                                  html += '</ul>';
                                  inBulletList = false;
                                }
                                
                                // Main headings (all caps or starts with number)
                                if (trimmed && (line === line.toUpperCase() || /^\d+\./.test(trimmed))) {
                                  html += `<h3 class="text-base font-bold text-gray-900 mt-4 mb-2">${trimmed}</h3>`;
                                }
                                // Sub-headings (Title Case)
                                else if (trimmed && /^[A-Z][a-z]+/.test(trimmed) && trimmed.length < 100 && !trimmed.includes('.') && !trimmed.includes(',')) {
                                  html += `<h4 class="text-sm font-semibold text-gray-800 mt-3 mb-1">${trimmed}</h4>`;
                                }
                                // Regular paragraphs
                                else if (trimmed) {
                                  html += `<p class="mb-2">${trimmed}</p>`;
                                }
                              }
                            }
                            
                            // Close bullet list if still open at the end
                            if (inBulletList) {
                              html += '</ul>';
                            }
                            
                            return html;
                          })()
                        }}
                      />
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created: {formatDate(selectedLesson.created_at)}</span>
                        <span>Updated: {formatDate(selectedLesson.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Lessons Available</h3>
              <p className="text-sm text-gray-600">
                No lessons found for this topic. Please check if data exists in your lessons table.
                     </p>
                        </div>
                 )}
                            </div>
                            
        {/* Right - AI Tutor Chat Panel */}
        <div className="relative w-[500px] border-l border-gray-200 flex flex-col shadow-xl bg-white">
          {/* Chat Header */}
          <div className="text-white p-4 shadow-lg" style={{ 
            background: `linear-gradient(90deg, ${palette.violet}, ${palette.magenta}, ${palette.coral})` 
          }}>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">AI Tutor</div>
                <div className="flex items-center text-xs" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
                  Always Available
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startNewChat}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  title="New Chat"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistorySidebar(!showHistorySidebar)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 relative"
                  title="Chat History"
                >
                  <History className="h-4 w-4" />
                  {chatHistory.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                      {chatHistory.length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Chat History Sidebar */}
          {showHistorySidebar && (
            <div className="absolute inset-y-0 right-full w-[350px] bg-white border-r border-gray-200 shadow-2xl z-50 flex flex-col">
              {/* Sidebar Header */}
              <div className="text-white p-4" style={{ 
                background: `linear-gradient(90deg, ${palette.violet}, ${palette.magenta})` 
              }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    <h3 className="font-bold text-sm">Chat History</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistorySidebar(false)}
                    className="text-white hover:bg-white/20 h-7 w-7 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={startNewChat}
                  className="w-full text-white border border-white/30"
                  style={{ background: '#000000' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>
              
              {/* History List */}
              <div className="flex-1 overflow-y-auto p-2">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 mb-1">No chat history yet</p>
                    <p className="text-xs text-gray-400">Start a conversation to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatHistory.map((chat) => (
                      <div
                        key={chat.id}
                        className={`group relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          currentChatId === chat.id
                            ? 'border-gray-200'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        style={currentChatId === chat.id ? {
                          borderColor: palette.violet,
                          backgroundColor: palette.lightViolet
                        } : {}}
                        onMouseEnter={(e) => {
                          if (currentChatId !== chat.id) {
                            e.currentTarget.style.borderColor = palette.violet;
                            e.currentTarget.style.backgroundColor = palette.lightViolet;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentChatId !== chat.id) {
                            e.currentTarget.style.borderColor = '#E5E7EB';
                            e.currentTarget.style.backgroundColor = '';
                          }
                        }}
                        onClick={() => loadChatFromHistory(chat.id)}
                      >
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate mb-1">
                              {chat.title}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {new Date(chat.lastUpdated).toLocaleDateString()} at {new Date(chat.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {chat.messages.filter(m => m.role === 'user').length} messages
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChatFromHistory(chat.id);
                          }}
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto bg-white">
            {chatMessages.length === 0 ? (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ 
                  background: `linear-gradient(135deg, ${palette.violet}, ${palette.magenta})` 
                }}>
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="text-black p-3 rounded-2xl max-w-[85%] text-xs shadow-sm" style={{ 
                  fontFamily: 'Nunito, sans-serif',
                  background: `linear-gradient(135deg, ${palette.lightViolet}, ${palette.lightMagenta})`,
                  borderColor: palette.violet,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}>
                  {storedTopicData 
                    ? selectedLesson
                      ? `Hi! I'm here to help you understand "${selectedLesson.title}" from the ${storedTopicData.title} topic. Feel free to ask me any questions about this lesson!`
                      : `Hi! I'm here to help you with ${storedTopicData.title}. Please select a lesson to get started!`
                    : "Hi! I'm here to help you with your studies. Please select a topic to get started!"
                  }
                </div>
              </div>
            ) : (
              <div className="space-y-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex items-start gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ 
                        background: `linear-gradient(135deg, ${palette.violet}, ${palette.magenta})` 
                      }}>
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl max-w-[80%] text-xs shadow-sm ${
                      message.role === 'user' 
                        ? 'text-white' 
                        : 'text-black'
                    }`}
                    style={message.role === 'user' ? {
                      background: `linear-gradient(135deg, ${palette.violet}, ${palette.magenta}, ${palette.coral})`
                    } : {
                      background: `linear-gradient(135deg, ${palette.lightViolet}, ${palette.lightMagenta})`,
                      borderColor: palette.violet,
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}>
                      {message.role === 'assistant' ? (
                        <>
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: message.content
                                // Remove all asterisks first
                                .replace(/\*\*/g, '')
                                .replace(/\*/g, '')
                                .split('\n\n')
                                .map(para => {
                                  const trimmed = para.trim();
                                  // Check if it's a heading (starts with # or all caps short line)
                                  if (trimmed.startsWith('#')) {
                                    const level = trimmed.match(/^#+/)?.[0].length || 1;
                                    const text = trimmed.replace(/^#+\s*/, '');
                                    return `<h${Math.min(level, 4)} class="font-bold text-gray-900 mt-3 mb-2">${text}</h${Math.min(level, 4)}>`;
                                  } else if (trimmed.length < 60 && trimmed === trimmed.toUpperCase() && trimmed.length > 0) {
                                    return `<h3 class="font-bold text-gray-900 mt-3 mb-2">${trimmed}</h3>`;
                                  } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                                    // Bullet list
                                    const items = para.split('\n').filter(line => line.trim());
                                    const listItems = items.map(item => {
                                      const text = item.replace(/^[-•]\s*/, '').trim();
                                      return `<li class="ml-4">${text}</li>`;
                                    }).join('');
                                    return `<ul class="list-disc list-outside mb-2 space-y-1">${listItems}</ul>`;
                                  } else if (trimmed.match(/^\d+\./)) {
                                    // Numbered list
                                    const items = para.split('\n').filter(line => line.trim());
                                    const listItems = items.map(item => {
                                      const text = item.replace(/^\d+\.\s*/, '').trim();
                                      return `<li class="ml-4">${text}</li>`;
                                    }).join('');
                                    return `<ol class="list-decimal list-outside mb-2 space-y-1">${listItems}</ol>`;
                                  } else if (trimmed) {
                                    return `<p class="mb-2 leading-relaxed">${trimmed}</p>`;
                                  }
                                  return '';
                                })
                                .join('')
                            }}
                          />
                          {message.reasoningLabel && (
                            <div className="mt-2 text-[10px] text-gray-600">
                              Reasoning: <span className="font-semibold">{message.reasoningLabel}</span>
                            </div>
                          )}
                          {message.readiness && (
                            <div className="mt-1 text-[10px] text-blue-700">
                              Readiness Level: {message.readiness.overall_readiness}
                            </div>
                          )}
                          {message.learningPath && (
                            <div className="mt-1 text-[10px] text-purple-700">
                              Next Step: {message.learningPath.recommended_concept_name || message.learningPath.recommended_concept || message.learningPath.decision}
                            </div>
                          )}
                        </>
                      ) : (
                        message.content
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ 
                        background: `linear-gradient(135deg, ${palette.violet}, ${palette.magenta}, ${palette.coral})` 
                      }}>
                        <User className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ 
                      background: `linear-gradient(135deg, ${palette.violet}, ${palette.magenta})` 
                    }}>
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-black p-3 rounded-2xl max-w-[80%] text-xs shadow-sm" style={{ 
                      fontFamily: 'Nunito, sans-serif',
                      background: `linear-gradient(135deg, ${palette.lightViolet}, ${palette.lightMagenta})`,
                      borderColor: palette.violet,
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: palette.violet }}></div>
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{backgroundColor: palette.magenta, animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{backgroundColor: palette.coral, animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <Input
                placeholder={
                  selectedLesson 
                    ? `Ask me about "${selectedLesson.title}"...`
                    : "Ask me anything about this topic..."
                }
                className="flex-1 text-xs border-2 rounded-xl py-2 px-3"
                style={{ 
                  borderColor: '#E5E7EB'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = palette.violet;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                }}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isLoading}
              />
              <Button 
                size="sm" 
                className="text-white px-4 shadow-lg hover:shadow-xl transition-all"
                style={{ background: '#000000' }}
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Suggested Questions - Only show when NO related concepts */}
            {suggestions.length > 0 && relatedConcepts.length === 0 && (
              <div className="mt-3">
                <div className="text-[10px] font-medium text-black mb-1.5 flex items-center gap-1.5">
                  <Lightbulb className="h-3 w-3" style={{ color: palette.violet }} />
                  Suggested questions:
                </div>
                <div className="flex flex-col gap-1.5">
                  {suggestions.slice(0, 4).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={async () => {
                        setInputMessage('');
                        
                        // Add user message immediately
                        const newUserMessage = {
                          role: 'user' as const,
                          content: suggestion,
                          timestamp: new Date().toISOString()
                        };
                        
                        setChatMessages(prev => [...prev, newUserMessage]);
                        setIsLoading(true);
                        
                        try {
                          // Get user ID - use from user object or fallback to 'anonymous'
                          const userId = user?.id || 'anonymous';
                          
                          // Get topic ID - from storedTopicData or localStorage
                          let topicId: string | number;
                          if (storedTopicData?.topic_id) {
                            topicId = storedTopicData.topic_id;
                          } else {
                            const storedTopicId = localStorage.getItem('selectedTopicId');
                            if (storedTopicId) {
                              topicId = storedTopicId;
                            } else {
                              throw new Error('Topic ID not found. Please select a topic first.');
                            }
                          }
                          
                          // Auto-generate conversation ID if not set
                          let conversationId = currentChatId;
                          if (!conversationId) {
                            conversationId = `${userId}_${topicId}`;
                            setCurrentChatId(conversationId);
                          }
                          
                          const lessonContent = selectedLesson?.content || '';
                          const response = await aiTutorService.sendMessage(
                            suggestion,
                            lessonContent,
                            topicId,
                            userId,
                            conversationId
                          );
                          
                          if (response.success && response.data) {
                            // Store metadata from backend
                            setRelatedConcepts(response.data.related_concepts || []);
                            setReasoningLabel(response.data.reasoning_label || "");
                            setReadiness(response.data.readiness || null);
                            setLearningPath(response.data.learning_path || null);
                            
                            const aiMessage = {
                              role: 'assistant' as const,
                              content: response.data.response,
                              timestamp: new Date().toISOString(),
                              reasoningLabel: response.data.reasoning_label || "",
                              relatedConcepts: response.data.related_concepts || [],
                              readiness: response.data.readiness || null,
                              learningPath: response.data.learning_path || null
                            };
                            
                            setChatMessages(prev => [...prev, aiMessage]);
                            setSuggestions(response.data.suggestions || []);
                          }
                        } catch (error) {
                          console.error('Error sending message:', error);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="text-[10px] text-left px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer text-black"
                      style={{ 
                        background: `linear-gradient(90deg, ${palette.lightViolet}, ${palette.lightMagenta})`,
                        borderColor: palette.violet,
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(90deg, ${palette.lightMagenta}, ${palette.lightCoral})`;
                        e.currentTarget.style.borderColor = palette.magenta;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(90deg, ${palette.lightViolet}, ${palette.lightMagenta})`;
                        e.currentTarget.style.borderColor = palette.violet;
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}