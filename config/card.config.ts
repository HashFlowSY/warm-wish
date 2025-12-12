// ==============================================================================
// CARD CONFIGURATION
// ==============================================================================

export const cardConfig = {
  // ----------------------------------------------------------------------------
  // CONTENT
  // ----------------------------------------------------------------------------
  recipientName: "YR",

  // NEW: Avatar image path (local file or URL)
  // Use a square image for best results.
  avatarPath: "/YR.jpg",

  messages: [
    "生日快乐",
    "这就是一个简单的生日贺卡页面",
    "反正你已经看过了",
    "那就看一下别的吧",
    "✨ Stay Awesome ✨",
  ],

  // ----------------------------------------------------------------------------
  // AUDIO
  // ----------------------------------------------------------------------------
  // CHANGED: Reference to a local file in public folder using root-relative path.
  // NOTE: You must place a file named 'birthday-song.mp3' in your project's public folder.
  audioSource: "https://stream.zeno.fm/0r0xa792kwzuv",

  // ----------------------------------------------------------------------------
  // COLORS
  // ----------------------------------------------------------------------------
  colors: {
    background: "#FFFBEB", // Warm cream/amber-50
    primary: "#D97706", // Amber-600
    accent: "#FCD34D", // Amber-300
    text: "#78350F", // Amber-900
    cardSurface: "#FFFFFF",

    // PARTICLE SPECIFIC COLORS
    particles: ["#FFD700", "#FF6347", "#FFA500", "#FF4500"], // Gold, Tomato, Orange
    explosion: ["#FFD700", "#FFFFFF", "#FCD34D"], // Bright Gold, White, Amber for the burst
  },
};
