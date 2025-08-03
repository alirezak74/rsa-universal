import React, { useState } from 'react';

const ChartTimeFrameControls = ({ onTimeFrameChange, currentTimeFrame = '1h' }) => {
  const timeFrames = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1d' }
  ];

  const [selectedTimeFrame, setSelectedTimeFrame] = useState(currentTimeFrame);

  const handleTimeFrameChange = (timeFrame) => {
    setSelectedTimeFrame(timeFrame);
    if (onTimeFrameChange) {
      onTimeFrameChange(timeFrame);
    }
  };

  return (
    <div className="flex bg-gray-100 rounded-lg p-1 space-x-1">
      {timeFrames.map((tf) => (
        <button
          key={tf.value}
          onClick={() => handleTimeFrameChange(tf.value)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            selectedTimeFrame === tf.value
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
};

export default ChartTimeFrameControls;