
export type AssistantMode = 'silent' | 'suggestive' | 'assertive';

export type CallState = 'idle' | 'connecting' | 'active' | 'ended';

export type MessageType = 'suggestion' | 'alert' | 'reminder' | 'response';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  transcript: string[];
  messages: Message[];
  startTime?: Date;
  endTime?: Date;
}

export interface Topic {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
}

export interface CallSettings {
  mode: AssistantMode;
  topics: Topic[];
  reminders: string[];
  avoidTopics: string[];
  conversationGoal?: string;
}