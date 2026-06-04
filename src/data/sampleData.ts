import type { Reminder, Category, SeedColor, WeekStat, CategoryKey, ToneName } from '../types';

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
  health:   { label: 'בריאות', icon: 'ecg_heart',        tone: 'error' as ToneName },
  work:     { label: 'עבודה',  icon: 'work',              tone: 'primary' as ToneName },
  personal: { label: 'אישי',   icon: 'self_improvement',  tone: 'tertiary' as ToneName },
  shopping: { label: 'קניות',  icon: 'shopping_bag',      tone: 'secondary' as ToneName },
};

export const CATEGORY_ORDER: CategoryKey[] = ['health', 'work', 'personal', 'shopping'];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'r1', title: 'לקחת תרופה', sub: 'כדור אחד עם אוכל',
    time: '08:00', kind: 'time', priority: 'urgent', icon: 'medication', cat: 'health',
    repeat: 'כל יום', done: true, doneAt: '08:05',
  },
  {
    id: 'r2', title: 'פגישת צוות שבועית', sub: 'חדר ישיבות קומה 3',
    time: '10:30', kind: 'time', priority: 'urgent', icon: 'groups', cat: 'work',
    repeat: 'כל יום ראשון', done: false,
  },
  {
    id: 'r3', title: 'לקנות חלב ולחם', sub: 'כשמגיעים לסופר',
    place: 'שופרסל דיזנגוף', kind: 'place', trigger: 'arrive', cat: 'shopping',
    priority: 'normal', icon: 'shopping_cart', done: false,
  },
  {
    id: 'r4', title: 'להתקשר לאמא', sub: 'לבדוק מה שלומה',
    time: '17:00', kind: 'time', priority: 'normal', icon: 'call', cat: 'personal',
    repeat: 'חד פעמי', done: false,
  },
  {
    id: 'r5', title: 'להוציא את הכלב', sub: 'הליכת ערב',
    time: '19:30', kind: 'time', priority: 'normal', icon: 'pets', cat: 'personal',
    repeat: 'כל יום', done: false,
  },
  {
    id: 'r6', title: 'לשלוח דוח חודשי', sub: 'כשיוצאים מהמשרד',
    place: 'המשרד', kind: 'place', trigger: 'leave', cat: 'work',
    priority: 'urgent', icon: 'description', done: false,
  },
];

export const WEEK_STATS: WeekStat[] = [
  { day: 'ראשון', done: 6, total: 7 },
  { day: 'שני',   done: 5, total: 6 },
  { day: 'שלישי', done: 8, total: 8 },
  { day: 'רביעי', done: 4, total: 7 },
  { day: 'חמישי', done: 7, total: 9 },
  { day: 'שישי',  done: 3, total: 4 },
  { day: 'שבת',   done: 5, total: 5 },
];

export const CAL_REMINDERS: Record<number, number> = {
  3: 2, 7: 1, 12: 4, 15: 2, 18: 3, 22: 1, 26: 5, 28: 2,
};

export const HEB_MONTHS = [
  'ינואר','פברואר','מרץ','אפריל','מאי','יוני',
  'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר',
];
export const HEB_DAYS_SHORT = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];

export const REPEAT_OPTS = ['חד פעמי','כל יום','ימי חול','כל שבוע','כל חודש'];
export const ICON_CHOICES = [
  'notifications','medication','shopping_cart','call','groups','pets',
  'description','fitness_center','payments','cake','flight','local_cafe',
];
