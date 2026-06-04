/* ULTRA · sample data (Hebrew) */

const SEED_COLORS = [
  { hex: '#B5651D', name: 'טרהקוטה' },
  { hex: '#386A1F', name: 'זית' },
  { hex: '#6750A4', name: 'סגול' },
  { hex: '#00658E', name: 'תכלת' },
  { hex: '#B3261E', name: 'אדום' },
  { hex: '#7D5260', name: 'ורוד' },
  { hex: '#1D6E5C', name: 'טורקיז' },
  { hex: '#8A5A00', name: 'ענבר' },
];

// kind: 'time' | 'place' ; priority: 'urgent' | 'normal'
const CATEGORIES = {
  health:   { label: 'בריאות', icon: 'ecg_heart', tone: 'error' },
  work:     { label: 'עבודה',  icon: 'work',      tone: 'primary' },
  personal: { label: 'אישי',   icon: 'self_improvement', tone: 'tertiary' },
  shopping: { label: 'קניות',  icon: 'shopping_bag', tone: 'secondary' },
};
const CATEGORY_ORDER = ['health', 'work', 'personal', 'shopping'];

const TODAY_REMINDERS = [
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

const WEEK_STATS = [
  { day: 'רא', done: 6, total: 7 },
  { day: 'ב', done: 5, total: 6 },
  { day: 'ג', done: 8, total: 8 },
  { day: 'ד', done: 4, total: 7 },
  { day: 'ה', done: 7, total: 9 },
  { day: 'ו', done: 3, total: 4 },
  { day: 'ש', done: 5, total: 5 },
];

const CAL_REMINDERS = {
  // dayOfMonth -> count
  3: 2, 7: 1, 12: 4, 15: 2, 18: 3, 22: 1, 26: 5, 28: 2,
};

const HEB_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const HEB_DAYS_SHORT = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];

const REPEAT_OPTS = ['חד פעמי','כל יום','ימי חול','כל שבוע','כל חודש'];
const ICON_CHOICES = ['notifications','medication','shopping_cart','call','groups','pets','description','fitness_center','payments','cake','flight','local_cafe'];

Object.assign(window, {
  SEED_COLORS, TODAY_REMINDERS, WEEK_STATS, CAL_REMINDERS, CATEGORIES, CATEGORY_ORDER,
  HEB_MONTHS, HEB_DAYS_SHORT, REPEAT_OPTS, ICON_CHOICES,
});
