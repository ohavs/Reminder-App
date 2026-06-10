import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { Reminder, ReminderKind, ReminderPriority, ReminderTrigger, CategoryKey } from '../types';
import { REPEAT_OPTS, ICON_CHOICES, CATEGORIES, CATEGORY_ORDER } from '../data/sampleData';
import { TopBar } from '../components/ui/TopBar';
import { IconButton } from '../components/ui/IconButton';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Segmented } from '../components/ui/Segmented';
import { Icon } from '../components/ui/Icon';
import { ClayTile } from '../components/illustrations/ClayTile';
import { LocationPicker } from '../components/LocationPicker';
import type { GeoPoint } from '../components/LocationPicker';

const fieldStyle: CSSProperties = {
  width: '100%', height: 56, padding: '0 18px', borderRadius: 'var(--r-md)',
  border: '1.5px solid var(--md-outline-variant)',
  background: 'var(--md-surface-container-lowest)',
  color: 'var(--md-on-surface)', font: '600 16px var(--font-body)', outline: 'none',
  boxSizing: 'border-box',
};

function FieldLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10,
      font: '700 14px var(--font-body)', color: 'var(--md-on-surface-variant)',
    }}>
      <Icon name={icon} size={18} color="var(--md-primary)" />
      {children}
    </div>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="hide-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
      {ICON_CHOICES.map((ic) => {
        const sel = ic === value;
        return (
          <button key={ic} onClick={() => onChange(ic)}
            style={{
              width: 52, height: 52, flexShrink: 0, borderRadius: 'var(--r-md)', cursor: 'pointer',
              border: sel ? '2px solid var(--md-primary)' : '1.5px solid var(--md-outline-variant)',
              background: sel ? 'var(--md-primary-container)' : 'var(--md-surface-container-lowest)',
              display: 'grid', placeItems: 'center', WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.2s var(--ease-spring)',
            }}>
            <Icon name={ic} size={24} color={sel ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)'} />
          </button>
        );
      })}
    </div>
  );
}

type NewReminder = Omit<Reminder, 'id' | 'done' | 'doneAt'>;

interface AddScreenProps {
  onClose: () => void;
  onSave: (data: NewReminder) => void;
  defaultDate?: string;
  editing?: Reminder | null;
}

export function AddScreen({ onClose, onSave, defaultDate, editing }: AddScreenProps) {
  const [title, setTitle] = useState(editing?.title ?? '');
  const [icon, setIcon] = useState(editing?.icon ?? 'bell');
  const [kind, setKind] = useState<ReminderKind>(editing?.kind ?? 'time');
  const [time, setTime] = useState(editing?.time ?? '09:00');
  const [dueDate, setDueDate] = useState(editing?.dueDate ?? defaultDate ?? '');
  const [place, setPlace] = useState(editing?.place ?? '');
  const [trigger, setTrigger] = useState<ReminderTrigger>(editing?.trigger ?? 'arrive');
  const [repeat, setRepeat] = useState(editing?.repeat ?? 'חד פעמי');
  const [priority, setPriority] = useState<ReminderPriority>(editing?.priority ?? 'normal');
  const [cat, setCat] = useState<CategoryKey>(editing?.cat ?? 'personal');
  const [geo, setGeo] = useState<GeoPoint | null>(
    editing?.lat != null && editing?.lng != null
      ? { lat: editing.lat, lng: editing.lng, radius: editing.radius ?? 200 }
      : null,
  );
  const [searching, setSearching] = useState(false);

  const searchPlace = async () => {
    const q = place.trim();
    if (!q || searching) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=he&q=${encodeURIComponent(q)}`,
      );
      const data = await res.json();
      if (data[0]) setGeo({ lat: +data[0].lat, lng: +data[0].lon, radius: geo?.radius ?? 200 });
    } catch { /* offline / blocked — pin can still be placed manually */ }
    setSearching(false);
  };

  const handleSave = () => {
    onSave({
      title: title.trim() || 'תזכורת חדשה',
      icon, kind, priority, cat,
      time: kind === 'time' ? time : undefined,
      repeat: kind === 'time' ? repeat : undefined,
      place: kind === 'place' ? (place.trim() || 'מיקום') : undefined,
      trigger: kind === 'place' ? trigger : undefined,
      sub: kind === 'place'
        ? (trigger === 'arrive' ? 'בהגעה למקום' : 'ביציאה מהמקום')
        : repeat,
      dueDate: dueDate || undefined,
      lat: kind === 'place' ? geo?.lat : undefined,
      lng: kind === 'place' ? geo?.lng : undefined,
      radius: kind === 'place' ? geo?.radius : undefined,
    });
  };

  return (
    <div className="screen-pad" style={{ paddingBottom: 0, display: 'flex', flexDirection: 'column' }}>
      <TopBar
        leading={<IconButton icon="x" onClick={onClose} label="סגור" />}
        title={
          <div style={{ font: '800 22px var(--font-display)', color: 'var(--md-on-surface)' }}>
            {editing ? 'עריכת תזכורת' : 'תזכורת חדשה'}
          </div>
        }
      />

      <div className="reveal" style={{ display: 'grid', placeItems: 'center', margin: '8px 0 26px' }}>
        <ClayTile
          icon={icon}
          tone={priority === 'urgent' ? 'error' : kind === 'place' ? 'tertiary' : 'primary'}
          size={96}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <FieldLabel icon="edit">שם התזכורת</FieldLabel>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="למשל, לקחת תרופה"
            style={fieldStyle}
          />
        </div>

        <div>
          <FieldLabel icon="tag">אייקון</FieldLabel>
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        <div>
          <FieldLabel icon="grid">קטגוריה</FieldLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORY_ORDER.map((c) => (
              <Chip key={c} selected={cat === c} icon={CATEGORIES[c].icon} onClick={() => setCat(c)}>
                {CATEGORIES[c].label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel icon="tune">סוג התזכורת</FieldLabel>
          <Segmented
            value={kind}
            onChange={(v) => setKind(v as ReminderKind)}
            options={[
              { value: 'time',  label: 'לפי זמן',    icon: 'clock' },
              { value: 'place', label: 'לפי מיקום',  icon: 'location' },
            ]}
          />
        </div>

        {kind === 'time' ? (
          <div className="reveal">
            <FieldLabel icon="clock">שעה</FieldLabel>
            <input
              type="time" value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ ...fieldStyle, textAlign: 'start', fontVariantNumeric: 'tabular-nums', fontSize: 22, fontWeight: 800 }}
            />
            <div style={{ height: 24 }} />
            <FieldLabel icon="calendar">תאריך (אופציונלי)</FieldLabel>
            <input
              type="date" value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ ...fieldStyle, fontSize: 16 }}
            />
            <div style={{ height: 24 }} />
            <FieldLabel icon="repeat">חזרתיות</FieldLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: -6 }}>
              {REPEAT_OPTS.map((o) => (
                <Chip key={o} selected={repeat === o} onClick={() => setRepeat(o)}>{o}</Chip>
              ))}
            </div>
          </div>
        ) : (
          <div className="reveal">
            <FieldLabel icon="map-pin">מיקום</FieldLabel>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') searchPlace(); }}
                placeholder="חפש כתובת או מקום"
                style={{ ...fieldStyle, flex: 1 }}
              />
              <button
                onClick={searchPlace}
                aria-label="חפש"
                style={{
                  width: 56, height: 56, flexShrink: 0, borderRadius: 'var(--r-md)',
                  border: 'none', cursor: 'pointer',
                  background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)',
                  display: 'grid', placeItems: 'center',
                  opacity: searching ? 0.5 : 1,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Icon name="search" size={22} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <LocationPicker value={geo} onChange={setGeo} />
              <div style={{
                marginTop: 8, font: '500 12px var(--font-body)',
                color: 'var(--md-on-surface-variant)', textAlign: 'center',
              }}>
                {geo ? 'גרור או לחץ על המפה לעדכון המיקום' : 'לחץ על המפה לבחירת מיקום'}
              </div>
            </div>

            {geo && (
              <div style={{ marginBottom: 14 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', marginBottom: 8,
                  font: '700 14px var(--font-body)', color: 'var(--md-on-surface-variant)',
                }}>
                  <span>רדיוס התראה</span>
                  <span style={{ color: 'var(--md-primary)' }}>{geo.radius} מ׳</span>
                </div>
                <input
                  type="range" min="100" max="1000" step="50" value={geo.radius}
                  onChange={(e) => setGeo({ ...geo, radius: +e.target.value })}
                  style={{ width: '100%', accentColor: 'var(--md-primary)' }}
                />
              </div>
            )}

            <Segmented
              value={trigger}
              onChange={(v) => setTrigger(v as ReminderTrigger)}
              options={[
                { value: 'arrive', label: 'בהגעה',  icon: 'navigation' },
                { value: 'leave',  label: 'ביציאה', icon: 'log-out' },
              ]}
            />
          </div>
        )}

        <div>
          <FieldLabel icon="flag">עדיפות</FieldLabel>
          <Segmented
            value={priority}
            onChange={(v) => setPriority(v as ReminderPriority)}
            options={[
              { value: 'urgent', label: 'דחוף', icon: 'alert' },
              { value: 'normal', label: 'רגיל', icon: 'check' },
            ]}
          />
        </div>
      </div>

      <div style={{
        position: 'sticky', bottom: 0, marginTop: 28,
        padding: '16px 0 22px',
        background: 'linear-gradient(to top, var(--md-surface) 70%, transparent)',
      }}>
        <Button full icon="check" onClick={handleSave}>{editing ? 'שמירת שינויים' : 'שמירת תזכורת'}</Button>
      </div>
    </div>
  );
}
