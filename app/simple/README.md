# Prompt of simple version for Google Ai Studio

```markdownlint
Role: You are a Senior Frontend Architect & Visual Effects Specialist. Critical Objective: Build a Next.js 14 Birthday Card SPA where BACKGROUND PARTICLES ARE GUARANTEED TO BE VISIBLE. Current Bug to Fix: Previous builds resulted in a blank background. You must ensure the particle canvas is correctly positioned on top of the background color but behind the content.

1. Technology Stack & Constraints
Framework: Next.js 14 (App Router, TypeScript).

Styling: Tailwind CSS (Focus on z-index management).

Particles: react-tsparticles + tsparticles-slim.

Animation: Framer Motion (for the "Envelope Explosion" and "Text Condensing" sequence).

Fonts: next/font/google (Dancing Script, Lato).

2. Architecture & File Structure
Please generate the production-ready code for these specific files:

A. package.json (Dependencies)
List installation commands for: framer-motion, react-tsparticles, tsparticles-slim, clsx, tailwind-merge.

B. src/config/card.config.ts (The Content Engine)
Purpose: Allow the user to edit everything without touching code.

Fields:

recipientName: string.

avatar: string (URL to image).

messages: string[].

audioSource: string (URL to mp3).

colors: Object { background: string, particle: string, text: string }.

Constraint: Set default colors.background to a warm hex (e.g., #FFFBF0) and colors.particle to a high-contrast Gold (#D4AF37) so they are definitely visible.

C. src/components/ParticleBackground.tsx (THE FIX IS HERE)
Strict Logic for Visibility:

CSS: The container div MUST have classes: fixed inset-0 -z-10 pointer-events-none.

Config: In the options prop for Particles:

fullScreen: { enable: false } (We control sizing via CSS).

background: { color: { value: "transparent" } } (Let the CSS background show through).

particles.color.value: Use the config color (Gold/Orange). Do not use White.

particles.opacity.value: 0.6 (Must be opaque enough).

particles.number.value: 50 (Density).

particles.move.enable: true (Speed 1-2).

Functionality: It renders the ambient floating dust/sparkles.

D. src/components/InteractiveCard.tsx (The Magic Sequence)
Visual Logic:

Stage 1 (Closed): Show 3D Envelope. Pulse animation.

Interaction: User clicks.

Stage 2 (Explosion): Envelope opacity -> 0. Trigger a Particle Explosion (using a temporary tsparticles Emitter or a Framer Motion layout effect that scatters 50+ dots outwards).

Stage 3 (Re-materialization):

Wait 200ms.

Avatar: Pops in first (scale: 0 -> spring -> 1).

Card Body: Expands outwards from the center.

Stage 4 (Text Condense):

Text appears after the Avatar.

Effect: filter: blur(10px) opacity(0) -> filter: blur(0px) opacity(1).

Stagger characters by 0.03s.

E. src/app/page.tsx (Composition)
Layout:

Container: relative w-full h-screen overflow-hidden flex items-center justify-center.

Background Style: Apply the background color from config here.

Render Order:

<ParticleBackground /> (Absolute, Z-0).

<InteractiveCard /> (Relative, Z-10).

F. src/app/layout.tsx
Load Google Fonts.

3. Specific Instructions to AI
Z-Index Strategy: The page.tsx main container usually has a white background by default in Next.js. You MUST force the ParticleBackground to sit on top of that background color but behind the text.

Solution: Apply the background color to the <body> or the main wrapper, and ensure ParticleBackground is absolute with transparency.

Explosion Implementation: For the envelope explosion, since creating a second particle instance is complex, simply use Framer Motion to animate 20 small div circles (Confetti) exploding outwards when the envelope is clicked, then remove them. This is lighter and smoother than managing two tsParticle instances.

Avatar: Ensure the Avatar image is styled with rounded-full, border-4 border-white, and shadow-xl.

Output: Provide the full, clean code for all files.
```
