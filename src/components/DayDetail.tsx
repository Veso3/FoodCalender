import { useState, useEffect } from 'react';
import type { Entry, NightPain } from '../types';
import { MOOD_LABELS } from '../types';

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

interface DayDetailProps {
  date: Date;
  entries: Entry[];
  nightPain: NightPain | null;
  onSaveNightPain: (data: { pain: boolean; notes: string }) => void;
  onAddEntry: () => void;
  onEditEntry: (entry: Entry) => void;
  onDeleteEntry: (id: string) => void;
  onClose: () => void;
}

function formatDate(d: Date): string {
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function DayDetail({
  date,
  entries,
  nightPain,
  onSaveNightPain,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onClose,
}: DayDetailProps) {
  const [pain, setPain] = useState(nightPain?.pain ?? false);
  const [notes, setNotes] = useState(nightPain?.notes ?? '');

  useEffect(() => {
    setPain(nightPain?.pain ?? false);
    setNotes(nightPain?.notes ?? '');
  }, [nightPain?.pain, nightPain?.notes]);

  const handlePainChange = (value: boolean) => {
    setPain(value);
    onSaveNightPain({ pain: value, notes });
  };

  const handleNotesBlur = () => {
    onSaveNightPain({ pain, notes });
  };

  return (
    <div className="day-detail" role="dialog" aria-modal="true" aria-label={`Einträge für ${formatDate(date)}`}>
      <header className="day-detail-header">
        <h3 className="day-detail-title">{formatDate(date)}</h3>
        <button
          type="button"
          className="day-detail-close"
          onClick={onClose}
          aria-label="Schließen"
        >
          <span className="day-detail-close-icon" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </span>
        </button>
      </header>
      <div className="day-detail-content">
        {entries.length === 0 ? (
          <p className="day-detail-empty">Noch keine Einträge an diesem Tag.</p>
        ) : (
          <ul className="day-detail-list">
            {entries.map((entry) => (
              <li key={entry.id} className="day-detail-item">
                <div className="day-detail-item-main">
                  {entry.time && (
                    <span className="day-detail-time">{entry.time}</span>
                  )}
                  <p className="day-detail-food">{entry.food}</p>
                  <span className="day-detail-mood" title={MOOD_LABELS[entry.mood]}>
                    {'★'.repeat(entry.mood)}{'☆'.repeat(5 - entry.mood)}
                  </span>
                </div>
                <div className="day-detail-item-actions">
                  <button
                    type="button"
                    className="btn btn-icon"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEditEntry(entry);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEntry(entry);
                    }}
                    aria-label="Bearbeiten"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="btn btn-icon btn-danger"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeleteEntry(entry.id);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEntry(entry.id);
                    }}
                    aria-label="Löschen"
                  >
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <section className="night-pain-block" aria-labelledby="night-pain-label">
          <h4 id="night-pain-label" className="night-pain-label">Schmerzen in der Nacht</h4>
          <div className="mood-buttons night-pain-buttons">
            <button
              type="button"
              className={`mood-btn ${pain ? 'mood-btn--active' : ''}`}
              onClick={() => handlePainChange(true)}
            >
              Ja
            </button>
            <button
              type="button"
              className={`mood-btn ${!pain ? 'mood-btn--active' : ''}`}
              onClick={() => handlePainChange(false)}
            >
              Nein
            </button>
          </div>
          <label className="entry-form-row" style={{ marginTop: '0.75rem' }}>
            <span className="entry-form-label">Notizen</span>
            <textarea
              className="entry-form-input entry-form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Optional"
              rows={2}
            />
          </label>
        </section>
        <button
          type="button"
          className="btn btn-primary btn-block day-detail-add"
          onClick={(e) => {
            e.stopPropagation();
            onAddEntry();
          }}
        >
          + Eintrag hinzufügen
        </button>
      </div>
    </div>
  );
}
