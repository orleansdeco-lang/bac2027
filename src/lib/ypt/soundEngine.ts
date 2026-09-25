/**
 * Sound Engine (Decommissioned)
 * All procedural Web Audio API generators, oscillators, and ambient sound loops
 * have been permanently neutralized in favor of a 100% quiet, academic study focus.
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

export const AMBIENT_SOUNDS: AmbientSoundMeta[] = [];

class FocusSoundEngine {
  private currentAmbiance: AmbientSoundMode = "none";
  private volumeLevel = 0;

  public async resumeContext(): Promise<boolean> {
    return true;
  }

  public setVolume(_volume: number) {
    this.volumeLevel = 0;
  }

  public getVolume(): number {
    return 0;
  }

  public getCurrentAmbiance(): AmbientSoundMode {
    return "none";
  }

  public setAmbiance(_type: AmbientSoundMode) {
    this.currentAmbiance = "none";
  }

  public stopAmbiance() {
    this.currentAmbiance = "none";
  }

  public setAmbientSound(_type: AmbientSoundType) {
    this.currentAmbiance = "none";
  }

  public playChime() {
    // Audio permanently muted
  }
}

export const soundEngine = new FocusSoundEngine();
