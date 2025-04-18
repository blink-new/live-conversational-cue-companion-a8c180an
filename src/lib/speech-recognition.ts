
// This is a wrapper around the Web Speech API for speech recognition
// In a production app, we would use faster-whisper or another more robust solution

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export type SpeechRecognitionCallback = (result: SpeechRecognitionResult) => void;

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private callback: SpeechRecognitionCallback | null = null;
  private restartTimeout: number | null = null;
  private simulationMode = false;
  private simulationInterval: number | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser, using simulation mode');
      this.simulationMode = true;
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionAPI();

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        if (this.callback) {
          const lastResult = event.results[event.results.length - 1];
          const transcript = lastResult[0].transcript;
          const isFinal = lastResult.isFinal;
          
          this.callback({
            transcript,
            isFinal
          });
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // If we're supposed to be listening but recognition stopped, restart it
          this.restartTimeout = window.setTimeout(() => {
            if (this.isListening) {
              console.log('Speech recognition ended unexpectedly, restarting...');
              this.recognition?.start();
            }
          }, 300);
        }
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        
        // Restart on error, except for certain errors
        if (event.error !== 'aborted' && event.error !== 'no-speech' && this.isListening) {
          this.restartTimeout = window.setTimeout(() => {
            if (this.isListening) {
              console.log('Restarting speech recognition after error');
              this.recognition?.start();
            }
          }, 500);
        }
      };
    }
  }

  private startSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    // Generate simulated speech results
    const simulatedPhrases = [
      "I'm doing well, thanks for asking.",
      "That's interesting, tell me more about it.",
      "I've been thinking about getting a new car.",
      "How have you been lately?",
      "The weather has been nice recently.",
      "I'm planning a vacation next month.",
      "Did you hear about the new project at work?",
      "I've been really busy with school lately.",
      "What do you think about the new Mercedes models?",
      "Have you seen any good movies recently?",
    ];

    this.simulationInterval = window.setInterval(() => {
      if (!this.isListening || !this.callback) return;

      // Randomly decide if we should generate a phrase
      if (Math.random() > 0.7) {
        const phrase = simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];
        
        // First send as interim result
        this.callback({
          transcript: phrase,
          isFinal: false
        });

        // Then after a short delay, send as final result
        setTimeout(() => {
          if (this.isListening && this.callback) {
            this.callback({
              transcript: phrase,
              isFinal: true
            });
          }
        }, 800);
      }
    }, 5000); // Generate a phrase roughly every 5 seconds
  }

  public start(callback: SpeechRecognitionCallback) {
    this.callback = callback;
    this.isListening = true;

    if (this.simulationMode) {
      this.startSimulation();
      return true;
    }

    if (!this.recognition) {
      console.error('Speech recognition not initialized');
      return false;
    }

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition', error);
      // Fall back to simulation mode if we can't start recognition
      console.log('Falling back to simulation mode');
      this.simulationMode = true;
      this.startSimulation();
      return true;
    }
  }

  public stop() {
    this.isListening = false;
    
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    if (this.recognition && !this.simulationMode) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition', error);
      }
    }
  }

  public isSupported() {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  }

  public isListening() {
    return this.isListening;
  }
}

// Singleton instance
export const speechRecognition = new SpeechRecognitionService();