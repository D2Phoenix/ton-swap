import { HTMLProps } from 'react';

import './Card.scss';

export function Card({ children, ...props }: HTMLProps<HTMLDivElement>) {
  return (
    <div className="card" {...props}>
      {children}
    </div>
  );
}
