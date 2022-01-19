import React, { MouseEventHandler } from 'react';

import './Button.scss';

interface ButtonProps {
  className?: string;
  type: 'primary' | 'secondary' | 'outline' | 'icon';
  disabled?: boolean;
  alt?: string;
  icon?: JSX.Element;
  onClick?: MouseEventHandler;
  children?: any;
}

function Button({ className, type, disabled, alt, icon, onClick, children }: ButtonProps) {
  return (
    <button className={`btn btn-${type} ${className || ''}`} title={alt} disabled={disabled} onClick={onClick}>
      {!!icon && icon}
      {!!children && children}
    </button>
  );
}

export default Button;
