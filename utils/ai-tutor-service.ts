// AI Tutor Service for React Frontend
interface TutorResponse {
  response: string;
  suggestions: string[];
  related_concepts: string[];
  related_concept_ids: string[];
  confidence_score: number;
  reasoning_label: string;
  mastery_updates: any[];
  readiness: any;
  learning_path: any;
  token_usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface LessonResponse {
  lesson_content: string;
  key_points: string[];
  practice_questions: string[];
  estimated_duration: number;
}

class AITutorService {
  private baseURL: string;
  private currentTopic: string | null;
  private userId: string | null;

  constructor() {
    // Force localhost for local development (Railway backend deleted)
    // Use environment variable for API base URL, but default to localhost
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    // If Railway URL is detected, use localhost instead
    if (envUrl && envUrl.includes('railway')) {
      console.warn('⚠️ Railway URL detected, using localhost:8000 instead');
      this.baseURL = 'http://localhost:8000';
    } else {
      this.baseURL = envUrl || 'http://localhost:8000';
    }
    this.currentTopic = null;
    this.userId = null;
  }

  // Set user ID for conversation tracking
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Set current topic
  setCurrentTopic(topic: string): void {
    this.currentTopic = topic;
  }

  // Send message to AI Tutor
  async sendMessage(
    message: string,
    lessonContent: string | undefined,
    topicId: string | number,
    userId: string,
    conversationId: string,
    conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>
  ): Promise<{
    success: boolean;
    data?: TutorResponse;
    error?: string;
  }> {
    try {
      // Format conversation history for backend
      // Backend expects: [{role: "user", content: "..."}, {role: "assistant", content: "..."}]
      const formattedHistory = conversationHistory?.map(msg => ({
        role: msg.role,
        content: msg.content
      })) || [];

      const response = await fetch(`${this.baseURL}/tutor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          topic: topicId.toString(),
          user_id: userId,
          conversation_id: conversationId,
          conversation_history: formattedHistory,
          explanation_style: "default"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data
      };
    } catch (err) {
      console.error("AI Tutor Error:", err);
      return { success: false };
    }
  }

  // Generate custom lesson
  async generateLesson(
    topic: string, 
    learningObjectives: string[], 
    difficultyLevel: string = 'intermediate'
  ): Promise<{
    success: boolean;
    data?: LessonResponse;
    error?: string;
  }> {
    try {
      const requestBody = {
        topic: topic,
        learning_objectives: learningObjectives,
        difficulty_level: difficultyLevel
      };

      const response = await fetch(`${this.baseURL}/tutor/generate-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LessonResponse = await response.json();
      return { success: true, data: data };

    } catch (error) {
      console.error('Error generating lesson:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get available topics
  async getAvailableTopics(): Promise<{
    success: boolean;
    data?: string[];
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/tutor/topics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.topics };

    } catch (error) {
      console.error('Error fetching topics:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Health check
  async healthCheck(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/tutor/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data };

    } catch (error) {
      console.error('Health check failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Test LangChain AI Tutor connection
  async testLangChainConnection(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      console.log('🧪 Testing LangChain AI Tutor connection...');
      
      const testMessage = "Hello! Can you briefly explain what Business Strategy means?";
      // Test with minimal required parameters
      const response = await this.sendMessage(
        testMessage,
        undefined,
        '1',
        this.userId || 'anonymous',
        `${this.userId || 'anonymous'}_1`
      );
      
      if (response.success && response.data) {
        console.log('✅ LangChain AI Tutor connection test successful!');
        return { 
          success: true, 
          data: {
            message: 'LangChain AI Tutor is working perfectly!',
            response: response.data.response,
            confidence: response.data.confidence_score
          }
        };
      } else {
        throw new Error('Failed to get response from LangChain AI Tutor');
      }

    } catch (error) {
      console.error('❌ LangChain AI Tutor connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }


  // Export conversation history
  exportConversation(): void {
    const conversation = {
      topic: this.currentTopic,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      messages: []
    };
    
    const blob = new Blob([JSON.stringify(conversation, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tutor-conversation-${this.currentTopic}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
const aiTutorService = new AITutorService();

export default aiTutorService;
