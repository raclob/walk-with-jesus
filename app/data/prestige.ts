export interface PrestigeRank {
  level: number;
  title: string;
  description: string;
}

export const PRESTIGE_RANKS: PrestigeRank[] = [
  { level: 0, title: "Seeker", description: "You are beginning your first walk through the whole story." },
  { level: 1, title: "Pilgrim", description: "You have walked the road once. You walk it again with a wider sight." },
  { level: 2, title: "Disciple", description: "You have learned to follow. The Word is becoming familiar terrain." },
  { level: 3, title: "Apostle", description: "You have been sent. You walk now to gather others into the journey." },
  { level: 4, title: "Elder", description: "You have walked far. The whole story sits in your memory like an old map." },
  { level: 5, title: "Saint", description: "You walk with quiet weight. The story has become part of you." },
];

export function getRank(level: number): PrestigeRank {
  if (level < PRESTIGE_RANKS.length) return PRESTIGE_RANKS[level];
  // After Saint, rank repeats with numbering
  return {
    level,
    title: `Saint · ${level - PRESTIGE_RANKS.length + 2}`,
    description: "You walk with the elders of the faith. Each return reveals new depths.",
  };
}
