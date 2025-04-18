
import { useState, useEffect, useCallback } from 'react'
import { faker } from '@faker-js/faker'
import { AssistantMode, CallSettings, CallState, Conversation, Message, MessageType, Topic } from '@/types'

// This is a mock implementation that simulates the behavior of the call assistant
// In a real implementation, this would connect to a speech recognition service and AI model

export function useCallAssistant() {
  const [callState, setCallState] = useState<CallState>('idle')
  const [conversation, setConversation] = useState<Conversation>({
    id: crypto.randomUUID(),
    transcript: [],
    messages: [],
  })
  const [settings, setSettings] = useState<CallSettings>({
    mode: 'suggestive',
    topics: [
      { id: crypto.randomUUID(), title: 'School' },
      { id: crypto.randomUUID(), title: 'New Mercedes' },
      { id: crypto.randomUUID(), title: 'Upcoming vacation' },
    ],
    reminders: ['Mention the project deadline', 'Ask about family'],
    avoidTopics: ['Politics', 'Religion'],
  })

  // Mock function to simulate speech recognition
  const simulateTranscript = useCallback(() => {
    if (callState !== 'active') return

    const speakers = ['You', 'Them']
    const speaker = speakers[Math.floor(Math.random() * speakers.length)]
    
    // Generate a random sentence based on the topics
    let sentence = ''
    const allTopics = [...settings.topics.map(t => t.title), ...settings.avoidTopics]
    const randomTopic = allTopics[Math.floor(Math.random() * allTopics.length)]
    
    if (Math.random() > 0.7) {
      // Sometimes mention a topic
      sentence = faker.helpers.arrayElement([
        `${speaker}: I wanted to talk about ${randomTopic}.`,
        `${speaker}: What do you think about ${randomTopic}?`,
        `${speaker}: Have you heard about the ${randomTopic}?`,
      ])
    } else {
      // General conversation
      sentence = faker.helpers.arrayElement([
        `${speaker}: ${faker.word.words(5 + Math.floor(Math.random() * 10))}`,
        `${speaker}: I think that's interesting.`,
        `${speaker}: I'm not sure about that.`,
        `${speaker}: Could you explain more?`,
        `${speaker}: That makes sense.`,
      ])
    }
    
    setConversation(prev => ({
      ...prev,
      transcript: [...prev.transcript, sentence],
    }))
  }, [callState, settings])

  // Generate assistant messages based on the transcript and settings
  const generateAssistantMessage = useCallback(() => {
    if (callState !== 'active' || settings.mode === 'silent') return
    
    const messageTypes: MessageType[] = ['suggestion', 'alert', 'reminder', 'response']
    const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)]
    
    let content = ''
    
    switch (randomType) {
      case 'suggestion':
        const randomTopic = settings.topics[Math.floor(Math.random() * settings.topics.length)]
        content = faker.helpers.arrayElement([
          `Ask about ${randomTopic.title}`,
          `Say: "What do you think about ${randomTopic.title}?"`,
          `Transition to ${randomTopic.title} by saying: "By the way..."`,
        ])
        break
      case 'alert':
        const avoidTopic = settings.avoidTopics[Math.floor(Math.random() * settings.avoidTopics.length)]
        content = faker.helpers.arrayElement([
          `Careful, the conversation is drifting toward ${avoidTopic}`,
          `You're talking too fast, slow down a bit`,
          `You've been silent for a while, try asking a question`,
        ])
        break
      case 'reminder':
        const reminder = settings.reminders[Math.floor(Math.random() * settings.reminders.length)]
        content = `Remember: ${reminder}`
        break
      case 'response':
        content = faker.helpers.arrayElement([
          `You're doing great, keep going`,
          `That was clear and concise`,
          `Good point, they seem interested`,
          `Try to let them speak more`,
        ])
        break
    }
    
    const newMessage: Message = {
      id: crypto.randomUUID(),
      type: randomType,
      content,
      timestamp: new Date(),
    }
    
    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }))
  }, [callState, settings])

  // Start the call
  const startCall = useCallback(() => {
    setCallState('active')
    setConversation({
      id: crypto.randomUUID(),
      transcript: [],
      messages: [{
        id: crypto.randomUUID(),
        type: 'suggestion',
        content: 'Start with a friendly greeting',
        timestamp: new Date(),
      }],
      startTime: new Date(),
    })
  }, [])

  // End the call
  const endCall = useCallback(() => {
    setCallState('ended')
    setConversation(prev => ({
      ...prev,
      endTime: new Date(),
    }))
    
    // Reset after a delay
    setTimeout(() => {
      setCallState('idle')
    }, 2000)
  }, [])

  // Handle user messages
  const sendMessage = useCallback((content: string) => {
    if (callState !== 'active') return
    
    // Generate a response based on the user's message
    setTimeout(() => {
      const responseTypes: MessageType[] = ['suggestion', 'response']
      const responseType = responseTypes[Math.floor(Math.random() * responseTypes.length)]
      
      let responseContent = ''
      
      if (content.toLowerCase().includes('talking too much')) {
        responseContent = 'Yes, try to be more concise. Say: "But to get to the point..."'
      } else if (content.toLowerCase().includes('sound rude')) {
        responseContent = 'No, you were clear and respectful'
      } else if (content.toLowerCase().includes('remind me')) {
        responseContent = 'I\'ll remind you in a moment'
        
        // Set a reminder
        const match = content.match(/remind me to (.+) in (\d+) min/)
        if (match) {
          const reminderText = match[1]
          const minutes = parseInt(match[2])
          
          setTimeout(() => {
            const reminderMessage: Message = {
              id: crypto.randomUUID(),
              type: 'reminder',
              content: `Reminder: ${reminderText}`,
              timestamp: new Date(),
            }
            
            setConversation(prev => ({
              ...prev,
              messages: [...prev.messages, reminderMessage],
            }))
          }, minutes * 60 * 1000)
          
          responseContent = `Noted. Will remind you about "${reminderText}" in ${minutes} minute${minutes > 1 ? 's' : ''}`
        }
      } else if (content.toLowerCase().includes('what do i say')) {
        const randomTopic = settings.topics[Math.floor(Math.random() * settings.topics.length)]
        responseContent = `Ask: "What's your take on ${randomTopic.title}?"`
      } else {
        responseContent = faker.helpers.arrayElement([
          'Try to speak more slowly and clearly',
          'That\'s a good point to bring up',
          'Ask them to elaborate on what they just said',
          'You could transition to another topic now',
        ])
      }
      
      const newMessage: Message = {
        id: crypto.randomUUID(),
        type: responseType,
        content: responseContent,
        timestamp: new Date(),
      }
      
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }))
    }, 500)
  }, [callState, settings])

  // Simulate transcript and assistant messages during active calls
  useEffect(() => {
    if (callState !== 'active') return
    
    // Simulate transcript updates
    const transcriptInterval = setInterval(() => {
      simulateTranscript()
    }, 3000)
    
    // Simulate assistant messages based on mode
    const messageInterval = setInterval(() => {
      if (Math.random() > 0.5 || settings.mode === 'assertive') {
        generateAssistantMessage()
      }
    }, settings.mode === 'assertive' ? 5000 : 10000)
    
    return () => {
      clearInterval(transcriptInterval)
      clearInterval(messageInterval)
    }
  }, [callState, settings, simulateTranscript, generateAssistantMessage])

  return {
    callState,
    conversation,
    settings,
    startCall,
    endCall,
    sendMessage,
    updateSettings: setSettings,
  }
}