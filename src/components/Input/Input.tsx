import { HTMLInputTypeAttribute, HTMLProps } from 'react';

import ErrorIcon from '../Icons/ErrorIcon';
import SuccessIcon from '../Icons/SuccessIcon';
import WarningIcon from '../Icons/WarningIcon';
import './Input.scss';

interface InputProps {
  inputSize?: 'small' | 'large';
  inputType?: HTMLInputTypeAttribute;
  inputState?: 'default' | 'success' | 'warning' | 'error';
  helpText?: string;
}

export function Input({
  inputSize = 'large',
  inputType = 'text',
  inputState = 'default',
  helpText,
  ...props
}: InputProps & HTMLProps<HTMLInputElement>) {
  return (
    <div className={`input input--type-${inputType} input--size-${inputSize} input--state-${inputState}`}>
      <input {...props} />
      {inputState === 'error' && <ErrorIcon />}
      {inputState === 'warning' && <WarningIcon />}
      {inputState === 'success' && <SuccessIcon />}
      {!!helpText && <label className="input__help small">{helpText}</label>}
    </div>
  );
}
