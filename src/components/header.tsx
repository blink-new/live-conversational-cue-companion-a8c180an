
import { Phone, Settings } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { CallState } from "@/types"
import { cn } from "@/lib/utils"

interface HeaderProps {
  callState: CallState
  onStartCall: () => void
  onEndCall: () => void
  onOpenSettings: () => void
}

export function Header({ callState, onStartCall, onEndCall, onOpenSettings }: HeaderProps) {
  const isCallActive = callState === 'active'
  
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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onOpenSettings}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant={isCallActive ? "destructive" : "default"}
            className={cn(
              "transition-all",
              isCallActive ? "animate-pulse" : ""
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