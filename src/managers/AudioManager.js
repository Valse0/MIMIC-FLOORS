export class AudioManager {
  constructor() {
    this.context = null;
    this.ambienceStarted = false;
    this.ambienceNodes = [];
    this.lightHumNodes = [];
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) this.context = new Context();
    } catch {
      this.context = null;
    }
  }

  resume() {
    try {
      const result = this.context?.resume();
      result?.catch(() => {});
    } catch { this.context = null; }
  }

  startAmbience() {
    if (!this.context || this.ambienceStarted) return;
    try {
      const now = this.context.currentTime;
      const lfo = this.context.createOscillator();
      const lfoGain = this.context.createGain();
      lfo.frequency.value = 0.12;
      lfoGain.gain.value = 0.008;
      lfo.connect(lfoGain);
      const nodes = [lfo, lfoGain];
      [50, 53].forEach((frequency) => {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.value = 0.032;
        lfoGain.connect(gain.gain);
        oscillator.connect(gain);
        gain.connect(this.context.destination);
        oscillator.start(now);
        nodes.push(oscillator, gain);
      });
      lfo.start(now);
      this.ambienceNodes = nodes;
      this.ambienceStarted = true;
    } catch { this.stopNodes('ambienceNodes'); }
  }

  startLightHum() {
    if (!this.context || this.lightHumNodes.length) return;
    try {
      const oscillator = this.context.createOscillator();
      const filter = this.context.createBiquadFilter();
      const gain = this.context.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 100;
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      gain.gain.value = 0.01;
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start();
      this.lightHumNodes = [oscillator, filter, gain];
    } catch { this.stopNodes('lightHumNodes'); }
  }

  stopLightHum() { this.stopNodes('lightHumNodes'); }

  ding() {
    this.playTone('sine', 880, 0.15, 0, 0.045);
    this.playTone('sine', 660, 0.15, 0.15, 0.045);
  }

  correct() { this.playTone('sine', 740, 0.12, 0, 0.035); }
  wrong() { this.playTone('sawtooth', 150, 0.25, 0, 0.06); }
  buzz() { this.wrong(); }

  heartbeat() {
    this.playTone('sine', 60, 0.08, 0, 0.07);
    this.playTone('sine', 60, 0.08, 0.15, 0.07);
  }

  doorSlide() {
    if (!this.context) return;
    try {
      const length = Math.floor(this.context.sampleRate * 0.45);
      const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      const source = this.context.createBufferSource();
      const filter = this.context.createBiquadFilter();
      const gain = this.context.createGain();
      source.buffer = buffer;
      filter.type = 'lowpass';
      filter.frequency.value = 700;
      gain.gain.setValueAtTime(0.08, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.45);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.context.destination);
      source.start();
      source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    } catch { /* Audio is optional. */ }
  }

  playTone(type, frequency, duration, delay = 0, volume = 0.06) {
    if (!this.context) return;
    try {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const start = this.context.currentTime + delay;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { /* Audio is optional. */ }
  }

  stopAmbience() {
    this.stopNodes('ambienceNodes');
    this.ambienceStarted = false;
    this.stopLightHum();
  }

  stopNodes(property) {
    this[property].forEach((node) => {
      try { node.stop?.(); } catch { /* Node may already be stopped. */ }
      try { node.disconnect(); } catch { /* Node may already be disconnected. */ }
    });
    this[property] = [];
  }
}
