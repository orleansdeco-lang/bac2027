/**
 * Browser Web Audio Synthesizer for Focus & Timer Alerts
 * 100% offline, zero-latency, no external audio files required.
 */

export type AmbientSoundType = "none" | "white_noise" | "rain" | "alpha_waves";

class FocusSoundEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private currentSound: AmbientSoundType = "none";

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setAmbientSound(type: AmbientSoundType, volume = 0.25) {
    if (type === this.currentSound) return;
    this.stopAmbient();

    if (type === "none") {
      this.currentSound = "none";
      return;
    }

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.gainNode = ctx.createGain();
      this.gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      this.gainNode.connect(ctx.destination);

      if (type === "white_noise" || type === "rain") {
        // Generate filtered noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === "rain") {
            // Brown/Pink filter for rain texture
            lastOut = (lastOut + 0.02 * white) / 1.02;
            output[i] = lastOut * 3.5;
          } else {
            // Softer white noise
            output[i] = white * 0.15;
          }
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = type === "rain" ? "lowpass" : "bandpass";
        filter.frequency.value = type === "rain" ? 800 : 1200;

        whiteNoise.connect(filter);
        filter.connect(this.gainNode);
        whiteNoise.start(0);
        this.currentSource = whiteNoise;
      } else if (type === "alpha_waves") {
        // Binaural 10Hz alpha beat around 200Hz
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(200, ctx.currentTime);
        osc2.frequency.setValueAtTime(210, ctx.currentTime);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.08, ctx.currentTime);

        osc1.connect(subGain);
        osc2.connect(subGain);
        subGain.connect(this.gainNode);

        osc1.start();
        osc2.start();

        this.currentSource = subGain;
      }

      this.currentSound = type;
    } catch {
      // Audio autoplay policy or browser restriction
    }
  }

  public stopAmbient() {
    if (this.currentSource) {
      try {
        if ("stop" in this.currentSource && typeof (this.currentSource as any).stop === "function") {
          (this.currentSource as any).stop();
        }
        this.currentSource.disconnect();
      } catch {
        // Ignore disconnect errors
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
    this.currentSound = "none";
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

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch {
      // Ignore audio error
    }
  }
}

export const soundEngine = new FocusSoundEngine();
