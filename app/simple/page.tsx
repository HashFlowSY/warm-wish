"use client";

import React, { useState } from "react";
import ParticleBackground from "@/components/ParticleBackground";
import InteractiveCard from "@/components/InteractiveCard";
import MusicPlayer from "@/components/MusicPlayer";
import { cardConfig } from "@/config/card.config";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);

  // This function is triggered by the card interaction
  const handleStartExperience = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  return (
    <main
      className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden"
      style={{ backgroundColor: cardConfig.colors.background }}
    >
      {/* LAYER 0: Particles (Fixed Background, Z-0) */}
      <ParticleBackground />

      {/* LAYER 1: Audio Logic (Invisible) */}
      <MusicPlayer isPlaying={isPlaying} />

      {/* LAYER 2: Main Interactive Content (Relative, Z-10) */}
      <div className="z-10 w-full flex flex-col items-center">
        <InteractiveCard onOpen={handleStartExperience} />

        {/* Footer Credit */}
        <div className="absolute bottom-4 text-xs opacity-50 font-light mix-blend-multiply pointer-events-none">
          Made with ❤️ for {cardConfig.recipientName}
        </div>
      </div>
    </main>
  );
}
