
import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { 
  RadioGroup, 
  RadioGroupItem 
} from "./ui/radio-group"
import { AssistantMode, CallSettings, Topic } from "@/types"
import { X, Plus, Volume, Volume1, Volume2, Info } from "lucide-react"
import { Badge } from "./ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: CallSettings
  onSaveSettings: (settings: CallSettings) => void
}

export function SettingsDialog({ 
  open, 
  onOpenChange, 
  settings, 
  onSaveSettings 
}: SettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<CallSettings>({...settings})
  const [newTopic, setNewTopic] = useState("")
  const [newReminder, setNewReminder] = useState("")
  const [newAvoidTopic, setNewAvoidTopic] = useState("")
  
  const handleSave = () => {
    onSaveSettings(localSettings)
    onOpenChange(false)
  }

  const handleModeChange = (value: string) => {
    setLocalSettings({
      ...localSettings,
      mode: value as AssistantMode
    })
  }

  const addTopic = () => {
    if (newTopic.trim()) {
      setLocalSettings({
        ...localSettings,
        topics: [
          ...localSettings.topics,
          { id: crypto.randomUUID(), title: newTopic.trim() }
        ]
      })
      setNewTopic("")
    }
  }

  const removeTopic = (id: string) => {
    setLocalSettings({
      ...localSettings,
      topics: localSettings.topics.filter(topic => topic.id !== id)
    })
  }

  const addReminder = () => {
    if (newReminder.trim()) {
      setLocalSettings({
        ...localSettings,
        reminders: [...localSettings.reminders, newReminder.trim()]
      })
      setNewReminder("")
    }
  }

  const removeReminder = (index: number) => {
    setLocalSettings({
      ...localSettings,
      reminders: localSettings.reminders.filter((_, i) => i !== index)
    })
  }

  const addAvoidTopic = () => {
    if (newAvoidTopic.trim()) {
      setLocalSettings({
        ...localSettings,
        avoidTopics: [...localSettings.avoidTopics, newAvoidTopic.trim()]
      })
      setNewAvoidTopic("")
    }
  }

  const removeAvoidTopic = (index: number) => {
    setLocalSettings({
      ...localSettings,
      avoidTopics: localSettings.avoidTopics.filter((_, i) => i !== index)
    })
  }

  const getModeIcon = (mode: AssistantMode) => {
    switch (mode) {
      case "silent":
        return <Volume className="h-4 w-4 mr-2" />
      case "suggestive":
        return <Volume1 className="h-4 w-4 mr-2" />
      case "assertive":
        return <Volume2 className="h-4 w-4 mr-2" />
    }
  }

  const getModeDescription = (mode: AssistantMode) => {
    switch (mode) {
      case "silent":
        return "Only responds when you ask for help"
      case "suggestive":
        return "Provides gentle cues every 30s or when context shifts"
      case "assertive":
        return "Actively warns, redirects, and provides urgent messages"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Call Settings
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                    <Info className="h-3 w-3" />
                    <span className="sr-only">Info</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>Configure how your AI assistant behaves during calls. Set topics to discuss, reminders, and choose how proactive the assistant should be.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTitle>
          <DialogDescription>
            Customize your AI conversation assistant
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="mode" className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="mode">Assistant Mode</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mode" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Select Assistant Mode</Label>
                <RadioGroup 
                  value={localSettings.mode} 
                  onValueChange={handleModeChange}
                  className="mt-2 space-y-3"
                >
                  {(["silent", "suggestive", "assertive"] as AssistantMode[]).map((mode) => (
                    <div key={mode} className="flex items-start space-x-3">
                      <RadioGroupItem value={mode} id={mode} />
                      <div className="grid gap-1.5">
                        <Label htmlFor={mode} className="flex items-center">
                          {getModeIcon(mode)}
                          <span className="capitalize">{mode}</span>
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {getModeDescription(mode)}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="topics" className="space-y-4">
            <div>
              <Label htmlFor="topics">Topics to Discuss</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Add topics you want to cover during the call
              </p>
              
              <div className="flex gap-2 mb-4">
                <Input
                  id="topics"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Add a topic..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTopic.trim()) {
                      e.preventDefault()
                      addTopic()
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addTopic} 
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {localSettings.topics.map((topic) => (
                  <Badge key={topic.id} variant="secondary" className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                    {topic.title}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeTopic(topic.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {localSettings.topics.length === 0 && (
                  <p className="text-sm text-muted-foreground">No topics added yet</p>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Label htmlFor="avoid-topics">Topics to Avoid</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Add topics you want to steer away from
              </p>
              
              <div className="flex gap-2 mb-4">
                <Input
                  id="avoid-topics"
                  value={newAvoidTopic}
                  onChange={(e) => setNewAvoidTopic(e.target.value)}
                  placeholder="Add a topic to avoid..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newAvoidTopic.trim()) {
                      e.preventDefault()
                      addAvoidTopic()
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addAvoidTopic} 
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {localSettings.avoidTopics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1 border-red-500/50 text-red-500">
                    {topic}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeAvoidTopic(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {localSettings.avoidTopics.length === 0 && (
                  <p className="text-sm text-muted-foreground">No topics to avoid added yet</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reminders" className="space-y-4">
            <div>
              <Label htmlFor="reminders">Reminders</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Add reminders for things you want to mention during the call
              </p>
              
              <div className="flex gap-2 mb-4">
                <Input
                  id="reminders"
                  value={newReminder}
                  onChange={(e) => setNewReminder(e.target.value)}
                  placeholder="Add a reminder..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newReminder.trim()) {
                      e.preventDefault()
                      addReminder()
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addReminder} 
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-2">
                {localSettings.reminders.map((reminder, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                    <span>{reminder}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeReminder(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {localSettings.reminders.length === 0 && (
                  <p className="text-sm text-muted-foreground">No reminders added yet</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}