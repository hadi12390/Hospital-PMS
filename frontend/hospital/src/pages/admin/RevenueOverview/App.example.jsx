import React from 'react';
import RevenueOverview from './RevenueOverview';

// Placeholder data — replace this array with whatever your API
// returns once it exists. The shape RevenueOverview expects is:
// { day: string, value: number }[]
const mockData = [
  { day: 'Day 1', value: 4000 },
  { day: 'Day 2', value: 5000 },
  { day: 'Day 3', value: 3500 },
  { day: 'Day 4', value: 8000 },
  { day: 'Day 5', value: 1500 },
  { day: 'Day 6', value: 10500 },
  { day: 'Day 7', value: 5000 },
  { day: 'Day 8', value: 7000 },
  { day: 'Day 9', value: 9500 },
  { day: 'Day 10', value: 12000 },
];

export default function App() {
  return (
    <div style={{ padding: '24px' }}>
      <RevenueOverview data={mockData} />
    </div>
  );
}