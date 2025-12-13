# Simple version for Google Ai Studio

## Prompt

```markdownlint
Role: You are a Senior Creative Frontend Engineer specializing in Next.js 14+ (App Router), TypeScript, Tailwind CSS, and React Three Fiber (R3F).

Objective: Create a complete, single-page 3D interactive Birthday Card application based on a strictly defined flow. The code must be production-ready, performant, and visually stunning.

Tech Stack Requirements:

Framework: Next.js 14+ (App Router).

3D Engine: @react-three/fiber, @react-three/drei (Crucial for controls, text, and shaders).

Animation: framer-motion or react-spring (for UI), but use native R3F useFrame for particle lerping (morphing) to ensure high performance.

Styling: Tailwind CSS.

No Backend: All data comes from a config file.

File Structure Requirement: The project should include:

app/page.tsx: Main entry.

components/Experience.tsx: The 3D Canvas setup.

components/ParticleSystem.tsx: The core logic for particle morphing.

config/card.config.ts: Configuration file.

Detailed Functional Requirements:

1. Configuration (card.config.ts) Create a config file exporting an object containing:

name: String (Recipient's name).

wishes: Array of Strings (The distinct messages to show).

musicUrl: String (URL to a gentle background MP3).

colors: Object (Defining starColor, cakeColor, textColor).

2. The 3D Scene (Stages) The application is a State Machine with 3 stages. Use a huge number of particles (e.g., 3000-5000 points).

Stage 0: The Void (Start)

Visual: A starry background where particles are scattered randomly in a large sphere (simulating stars). They should drift slowly.

Centerpiece: A glowing, "breathing" white sphere (The "Origin"). Use MeshBasicMaterial with a glow effect or Bloom post-processing if possible, but keep it performant.

Interaction: Clicking the Origin triggers Stage 1 and Plays the Audio.

Stage 1: The Cake

Transition: Particles must smoothly move (morph) from their random star positions to form the shape of a 3D Two-Tier Birthday Cake.

Shape Logic: Mathematically calculate points on the surface of two cylinders (one large base, one smaller top) to define the target positions for the particles.

Visual: Change particle colors to a warm, soft palette (defined in config).

Interaction: Clicking the Cake triggers Stage 2.

Stage 2: The Message

Transition: Particles explode outwards slightly and then converge to form 3D Text (The wishes from config).

Shape Logic: You must use @react-three/drei's Text or Three.js FontLoader to parse the text geometry and sample vertices (points) from the font mesh.

Constraint: Crucial: The particles forming the text must be dense. If the text is "Happy Birthday", ensure the particles are compressed tightly so the letters are legible.

Interaction: 360-degree rotation is allowed throughout all stages using <OrbitControls />.

3. Engineering constraints & Best Practices:

Performance: Do NOT create 5000 Mesh objects. Use <points> with a BufferGeometry. Update the position attribute of the geometry frame-by-frame in useFrame to achieve the morphing effect (linear interpolation between currentPosition and targetPosition).

Responsiveness: Ensure the canvas fits the screen (100vw, 100vh).

Audio: Handle the AudioContext auto-play policy (only start audio after the first user click).

Output format: Provide the full code for the files mentioned above. For layout.tsx or globals.css, keeping them standard is fine. Focus heavily on the math logic in ParticleSystem.tsx to handle the coordinate mapping for Stars -> Cylinder(Cake) -> Text.
```

### Addition0

```markdownlint
Role: Senior Creative Frontend Engineer. Context: We have a working prototype, but the visual quality is lacking. Task: Refactor the ParticleSystem and Experience components to fix specific visual issues.

Critical Issues to Fix (Must Implementation):

1. Fix "Square Particles" (Crucial):

Currently, particles render as squares. This looks cheap.

Solution: In your ShaderMaterial or PointsMaterial, you MUST render them as circles.

2. Fix "Illegible Text" (Crucial):

Currently, the text is too small and the particles are too sparse to read.

Solution A (Density): When sampling points from the Text geometry, increase the number of particles dedicated to the text stage. If the total particle count is fixed (e.g., 4000), ensure the text sampling uses all of them efficiently.

Solution B (Scale): The scale of the generated Text geometry is too small. Multiply the text coordinate scale by 2x or 3x so it fills the screen width.

Solution C (Centering): Ensure the text geometry is centered (geometry.center()) so it rotates around the middle, not the bottom-left corner.

3. Visual Polish: Bloom & Breathing Origin:

Add @react-three/postprocessing to the project.

Add a <Bloom /> effect to the scene. High intensity, but low threshold, so the "Origin" sphere and bright stars glow.

The Origin Sphere: It currently looks like a flat 2D circle. Make it a 3D Sphere with an Emissive material (so it glows). Add a useFrame animation to make it "breathe" (scale up and down gently using Math.sin).

4. Color Palette Refinement:

Stage 0 (Stars): White/Blue-ish.

Stage 1 (Cake): Warm Gold/Cream (keep existing).

Stage 2 (Text): Change to Bright Gold or Pure White. The current Cyan/Green looks out of place.

Code Output Requirements: Please provide the updated code for:

components/Experience.tsx (Adding PostProcessing/Bloom).

components/ParticleSystem.tsx (Fixing the round particles, text density/scaling logic, and color interpolation).

card.config.ts (Update colors if needed).
```

### Addition1

```markdownlint
Role: Senior Creative Frontend Engineer. Context: The visual style is now acceptable (round particles, bloom are working). However, the transitions and composition need final polish to be production-ready.

Critical Tasks (Must Fix):

1. Hiding the "Origin" Sphere (Logic Fix):

Current Behavior: The central white glowing sphere (The "Origin") stays visible inside the Cake and behind the Text. This is visually distracting.

Required Behavior:

On Stage 0 (Start): Sphere is Visible.

On Stage 1 (Cake) & Stage 2 (Text): The Sphere must animate out.

Implementation: Use a spring or framer-motion value for the Sphere's scale. When stage > 0, animate scale to 0. It should shrink and disappear smoothly so the Cake becomes the focus.

2. Boost Particle Density & Quality:

Current: The text looks a bit sparse/thin.

Action: Increase the particle count constant to 8000 (or 10000 if performance allows).

Action: When sampling the Text Geometry, ensure you are using a Bold font weight or significantly increasing the sample size to create "thicker" letters. The text needs to look like a solid neon cloud.

3. Cinematic Camera:

Enable autoRotate on <OrbitControls />.

Set autoRotateSpeed to a very low value (e.g., 0.5) so the cake and text gently spin, showcasing the 3D depth without making the user dizzy.

4. Refine Text Layout:

If the wish text is long (e.g., "Happy Birthday Name"), logic should attempt to split it into two lines or adjust the size so it doesn't run off the edge of the screen.

Output: Please provide the updated code for:

components/Experience.tsx (Handling the Sphere visibility logic and Camera controls).

components/ParticleSystem.tsx (Updating particle count and text sampling density).
```

### Addition2

```markdownlint
Role: Senior Creative Frontend Engineer. Context: The visual structure is solid (good density, good shapes). Now we need to add "Life" and "Micro-Interactions". The particles currently look too static/frozen once they form the shape.

Task: Polish the ParticleSystem.tsx to add "Idle Shimmer" and fix layout spacing.

Optimization Requirements:

1. Inject "Life" (Idle Shimmering):

Current: Particles move to the target position and stop dead.

Required: When the morph transition is mostly complete (particle is near target), add a continuous sine-wave motion.

Visual Goal: The Cake and Text should feel like they are "floating" or "breathing" slightly, never perfectly still.

2. Tighten Text Layout (Line Height):

Current: The gap between the "Happy Birthday" line and the "Name" line is too wide.

Required: In your text sampling logic, reduce the y offset separation between lines. Bring the name closer to the main wish.

3. Sparkle Effect (Optional but Nice):

Update the Color logic. Instead of a solid static color, allow the opacity or brightness of individual particles to fluctuate slightly with time, creating a "twinkling stars" effect.

4. Camera Polish:

Ensure <OrbitControls autoRotate autoRotateSpeed={0.5} /> is active. The slow rotation combined with the particle wobble creates a powerful 3D parallax effect.

Output: Please provide the full updated code for components/ParticleSystem.tsx. You do not need to change the config or the main page unless necessary for the camera controls.
```

### Addition3

```markdownlint
Role: Senior Creative Frontend Engineer. Context: The "Cake" shape in Stage 1 currently looks like two empty wireframe cylinders. It lacks volume and detail. Task: Refine the calculateCakePositions logic in ParticleSystem.tsx to create a much more organic, solid-looking cake with a candle.

Geometric Optimization Requirements:

1. Fix "Hollowness" (Add Caps):

Current: Particles only map to the side walls of the cylinders.

Requirement: Distribute particles across 3 distinct zones to make it look solid:

Side Walls: The vertical surfaces of both tiers.

Top Caps: The flat top surface of the Top Tier, AND the exposed flat ring of the Bottom Tier.

Volume (Optional): Scatter a few particles inside the cylinder so it doesn't look like a thin shell.

2. Adjust Proportions (Elegance):

Bottom Tier: Wider radius, slightly shorter height.

Top Tier: Narrower radius (about 60% of bottom), slightly taller height.

Result: A more elegant "wedding cake" silhouette.

3. Organic "Cream" Texture (Noise):

Do not place particles on a perfect mathematical circle (r).

Add random variation to the radius: finalR = baseR + (Math.random() - 0.5) * 0.2.

This creates a "fluffy" or "frosted" look, removing the sharp "CAD model" edges.

4. The Candle (The Soul):

Reserve a small cluster of particles (e.g., 50-100 particles) to form a small flame shape at the very top center of the cake.

Color Override: If possible, force these specific particles to flicker with an Orange/Red color in the shader or color attribute, distinct from the Golden cake.

Output: Please provide the updated components/ParticleSystem.tsx code focusing on the getExpreiencePositions (or equivalent) function to implement this improved Cake geometry.
```

### Addition4

```markdownlint
Role: Senior Creative Frontend Engineer.Context: The project is 90% there. The Candle and interactions are great.Critical Visual Fixes Required:1. Fix "Hollow Cake" (Must Implementation):Problem: The cake currently looks like two hollow rings/tubes. The Top Surfaces are missing.Solution: In calculateCakePositions, you must explicitly distribute about 30% of the particles onto the horizontal surfaces (Disks).Math Logic:Instead of just x = R * cos(theta), use r = R * sqrt(Math.random()) to fill the circle.Zone A (Top Tier Cap): Fill the circle at the very top ($y = height_{top}$).Zone B (Bottom Tier Shoulder): Fill the ring exposed by the bottom tier ($y = height_{bottom}$, radius between $R_{top}$ and $R_{bottom}$).2. Improve Transition (Remove "Collapse"):Problem: Transition from Cake -> Text creates a weird "implosion" effect where particles collapse into a line/point.Solution: Add a Random Noise Offset during the interpolation.Technique: In your vertex shader or useFrame loop, when progress is between 0.0 and 1.0, add a noise vector that pushes particles OUTWARDS slightly, rather than letting them take a direct linear path through the center. This creates an "Explosion/Morph" effect instead of a "Collapse".3. Candle Fidelity:Make the candle flame particles (the center top cluster) strictly Red/Orange. Currently, they blend too much with the gold.Output:Please provide the updated components/ParticleSystem.tsx. Focus heavily on the getCakePositions function to ensure the top caps are filled with particles.
```

### Addition5

```markdownlint
Role: Senior Creative Frontend Engineer. Context: The visual output is great, but the Text Readability needs one final adjustment. Task: Increase the vertical spacing (Line Height) between the distinct lines of text in Stage 2.

Specific Requirement:

Problem: The "Happy Birthday" line and the "Name" line are currently too close to each other. The particles from the top line are almost touching the bottom line.

Solution: In your calculateTextPositions (or equivalent logic), increase the vertical gap between the lines.

Implementation:

If you are calculating offsets manually: Push the second line (the Name) further down along the negative Y-axis. Increase the gap by at least 50% (1.5x) of the current spacing.

If you are using a library property (like lineHeight): Increase it significantly (e.g., from 1 to 1.5 or 1.6).

Output: Please provide the updated components/ParticleSystem.tsx (or wherever the text layout logic resides) with this increased spacing applied.
```

### Addition6

```markdownlint
Role: Senior Creative Frontend Engineer. Context: The user wants to display multiple messages in Stage 2, not just one. Task: Implement a Text Carousel (Loop) for the wishes array in Stage 2.

Functional Requirements:

1. Cycling Logic:

Current: Displays static text (likely wishes[0]).

Required: Cycle through the wishes array from card.config.ts.

Interval: Change the message every 5 seconds.

Loop: When the end of the array is reached, go back to the first wish.

2. Implementation Details (ParticleSystem.tsx):

Add a state for currentWishIndex.

Use a useEffect or useInterval hook to increment the index.

Trigger: When currentWishIndex changes, you MUST recalculate the target positions for the new text string immediately.

Transition: The existing useFrame lerp logic should automatically handle the morphing. The particles will fly from the "Old Text" shape to the "New Text" shape.

3. Maintain Previous Layout Fixes:

Crucial: Ensure the Line Height / Spacing logic you fixed in the previous step (separating the name from the wish) is applied to every new message generated in the loop.

4. Performance Hint:

Generating 3D Text geometry can be expensive. Ensure you clean up old geometries if necessary, or just rely on R3F's automatic disposal.

The calculateTextPositions function should be robust enough to handle strings of varying lengths without crashing.

Output: Please provide the updated components/ParticleSystem.tsx.
```

### Addition7

```markdownlint
Role: Senior Creative Frontend Engineer. Context: We are refining the Stage 2 (Text Loop) animation. Task: Implement a "Stable Anchor" for the recipient's name.

The Problem: Currently, when the carousel loops to a new Wish message, all particles (including the Name at the bottom) scatter and reform. This looks unstable.

The Requirement: The recipient's name (e.g., "Alex") must remain completely static and solid while the top wish text transforms.

Technical Implementation Strategy (Particle Segmentation):

Split the Buffer:

Divide the total particle count (e.g., 8000) into two segments:

Segment A (Name Particles): Fixed amount (e.g., 2000 particles).

Segment B (Wish Particles): The remaining particles (e.g., 6000 particles).

Memoize the Name:

Calculate the target positions for the Name ONCE (when Stage 2 is first prepared or on mount).

Store these coordinates. Do NOT recalculate them when the currentWishIndex changes.

Dynamic Wish Update:

When currentWishIndex changes, only recalculate the target positions for Segment B (the Wish text).

Merge for Frame Update:

In your render loop or position update logic, the target array for Stage 2 should always be: [...FixedNamePositions, ...NewWishPositions].

Because the FixedNamePositions are identical to the previous frame, the lerp function will result in zero movement for those particles, creating a solid, rock-steady name.

Maintain Layout:

Keep the vertical spacing (line height) logic from the previous step. Ensure the Name is positioned well below the changing Wish text.

Output: Please provide the updated components/ParticleSystem.tsx implementing this segmented particle logic.
```

## Install

```shell
pnpm install

pnpm build

pnpm start
```
