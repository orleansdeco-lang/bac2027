"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  soundEngine,
  AmbientSoundMode,
  AMBIENT_SOUNDS,
  AmbientSoundMeta,
} from "@/lib/ypt/soundEngine";

const LOCAL_STORAGE_SOUND_KEY = "shater_ambient_sound";
const LOCAL_STORAGE_VOLUME_KEY = "shater_ambient_volume";
const LOCAL_STORAGE_MUTED_KEY = "shater_ambient_muted";

export interface StudyAudioContextType {
  isPlaying: boolean;
  currentSound: AmbientSoundMode;
  currentSoundMeta: AmbientSoundMeta | undefined;
  volume: number; // 0 to 1
  isMuted: boolean;
  availableSounds: AmbientSoundMeta[];
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  setSound: (sound: AmbientSoundMode) => Promise<void>;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  playChime: () => void;
}

const StudyAudioContext = createContext<StudyAudioContextType | undefined>(undefined);

export function StudyAudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSound, setCurrentSoundState] = useState<AmbientSoundMode>("rain");
  const [volume, setVolumeState] = useState<number>(0.35);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Load preferences from localStorage on client mount (without autoplaying)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedSound = localStorage.getItem(LOCAL_STORAGE_SOUND_KEY) as AmbientSoundMode | null;
      if (savedSound && AMBIENT_SOUNDS.some((s) => s.id === savedSound)) {
        setCurrentSoundState(savedSound);
      }

      const savedVol = localStorage.getItem(LOCAL_STORAGE_VOLUME_KEY);
      if (savedVol !== null) {
        const parsedVol = parseFloat(savedVol);
        if (!isNaN(parsedVol) && parsedVol >= 0 && parsedVol <= 1) {
          setVolumeState(parsedVol);
          soundEngine.setVolume(parsedVol);
        }
      }

      const savedMuted = localStorage.getItem(LOCAL_STORAGE_MUTED_KEY);
      if (savedMuted === "true") {
        setIsMuted(true);
      }
    } catch {
      // LocalStorage access restricted (e.g. private browsing)
    }
  }, []);

  const currentSoundMeta = useMemo(() => {
    return AMBIENT_SOUNDS.find((s) => s.id === currentSound);
  }, [currentSound]);

  const play = useCallback(async () => {
    if (currentSound === "none") {
      setCurrentSoundState("rain");
    }
    const soundToPlay = currentSound === "none" ? "rain" : currentSound;

    await soundEngine.resumeContext();
    soundEngine.setVolume(isMuted ? 0 : volume);
    soundEngine.setAmbiance(soundToPlay);
    setIsPlaying(true);
  }, [currentSound, isMuted, volume]);

  const pause = useCallback(() => {
    soundEngine.stopAmbiance();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [isPlaying, pause, play]);

  const setSound = useCallback(
    async (sound: AmbientSoundMode) => {
      if (sound === "none") {
        pause();
        return;
      }

      setCurrentSoundState(sound);
      try {
        localStorage.setItem(LOCAL_STORAGE_SOUND_KEY, sound);
      } catch {}

      // Selecting a sound is an explicit user gesture: start playing immediately
      await soundEngine.resumeContext();
      soundEngine.setVolume(isMuted ? 0 : volume);
      soundEngine.setAmbiance(sound);
      setIsPlaying(true);
    },
    [isMuted, pause, volume]
  );

  const setVolume = useCallback(
    (newVolume: number) => {
      const clamped = Math.max(0, Math.min(1, newVolume));
      setVolumeState(clamped);
      if (isMuted && clamped > 0) {
        setIsMuted(false);
        try {
          localStorage.setItem(LOCAL_STORAGE_MUTED_KEY, "false");
        } catch {}
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_VOLUME_KEY, clamped.toString());
      } catch {}

      if (!isMuted) {
        soundEngine.setVolume(clamped);
      }
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LOCAL_STORAGE_MUTED_KEY, next.toString());
      } catch {}

      soundEngine.setVolume(next ? 0 : volume);
      return next;
    });
  }, [volume]);

  const playChime = useCallback(() => {
    soundEngine.playChime();
  }, []);

  const contextValue = useMemo<StudyAudioContextType>(
    () => ({
      isPlaying,
      currentSound,
      currentSoundMeta,
      volume,
      isMuted,
      availableSounds: AMBIENT_SOUNDS,
      play,
      pause,
      togglePlay,
      setSound,
      setVolume,
      toggleMute,
      playChime,
    }),
    [
      isPlaying,
      currentSound,
      currentSoundMeta,
      volume,
      isMuted,
      play,
      pause,
      togglePlay,
      setSound,
      setVolume,
      toggleMute,
      playChime,
    ]
  );

  return (
    <StudyAudioContext.Provider value={contextValue}>
      {children}
    </StudyAudioContext.Provider>
  );
}

export function useStudyAudio(): StudyAudioContextType {
  const context = useContext(StudyAudioContext);
  if (!context) {
    throw new Error("useStudyAudio must be used within a StudyAudioProvider");
  }
  return context;
}
