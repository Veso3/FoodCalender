import { useState, useEffect, useCallback } from 'react';
import Calendar from './components/Calendar';
import DayDetail from './components/DayDetail';
import EntryForm from './components/EntryForm';
import type { Entry } from './types';
import {
  getDatesWithEntries,
  getEntriesByDate,
  addEntry as dbAddEntry,
  updateEntry as dbUpdateEntry,
  deleteEntry as dbDeleteEntry,
} from './db';
import './App.css';

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [datesWithEntries, setDatesWithEntries] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayEntries, setDayEntries] = useState<Entry[]>([]);
  const [formState, setFormState] = useState<'closed' | 'new' | { edit: Entry }>('closed');

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
      return;
    }
    const key = toDateKey(selectedDate);
    getEntriesByDate(key).then(setDayEntries);
  }, [selectedDate]);

  const handleSelectDay = (date: Date) => {
    setSelectedDate(date);
    setFormState('closed');
  };

  const handleCloseDay = () => {
    setSelectedDate(null);
    setFormState('closed');
  };

  const handleOpenNewEntry = () => {
    setFormState('new');
  };

  const handleEditEntry = (entry: Entry) => {
    setFormState({ edit: entry });
  };

  const handleSaveEntry = async (entry: Entry) => {
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
  };

  const handleDeleteEntry = async (id: string) => {
    await dbDeleteEntry(id);
    await refreshDates();
    if (selectedDate) {
      setDayEntries(await getEntriesByDate(toDateKey(selectedDate)));
    }
    setFormState('closed');
  };

  const formDate = selectedDate ?? new Date();
  const editingEntry = formState === 'closed' ? null : formState === 'new' ? null : formState.edit;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Essens-Kalender</h1>
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
      </main>

      {selectedDate && (
        <div className="modal-backdrop" onClick={handleCloseDay} aria-hidden>
          <div
            className="modal-panel day-detail-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {formState !== 'closed' ? (
              <EntryForm
                initialDate={formDate}
                entry={editingEntry}
                onSave={handleSaveEntry}
                onCancel={() => setFormState('closed')}
              />
            ) : (
              <DayDetail
                date={selectedDate}
                entries={dayEntries}
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
