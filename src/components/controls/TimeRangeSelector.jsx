import React from 'react';

export const TimeRangeSelector = ({ selectedRange, onRangeChange }) => {
  return (
    <div className="bg-white p-2 rounded-lg shadow-lg">
      <select
        value={selectedRange}
        onChange={(e) => onRangeChange(e.target.value)}
        className="bg-white border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="1h">Last 1 hour</option>
        <option value="3h">Last 3 hours</option>
        <option value="6h">Last 6 hours</option>
        <option value="12h">Last 12 hours</option>
        <option value="24h">Last 24 hours</option>
      </select>
    </div>
  );
};