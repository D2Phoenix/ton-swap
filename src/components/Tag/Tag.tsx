import { HTMLAttributes } from 'react';

import './Tag.scss';

interface TagProps {
  children: JSX.Element | string;
  selected: boolean;
}

export function Tag({ children, selected, ...props }: TagProps & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`tag tag--${selected ? 'active' : 'inactive'}`} {...props}>
      {children}
    </div>
  );
}
