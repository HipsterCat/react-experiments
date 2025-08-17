import React from 'react';

export const DownIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <path 
      d="M5 7L10 12L15 7" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);
