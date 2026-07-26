import React, { useEffect, useState } from 'react';
import RevenueOverview from './RevenueOverview';

// 👇 EDIT THIS: your actual API endpoint
const API_URL = '/api/revenue/last-10-days';

export default function RevenueOverviewContainer() {
  const [data, setData] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRevenue() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json = await res.json();

        if (cancelled) return;

        // 👇 EDIT THIS: map your API's actual response shape to
        // { day: string, value: number }[]. Whatever your JSON
        // looks like, this is the only line that needs to change.
        const days = json.days.map((d) => ({
          day: d.label,
          value: d.revenue,
        }));

        setData(days);
        setTotalRevenue(json.totalRevenue ?? null);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRevenue();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <RevenueOverview
      data={data}
      totalRevenue={totalRevenue}
      loading={loading}
      error={error}
    />
  );
}