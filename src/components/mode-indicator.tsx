
import { Volume, Volume1, Volume2 } from "lucide-react"
import { AssistantMode } from "@/types"
import { cn } from "@/lib/utils"

interface ModeIndicatorProps {
  mode: AssistantMode
  isActive: boolean
}

export function ModeIndicator({ mode, isActive }: ModeIndicatorProps) {
  if (!isActive) return null
  
  const getModeIcon = () => {
    switch (mode) {
      case "silent":
        return <Volume className="h-5 w-5" />
      case "suggestive":
        return <Volume1 className="h-5 w-5" />
      case "assertive":
        return <Volume2 className="h-5 w-5" />
    }
  }
  
  const getModeColor = () => {
    switch (mode) {
      case "silent":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "suggestive":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "assertive":
        return "bg-red-500/10 text-red-500 border-red-500/20"
    }
  }
  
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium",
      getModeColor()
    )}>
      {getModeIcon()}
      <span className="capitalize">{mode} Mode</span>
    </div>
  )
}