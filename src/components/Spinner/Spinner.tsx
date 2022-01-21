import './Spinner.scss';
import React from 'react';

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
