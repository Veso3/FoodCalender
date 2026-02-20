import { useState, useEffect, useCallback } from 'react';
import Calendar from './components/Calendar';
import DayDetail from './components/DayDetail';
import EntryForm from './components/EntryForm';
import type { Entry, NightPain } from './types';
import {
  getDatesWithEntries,
  getEntriesByDate,
  getAllEntries,
  getNightPain,
  getNightPainByMonth,
  saveNightPain,
  addEntry as dbAddEntry,
  updateEntry as dbUpdateEntry,
  deleteEntry as dbDeleteEntry,
} from './db';
import { toDateKey } from './dateUtils';
import './App.css';

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [datesWithEntries, setDatesWithEntries] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayEntries, setDayEntries] = useState<Entry[]>([]);
  const [formState, setFormState] = useState<'closed' | 'new' | { edit: Entry }>('closed');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [nightPain, setNightPain] = useState<NightPain | null>(null);

  const refreshDates = useCallback(async () => {
    const set = await getDatesWithEntries();
    setDatesWithEntries(set);
  }, []);

  useEffect(() => {
    refreshDates();
  }, [refreshDates]);

  useEffect(() => {
    if (!selectedDate) {
      setDayEntries([]);
      setNightPain(null);
      return;
    }
    const key = toDateKey(selectedDate);
    getEntriesByDate(key).then(setDayEntries);
    getNightPain(key).then(setNightPain);
  }, [selectedDate]);

  const handleSelectDay = (date: Date) => {
    setSelectedDate(date);
    setFormState('closed');
  };

  const handleCloseDay = () => {
    setSelectedDate(null);
    setFormState('closed');
    setErrorMessage(null);
  };

  const handleOpenNewEntry = () => {
    setFormState('new');
  };

  const handleEditEntry = (entry: Entry) => {
    setFormState({ edit: entry });
  };

  const handleSaveEntry = async (entry: Entry) => {
    setSaving(true);
    setErrorMessage(null);
    try {
      if (entry.id && dayEntries.some((e) => e.id === entry.id)) {
        await dbUpdateEntry(entry);
      } else {
        await dbAddEntry(entry);
      }
      await refreshDates();
      if (selectedDate && toDateKey(selectedDate) === entry.date) {
        setDayEntries(await getEntriesByDate(entry.date));
      }
      setFormState('closed');
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Möchten Sie diesen Eintrag wirklich löschen?')) return;
    setErrorMessage(null);
    try {
      await dbDeleteEntry(id);
      await refreshDates();
      if (selectedDate) {
        setDayEntries(await getEntriesByDate(toDateKey(selectedDate)));
      }
      setFormState('closed');
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Fehler beim Löschen.');
    }
  };

  const handleSaveNightPain = async (data: { pain: boolean; notes: string }) => {
    if (!selectedDate) return;
    const date = toDateKey(selectedDate);
    try {
      await saveNightPain({ date, pain: data.pain, notes: data.notes });
      setNightPain({ date, pain: data.pain, notes: data.notes });
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Fehler beim Speichern.');
    }
  };

  const handleExportMonth = async () => {
    const year = currentMonth.getFullYear();
    const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `${year}-${month}`;
    const [allEntries, nightPainList] = await Promise.all([
      getAllEntries(),
      getNightPainByMonth(prefix),
    ]);
    const entries = allEntries
      .filter((e) => e.date.startsWith(prefix))
      .sort((a, b) => {
        const d = a.date.localeCompare(b.date);
        return d !== 0 ? d : (a.time || '').localeCompare(b.time || '');
      });
    const nightPainByDate = new Map<string, NightPain>();
    nightPainList.forEach((np) => nightPainByDate.set(np.date, np));
    const allDates = new Set<string>([...entries.map((e) => e.date), ...nightPainByDate.keys()]);
    const sortedDates = Array.from(allDates).sort();

    const blocks: string[] = [];
    for (const dateKey of sortedDates) {
      const [y, m, d] = dateKey.split('-');
      const dateStr = `${d}.${m}.${y}`;
      blocks.push(dateStr);
      const np = nightPainByDate.get(dateKey);
      if (np) {
        blocks.push(`  Schmerzen in der Nacht: ${np.pain ? 'Ja' : 'Nein'}`);
        if (np.notes.trim()) blocks.push(`  Notizen: ${np.notes.trim()}`);
      }
      const dayEntriesList = entries.filter((e) => e.date === dateKey);
      for (const e of dayEntriesList) {
        const timeStr = e.time || '--:--';
        const moodStr = '★'.repeat(e.mood) + '☆'.repeat(5 - e.mood);
        blocks.push(`  ${timeStr} | ${e.food} | Stimmung ${e.mood}/5 ${moodStr}`);
      }
      blocks.push('');
    }
    const text =
      blocks.length > 0
        ? blocks.join('\n').trimEnd()
        : `Keine Einträge für ${currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}.`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Medos-Essens-Kalender-${year}-${month}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formDate = selectedDate ?? new Date();
  const editingEntry = formState === 'closed' ? null : formState === 'new' ? null : formState.edit;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Medos Essens-Kalender</h1>
      </header>
      <main className="app-main">
        <Calendar
          current={currentMonth}
          onPrevMonth={() =>
            setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1))
          }
          onNextMonth={() =>
            setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1))
          }
          onSelectDay={handleSelectDay}
          datesWithEntries={datesWithEntries}
        />
        <button
          type="button"
          className="btn btn-secondary btn-block app-export"
          onClick={handleExportMonth}
        >
          Export (aktueller Monat)
        </button>
      </main>

      {selectedDate && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseDay();
          }}
          aria-hidden
        >
          <div
            className="modal-panel day-detail-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {errorMessage && (
              <div className="app-error" role="alert">
                {errorMessage}
                <button
                  type="button"
                  className="app-error-dismiss"
                  onClick={() => setErrorMessage(null)}
                  aria-label="Fehlermeldung schließen"
                >
                  ×
                </button>
              </div>
            )}
            {formState !== 'closed' ? (
              <EntryForm
                initialDate={formDate}
                entry={editingEntry}
                onSave={handleSaveEntry}
                onCancel={() => setFormState('closed')}
                saving={saving}
              />
            ) : (
              <DayDetail
                date={selectedDate}
                entries={dayEntries}
                nightPain={nightPain}
                onSaveNightPain={handleSaveNightPain}
                onAddEntry={handleOpenNewEntry}
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
                onClose={handleCloseDay}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
