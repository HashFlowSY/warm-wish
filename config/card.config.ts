import { CardConfig } from "../types";

export const cardConfig: CardConfig = {
  name: "悠然",
  wishes: [
    "生日快乐",
    "今天不必共情",
    "不必时刻清醒",
    "卸下所有防御",
    "做回那个小孩",
    "愿治愈他人的你",
    "也能被世界温柔接住",
    "这不是心理暗示",
    "而是既定事实",
    "余生幸福",
  ],
  // Gentle ambient background music
  musicUrl:
    "https://res.cloudinary.com/dr6d86idz/video/upload/v1766108790/stars_bdtedz.mp3",
  fontsUrl: "/fonts/specific.json",
  wordsTime: 5000,
  colors: {
    starColor: "#b3e5fc", // Light blue-ish white
    cakeColor: "#ffd54f", // Warm Gold
    textColor: "#ffffff", // Pure bright white for legibility
    originColor: "#ffffff", // Glowing white center
  },
};
