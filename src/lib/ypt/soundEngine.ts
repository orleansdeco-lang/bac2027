/**
 * Silent Focus Sound Engine (Audio Decommissioned)
 * All audio features and Web Audio API generators have been permanently removed.
 * This module exports silent no-op stubs to maintain type compatibility.
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
];

class FocusSoundEngine {
  private volumeLevel = 0;

  public async resumeContext(): Promise<boolean> {
    return true;
  }

  public setVolume(_volume: number): void {
    this.volumeLevel = 0;
  }

  public getVolume(): number {
    return 0;
  }

  public getCurrentAmbiance(): AmbientSoundMode {
    return "none";
  }

  public stopAmbiance(): void {}

  public setAmbiance(_type: AmbientSoundMode): void {}

  public setAmbientSound(_type: AmbientSoundType): void {}

  public playChime(): void {}
}

export const soundEngine = new FocusSoundEngine();
