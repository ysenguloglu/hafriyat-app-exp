import React from "react";

export type DateRange = { start_date: string; end_date: string };

function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(d: Date): Date {
  // Pazartesi başlangıç (TR kullanımı için)
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = (day === 0 ? -6 : 1 - day);
  const x = new Date(d);
  x.setDate(d.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfWeek(d: Date): Date {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  return e;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function DateRangeBar({
  value,
  onChange
}: {
  value: DateRange;
  onChange: (v: DateRange) => void;
}) {
  const now = new Date();
  const setToday = () => {
    const t = toIsoDate(now);
    onChange({ start_date: t, end_date: t });
  };
  const setThisWeek = () => onChange({ start_date: toIsoDate(startOfWeek(now)), end_date: toIsoDate(endOfWeek(now)) });
  const setThisMonth = () => onChange({ start_date: toIsoDate(startOfMonth(now)), end_date: toIsoDate(endOfMonth(now)) });

  return (
    <div className="card card-pad">
      <div className="row row-wrap" style={{ marginBottom: 8 }}>
        <button className="btn" type="button" onClick={setToday}>
          Bugün
        </button>
        <button className="btn" type="button" onClick={setThisWeek}>
          Bu hafta
        </button>
        <button className="btn" type="button" onClick={setThisMonth}>
          Bu ay
        </button>
      </div>
      <div className="row row-wrap">
        <div style={{ flex: 1, minWidth: 160 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
            Başlangıç
          </div>
          <input
            className="input"
            type="date"
            value={value.start_date}
            onChange={(e) => onChange({ ...value, start_date: e.target.value })}
          />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
            Bitiş
          </div>
          <input
            className="input"
            type="date"
            value={value.end_date}
            onChange={(e) => onChange({ ...value, end_date: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

