import React from 'react';

import SettingsIcon from '../Icons/SettingsIcon';
import SwapIcon from '../Icons/SwapIcon';
import { Input as InputElement } from './Input';
import './Input.scss';

const InputTemplate = (args: any) => {
  return (
    <div style={{ width: '400px' }}>
      <InputElement
        inputSize={args.inputSize}
        inputType={args.inputType}
        inputState={args.inputState}
        helpText={args.helpText}
        placeholder={args.placeholder}
      />
    </div>
  );
};

interface DefaultListProps {
  [key: string]: any;
}

//👇 Each story then reuses that template
export const Input: DefaultListProps = InputTemplate.bind({});
Input.args = {
  inputSize: 'large',
  inputType: 'text',
  inputState: 'default',
  helpText: 'Help text',
  placeholder: 'Enter text',
};
Input.argTypes = {
  inputType: {
    options: ['text', 'number'],
    mapping: {
      text: 'text',
      number: 'number',
    },
  },
};

export default {
  component: InputElement,
  title: 'components/Input',
  parameters: {
    layout: 'centered',
  },
};
