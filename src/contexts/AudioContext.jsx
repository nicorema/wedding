import { createContext, useContext, useRef } from "react";

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const setIsPlayingRef = useRef(null);

  const pauseAudio = () => {
    if (audioRef.current && setIsPlayingRef.current) {
      audioRef.current.pause();
      setIsPlayingRef.current(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current && setIsPlayingRef.current) {
      audioRef.current.play().catch(() => {});
      setIsPlayingRef.current(true);
    }
  };

  return (
    <AudioContext.Provider
      value={{ audioRef, setIsPlayingRef, pauseAudio, playAudio }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}
