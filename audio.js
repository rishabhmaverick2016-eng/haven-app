/**
 * Audio Engine for Haven
 * Uses Web Audio API to procedurally generate soothing soundscapes,
 * breathing bells, and sparkle chimes with zero external audio assets.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentTrack = null;
    this.ambientGain = null;
    this.nodes = [];
    this.masterGain = null;
    this.volume = 0.5;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  stopAmbient() {
    this.nodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.nodes = [];
    this.isPlaying = false;
    this.currentTrack = null;
  }

  playAmbient(type) {
    this.init();
    if (this.currentTrack === type && this.isPlaying) {
      this.stopAmbient();
      return false;
    }

    this.stopAmbient();
    this.currentTrack = type;
    this.isPlaying = true;

    switch (type) {
      case 'brown':
        this.createBrownNoise();
        break;
      case 'rain':
        this.createRainSound();
        break;
      case 'waves':
        this.createOceanWaves();
        break;
      case 'fire':
        this.createFireplace();
        break;
      case 'calm432':
        this.create432HzTone();
        break;
    }
    return true;
  }

  // Brown noise (deep soothing low rumble, gold standard for ADHD & calming racing thoughts)
  createBrownNoise() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate gain
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    this.nodes.push(whiteNoise, filter, gain);
  }

  // Gentle soft rain
  createRainSound() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.nodes.push(noise, filter, gain);
  }

  // Gentle rhythmic ocean waves
  createOceanWaves() {
    const bufferSize = 3 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.025 * white)) / 1.025;
      lastOut = output[i];
      output[i] *= 3.0;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Filter that modulates slowly to simulate wave surges
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8-second wave cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(280, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();
    this.nodes.push(noise, filter, lfo, lfoGain, gain);
  }

  // Cozy crackling fireplace
  createFireplace() {
    // Low rumble
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();

    // Crackle generator loop
    let isFireActive = true;
    const triggerCrackle = () => {
      if (!isFireActive || !this.ctx || this.ctx.state === 'closed') return;
      const crackleTime = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const crackleGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 1200, crackleTime);
      crackleGain.gain.setValueAtTime(0.08 * Math.random(), crackleTime);
      crackleGain.gain.exponentialRampToValueAtTime(0.001, crackleTime + 0.04);
      osc.connect(crackleGain);
      crackleGain.connect(this.masterGain);
      osc.start(crackleTime);
      osc.stop(crackleTime + 0.05);

      const nextDelay = 80 + Math.random() * 320;
      setTimeout(triggerCrackle, nextDelay);
    };

    triggerCrackle();

    this.nodes.push(noise, filter, gain, {
      stop: () => { isFireActive = false; }
    });
  }

  // 432Hz Calm frequency drone with soothing harmonics
  create432HzTone() {
    const fundamental = 432;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(fundamental / 2, this.ctx.currentTime); // 216Hz warm bass

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(fundamental, this.ctx.currentTime); // 432Hz main

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(fundamental * 1.5, this.ctx.currentTime); // 648Hz gentle fifth

    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();
    const gain3 = this.ctx.createGain();

    gain1.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain2.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain3.gain.setValueAtTime(0.04, this.ctx.currentTime);

    // Warm vibrato
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(1.5, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc2.frequency);

    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    const masterDroneGain = this.ctx.createGain();
    masterDroneGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    gain1.connect(masterDroneGain);
    gain2.connect(masterDroneGain);
    gain3.connect(masterDroneGain);
    masterDroneGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    osc3.start();
    lfo.start();

    this.nodes.push(osc1, osc2, osc3, lfo, lfoGain, gain1, gain2, gain3, masterDroneGain);
  }

  // Soft Tibetan singing bowl chime (for breath pacing)
  playChime(pitch = 528) {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, t);

    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(pitch * 2.76, t);

    const overtoneGain = this.ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.12, t);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);

    osc.connect(gain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    overtone.start(t);
    osc.stop(t + 3.0);
    overtone.stop(t + 3.0);
  }

  // Joyful gentle sparkle sound (for adding a win to the Glow Jar)
  playSparkle() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + (idx * 0.07);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }
}

// Global instance
window.soundEngine = new SoundEngine();
