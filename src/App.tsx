
import { useState } from 'react'
import { Header } from './components/header'
import { CallInterface } from './components/call-interface'
import { SettingsDialog } from './components/settings-dialog'
import { ModeIndicator } from './components/mode-indicator'
import { useCallAssistant } from './hooks/use-call-assistant'
import { ThemeProvider } from './components/ui/theme-provider'
import { Toaster } from './components/ui/toaster'
import { useToast } from './hooks/use-toast'

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

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
        <Header 
          callState={callState}
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
    </ThemeProvider>
  )
}

export default App