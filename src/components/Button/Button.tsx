import React, { ButtonHTMLAttributes } from 'react';

import './Button.scss';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'default';
  size?: 'large' | 'medium' | 'small';
  icon?: JSX.Element;
  iconPosition?: 'start' | 'end';
}

export function Button({
  variant = 'primary',
  size = 'large',
  icon,
  iconPosition = 'start',
  children,
  className,
  ...props
}: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const calcClassName = ['btn', `btn--${variant}`, `btn--${size}`];
  if (!!icon) {
    calcClassName.push('btn-icon--' + iconPosition);
  }
  if (className) {
    calcClassName.push(className);
  }
  return (
    <button className={calcClassName.join(' ')} {...props}>
      {!!icon && iconPosition === 'start' && icon}
      {!!children && <span>{children}</span>}
      {!!icon && iconPosition === 'end' && icon}
    </button>
  );
}
