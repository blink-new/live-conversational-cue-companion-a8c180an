
import { v4 as uuidv4 } from 'uuid';
import { AssistantMode, CallSettings, Message, MessageType, Topic } from '@/types';

// In a production app, we would use a real AI model like PhoneLM
// This is a simulated AI assistant that provides realistic responses

interface ConversationContext {
  transcript: string[];
  currentTopics: string[];
  settings: CallSettings;
  lastUserMessage?: string;
}

export class AIAssistant {
  private context: ConversationContext;
  
  constructor(settings: CallSettings) {
    this.context = {
      transcript: [],
      currentTopics: [],
      settings
    };
  }

  public updateSettings(settings: CallSettings) {
    this.context.settings = settings;
  }

  public updateTranscript(text: string) {
    this.context.transcript.push(text);
    
    // Keep only the last 10 transcript entries to simulate a rolling window
    if (this.context.transcript.length > 10) {
      this.context.transcript = this.context.transcript.slice(-10);
    }
    
    // Update current topics based on transcript
    this.updateCurrentTopics();
  }

  public setUserMessage(message: string) {
    this.context.lastUserMessage = message;
  }

  private updateCurrentTopics() {
    const allTopics = [
      ...this.context.settings.topics.map(t => t.title.toLowerCase()),
      ...this.context.settings.avoidTopics.map(t => t.toLowerCase())
    ];
    
    this.context.currentTopics = allTopics.filter(topic => 
      this.context.transcript.some(line => 
        line.toLowerCase().includes(topic.toLowerCase())
      )
    );
  }

  public async generateResponse(forceType?: MessageType): Promise<Message> {
    // In a real implementation, this would call the AI model
    const messageType = forceType || this.determineMessageType();
    const content = await this.generateContentForType(messageType);
    
    return {
      id: uuidv4(),
      type: messageType,
      content,
      timestamp: new Date()
    };
  }

  private determineMessageType(): MessageType {
    const { mode } = this.context.settings;
    
    // If user asked a question, respond to it
    if (this.context.lastUserMessage) {
      return 'response';
    }
    
    // In silent mode, don't generate unprompted messages
    if (mode === 'silent') {
      return 'suggestion';
    }
    
    // Check if we need to give a reminder
    const shouldRemind = this.context.settings.reminders.length > 0 && Math.random() > 0.7;
    if (shouldRemind) {
      return 'reminder';
    }
    
    // Check if user is discussing an avoid topic
    const isDiscussingAvoidTopic = this.context.settings.avoidTopics.some(topic => 
      this.context.currentTopics.includes(topic.toLowerCase())
    );
    
    if (isDiscussingAvoidTopic && (mode === 'assertive' || Math.random() > 0.5)) {
      return 'alert';
    }
    
    // Default to suggestion
    return 'suggestion';
  }

  private async generateContentForType(type: MessageType): Promise<string> {
    // In a real implementation, this would use the AI model to generate content
    // Here we're using predefined responses based on the context
    
    switch (type) {
      case 'suggestion':
        return this.generateSuggestion();
      case 'alert':
        return this.generateAlert();
      case 'reminder':
        return this.generateReminder();
      case 'response':
        return this.generateDirectResponse();
      default:
        return "I'm not sure what to suggest right now.";
    }
  }

  private generateSuggestion(): string {
    // Find topics that haven't been discussed yet
    const discussedTopics = this.context.currentTopics;
    const undiscussedTopics = this.context.settings.topics.filter(topic => 
      !discussedTopics.includes(topic.title.toLowerCase())
    );
    
    // If we have a conversation goal, use it to guide suggestions
    if (this.context.settings.conversationGoal && Math.random() > 0.7) {
      const goal = this.context.settings.conversationGoal;
      
      const goalSuggestions = [
        `Remember your goal: ${goal}`,
        `To achieve your goal, try asking about their perspective on ${goal.split(' ').slice(0, 3).join(' ')}...`,
        `Based on your goal, now would be a good time to steer the conversation toward ${goal.split(' ').slice(-3).join(' ')}`,
        `Keep your goal in mind: ${goal}`,
      ];
      
      return goalSuggestions[Math.floor(Math.random() * goalSuggestions.length)];
    }
    
    if (undiscussedTopics.length > 0) {
      // Suggest a topic that hasn't been discussed
      const topic = undiscussedTopics[Math.floor(Math.random() * undiscussedTopics.length)];
      
      const suggestions = [
        `Ask about ${topic.title}`,
        `Say: "I wanted to talk about ${topic.title}. What do you think?"`,
        `Transition to ${topic.title} by saying: "By the way, regarding ${topic.title}..."`,
        `Bring up ${topic.title} now`,
      ];
      
      return suggestions[Math.floor(Math.random() * suggestions.length)];
    } else if (this.context.transcript.length > 0) {
      // General conversation suggestions
      const suggestions = [
        "Ask them to elaborate on their last point",
        "Nod and say 'That's interesting, tell me more'",
        "Summarize what they've said to show you're listening",
        "Share a brief related experience of your own",
        "Ask: 'How do you feel about that?'",
      ];
      
      return suggestions[Math.floor(Math.random() * suggestions.length)];
    } else {
      // Starting conversation
      return "Start with a friendly greeting and ask how they're doing";
    }
  }

  private generateAlert(): string {
    // Check if discussing avoid topics
    for (const avoidTopic of this.context.settings.avoidTopics) {
      if (this.context.currentTopics.includes(avoidTopic.toLowerCase())) {
        return `Careful! The conversation is drifting toward ${avoidTopic}. Try to redirect.`;
      }
    }
    
    // Check if we're getting off track from our goal
    if (this.context.settings.conversationGoal && Math.random() > 0.5) {
      return `You're getting off track from your goal: ${this.context.settings.conversationGoal}. Try to refocus.`;
    }
    
    // General alerts
    const alerts = [
      "You're speaking too quickly. Slow down and take a breath.",
      "You've been talking for a while. Give them a chance to respond.",
      "Your tone is getting tense. Try to stay calm and measured.",
      "You're starting to go off-topic. Refocus on your main points.",
      "Be careful - you might be agreeing to something you wanted to avoid.",
    ];
    
    return alerts[Math.floor(Math.random() * alerts.length)];
  }

  private generateReminder(): string {
    // Remind about the conversation goal
    if (this.context.settings.conversationGoal && Math.random() > 0.6) {
      return `Goal reminder: ${this.context.settings.conversationGoal}`;
    }
    
    if (this.context.settings.reminders.length > 0) {
      const reminder = this.context.settings.reminders[
        Math.floor(Math.random() * this.context.settings.reminders.length)
      ];
      
      return `Remember: ${reminder}`;
    }
    
    return "Remember your goals for this conversation";
  }

  private generateDirectResponse(): string {
    if (!this.context.lastUserMessage) {
      return this.generateSuggestion();
    }
    
    const message = this.context.lastUserMessage.toLowerCase();
    
    // Handle specific user questions
    if (message.includes("talking too much")) {
      return "Yes, try to be more concise. Say: 'But to get to the point...'";
    } else if (message.includes("sound rude") || message.includes("was i rude")) {
      return "No, you were clear and respectful. Continue with confidence.";
    } else if (message.includes("remind me")) {
      // Extract reminder text and time if present
      const reminderMatch = message.match(/remind me (?:to|about) (.+?)(?: in (\d+) min)?/i);
      if (reminderMatch) {
        const reminderText = reminderMatch[1];
        const minutes = reminderMatch[2] ? parseInt(reminderMatch[2]) : null;
        
        if (minutes) {
          return `Noted. Will remind you about "${reminderText}" in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
        } else {
          return `I'll remind you about "${reminderText}" shortly.`;
        }
      }
      return "I'll remind you about that soon.";
    } else if (message.includes("what do i say") || message.includes("what should i say") || message.includes("he's quiet") || message.includes("she's quiet") || message.includes("they're quiet")) {
      // Suggest something to say based on current topics and goal
      if (this.context.settings.conversationGoal) {
        return `Based on your goal, ask: "I'd like to know more about your thoughts on ${this.context.settings.conversationGoal.split(' ').slice(-3).join(' ')}?"`;
      }
      
      const undiscussedTopics = this.context.settings.topics.filter(topic => 
        !this.context.currentTopics.includes(topic.title.toLowerCase())
      );
      
      if (undiscussedTopics.length > 0) {
        const topic = undiscussedTopics[0];
        return `Ask: "What's your take on ${topic.title}?"`;
      } else {
        return "Ask: 'What are your thoughts on that?' or 'Could you tell me more about your perspective?'";
      }
    } else if (message.includes("nervous") || message.includes("anxious") || message.includes("anxiety")) {
      return "Take a deep breath. Speak slowly and remember you're doing great. It's okay to pause.";
    } else if (message.includes("end the call") || message.includes("wrap up") || message.includes("finish")) {
      return "Say: 'I should let you go. It was great talking with you. Let's catch up again soon.'";
    } else if (message.includes("goal") || message.includes("purpose") || message.includes("objective")) {
      // Respond about the conversation goal
      if (this.context.settings.conversationGoal) {
        return `Your goal is: ${this.context.settings.conversationGoal}. Stay focused on this.`;
      } else {
        return "You haven't set a specific goal for this conversation. You can add one in the settings.";
      }
    } else if (message.includes("next topic") || message.includes("what topic")) {
      // Suggest the next topic to discuss
      const undiscussedTopics = this.context.settings.topics.filter(topic => 
        !this.context.currentTopics.includes(topic.title.toLowerCase())
      );
      
      if (undiscussedTopics.length > 0) {
        const nextTopic = undiscussedTopics[0];
        return `Next topic: ${nextTopic.title}. Try saying: "I'd like to talk about ${nextTopic.title} now."`;
      } else {
        return "You've covered all your planned topics. You could ask if they have anything they'd like to discuss.";
      }
    } else {
      // Generic responses
      const responses = [
        "Try to speak more slowly and clearly",
        "That's a good point to bring up",
        "Ask them to elaborate on what they just said",
        "You could transition to another topic now",
        "You're doing well. Keep the conversation flowing naturally.",
        "Maintain eye contact and nod to show you're engaged.",
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
}