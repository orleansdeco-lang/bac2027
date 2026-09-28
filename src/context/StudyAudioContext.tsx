"use client";

import React, { createContext, useContext, ReactNode } from "react";

export interface StudyAudioContextType {
  isPlaying: boolean;
  currentSound: string;
  volume: number;
  isMuted: boolean;
  availableSounds: any[];
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  setSound: (sound: any) => Promise<void>;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  playChime: () => void;
}

const noop = () => {};
const asyncNoop = async () => {};

const defaultContext: StudyAudioContextType = {
  isPlaying: false,
  currentSound: "none",
  volume: 0,
  isMuted: true,
  availableSounds: [],
  play: asyncNoop,
  pause: noop,
  togglePlay: asyncNoop,
  setSound: asyncNoop,
  setVolume: noop,
  toggleMute: noop,
  playChime: noop,
};

const StudyAudioContext = createContext<StudyAudioContextType>(defaultContext);

export function StudyAudioProvider({ children }: { children: ReactNode }) {
  return (
    <StudyAudioContext.Provider value={defaultContext}>
      {children}
    </StudyAudioContext.Provider>
  );
}

export function useStudyAudio(): StudyAudioContextType {
  return useContext(StudyAudioContext) || defaultContext;
}
