"use client";

import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import { cardConfig } from "../config/card.config";

const ParticleBackground: React.FC = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    // initialize the tsParticles instance (main)
    await loadSlim(engine);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="w-full h-full"
        options={{
          fullScreen: { enable: false }, // Critical: Disable built-in fullscreen to respect parent container styling
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
            },
          },
          particles: {
            color: {
              value: cardConfig.colors.particles,
            },
            links: {
              enable: false, // Disable links for a "firefly/confetti" look
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "out",
              },
              random: true,
              speed: 1.5, // Visible movement speed
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 50, // Sufficient density for visual impact
            },
            opacity: {
              value: 0.7, // High opacity to ensure visibility against light backgrounds
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.3,
                sync: false,
              },
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 3, max: 7 }, // Larger size to ensure visibility
              random: true,
              anim: {
                enable: true,
                speed: 3,
                size_min: 0.3,
                sync: false,
              },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
};

export default ParticleBackground;
