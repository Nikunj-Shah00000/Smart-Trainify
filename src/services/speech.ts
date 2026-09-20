class VoiceCoach {
  private synth: SpeechSynthesis | null = null;
  private isEnabled: boolean = true;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoice();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer natural English voices
    this.voice =
      voices.find((v) => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.lang.startsWith('en')) ||
      voices[0] ||
      null;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public speak(text: string, priority: 'normal' | 'urgent' = 'normal') {
    if (!this.synth || !this.isEnabled) return;
    if (priority === 'urgent') {
      this.synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const voiceCoach = new VoiceCoach();
