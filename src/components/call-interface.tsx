
import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Send } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card } from "./ui/card"
import { cn } from "@/lib/utils"
import { Message, MessageType } from "@/types"
import { AnimatePresence, motion } from "framer-motion"

interface CallInterfaceProps {
  isActive: boolean
  messages: Message[]
  onSendMessage: (message: string) => void
  transcript: string[]
}

export function CallInterface({ 
  isActive, 
  messages, 
  onSendMessage,
  transcript
}: CallInterfaceProps) {
  const [inputValue, setInputValue] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
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

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center p-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Phone className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Active Call</h2>
        <p className="text-muted-foreground max-w-md">
          Start a call to receive real-time conversation assistance and prompts.
        </p>
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

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {transcript.length > 0 && (
          <Card className="p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Live Transcript</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              {transcript.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </Card>
        )}
        
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
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
                  <div className="font-medium capitalize">{message.type}</div>
                  <p>{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Button
            type="button"
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="shrink-0"
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask your brain anything..."
            className="flex-1"
          />
          <Button type="submit" className="shrink-0">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}

import { AlertTriangle, Clock, Lightbulb, MessageSquare, Phone } from "lucide-react"