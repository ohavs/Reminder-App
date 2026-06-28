import type { Reminder } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { BottomSheet } from './ui/BottomSheet';
import { ClayTile } from './illustrations/ClayTile';
import { LocationPicker } from './LocationPicker';

interface DetailSheetProps {
  reminder: Reminder | null;
  onClose: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (r: Reminder) => void;
  onSnooze: (r: Reminder) => void;
}

export function DetailSheet({ reminder, onClose, onToggle, onDelete, onEdit, onSnooze }: DetailSheetProps) {
  const open = !!reminder;
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
                <h3 style={{
                  font: '800 24px var(--font-display)',
                  color: 'var(--md-on-surface)', margin: 0,
                }}>
                  {reminder.title}
                </h3>
                {reminder.sub && (
                  <p style={{
                    font: '500 15px var(--font-body)',
                    color: 'var(--md-on-surface-variant)', margin: '6px 0 0',
                  }}>
                    {reminder.sub}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
              <Card tone="lowest" style={{ flex: 1, padding: 14 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  font: '600 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginBottom: 6,
                }}>
                  <Icon name={reminder.kind === 'place' ? 'location' : 'clock'} size={17} color="var(--md-primary)" />
                  {reminder.kind === 'place' ? 'מיקום' : 'שעה'}
                </div>
                <div style={{ font: '800 17px var(--font-body)', color: 'var(--md-on-surface)' }}>
                  {reminder.kind === 'place' ? reminder.place : reminder.time}
                </div>
              </Card>

              <Card tone="lowest" style={{ flex: 1, padding: 14 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  font: '600 13px var(--font-body)', color: 'var(--md-on-surface-variant)', marginBottom: 6,
                }}>
                  <Icon name={reminder.kind === 'place' ? 'navigation' : 'repeat'} size={17} color="var(--md-primary)" />
                  {reminder.kind === 'place' ? 'טריגר' : 'חזרתיות'}
                </div>
                <div style={{ font: '800 17px var(--font-body)', color: 'var(--md-on-surface)' }}>
                  {reminder.kind === 'place'
                    ? (reminder.trigger === 'arrive' ? 'בהגעה' : 'ביציאה')
                    : (reminder.repeat || 'חד פעמי')}
                </div>
              </Card>
            </div>

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
              <Button
                variant="outline" icon="trash"
                onClick={() => { onDelete(reminder.id); onClose(); }}
                style={{ flex: '0 0 auto' }}
              />
              <Button
                variant="outline" icon="edit"
                onClick={() => { onEdit(reminder); onClose(); }}
                style={{ flex: '0 0 auto' }}
              />
              {reminder.kind === 'time' && !reminder.done && (
                <Button
                  variant="outline" icon="bell-off"
                  onClick={() => { onSnooze(reminder); onClose(); }}
                  style={{ flex: '0 0 auto' }}
                />
              )}
              <Button
                full icon={reminder.done ? 'replay' : 'check'}
                onClick={() => { onToggle(reminder.id); onClose(); }}
              >
                {reminder.done ? 'בטל ביצוע' : 'סמן כבוצע'}
              </Button>
            </div>
          </>
        )}
    </BottomSheet>
  );
}
