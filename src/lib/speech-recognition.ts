
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

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
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
              this.recognition?.start();
            }
          }, 500);
        }
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        
        // Restart on error, except for certain errors
        if (event.error !== 'aborted' && event.error !== 'no-speech' && this.isListening) {
          this.restartTimeout = window.setTimeout(() => {
            if (this.isListening) {
              this.recognition?.start();
            }
          }, 1000);
        }
      };
    }
  }

  public start(callback: SpeechRecognitionCallback) {
    if (!this.recognition) {
      console.error('Speech recognition not initialized');
      return false;
    }

    if (this.isListening) {
      return true; // Already listening
    }

    this.callback = callback;
    this.isListening = true;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition', error);
      return false;
    }
  }

  public stop() {
    if (!this.recognition || !this.isListening) {
      return;
    }

    this.isListening = false;
    
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition', error);
    }
  }

  public isSupported() {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  }
}

// Singleton instance
export const speechRecognition = new SpeechRecognitionService();