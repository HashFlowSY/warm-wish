"use client";

import React, { useEffect, useRef } from "react";
import { cardConfig } from "../config/card.config";

interface MusicPlayerProps {
  isPlaying: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isPlaying }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      // Set volume to 50% for a pleasant background experience
      audioRef.current.volume = 0.5;

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Audio playing successfully");
          })
          .catch((error) => {
            console.error("Audio playback failed:", error);
            // This usually happens if the user interaction wasn't passed correctly
            // or the URL is blocked.
          });
      }
    }
  }, [isPlaying]);

  return (
    <audio ref={audioRef} loop preload="auto">
      <source src={cardConfig.audioSource} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
};

export default MusicPlayer;
