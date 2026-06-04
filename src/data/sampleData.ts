import type { Category, SeedColor, CategoryKey, ToneName } from '../types';

export const SEED_COLORS: SeedColor[] = [
  { hex: '#B5651D', name: 'טרהקוטה' },
  { hex: '#386A1F', name: 'זית' },
  { hex: '#6750A4', name: 'סגול' },
  { hex: '#00658E', name: 'תכלת' },
  { hex: '#B3261E', name: 'אדום' },
  { hex: '#7D5260', name: 'ורוד' },
  { hex: '#1D6E5C', name: 'טורקיז' },
  { hex: '#8A5A00', name: 'ענבר' },
];

export const CATEGORIES: Record<CategoryKey, Category> = {
  health:   { label: 'בריאות', icon: 'heart',        tone: 'error' as ToneName },
  work:     { label: 'עבודה',  icon: 'briefcase',     tone: 'primary' as ToneName },
  personal: { label: 'אישי',   icon: 'smile',         tone: 'tertiary' as ToneName },
  shopping: { label: 'קניות',  icon: 'shopping-bag',  tone: 'secondary' as ToneName },
};

export const CATEGORY_ORDER: CategoryKey[] = ['health', 'work', 'personal', 'shopping'];

export const HEB_MONTHS = [
  'ינואר','פברואר','מרץ','אפריל','מאי','יוני',
  'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר',
];
export const HEB_DAYS_SHORT = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];

export const REPEAT_OPTS = ['חד פעמי','כל יום','ימי חול','כל שבוע','כל חודש'];

export const ICON_CHOICES = [
  'bell', 'pill', 'shopping-cart', 'phone', 'users', 'paw-print',
  'file-text', 'dumbbell', 'credit-card', 'cake', 'plane', 'coffee',
  'heart', 'star', 'book', 'music',
];
