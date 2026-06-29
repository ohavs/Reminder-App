export type ReminderKind = 'time' | 'place';
export type ReminderPriority = 'urgent' | 'normal';
export type ReminderTrigger = 'arrive' | 'leave';
export type CategoryKey = 'health' | 'work' | 'personal' | 'shopping';
export type ThemeMode = 'light' | 'dark';
export type NavTab = 'home' | 'calendar' | 'profile';
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
  doneAtMs?: number;
  time?: string;
  repeat?: string;
  place?: string;
  trigger?: ReminderTrigger;
  dueDate?: string; // "YYYY-MM-DD"
  lat?: number;
  lng?: number;
  radius?: number; // geofence radius, meters
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

export interface SharedList {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  inviteCode: string;
}

export type InviteStatus = 'pending' | 'accepted' | 'declined';

export interface Invite {
  id: string;
  listId: string;
  listName: string;
  email: string;     // invited person's email (lowercased)
  fromName: string;
  fromUid: string;
  status: InviteStatus;
}

export interface AppearanceSettings {
  fontPair: FontPair;
  radius: number;
}

export interface SavedPlace {
  id: string;
  name: string;      // friendly label, e.g. "בית", "עבודה"
  address?: string;  // the searched/entered address text
  lat: number;
  lng: number;
  radius: number;    // meters
}
