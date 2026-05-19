import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface Props {
  confidence: number; // 0-100
  size?: number;
}

const ConfidenceScore: React.FC<Props> = ({ confidence, size = 100 }) => {
  const getColor = (value: number): string => {
    if (value >= 80) return '#13b13f'; // High confidence - green
    if (value >= 60) return '#fbbf24'; // Medium confidence - amber
    return '#ef4444'; // Low confidence - red
  };

  return (
    <div style={{ width: size, height: size }}>
      <CircularProgressbar
        value={confidence}
        text={`${confidence}%`}
        styles={buildStyles({
          rotation: 0.25,
          strokeLinecap: 'round',
          textSize: '16px',
          pathTransitionDuration: 0.5,
          pathColor: getColor(confidence),
          textColor: getColor(confidence),
          trailColor: '#374151',
          backgroundColor: '#1f2937',
        })}
      />
    </div>
  );
};

export default ConfidenceScore;
