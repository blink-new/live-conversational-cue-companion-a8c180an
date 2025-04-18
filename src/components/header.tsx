
import { Phone, Settings, Volume, Volume1, Volume2 } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { AssistantMode, CallState } from "@/types"
import { cn } from "@/lib/utils"
import { Badge } from "./ui/badge"

interface HeaderProps {
  callState: CallState
  mode: AssistantMode
  onStartCall: () => void
  onEndCall: () => void
  onOpenSettings: () => void
}

export function Header({ callState, mode, onStartCall, onEndCall, onOpenSettings }: HeaderProps) {
  const isCallActive = callState === 'active'
  
  const getModeIcon = () => {
    switch (mode) {
      case "silent":
        return <Volume className="h-4 w-4 mr-1" />
      case "suggestive":
        return <Volume1 className="h-4 w-4 mr-1" />
      case "assertive":
        return <Volume2 className="h-4 w-4 mr-1" />
    }
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg">CallBrain</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isCallActive && (
            <Badge 
              variant="outline" 
              className="hidden md:flex items-center gap-1 animate-pulse"
            >
              {getModeIcon()}
              <span className="capitalize">{mode} Mode</span>
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="icon"
            onClick={onOpenSettings}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant={isCallActive ? "destructive" : "default"}
            className={cn(
              "transition-all",
              isCallActive ? "animate-pulse" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            )}
            onClick={isCallActive ? onEndCall : onStartCall}
          >
            {isCallActive ? "End Call" : "Start Call"}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}