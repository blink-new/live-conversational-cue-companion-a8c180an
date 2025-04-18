
import { useState, useEffect } from 'react'
import { Header } from './components/header'
import { CallInterface } from './components/call-interface'
import { SettingsDialog } from './components/settings-dialog'
import { ModeIndicator } from './components/mode-indicator'
import { useCallAssistant } from './hooks/use-call-assistant'
import { ThemeProvider } from './components/ui/theme-provider'
import { Toaster } from './components/ui/toaster'
import { useToast } from './hooks/use-toast'
import { TooltipProvider } from './components/ui/tooltip'

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { toast } = useToast()
  
  const {
    callState,
    conversation,
    settings,
    startCall,
    endCall,
    sendMessage,
    updateSettings,
    isSpeechRecognitionSupported
  } = useCallAssistant()
  
  const handleStartCall = () => {
    startCall()
    toast({
      title: "Call started",
      description: "Your AI assistant is now active",
    })
  }
  
  const handleEndCall = () => {
    endCall()
    toast({
      title: "Call ended",
      description: "Call data has been saved",
    })
  }
  
  const handleSendMessage = (message: string) => {
    sendMessage(message)
  }
  
  const handleSaveSettings = (newSettings: typeof settings) => {
    updateSettings(newSettings)
    toast({
      title: "Settings saved",
      description: "Your call assistant settings have been updated",
    })
  }

  // Show a welcome message on first load
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('callbrain-welcome-seen')
    
    if (!hasSeenWelcome) {
      setTimeout(() => {
        toast({
          title: "Welcome to CallBrain",
          description: "Your AI-powered conversation assistant. Start a call to begin!",
        })
        localStorage.setItem('callbrain-welcome-seen', 'true')
      }, 1000)
    }
  }, [toast])

  return (
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
          <Header 
            callState={callState}
            mode={settings.mode}
            onStartCall={handleStartCall}
            onEndCall={handleEndCall}
            onOpenSettings={() => setSettingsOpen(true)}
          />
          
          <main className="flex-1 container py-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                  {callState === 'active' ? 'Active Call' : 'Call Assistant'}
                </h1>
                <ModeIndicator 
                  mode={settings.mode} 
                  isActive={callState === 'active'} 
                />
              </div>
              
              <CallInterface 
                isActive={callState === 'active'}
                messages={conversation.messages}
                onSendMessage={handleSendMessage}
                transcript={conversation.transcript}
                isSpeechSupported={isSpeechRecognitionSupported}
              />
            </div>
          </main>
          
          <SettingsDialog 
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            settings={settings}
            onSaveSettings={handleSaveSettings}
          />
        </div>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App