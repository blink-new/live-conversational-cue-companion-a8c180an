
import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Send, AlertTriangle, Clock, Lightbulb, MessageSquare, Phone, Target } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card } from "./ui/card"
import { cn } from "@/lib/utils"
import { Message, MessageType } from "@/types"
import { AnimatePresence, motion } from "framer-motion"
import { ScrollArea } from "./ui/scroll-area"

interface CallInterfaceProps {
  isActive: boolean
  messages: Message[]
  onSendMessage: (message: string) => void
  transcript: string[]
  isSpeechSupported: boolean
}

export function CallInterface({ 
  isActive, 
  messages, 
  onSendMessage,
  transcript,
  isSpeechSupported
}: CallInterfaceProps) {
  const [inputValue, setInputValue] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSendMessage(inputValue)
      setInputValue("")
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [transcript])

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center p-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
          <Phone className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Active Call</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Start a call to receive real-time conversation assistance and prompts.
        </p>
        {!isSpeechSupported && (
          <Card className="p-4 bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 max-w-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Speech Recognition Not Available</h3>
                <p className="text-sm">
                  Your browser doesn't support speech recognition. The app will run in simulation mode.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    )
  }

  const getMessageColor = (type: MessageType) => {
    switch (type) {
      case "alert":
        return "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
      case "suggestion":
        return "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
      case "reminder":
        return "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
      case "response":
        return "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
      default:
        return "bg-muted"
    }
  }

  const getMessageIcon = (type: MessageType) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-4 w-4 shrink-0" />
      case "suggestion":
        return <Lightbulb className="h-4 w-4 shrink-0" />
      case "reminder":
        return <Clock className="h-4 w-4 shrink-0" />
      case "response":
        return <MessageSquare className="h-4 w-4 shrink-0" />
      default:
        return null
    }
  }

  // Check if a message is a goal reminder
  const isGoalMessage = (message: Message) => {
    return message.type === 'reminder' && message.content.startsWith('Goal:');
  }

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] bg-background/50 rounded-lg border overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden p-4">
        {/* Transcript Panel */}
        <Card className="flex flex-col h-full overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="font-medium">Live Transcript</h3>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {transcript.length > 0 ? (
                transcript.map((line, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "p-2 rounded text-sm",
                      line.startsWith("You:") ? "bg-blue-500/5" : "bg-muted/30"
                    )}
                  >
                    <p>{line}</p>
                  </motion.div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Transcript will appear here when the call begins
                </p>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </ScrollArea>
        </Card>

        {/* Assistant Messages Panel */}
        <Card className="flex flex-col h-full overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="font-medium">AI Assistant</h3>
          </div>
          
          {/* Goal Banner - Show if there's a goal message */}
          {messages.some(isGoalMessage) && (
            <div className="px-4 py-2 bg-purple-500/10 border-b border-purple-500/20 flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-500" />
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                {messages.find(isGoalMessage)?.content.replace('Goal: ', '')}
              </p>
            </div>
          )}
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              <AnimatePresence>
                {messages
                  .filter(message => !isGoalMessage(message)) // Filter out goal messages as they're shown in the banner
                  .map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "p-3 rounded-lg border flex items-start gap-3",
                      getMessageColor(message.type)
                    )}
                  >
                    {getMessageIcon(message.type)}
                    <div className="flex-1">
                      <div className="font-medium capitalize text-sm">{message.type}</div>
                      <p>{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </Card>
      </div>
      
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Button
            type="button"
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="shrink-0"
            title={isMuted ? "Unmute microphone" : "Mute microphone"}
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask your brain anything..."
            className="flex-1"
          />
          <Button type="submit" className="shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}