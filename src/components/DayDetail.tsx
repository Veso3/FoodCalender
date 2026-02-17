import type { Entry } from '../types';
import { MOOD_LABELS } from '../types';

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

interface DayDetailProps {
  date: Date;
  entries: Entry[];
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
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onClose,
}: DayDetailProps) {
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
