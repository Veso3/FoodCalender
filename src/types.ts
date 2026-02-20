export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface Entry {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  time?: string; // optional HH:mm
  food: string;
  mood: MoodLevel;
}

export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: 'Sehr schlecht',
  2: 'Schlecht',
  3: 'Mittel',
  4: 'Gut',
  5: 'Sehr gut',
};

export interface NightPain {
  date: string;
  pain: boolean;
  notes: string;
}
