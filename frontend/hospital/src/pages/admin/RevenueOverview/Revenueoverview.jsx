import React from 'react';
import styles from './RevenueOverview.module.css';

import { useState,useRef } from "react"

/**
 * Expected shape of fetched data:
 *
 * data = [
 *   { day: 'Day 1', value: 4000 },
 *   { day: 'Day 2', value: 5000 },
 *   ...
 * ]
 *
 * Only `data` is required. Everything else (ring total, "this day"
 * revenue, y-axis scale) is derived from it, but can be overridden
 * with explicit props if your API already returns those numbers.
 *
 * `onDateChange(isoDateString)` fires whenever the user picks a new
 * date from the calendar badge — hook this up in your container to
 * refetch data for that date.
 */

const CHART_HEIGHT = 260;
const TARGET_TICKS = 6; // roughly how many gridline labels we want

function formatCompactCurrency(value) {
  if (value == null || Number.isNaN(value)) return '$0';
  const abs = Math.abs(value);
  if (abs < 1000) return `$${Math.round(value)}`;
  const k = value / 1000;
  const decimals = Math.abs(k) >= 100 ? 3 : 1;
  return `$${k.toFixed(decimals)}k`;
}

// Rounds a raw step size up to the nearest "nice" number (1, 2, 5, 10 x a
// power of 10) so axis labels always land on round values like 2000,
// 5000, 10000 — never 3333.3.
function niceStep(rawStep) {
  if (!rawStep || rawStep <= 0) return 1000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  let niceNormalized;
  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 5) niceNormalized = 5;
  else niceNormalized = 10;
  return niceNormalized * magnitude;
}

export default function RevenueOverview({
  data,
  date = new Date(),
  totalRevenue, // optional override (number). Falls back to sum(data)
  loading = false,
  error = null,
  ringProgress, // optional override 0-1. Falls back to a derived value
  onDateChange, // optional callback: (isoDateString) => void, e.g. "2026-07-14"
}) {
  const dateLabel =
    typeof date === 'string'
      ? date
      : `${new Date(date).getDate()} / ${new Date(date).getMonth() + 1} / ${new Date(date).getFullYear()}`;

  const hasData = Array.isArray(data) && data.length > 0;

  const rawMax = hasData ? Math.max(...data.map((d) => d.value)) : 12000;
  const step = niceStep(rawMax / TARGET_TICKS);
  // axis max is the smallest multiple of `step` that still covers rawMax
  const maxValue = Math.ceil(rawMax / step) * step;

  const yLabels = [];
  for (let value = 0; value <= maxValue; value += step) {
    yLabels.push(formatCompactCurrency(value));
  }

  const periodTotal = hasData
    ? data.reduce((sum, d) => sum + (d.value || 0), 0)
    : 0;

  const mostRecentValue = hasData ? data[data.length - 1].value : 0;

  let computedRingProgress = 0;
  if (hasData) {
    const dayMax = Math.max(...data.map((d) => d.value));
    if (dayMax > 0) {
      computedRingProgress = Math.min(periodTotal / (dayMax * data.length), 1);
    }
  }

  const resolvedRingProgress = ringProgress ?? computedRingProgress;
  const resolvedTotalRevenue = totalRevenue ?? periodTotal;

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - resolvedRingProgress);

  // Formatted "DD / MM / YYYY" version of whatever date the user picked.
  // Falls back to `dateLabel` (derived from the `date` prop) until the
  // user picks something.
    const [selectedDate, setSelectedDate] = useState("");
    const [displayDate, setDisplayDate] = useState("");
    const dateInputRef = useRef(null);

    const handleDateChange = (e) => {
        const value = e.target.value;

        setSelectedDate(value);

        if (!value) {
            setDisplayDate("");
            return;
        }

        const date = new Date(value);

        setDisplayDate(
            `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`
        );

        onDateChange?.(value);
    };

  return (
    <div className={styles.wrapper}>
      {/* Left: chart card */}
      <div className={styles.chartCard}>
        <h2 className={styles.title}>Revenue Overview</h2>

        {error ? (
          <div className={styles.stateMessage}>Couldn't load revenue data.</div>
        ) : loading ? (
          <div className={styles.stateMessage}>Loading…</div>
        ) : !hasData ? (
          <div className={styles.stateMessage}>No revenue data yet.</div>
        ) : (
          <div className={styles.chartArea}>
            <div className={styles.yAxis}>
              {yLabels.map((label, i) => (
                <span key={`${label}-${i}`} className={styles.yLabel}>
                  {label}
                </span>
              ))}
            </div>

            <div className={styles.bars}>
              {data.map(({ day, value }) => {
                const heightPx = Math.max(
                  (value / maxValue) * CHART_HEIGHT,
                  18
                );
                return (
                  <div key={day} className={styles.barColumn}>
                    <div
                      className={styles.bar}
                      style={{ height: `${heightPx}px` }}
                      title={formatCompactCurrency(value)}
                    />
                    <span className={styles.dayLabel}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right: date badge + stats panel */}
      <div className={styles.sideCol}>
        <div onClick={() => dateInputRef.current?.showPicker()}  className={styles.dateBadge}>
          <span className={styles.calendarIcon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="16" rx="3" stroke="#ffffff" strokeWidth="2" />
              <path d="M3 9H21" stroke="#ffffff" strokeWidth="2" />
              <path d="M8 3V6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 3V6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
           <span className={styles.dateText}>
                {displayDate || dateLabel}
            </span>

            <input
                ref={dateInputRef}
                type="date"
                className={styles.hiddenDate}
                value={selectedDate}
                onChange={handleDateChange}
            />
        </div>

        <div className={styles.statsPanel}>
          <p className={styles.statsLabel}>Last 10 days revenue</p>

          <div className={styles.ringWrap}>
            <svg width="112" height="112" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r={radius} fill="#ffffff" stroke="#cfccc3" strokeWidth="10" />
              <circle
                cx="56"
                cy="56"
                r={radius}
                fill="none"
                stroke="#1c1d21"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 56 56)"
              />
              <text x="56" y="61" textAnchor="middle" className={styles.ringValue}>
                {loading ? '…' : formatCompactCurrency(periodTotal)}
              </text>
            </svg>
          </div>

          <div className={styles.miniStat}>
            <p className={styles.miniLabel}>This day revenue:</p>
            <p className={styles.miniValue}>
              {loading ? '—' : formatCompactCurrency(mostRecentValue)}
            </p>
          </div>

          <div className={styles.miniStat}>
            <p className={styles.miniLabel}>Total revenue:</p>
            <p className={styles.miniValue}>
              {loading ? '—' : formatCompactCurrency(resolvedTotalRevenue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example usage with a real fetch, refetching whenever the date changes:
 *
 * function RevenueOverviewContainer() {
 *   const [selectedDate, setSelectedDate] = useState(null); // "YYYY-MM-DD"
 *   const [data, setData] = useState(null);
 *   const [totalRevenue, setTotalRevenue] = useState(null);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError] = useState(null);
 *
 *   useEffect(() => {
 *     let cancelled = false;
 *     setLoading(true);
 *
 *     const url = selectedDate
 *       ? `/api/revenue/last-10-days?date=${selectedDate}`
 *       : '/api/revenue/last-10-days';
 *
 *     fetch(url)
 *       .then((res) => {
 *         if (!res.ok) throw new Error('Request failed');
 *         return res.json();
 *       })
 *       .then((json) => {
 *         if (cancelled) return;
 *         setData(json.days.map((d) => ({ day: d.label, value: d.revenue })));
 *         setTotalRevenue(json.totalRevenue);
 *       })
 *       .catch((err) => !cancelled && setError(err.message))
 *       .finally(() => !cancelled && setLoading(false));
 *
 *     return () => { cancelled = true; };
 *   }, [selectedDate]); // <-- refetches every time the date input changes
 *
 *   return (
 *     <RevenueOverview
 *       data={data}
 *       totalRevenue={totalRevenue}
 *       loading={loading}
 *       error={error}
 *       onDateChange={setSelectedDate}
 *     />
 *   );
 * }
 */