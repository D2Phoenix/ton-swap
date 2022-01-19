import React, { MouseEventHandler } from 'react';

import './Button.scss';

interface ButtonProps {
  className?: string;
  type: 'primary' | 'secondary' | 'outline' | 'icon' | 'default';
  disabled?: boolean;
  alt?: string;
  icon?: JSX.Element;
  onClick?: MouseEventHandler;
  children?: any;
}

function Button({ className, type = 'default', disabled, alt, icon, onClick, children }: ButtonProps) {
  return (
    <button className={`btn btn-${type} ${className || ''}`} title={alt} disabled={disabled} onClick={onClick}>
      {!!icon && icon}
      {!!children && children}
    </button>
  );
}

export default Button;
