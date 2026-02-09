import { useState, useRef, useEffect, useCallback } from "react";
import { useAudio } from "../contexts/AudioContext";
import styles from "./AudioPlayer.module.scss";

function AudioPlayer({ src, autoPlay = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.02);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef(null);
  const playerContainerRef = useRef(null);
  const playButtonRef = useRef(null);
  const hasStartedRef = useRef(false);
  const interactionHandlerRef = useRef(null);
  const { audioRef: contextAudioRef, setIsPlayingRef } = useAudio();

  // Expose audio ref and setIsPlaying to context
  useEffect(() => {
    contextAudioRef.current = audioRef.current;
    setIsPlayingRef.current = setIsPlaying;
  }, [contextAudioRef, setIsPlayingRef]);

  // Initialize audio settings
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.loop = true;
      audio.preload = "auto";
    }
  }, [volume]);

  // Remove all interaction listeners
  const removeInteractionListeners = useCallback(() => {
    if (!interactionHandlerRef.current) return;

    const handler = interactionHandlerRef.current;
    const clickEvents = ["click", "touchstart", "keydown", "mousedown"];
    const scrollEvents = ["scroll", "wheel", "touchmove"];

    // Remove click events
    clickEvents.forEach((event) => {
      document.removeEventListener(event, handler);
      window.removeEventListener(event, handler);
    });

    // Remove scroll events with capture
    scrollEvents.forEach((event) => {
      window.removeEventListener(event, handler, { capture: true });
      document.removeEventListener(event, handler, { capture: true });
      document.body.removeEventListener(event, handler, { capture: true });
    });

    interactionHandlerRef.current = null;
  }, []);

  // Start playing function
  const startPlaying = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || hasStartedRef.current) return false;

    // Wait for audio to be ready if needed
    if (audio.readyState < 2) {
      await new Promise((resolve) => {
        const handleCanPlay = () => {
          audio.removeEventListener("canplay", handleCanPlay);
          resolve();
        };
        audio.addEventListener("canplay", handleCanPlay);
      });
    }

    try {
      await audio.play();
      setIsPlaying(true);
      hasStartedRef.current = true;
      // Remove all interaction listeners once started
      removeInteractionListeners();
      return true;
    } catch (err) {
      console.log("Play failed:", err);
      return false;
    }
  }, [removeInteractionListeners]);

  // Try autoplay when audio is ready (silently, no UI)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !autoPlay || hasStartedRef.current) return;

    const tryPlayWhenReady = async () => {
      if (hasStartedRef.current) return;

      try {
        await audio.play();
        setIsPlaying(true);
        hasStartedRef.current = true;
      } catch (err) {
        // Autoplay blocked - user can click to start
      }
    };

    const handleCanPlay = () => {
      tryPlayWhenReady();
    };

    audio.addEventListener("canplay", handleCanPlay, { once: true });

    // Also try immediately if already loaded
    if (audio.readyState >= 2) {
      tryPlayWhenReady();
    }

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [autoPlay]);

  // Set up first interaction handler if autoplay is enabled
  useEffect(() => {
    if (!autoPlay || hasStartedRef.current || interactionHandlerRef.current)
      return;

    const handleFirstInteraction = (e) => {
      // For scroll/wheel events, always allow (they don't have reliable e.target)
      const isScrollEvent =
        e.type === "scroll" || e.type === "wheel" || e.type === "touchmove";

      // Don't trigger on audio player controls (only for click/touch events)
      if (
        !isScrollEvent &&
        e.target &&
        playerContainerRef.current &&
        playerContainerRef.current.contains(e.target)
      ) {
        return;
      }

      // Start playing on any interaction (including scroll)
      startPlaying();
    };

    interactionHandlerRef.current = handleFirstInteraction;

    // Listen for any user interaction including scroll
    const clickEvents = ["click", "touchstart", "keydown", "mousedown"];
    const scrollEvents = ["scroll", "wheel", "touchmove"];

    // Add click events to document and window
    clickEvents.forEach((event) => {
      document.addEventListener(event, handleFirstInteraction, {
        passive: true,
      });
      window.addEventListener(event, handleFirstInteraction, { passive: true });
    });

    // Add scroll events - use multiple targets for better detection
    // Scroll events work best on window and document
    scrollEvents.forEach((event) => {
      // Window scroll is most reliable
      window.addEventListener(event, handleFirstInteraction, {
        passive: true,
        capture: false, // Don't use capture for scroll, it can interfere
      });
      // Document scroll as backup
      document.addEventListener(event, handleFirstInteraction, {
        passive: true,
        capture: false,
      });
      // Body scroll for mobile touch scrolling
      if (document.body) {
        document.body.addEventListener(event, handleFirstInteraction, {
          passive: true,
          capture: false,
        });
      }
    });

    return () => {
      // Remove all event listeners
      const handler = handleFirstInteraction;
      clickEvents.forEach((event) => {
        document.removeEventListener(event, handler);
        window.removeEventListener(event, handler);
      });
      scrollEvents.forEach((event) => {
        window.removeEventListener(event, handler);
        document.removeEventListener(event, handler);
        if (document.body) {
          document.body.removeEventListener(event, handler);
        }
      });
      interactionHandlerRef.current = null;
    };
  }, [autoPlay, startPlaying]);

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.log("Play prevented:", err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Ensure music continues playing when navigating
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && isPlaying && audio.paused) {
      audio.play().catch(() => {
        // Play failed, might need user interaction
      });
    }
  }, [isPlaying]);

  const togglePlay = (e) => {
    if (e) {
      e.stopPropagation(); // Prevent triggering document click handlers
    }
    // Mark as started when user clicks play button
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      // Remove interaction listeners
      if (interactionHandlerRef.current) {
        const handler = interactionHandlerRef.current;
        const events = ["click", "touchstart", "keydown", "mousedown"];
        events.forEach((event) => {
          document.removeEventListener(event, handler);
        });
        interactionHandlerRef.current = null;
      }
    }
    setIsPlaying((prev) => !prev);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div ref={playerContainerRef} className={styles.audioPlayer}>
      <audio ref={audioRef} src={src} loop onEnded={handleEnded} />

      <button
        ref={playButtonRef}
        className={styles.playButton}
        onClick={togglePlay}
        aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
      >
        {isPlaying ? "⏸️" : "▶️"}
      </button>

      <div className={styles.controlsContainer}>
        <button
          className={styles.controlsToggle}
          onClick={() => setShowControls(!showControls)}
          aria-label="Mostrar controles"
        >
          🎵
        </button>

        {showControls && (
          <div className={styles.controls}>
            <label className={styles.volumeLabel}>
              <span>🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
              />
              <span>{Math.round(volume * 100)}%</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

export default AudioPlayer;
