import { useEffect, useState } from 'react';
import type { Reminder } from '../types';
import { REPEAT_OPTS } from '../data/sampleData';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { Icon } from './ui/Icon';
import { TimeField } from './ui/TimeField';
import { BottomSheet } from './ui/BottomSheet';
import { ClayTile } from './illustrations/ClayTile';
import { LocationPicker } from './LocationPicker';

interface DetailSheetProps {
  reminder: Reminder | null;
  onClose: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (r: Reminder) => void;
  onUpdate: (id: string, fields: Partial<Reminder>) => void;
}

export function DetailSheet({ reminder, onClose, onToggle, onDelete, onEdit, onUpdate }: DetailSheetProps) {
  const open = !!reminder;
  const [edit, setEdit] = useState<null | 'time' | 'repeat'>(null);
  const [time, setTime] = useState('09:00');
  const [repeat, setRepeat] = useState('חד פעמי');

  // Re-seed local edit state whenever a different reminder is opened
  useEffect(() => {
    if (reminder) {
      setTime(reminder.time ?? '09:00');
      setRepeat(reminder.repeat ?? 'חד פעמי');
      setEdit(null);
    }
  }, [reminder?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isTime = reminder?.kind === 'time';

  const chevron = (active: boolean) => (
    <Icon name="chevron-left" size={18} style={{
      transform: active ? 'rotate(-90deg)' : 'rotate(0deg)',
      transition: 'transform 0.25s var(--ease-spring)', marginInlineStart: 'auto',
    }} />
  );

  const handleDelete = () => {
    if (!reminder) return;
    if (window.confirm('למחוק את התזכורת? לא ניתן לשחזר.')) {
      onDelete(reminder.id);
      onClose();
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} maxWidth={560}>
      {reminder && (
        <>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', gap: 14, marginBottom: 22,
          }}>
            <ClayTile
              icon={reminder.icon}
              tone={reminder.priority === 'urgent' ? 'error' : reminder.kind === 'place' ? 'tertiary' : 'primary'}
              size={84}
            />
            <div>
              <h3 style={{ font: '800 24px var(--font-display)', color: 'var(--md-on-surface)', margin: 0 }}>
                {reminder.title}
              </h3>
              {reminder.sub && (
                <p style={{ font: '500 15px var(--font-body)', color: 'var(--md-on-surface-variant)', margin: '6px 0 0' }}>
                  {reminder.sub}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: edit ? 14 : 22 }}>
            {/* Time / location */}
            <Card
              tone="lowest"
              onClick={isTime ? () => setEdit(edit === 'time' ? null : 'time') : undefined}
              style={{ flex: 1, padding: 14, cursor: isTime ? 'pointer' : 'default' }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                font: '600 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginBottom: 6,
              }}>
                <Icon name={reminder.kind === 'place' ? 'location' : 'clock'} size={17} color="var(--md-primary)" />
                {reminder.kind === 'place' ? 'מיקום' : 'שעה'}
                {isTime && chevron(edit === 'time')}
              </div>
              <div style={{ font: '800 17px var(--font-body)', color: 'var(--md-on-surface)' }}>
                {reminder.kind === 'place' ? reminder.place : time}
              </div>
            </Card>

            {/* Repeat / trigger */}
            <Card
              tone="lowest"
              onClick={isTime ? () => setEdit(edit === 'repeat' ? null : 'repeat') : undefined}
              style={{ flex: 1, padding: 14, cursor: isTime ? 'pointer' : 'default' }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                font: '600 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginBottom: 6,
              }}>
                <Icon name={reminder.kind === 'place' ? 'navigation' : 'repeat'} size={17} color="var(--md-primary)" />
                {reminder.kind === 'place' ? 'טריגר' : 'חזרתיות'}
                {isTime && chevron(edit === 'repeat')}
              </div>
              <div style={{ font: '800 17px var(--font-body)', color: 'var(--md-on-surface)' }}>
                {reminder.kind === 'place'
                  ? (reminder.trigger === 'arrive' ? 'בהגעה' : 'ביציאה')
                  : repeat}
              </div>
            </Card>
          </div>

          {/* Inline editors */}
          {isTime && edit === 'time' && (
            <div className="reveal" style={{ marginBottom: 22 }}>
              <TimeField value={time} onChange={(v) => { setTime(v); onUpdate(reminder.id, { time: v }); }} />
            </div>
          )}
          {isTime && edit === 'repeat' && (
            <div className="reveal" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
              {REPEAT_OPTS.map((o) => (
                <Chip key={o} selected={repeat === o}
                  onClick={() => { setRepeat(o); onUpdate(reminder.id, { repeat: o, sub: o }); }}>
                  {o}
                </Chip>
              ))}
            </div>
          )}

          {reminder.kind === 'place' && reminder.lat != null && reminder.lng != null && (
            <div style={{ marginBottom: 22 }}>
              <LocationPicker
                readonly
                height={150}
                value={{ lat: reminder.lat, lng: reminder.lng, radius: reminder.radius ?? 200 }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="outline" icon="trash" onClick={handleDelete} style={{ flex: '0 0 auto' }} />
            <Button variant="outline" icon="edit" onClick={() => { onEdit(reminder); onClose(); }} style={{ flex: '0 0 auto' }} />
            <Button full icon={reminder.done ? 'replay' : 'check'} onClick={() => { onToggle(reminder.id); onClose(); }}>
              {reminder.done ? 'בטל ביצוע' : 'סמן כבוצע'}
            </Button>
          </div>
        </>
      )}
    </BottomSheet>
  );
}
