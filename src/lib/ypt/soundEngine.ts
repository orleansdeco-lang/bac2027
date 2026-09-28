/**
 * Procedural Web Audio API Engine
 * 100% Zero-bundle-size, procedural ambient sounds generated via browser Web Audio API.
 * No external audio files or downloads, no streaming overhead, zero copyright issues.
 */

export type AmbientSoundMode =
  | "none"
  | "brown_noise"
  | "rain"
  | "white_noise"
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
    id: "none",
    nameAr: "هدوء تام (صامت)",
    nameEn: "Silent Focus",
    emoji: "🔇",
    descriptionAr: "بدون أي مؤثرات صوتية، هدوء أكاديمي ناصع",
  },
  {
    id: "brown_noise",
    nameAr: "ضوضاء بنية عميقة",
    nameEn: "Brown Noise",
    emoji: "☕",
    descriptionAr: "ترددات منخفضة دافئة لعزل الضجيج الخارجي وتعزيز التركيز",
  },
  {
    id: "rain",
    nameAr: "خرير مطر هادئ",
    nameEn: "Gentle Rain",
    emoji: "🌧️",
    descriptionAr: "محاكاة إجرائية لصوت قطرات المطر المتساقطة",
  },
  {
    id: "alpha_waves",
    nameAr: "موجات ألفا (10 Hz)",
    nameEn: "Alpha Binaural",
    emoji: "🧠",
    descriptionAr: "نغمات ثنائية تحفيزية لصفاء الذهن أثناء حل التمارين",
  },
  {
    id: "white_noise",
    nameAr: "ضوضاء بيضاء نقية",
    nameEn: "White Noise",
    emoji: "📻",
    descriptionAr: "طبقة ناعمة متوازنة لحجب التشتت البصري والسمعي",
  },
];

class FocusSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentAmbiance: AmbientSoundMode = "none";
  private activeSourceNode: AudioNode | null = null;
  private alphaOscLeft: OscillatorNode | null = null;
  private alphaOscRight: OscillatorNode | null = null;
  private volumeLevel = 0.4; // 0 to 1

  constructor() {
    if (typeof window !== "undefined") {
      const savedVol = localStorage.getItem("shater_focus_volume");
      if (savedVol) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volumeLevel = parsed;
        }
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volumeLevel, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public async resumeContext(): Promise<boolean> {
    const ctx = this.initContext();
    if (!ctx) return false;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    return ctx.state === "running";
  }

  public setVolume(volume: number) {
    this.volumeLevel = Math.max(0, Math.min(1, volume));
    if (typeof window !== "undefined") {
      localStorage.setItem("shater_focus_volume", this.volumeLevel.toString());
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volumeLevel, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volumeLevel;
  }

  public getCurrentAmbiance(): AmbientSoundMode {
    return this.currentAmbiance;
  }

  public stopAmbiance() {
    this.currentAmbiance = "none";

    if (this.activeSourceNode) {
      try {
        if ("stop" in this.activeSourceNode && typeof (this.activeSourceNode as any).stop === "function") {
          (this.activeSourceNode as any).stop();
        }
        this.activeSourceNode.disconnect();
      } catch {}
      this.activeSourceNode = null;
    }

    if (this.alphaOscLeft) {
      try {
        this.alphaOscLeft.stop();
        this.alphaOscLeft.disconnect();
      } catch {}
      this.alphaOscLeft = null;
    }

    if (this.alphaOscRight) {
      try {
        this.alphaOscRight.stop();
        this.alphaOscRight.disconnect();
      } catch {}
      this.alphaOscRight = null;
    }
  }

  public setAmbiance(type: AmbientSoundMode) {
    if (type === this.currentAmbiance) return;
    this.stopAmbiance();
    if (type === "none") return;

    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    if (ctx.state === "suspended") {
      ctx.resume().then(() => this.startSoundType(type));
    } else {
      this.startSoundType(type);
    }
  }

  public setAmbientSound(type: AmbientSoundType) {
    this.setAmbiance(type);
  }

  private startSoundType(type: AmbientSoundMode) {
    if (!this.ctx || !this.masterGain) return;
    this.currentAmbiance = type;

    if (type === "brown_noise") {
      this.activeSourceNode = this.createBrownNoiseSource();
    } else if (type === "white_noise") {
      this.activeSourceNode = this.createWhiteNoiseSource();
    } else if (type === "rain") {
      this.activeSourceNode = this.createRainSource();
    } else if (type === "alpha_waves") {
      this.startAlphaWaves();
    }
  }

  /**
   * Procedural Brown Noise (Filtered Gaussian random walk)
   */
  private createBrownNoiseSource(): AudioNode | null {
    if (!this.ctx || !this.masterGain) return null;

    const bufferSize = this.ctx.sampleRate * 4; // 4 seconds looped
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }

    const whiteSource = this.ctx.createBufferSource();
    whiteSource.buffer = buffer;
    whiteSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(380, this.ctx.currentTime);

    whiteSource.connect(lowpass);
    lowpass.connect(this.masterGain);
    whiteSource.start(0);

    return whiteSource;
  }

  /**
   * Procedural White Noise
   */
  private createWhiteNoiseSource(): AudioNode | null {
    if (!this.ctx || !this.masterGain) return null;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(this.masterGain);
    source.start(0);

    return source;
  }

  /**
   * Procedural Rain Simulation
   */
  private createRainSource(): AudioNode | null {
    if (!this.ctx || !this.masterGain) return null;

    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.04 * white) / 1.04;
      // occasional drop crackle
      const drop = Math.random() > 0.997 ? (Math.random() * 2 - 1) * 0.2 : 0;
      data[i] = lastOut * 2.2 + drop;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(750, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(0.8, this.ctx.currentTime);

    source.connect(bandpass);
    bandpass.connect(this.masterGain);
    source.start(0);

    return source;
  }

  /**
   * Procedural Binaural Alpha Waves (200Hz Left, 210Hz Right -> 10Hz differential)
   */
  private startAlphaWaves() {
    if (!this.ctx || !this.masterGain) return;

    const oscLeft = this.ctx.createOscillator();
    const oscRight = this.ctx.createOscillator();

    oscLeft.type = "sine";
    oscRight.type = "sine";

    oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime);
    oscRight.frequency.setValueAtTime(210, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    oscLeft.connect(gain);
    oscRight.connect(gain);
    gain.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();

    this.alphaOscLeft = oscLeft;
    this.alphaOscRight = oscRight;
  }

  /**
   * Procedural Pleasant Academic Chime
   */
  public playChime() {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const chimeGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.9); // A4

    chimeGain.gain.setValueAtTime(0.3 * this.volumeLevel, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.3);
  }
}

export const soundEngine = new FocusSoundEngine();
