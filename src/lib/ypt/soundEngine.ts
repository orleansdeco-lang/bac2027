/**
 * Web Audio Procedural Sound Engine for Focus & Ambiances
 * Zero external audio dependencies, runs offline, crisp and zero-latency.
 * Phase 6: Extended with Brown Noise, leak-proof oscillator cleanup, and metadata.
 */

export type AmbientSoundMode =
  | "none"
  | "library"
  | "rain"
  | "brown_noise"
  | "white_noise"
  | "deep_focus"
  | "alpha_waves";

export type FocusAmbianceType = AmbientSoundMode;
export type AmbientSoundType = AmbientSoundMode;

export interface AmbientSoundMeta {
  id: AmbientSoundMode;
  nameAr: string;
  nameEn: string;
  emoji: string;
  descriptionAr: string;
}

export const AMBIENT_SOUNDS: AmbientSoundMeta[] = [
  {
    id: "library",
    nameAr: "مكتبة هادئة",
    nameEn: "Library",
    emoji: "📚",
    descriptionAr: "أجواء دراسة هادئة مع محاكاة خفيفة لتقليب أوراق الكتب",
  },
  {
    id: "rain",
    nameAr: "مطر خفيف",
    nameEn: "Rain",
    emoji: "🌧️",
    descriptionAr: "صوت زخات مطر لطيفة على النافذة لتهدئة الذهن",
  },
  {
    id: "brown_noise",
    nameAr: "ضوضاء بنية",
    nameEn: "Brown Noise",
    emoji: "🪵",
    descriptionAr: "ترددات عميقة ودافئة مثالية للتركيز وتخفيف التشتت",
  },
  {
    id: "white_noise",
    nameAr: "ضوضاء بيضاء",
    nameEn: "White Noise",
    emoji: "💨",
    descriptionAr: "عزل صوتي متوازن لحجب الضجيج الخارجي",
  },
  {
    id: "deep_focus",
    nameAr: "تركيز عميق (ألفا)",
    nameEn: "Deep Focus",
    emoji: "🧠",
    descriptionAr: "موجات ألفا ثنائية الأذنين (10Hz) مع ترددات بنية عميقة",
  },
];

class FocusSoundEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private gainNode: GainNode | null = null;
  private currentAmbiance: AmbientSoundMode = "none";
  private volumeLevel = 0.35;
  private intervalTimer: NodeJS.Timeout | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public async resumeContext(): Promise<boolean> {
    const ctx = this.getContext();
    if (ctx && ctx.state === "suspended") {
      try {
        await ctx.resume();
        return true;
      } catch {
        return false;
      }
    }
    return !!ctx;
  }

  public setVolume(volume: number) {
    this.volumeLevel = Math.max(0, Math.min(1, volume));
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.setValueAtTime(this.volumeLevel, this.ctx.currentTime);
      } catch {
        // Ignore
      }
    }
  }

  public getVolume(): number {
    return this.volumeLevel;
  }

  public getCurrentAmbiance(): AmbientSoundMode {
    return this.currentAmbiance;
  }

  public setAmbiance(type: AmbientSoundMode) {
    if (type === this.currentAmbiance) return;
    this.stopAmbiance();

    if (type === "none") {
      this.currentAmbiance = "none";
      return;
    }

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.gainNode = ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volumeLevel, ctx.currentTime);
      this.gainNode.connect(ctx.destination);

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (type === "rain") {
        // Pink / Brown filtered noise for gentle rain on window
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + 0.02 * white) / 1.02;
          output[i] = lastOut * 3.2;
        }

        const rainSource = ctx.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(750, ctx.currentTime);

        rainSource.connect(filter);
        filter.connect(this.gainNode);
        rainSource.start(0);
        this.currentSource = rainSource;
      } else if (type === "brown_noise") {
        // Deep Brownian / Red noise with smooth lowpass filter
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + 0.02 * white) / 1.02;
          output[i] = lastOut * 3.6;
        }

        const brownSource = ctx.createBufferSource();
        brownSource.buffer = noiseBuffer;
        brownSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(360, ctx.currentTime);

        brownSource.connect(filter);
        filter.connect(this.gainNode);
        brownSource.start(0);
        this.currentSource = brownSource;
      } else if (type === "deep_focus") {
        // Deep brown noise + 10Hz Alpha binaural beat
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + 0.015 * white) / 1.015;
          output[i] = lastOut * 4.0;
        }

        const brownSource = ctx.createBufferSource();
        brownSource.buffer = noiseBuffer;
        brownSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        // Binaural alpha waves (180Hz & 190Hz = 10Hz beat)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(180, ctx.currentTime);
        osc2.frequency.setValueAtTime(190, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.06, ctx.currentTime);

        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(this.gainNode);

        brownSource.connect(filter);
        filter.connect(this.gainNode);

        brownSource.start(0);
        osc1.start(0);
        osc2.start(0);

        this.activeOscillators = [osc1, osc2];
        this.currentSource = brownSource;
      } else if (type === "library") {
        // Gentle soft room tone with subtle page turns simulation
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.08;
        }

        const roomSource = ctx.createBufferSource();
        roomSource.buffer = noiseBuffer;
        roomSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(500, ctx.currentTime);
        filter.Q.setValueAtTime(1.0, ctx.currentTime);

        roomSource.connect(filter);
        filter.connect(this.gainNode);
        roomSource.start(0);
        this.currentSource = roomSource;

        // Occasional gentle page-turn simulation every 18 seconds
        this.intervalTimer = setInterval(() => {
          this.playSubtlePageTurn();
        }, 18000);
      } else if (type === "white_noise") {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.15;
        }
        const whiteSource = ctx.createBufferSource();
        whiteSource.buffer = noiseBuffer;
        whiteSource.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        whiteSource.connect(filter);
        filter.connect(this.gainNode);
        whiteSource.start(0);
        this.currentSource = whiteSource;
      } else if (type === "alpha_waves") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(200, ctx.currentTime);
        osc2.frequency.setValueAtTime(210, ctx.currentTime);
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(this.gainNode);
        osc1.start(0);
        osc2.start(0);
        this.activeOscillators = [osc1, osc2];
        this.currentSource = osc1;
      }

      this.currentAmbiance = type;
    } catch {
      // Audio autoplay policy handled gracefully
    }
  }

  private playSubtlePageTurn() {
    const ctx = this.getContext();
    if (!ctx || this.currentAmbiance !== "library" || !this.gainNode) return;
    try {
      const now = ctx.currentTime;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.35, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI) * 0.12;
      }
      const page = ctx.createBufferSource();
      page.buffer = buffer;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.setValueAtTime(1400, now);
      page.connect(f);
      f.connect(this.gainNode);
      page.start(now);
    } catch {
      // Ignore
    }
  }

  public stopAmbiance() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    // Clean up active oscillators
    if (this.activeOscillators.length > 0) {
      for (const osc of this.activeOscillators) {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Ignore
        }
      }
      this.activeOscillators = [];
    }
    if (this.currentSource) {
      try {
        if ("stop" in this.currentSource && typeof (this.currentSource as any).stop === "function") {
          (this.currentSource as any).stop();
        }
        this.currentSource.disconnect();
      } catch {
        // Ignore
      }
      this.currentSource = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {
        // Ignore
      }
      this.gainNode = null;
    }
    this.currentAmbiance = "none";
  }

  public setAmbientSound(type: AmbientSoundType) {
    this.setAmbiance(type);
  }

  public playChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.0, now + 0.15); // A5

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.3);
    } catch {
      // Ignore
    }
  }
}

export const soundEngine = new FocusSoundEngine();
