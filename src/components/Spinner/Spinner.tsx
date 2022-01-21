import React from 'react';

import './Spinner.scss';

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <div className={`lds-dual-ring ${className || ''}`}>
      <div />
      <div />
    </div>
  );
}
