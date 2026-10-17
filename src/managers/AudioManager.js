export class AudioManager {
  constructor() {
    this.context = null;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) this.context = new Context();
    } catch {
      this.context = null;
    }
  }

  resume() {
    if (!this.context) return;
    try {
      const resumeResult = this.context.resume();
      if (resumeResult?.catch) resumeResult.catch(() => {});
    } catch {
      this.context = null;
    }
  }

  ding() {
    this.playTone('sine', 880, 0.12);
  }

  buzz() {
    this.playTone('sawtooth', 150, 0.25);
  }

  playTone(type, frequency, duration) {
    if (!this.context) return;
    try {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const now = this.context.currentTime;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start(now);
      oscillator.stop(now + duration);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    } catch {
      // Keep gameplay available when Web Audio is unsupported.
    }
  }
}
