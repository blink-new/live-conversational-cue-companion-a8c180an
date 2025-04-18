
import { useState, useEffect, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { AssistantMode, CallSettings, CallState, Conversation, Message, MessageType, Topic } from '@/types'
import { speechRecognition, SpeechRecognitionResult } from '@/lib/speech-recognition'
import { AIAssistant } from '@/lib/ai-assistant'

export function useCallAssistant() {
  const [callState, setCallState] = useState<CallState>('idle')
  const [conversation, setConversation] = useState<Conversation>({
    id: uuidv4(),
    transcript: [],
    messages: [],
  })
  const [settings, setSettings] = useState<CallSettings>({
    mode: 'suggestive',
    topics: [
      { id: uuidv4(), title: 'School' },
      { id: uuidv4(), title: 'New Mercedes' },
      { id: uuidv4(), title: 'Upcoming vacation' },
    ],
    reminders: ['Mention the project deadline', 'Ask about family'],
    avoidTopics: ['Politics', 'Religion'],
    conversationGoal: 'Have a friendly catch-up and discuss recent updates',
  })

  // Refs to maintain state in callbacks
  const callStateRef = useRef(callState)
  const settingsRef = useRef(settings)
  const aiAssistantRef = useRef<AIAssistant | null>(null)
  const messageTimeoutRef = useRef<number | null>(null)
  const reminderTimeoutsRef = useRef<{[key: string]: number}>({})
  const recognitionRestartRef = useRef<number | null>(null)

  // Update refs when state changes
  useEffect(() => {
    callStateRef.current = callState
  }, [callState])

  useEffect(() => {
    settingsRef.current = settings
    if (aiAssistantRef.current) {
      aiAssistantRef.current.updateSettings(settings)
    }
  }, [settings])

  // Handle speech recognition results
  const handleSpeechResult = useCallback((result: SpeechRecognitionResult) => {
    if (callStateRef.current !== 'active') return
    
    if (result.isFinal && result.transcript.trim()) {
      const speaker = 'You' // In a real app, we would detect the speaker
      const newTranscriptLine = `${speaker}: ${result.transcript}`
      
      setConversation(prev => ({
        ...prev,
        transcript: [...prev.transcript, newTranscriptLine],
      }))
      
      // Update AI assistant with new transcript
      if (aiAssistantRef.current) {
        aiAssistantRef.current.updateTranscript(newTranscriptLine)
        
        // Generate a response if in assertive mode or randomly in suggestive mode
        if (
          settingsRef.current.mode === 'assertive' || 
          (settingsRef.current.mode === 'suggestive' && Math.random() > 0.7)
        ) {
          generateAssistantMessage()
        }
      }
    }
  }, [])

  // Generate an assistant message
  const generateAssistantMessage = useCallback(async (forceType?: MessageType) => {
    if (callStateRef.current !== 'active' || !aiAssistantRef.current) return
    
    try {
      const message = await aiAssistantRef.current.generateResponse(forceType)
      
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, message],
      }))
    } catch (error) {
      console.error('Error generating assistant message', error)
    }
  }, [])

  // Schedule periodic messages based on assistant mode
  const scheduleMessages = useCallback(() => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    
    if (callStateRef.current !== 'active') return
    
    const interval = settingsRef.current.mode === 'assertive' ? 8000 : 15000
    
    messageTimeoutRef.current = window.setTimeout(() => {
      if (callStateRef.current === 'active' && settingsRef.current.mode !== 'silent') {
        generateAssistantMessage()
      }
      scheduleMessages()
    }, interval)
  }, [generateAssistantMessage])

  // Ensure speech recognition is running
  const ensureSpeechRecognition = useCallback(() => {
    if (callStateRef.current !== 'active') return
    
    // Check if speech recognition is still running and restart if needed
    if (!speechRecognition.isListening() && speechRecognition.isSupported()) {
      console.log('Restarting speech recognition')
      speechRecognition.start(handleSpeechResult)
    }
    
    // Schedule next check
    if (recognitionRestartRef.current) {
      clearTimeout(recognitionRestartRef.current)
    }
    
    recognitionRestartRef.current = window.setTimeout(() => {
      ensureSpeechRecognition()
    }, 5000) // Check every 5 seconds
  }, [handleSpeechResult])

  // Start the call
  const startCall = useCallback(() => {
    // Initialize AI assistant
    aiAssistantRef.current = new AIAssistant(settings)
    
    setCallState('active')
    setConversation({
      id: uuidv4(),
      transcript: [],
      messages: [{
        id: uuidv4(),
        type: 'suggestion',
        content: 'Start with a friendly greeting',
        timestamp: new Date(),
      }],
      startTime: new Date(),
    })
    
    // Start speech recognition
    const isRecognitionStarted = speechRecognition.start(handleSpeechResult)
    
    if (!isRecognitionStarted) {
      // If speech recognition fails, add a message
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, {
          id: uuidv4(),
          type: 'alert',
          content: 'Speech recognition not available. This is a simulation mode.',
          timestamp: new Date(),
        }],
      }))
    }
    
    // Schedule periodic messages
    scheduleMessages()
    
    // Start the speech recognition monitoring
    ensureSpeechRecognition()
    
    // Add a goal reminder if one is set
    if (settings.conversationGoal) {
      setTimeout(() => {
        setConversation(prev => ({
          ...prev,
          messages: [...prev.messages, {
            id: uuidv4(),
            type: 'reminder',
            content: `Goal: ${settings.conversationGoal}`,
            timestamp: new Date(),
          }],
        }))
      }, 2000)
    }
  }, [settings, handleSpeechResult, scheduleMessages, ensureSpeechRecognition])

  // End the call
  const endCall = useCallback(() => {
    // Stop speech recognition
    speechRecognition.stop()
    
    // Clear all timeouts
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
      messageTimeoutRef.current = null
    }
    
    if (recognitionRestartRef.current) {
      clearTimeout(recognitionRestartRef.current)
      recognitionRestartRef.current = null
    }
    
    Object.values(reminderTimeoutsRef.current).forEach(timeoutId => {
      clearTimeout(timeoutId)
    })
    reminderTimeoutsRef.current = {}
    
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
  const sendMessage = useCallback(async (content: string) => {
    if (callStateRef.current !== 'active' || !aiAssistantRef.current) return
    
    // Add user message to conversation
    const userMessage: Message = {
      id: uuidv4(),
      type: 'response',
      content: `You asked: ${content}`,
      timestamp: new Date(),
    }
    
    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }))
    
    // Update AI assistant with user message
    aiAssistantRef.current.setUserMessage(content)
    
    // Check for reminder requests
    const reminderMatch = content.match(/remind me (?:to|about) (.+?) in (\\d+) min/i)
    if (reminderMatch) {
      const reminderText = reminderMatch[1]
      const minutes = parseInt(reminderMatch[2])
      
      if (!isNaN(minutes) && minutes > 0) {
        const reminderId = uuidv4()
        
        reminderTimeoutsRef.current[reminderId] = window.setTimeout(() => {
          if (callStateRef.current === 'active') {
            const reminderMessage: Message = {
              id: uuidv4(),
              type: 'reminder',
              content: `Reminder: ${reminderText}`,
              timestamp: new Date(),
            }
            
            setConversation(prev => ({
              ...prev,
              messages: [...prev.messages, reminderMessage],
            }))
          }
          
          delete reminderTimeoutsRef.current[reminderId]
        }, minutes * 60 * 1000)
      }
    }
    
    // Generate a response after a short delay
    setTimeout(() => {
      generateAssistantMessage('response')
    }, 500)
  }, [generateAssistantMessage])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      speechRecognition.stop()
      
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current)
      }
      
      if (recognitionRestartRef.current) {
        clearTimeout(recognitionRestartRef.current)
      }
      
      Object.values(reminderTimeoutsRef.current).forEach(timeoutId => {
        clearTimeout(timeoutId)
      })
    }
  }, [])

  return {
    callState,
    conversation,
    settings,
    startCall,
    endCall,
    sendMessage,
    updateSettings: setSettings,
    isSpeechRecognitionSupported: speechRecognition.isSupported(),
  }
}