import type { Reminder } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { ClayTile } from './illustrations/ClayTile';

interface DetailSheetProps {
  reminder: Reminder | null;
  onClose: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (r: Reminder) => void;
}

export function DetailSheet({ reminder, onClose, onToggle, onDelete, onEdit }: DetailSheetProps) {
  const open = !!reminder;
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'var(--md-scrim)',
          opacity: open ? 0.4 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s var(--ease)',
          zIndex: 40,
        }}
      />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 41,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        <div style={{
          width: '100%', maxWidth: 560,
          background: 'var(--md-surface-container-high)',
          borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
          padding: '14px 24px 28px',
          transform: open ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 0.42s var(--ease-spring)',
          boxShadow: '0 -8px 40px -8px rgba(0,0,0,.3)',
          pointerEvents: 'auto',
        }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'var(--md-outline-variant)', margin: '0 auto 20px',
        }} />

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
              <Button
                full icon={reminder.done ? 'replay' : 'check'}
                onClick={() => { onToggle(reminder.id); onClose(); }}
              >
                {reminder.done ? 'בטל ביצוע' : 'סמן כבוצע'}
              </Button>
            </div>
          </>
        )}
        </div>
      </div>
    </>
  );
}
