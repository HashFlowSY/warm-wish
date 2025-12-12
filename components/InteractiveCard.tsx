"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import { cardConfig } from "../config/card.config";
import { Gift, Sparkles, Heart } from "lucide-react";
import Image from "next/image";

// ============================================================================
// HELPER COMPONENT: MAGICAL TEXT
// Splits text into chars for the "Condensing Mist" effect
// ============================================================================
const MagicalText = ({
  text,
  delayOffset,
  className,
}: {
  text: string;
  delayOffset: number;
  className?: string;
}) => {
  const words = text.split(" ");
  return (
    <div
      className={`flex flex-wrap justify-center gap-x-2 gap-y-1 ${className}`}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block whitespace-nowrap">
          {word.split("").map((char, j) => (
            <motion.span
              key={j}
              initial={{ opacity: 0, filter: "blur(12px)", y: 25, scale: 1.2 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: delayOffset + i * 0.1 + j * 0.03,
                ease: "backOut",
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );
};

// ============================================================================
// HELPER COMPONENT: EXPLOSION PARTICLES
// A one-shot particle burst
// ============================================================================
const ExplosionParticles = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
      <Particles
        id="explosion-particles"
        init={particlesInit}
        className="w-full h-full"
        options={{
          fullScreen: { enable: false },
          fpsLimit: 60,
          particles: {
            number: { value: 0 }, // Start with 0, we rely on the burst/move effect
            color: { value: cardConfig.colors.explosion },
            shape: { type: ["circle", "star"] },
            opacity: {
              value: { min: 0, max: 1 },
              animation: {
                enable: true,
                speed: 2,
                startValue: "max",
                destroy: "min",
              },
            },
            size: {
              value: { min: 4, max: 10 },
              animation: {
                enable: true,
                speed: 5,
                startValue: "max",
                destroy: "min",
              },
            },
            move: {
              enable: true,
              speed: { min: 10, max: 20 }, // High speed for explosion
              direction: "none", // Random direction
              outModes: { default: "destroy" },
              straight: false,
            },
          },
          manualParticles: Array.from({ length: 60 }).map(() => ({
            position: { x: 50, y: 50 }, // Start at center (percent)
            options: {
              move: {
                direction: "none",
                enable: true,
                speed: 20,
                random: true,
                outModes: "destroy",
              },
            },
          })),
          detectRetina: true,
        }}
      />
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface InteractiveCardProps {
  onOpen: () => void;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({ onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);

  const handleOpen = () => {
    // 1. Trigger visuals
    setIsOpen(true);
    setShowExplosion(true);

    // 2. Trigger audio
    onOpen();

    // 3. Clean up explosion after 1s
    setTimeout(() => setShowExplosion(false), 1200);
  };

  return (
    <div className="relative z-10 w-full max-w-md aspect-[4/5] md:aspect-[3/4] flex items-center justify-center p-4">
      {/* EXPLOSION LAYER */}
      {showExplosion && <ExplosionParticles />}

      <AnimatePresence mode="wait">
        {/* STATE 1: LOCKED (ENVELOPE) */}
        {!isOpen && (
          <motion.div
            key="envelope"
            // Start State
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            // Idle Animation (Breathing)
            animate={{
              scale: 1,
              opacity: 1,
              y: [0, -10, 0],
              rotate: [0, 1, -1, 0],
            }}
            // Exit Animation (The "Swell & Vanish")
            exit={{
              scale: 1.5,
              opacity: 0,
              filter: "blur(20px)",
              transition: { duration: 0.3, ease: "easeIn" },
            }}
            transition={{
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              default: { duration: 0.6 },
            }}
            onClick={handleOpen}
            className="cursor-pointer group relative w-full max-w-xs aspect-[4/3] shadow-2xl rounded-lg flex items-center justify-center overflow-visible z-20"
            style={{
              background: `linear-gradient(135deg, ${cardConfig.colors.primary}, ${cardConfig.colors.accent})`,
            }}
            role="button"
            aria-label="Open Birthday Card"
          >
            {/* Envelope Flap Visual */}
            <div
              className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-lg backdrop-blur-sm"
              style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)" }}
            />

            {/* Pulsing Aura */}
            <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 group-hover:opacity-60 transition-opacity duration-500 rounded-full animate-pulse" />

            {/* Icon / Button */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="relative bg-white p-6 rounded-full shadow-xl z-20 border-4 border-yellow-100"
            >
              <Gift
                size={48}
                color={cardConfig.colors.primary}
                strokeWidth={1.5}
              />
            </motion.div>

            <motion.div
              className="absolute -bottom-20 text-3xl font-bold font-handwriting tracking-wide text-white drop-shadow-md"
              animate={{ opacity: [0.7, 1, 0.7], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Tap to Open
            </motion.div>
          </motion.div>
        )}

        {/* STATE 2: OPEN (CARD CONTENT) */}
        {isOpen && (
          <motion.div
            key="card"
            // Entry Animation (Implosion / Materialization)
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              boxShadow: [
                `0 0 0px ${cardConfig.colors.accent}`,
                `0 0 50px ${cardConfig.colors.accent}`,
                `0 25px 50px -12px rgba(0, 0, 0, 0.25)`,
              ],
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              delay: 0.2, // Wait for explosion to clear slightly
            }}
            className="w-full h-auto min-h-[500px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden relative p-8 flex flex-col items-center text-center border-4 border-double z-10"
            style={{ borderColor: cardConfig.colors.accent }}
          >
            {/* Inner Border Decoration */}
            <div className="absolute inset-2 border border-dashed border-gray-300 rounded-xl opacity-50 pointer-events-none" />

            {/* Decorative Sparkle (Top Right) */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="absolute top-6 right-6"
            >
              <Sparkles size={32} className="text-yellow-500" />
            </motion.div>

            {/* AVATAR / PROFILE PICTURE */}
            {cardConfig.avatarPath && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.5, // Appear just after the card settles
                }}
                className="relative z-20 mb-4 rounded-full p-1 bg-white/50 shadow-lg"
              >
                <Image
                  src={cardConfig.avatarPath}
                  alt={`${cardConfig.recipientName}'s avatar`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-sm"
                />
              </motion.div>
            )}

            {/* Header with Magical Reveal */}
            <div className="mb-8 relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-5xl md:text-7xl font-handwriting text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 drop-shadow-sm pb-2"
              >
                For {cardConfig.recipientName}
              </motion.h1>
            </div>

            {/* Messages Staggered Reveal */}
            <div className="space-y-6 flex-grow flex flex-col justify-center w-full relative z-10">
              {cardConfig.messages.map((msg, index) => (
                <MagicalText
                  key={index}
                  text={msg}
                  delayOffset={0.8 + index * 0.5} // Stagger lines
                  className="text-xl md:text-2xl font-medium text-gray-800"
                />
              ))}
            </div>

            {/* Footer Heart */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 4, type: "spring" }} // Appears last
              className="mt-8 mb-2"
            >
              <Heart
                size={28}
                className="text-red-500 fill-current animate-bounce"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveCard;
