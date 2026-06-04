export type ReminderKind = 'time' | 'place';
export type ReminderPriority = 'urgent' | 'normal';
export type ReminderTrigger = 'arrive' | 'leave';
export type CategoryKey = 'health' | 'work' | 'personal' | 'shopping';
export type ThemeMode = 'light' | 'dark';
export type NavTab = 'home' | 'calendar' | 'stats' | 'profile';
export type ToneName = 'primary' | 'secondary' | 'tertiary' | 'error';
export type FontPair = 'rubik' | 'assistant' | 'heebo' | 'rubikAll';

export interface Reminder {
  id: string;
  title: string;
  sub?: string;
  icon: string;
  kind: ReminderKind;
  priority: ReminderPriority;
  cat: CategoryKey;
  done: boolean;
  doneAt?: string;
  time?: string;
  repeat?: string;
  place?: string;
  trigger?: ReminderTrigger;
  dueDate?: string; // "YYYY-MM-DD"
}

export interface Category {
  label: string;
  icon: string;
  tone: ToneName;
}

export interface SeedColor {
  hex: string;
  name: string;
}

export interface AppearanceSettings {
  fontPair: FontPair;
  radius: number;
}
