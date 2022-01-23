import React from 'react';

import { TxStatus } from 'types/transactionInterfaces';

import './Spinner.scss';

interface SpinnerProps {
  className?: string;
  status?: TxStatus;
}

export function Spinner({ className, status }: SpinnerProps) {
  return (
    <div className={`circle-loader ${status!.toLowerCase()} ${className || ''}`}>
      <div className="status draw" />
    </div>
  );
}
