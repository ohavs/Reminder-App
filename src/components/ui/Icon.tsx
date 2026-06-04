import {
  Home, Calendar, BarChart3, User, Plus, Check, X, ChevronLeft, ChevronRight,
  Pencil, Trash2, MoreVertical, RefreshCw, Bell, BellOff, Clock, MapPin,
  AlertTriangle, Repeat, Flag, CheckCircle, Palette, Moon, Sun, Volume2,
  Lock, ShieldCheck, Download, Upload, Navigation, LogOut, Settings,
  TrendingUp, Trophy, Flame, Rocket, PartyPopper, ClipboardList, LayoutGrid,
  CalendarCheck, Heart, Briefcase, Smile, ShoppingBag, ShoppingCart,
  Phone, Users, PawPrint, FileText, Dumbbell, CreditCard, Cake, Plane,
  Coffee, Pill, SlidersHorizontal, ArrowRight, Star, Search, RotateCcw,
  Circle, MapPinned, Tag, Zap, Target, BookOpen, Music,
  type LucideIcon,
} from 'lucide-react';

export type { LucideIcon };

export const ICON_MAP: Record<string, LucideIcon> = {
  // Navigation
  'home': Home, 'calendar': Calendar, 'stats': BarChart3, 'bar-chart': BarChart3,
  'user': User, 'plus': Plus, 'add': Plus,
  // Actions
  'check': Check, 'x': X, 'close': X, 'back': ArrowRight,
  'edit': Pencil, 'delete': Trash2, 'trash': Trash2, 'more': MoreVertical,
  'refresh': RefreshCw, 'replay': RotateCcw,
  // Content
  'bell': Bell, 'bell-off': BellOff, 'snooze': BellOff,
  'clock': Clock, 'map-pin': MapPin, 'location': MapPin, 'map-pinned': MapPinned,
  'alert': AlertTriangle, 'repeat': Repeat, 'flag': Flag,
  'check-circle': CheckCircle, 'tag': Tag, 'zap': Zap, 'target': Target,
  // Theme
  'palette': Palette, 'moon': Moon, 'dark-mode': Moon, 'sun': Sun, 'light-mode': Sun,
  'volume': Volume2, 'sliders': SlidersHorizontal, 'tune': SlidersHorizontal,
  // Settings
  'lock': Lock, 'shield-check': ShieldCheck, 'download': Download,
  'upload': Upload, 'navigation': Navigation, 'logout': LogOut, 'log-out': LogOut,
  'settings': Settings,
  // Stats
  'trending-up': TrendingUp, 'trophy': Trophy, 'flame': Flame, 'fire': Flame,
  'rocket': Rocket, 'party': PartyPopper, 'clipboard': ClipboardList,
  'grid': LayoutGrid, 'calendar-check': CalendarCheck, 'today': CalendarCheck,
  // Categories
  'heart': Heart, 'briefcase': Briefcase, 'smile': Smile,
  'shopping-bag': ShoppingBag, 'shopping-cart': ShoppingCart,
  // Reminder icons
  'bell-reminder': Bell, 'pill': Pill, 'phone': Phone, 'users': Users,
  'paw-print': PawPrint, 'file-text': FileText, 'dumbbell': Dumbbell,
  'credit-card': CreditCard, 'cake': Cake, 'plane': Plane, 'coffee': Coffee,
  'star': Star, 'search': Search, 'book': BookOpen, 'music': Music,
  // Navigation extras
  'chevron-left': ChevronLeft, 'chevron-right': ChevronRight,
  // Legacy Material Symbol names → mapped to Lucide equivalents
  'notifications': Bell, 'medication': Pill, 'shopping_cart': ShoppingCart,
  'call': Phone, 'groups': Users, 'pets': PawPrint, 'description': FileText,
  'fitness_center': Dumbbell, 'payments': CreditCard, 'flight': Plane,
  'local_cafe': Coffee, 'ecg_heart': Heart, 'work': Briefcase,
  'self_improvement': Smile, 'shopping_bag': ShoppingBag,
  'schedule': Clock, 'location_on': MapPin, 'priority_high': AlertTriangle,
  'check_circle': CheckCircle, 'celebration': PartyPopper,
  'pending_actions': ClipboardList, 'local_fire_department': Flame,
  'rocket_launch': Rocket, 'dark_mode': Moon, 'light_mode': Sun,
  'arrow_forward': ArrowRight, 'more_vert': MoreVertical,
  'apps': LayoutGrid, 'alarm': Clock, 'login': Navigation,
  'tour': Navigation, 'event_available': CalendarCheck,
  'low_priority': Flag, 'volume_up': Volume2, 'rounded_corner': SlidersHorizontal,
  'my_location': Navigation, 'insights': TrendingUp, 'verified_user': ShieldCheck,
  'calendar_month': Calendar, 'bar_chart': BarChart3, 'person': User,
  'category': Tag, 'place': MapPin,
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2, style }: IconProps) {
  const Ic = ICON_MAP[name] ?? Circle;
  return <Ic size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}
