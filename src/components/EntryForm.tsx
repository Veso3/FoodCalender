import { useState, useEffect } from 'react';
import type { Entry, MoodLevel } from '../types';
import { MOOD_LABELS } from '../types';

interface EntryFormProps {
  initialDate: Date;
  entry?: Entry | null;
  onSave: (entry: Entry) => void;
  onCancel: () => void;
}

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function EntryForm({
  initialDate,
  entry,
  onSave,
  onCancel,
}: EntryFormProps) {
  const [date, setDate] = useState(toDateInputValue(initialDate));
  const [time, setTime] = useState('');
  const [food, setFood] = useState('');
  const [mood, setMood] = useState<MoodLevel>(3);

  useEffect(() => {
    if (entry) {
      setDate(entry.date);
      setTime(entry.time ?? '');
      setFood(entry.food);
      setMood(entry.mood);
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Entry = {
      id: entry?.id ?? crypto.randomUUID(),
      date,
      time: time || undefined,
      food: food.trim(),
      mood,
    };
    onSave(payload);
  };

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <h3 className="entry-form-title">
        {entry ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
      </h3>
      <div className="entry-form-row">
        <label htmlFor="entry-date">Datum</label>
        <input
          id="entry-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="entry-form-input"
        />
      </div>
      <div className="entry-form-row">
        <label htmlFor="entry-time">Uhrzeit (optional)</label>
        <input
          id="entry-time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="entry-form-input"
        />
      </div>
      <div className="entry-form-row">
        <label htmlFor="entry-food">Was hast du gegessen?</label>
        <textarea
          id="entry-food"
          value={food}
          onChange={(e) => setFood(e.target.value)}
          placeholder="z.B. Mittagessen: Salat mit Hähnchen"
          required
          rows={3}
          className="entry-form-input entry-form-textarea"
        />
      </div>
      <div className="entry-form-row">
        <span className="entry-form-label">Wie hast du dich dabei gefühlt?</span>
        <div className="mood-buttons" role="group" aria-label="Stimmung">
          {([1, 2, 3, 4, 5] as const).map((level) => (
            <button
              key={level}
              type="button"
              className={`mood-btn ${mood === level ? 'mood-btn--active' : ''}`}
              onClick={() => setMood(level)}
              title={MOOD_LABELS[level]}
              aria-pressed={mood === level}
            >
              {level}
            </button>
          ))}
        </div>
        <span className="mood-hint">{MOOD_LABELS[mood]}</span>
      </div>
      <div className="entry-form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="submit" className="btn btn-primary">
          Speichern
        </button>
      </div>
    </form>
  );
}
