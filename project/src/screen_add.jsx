/* ULTRA · Add reminder screen */

function FieldLabel({ icon, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10,
      font: '700 14px var(--font-body)', color: 'var(--md-on-surface-variant)',
    }}>
      <span className="msym" style={{ fontSize: 19, color: 'var(--md-primary)' }}>{icon}</span>
      {children}
    </div>
  );
}

function IconPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }} className="hide-scroll">
      {ICON_CHOICES.map((ic) => {
        const sel = ic === value;
        return (
          <button key={ic} onClick={() => onChange(ic)}
            style={{
              width: 52, height: 52, flexShrink: 0, borderRadius: 'var(--r-md)', cursor: 'pointer',
              border: sel ? '2px solid var(--md-primary)' : '1.5px solid var(--md-outline-variant)',
              background: sel ? 'var(--md-primary-container)' : 'var(--md-surface-container-lowest)',
              color: sel ? 'var(--md-on-primary-container)' : 'var(--md-on-surface-variant)',
              display: 'grid', placeItems: 'center', WebkitTapHighlightColor: 'transparent',
              transition: 'all .2s var(--ease-spring)',
            }}>
            <span className="msym" style={{ fontSize: 24 }}>{ic}</span>
          </button>
        );
      })}
    </div>
  );
}

function AddScreen({ onClose, onSave }) {
  const [title, setTitle] = React.useState('');
  const [icon, setIcon] = React.useState('notifications');
  const [kind, setKind] = React.useState('time');
  const [time, setTime] = React.useState('09:00');
  const [place, setPlace] = React.useState('');
  const [trigger, setTrigger] = React.useState('arrive');
  const [repeat, setRepeat] = React.useState('חד פעמי');
  const [priority, setPriority] = React.useState('normal');

  const fieldStyle = {
    width: '100%', height: 56, padding: '0 18px', borderRadius: 'var(--r-md)',
    border: '1.5px solid var(--md-outline-variant)', background: 'var(--md-surface-container-lowest)',
    color: 'var(--md-on-surface)', font: '600 16px var(--font-body)', outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div className="screen-pad" style={{ paddingBottom: 120 }}>
      <TopBar
        leading={<IconButton icon="arrow_forward" onClick={onClose} />}
        title={<div style={{ font: '800 22px var(--font-display)', color: 'var(--md-on-surface)' }}>תזכורת חדשה</div>}
      />

      {/* preview clay tile */}
      <div className="reveal" style={{ display: 'grid', placeItems: 'center', margin: '8px 0 26px' }}>
        <ClayTile icon={icon} tone={priority === 'urgent' ? 'error' : kind === 'place' ? 'tertiary' : 'primary'} size={96} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <FieldLabel icon="edit">שם התזכורת</FieldLabel>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="למשל, לקחת תרופה" style={fieldStyle} />
        </div>

        <div>
          <FieldLabel icon="category">אייקון</FieldLabel>
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        <div>
          <FieldLabel icon="tune">סוג התזכורת</FieldLabel>
          <Segmented
            value={kind} onChange={setKind}
            options={[
              { value: 'time', label: 'לפי זמן', icon: 'schedule' },
              { value: 'place', label: 'לפי מיקום', icon: 'location_on' },
            ]}
          />
        </div>

        {kind === 'time' ? (
          <div className="reveal">
            <FieldLabel icon="alarm">שעה</FieldLabel>
            <div style={{ position: 'relative' }}>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                style={{ ...fieldStyle, textAlign: 'start', fontVariantNumeric: 'tabular-nums', fontSize: 22, fontWeight: 800 }} />
            </div>
            <FieldLabel icon="repeat" >&nbsp;</FieldLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: -6 }}>
              {REPEAT_OPTS.map((o) => (
                <Chip key={o} selected={repeat === o} onClick={() => setRepeat(o)}>{o}</Chip>
              ))}
            </div>
          </div>
        ) : (
          <div className="reveal">
            <FieldLabel icon="place">מיקום</FieldLabel>
            <input value={place} onChange={(e) => setPlace(e.target.value)}
              placeholder="חפש כתובת או מקום" style={{ ...fieldStyle, marginBottom: 14 }} />
            {/* faux map */}
            <div style={{
              height: 130, borderRadius: 'var(--r-md)', position: 'relative', overflow: 'hidden',
              background: 'repeating-linear-gradient(45deg, var(--md-surface-container), var(--md-surface-container) 14px, var(--md-surface-container-high) 14px, var(--md-surface-container-high) 28px)',
              border: '1.5px solid var(--md-outline-variant)', marginBottom: 14,
              display: 'grid', placeItems: 'center',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 60% at 50% 45%, var(--md-tertiary-container), transparent 70%)', opacity: .6 }} />
              <ClayPin size={88} />
            </div>
            <Segmented
              value={trigger} onChange={setTrigger}
              options={[
                { value: 'arrive', label: 'בהגעה', icon: 'login' },
                { value: 'leave', label: 'ביציאה', icon: 'logout' },
              ]}
            />
          </div>
        )}

        <div>
          <FieldLabel icon="flag">עדיפות</FieldLabel>
          <Segmented
            value={priority} onChange={setPriority}
            options={[
              { value: 'urgent', label: 'דחוף', icon: 'priority_high' },
              { value: 'normal', label: 'רגיל', icon: 'low_priority' },
            ]}
          />
        </div>
      </div>

      {/* sticky save */}
      <div style={{
        position: 'absolute', insetInline: 0, bottom: 0, padding: '16px 22px 22px',
        background: 'linear-gradient(to top, var(--md-surface) 70%, transparent)',
      }}>
        <Button full icon="check" onClick={() => onSave({
          title: title || 'תזכורת חדשה', icon, kind, time, place: place || 'מיקום',
          trigger, repeat, priority,
        })}>שמירת תזכורת</Button>
      </div>
    </div>
  );
}

Object.assign(window, { AddScreen });
