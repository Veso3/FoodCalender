import { useMemo } from 'react';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

function getDaysInMonth(year: number, month: number): Date[] {
  const last = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function getCalendarGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Mo = 0
  const days = getDaysInMonth(year, month);
  const grid: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) grid.push(null);
  for (const d of days) grid.push(d);
  return grid;
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface CalendarProps {
  current: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (date: Date) => void;
  datesWithEntries: Set<string>;
}

export default function Calendar({
  current,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
  datesWithEntries,
}: CalendarProps) {
  const grid = useMemo(
    () => getCalendarGrid(current.getFullYear(), current.getMonth()),
    [current.getFullYear(), current.getMonth()]
  );

  const year = current.getFullYear();
  const month = current.getMonth();

  return (
    <section className="calendar" aria-label="Kalender">
      <header className="calendar-header">
        <button
          type="button"
          className="calendar-nav"
          onClick={onPrevMonth}
          aria-label="Vorheriger Monat"
        >
          ‹
        </button>
        <h2 className="calendar-title">
          {MONTHS[month]} {year}
        </h2>
        <button
          type="button"
          className="calendar-nav"
          onClick={onNextMonth}
          aria-label="Nächster Monat"
        >
          ›
        </button>
      </header>
      <div className="calendar-weekdays">
        {WEEKDAYS.map((wd) => (
          <span key={wd} className="calendar-weekday">
            {wd}
          </span>
        ))}
      </div>
      <div className="calendar-grid">
        {grid.map((cell, i) => {
          if (!cell) {
            return <div key={`empty-${i}`} className="calendar-day calendar-day--empty" />;
          }
          const key = toDateKey(cell);
          const hasEntries = datesWithEntries.has(key);
          const isToday =
            key === toDateKey(new Date());
          return (
            <button
              key={key}
              type="button"
              className={`calendar-day ${hasEntries ? 'calendar-day--has-entries' : ''} ${isToday ? 'calendar-day--today' : ''}`}
              onClick={() => onSelectDay(cell)}
              aria-label={`${cell.getDate()}. ${MONTHS[month]} ${year}${hasEntries ? ', hat Einträge' : ''}`}
            >
              <span className="calendar-day-num">{cell.getDate()}</span>
              {hasEntries && <span className="calendar-day-dot" aria-hidden />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
