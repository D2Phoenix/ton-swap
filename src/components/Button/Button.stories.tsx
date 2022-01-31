import SettingsIcon from '../Icons/SettingsIcon';
import SwapIcon from '../Icons/SwapIcon';
import { Button as ButtonElement } from './Button';
import './Button.scss';

const Template = (args: any) => (
  <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', width: 'auto', alignItems: 'self-start' }}>
    <ButtonElement
      variant={args.variant}
      size={'large'}
      icon={args.icon}
      iconPosition={args.iconPosition}
      disabled={args.disabled}
    >
      {args.showText && 'Large'}
    </ButtonElement>
    <ButtonElement
      variant={args.variant}
      size={'medium'}
      icon={args.icon}
      iconPosition={args.iconPosition}
      disabled={args.disabled}
    >
      {args.showText && 'Medium'}
    </ButtonElement>
    <ButtonElement
      variant={args.variant}
      size={'small'}
      icon={args.icon}
      iconPosition={args.iconPosition}
      disabled={args.disabled}
    >
      {args.showText && 'Small'}
    </ButtonElement>
  </div>
);

interface ThemeButtonProps {
  [key: string]: any;
}

//👇 Each story then reuses that template
export const Button: ThemeButtonProps = Template.bind({});
Button.args = {
  variant: 'primary',
  size: 'large',
  children: 'Primary',
  icon: 'Settings',
  iconPosition: 'start',
  disabled: false,
  showText: true,
};
Button.parameters = { controls: { exclude: ['size', 'children'] } };

export default {
  component: ButtonElement,
  title: 'components/Button',
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    disabled: {
      control: {
        type: 'boolean',
      },
    },
    icon: {
      options: ['None', 'Settings', 'Swap'],
      mapping: {
        None: null,
        Settings: <SettingsIcon />,
        Swap: <SwapIcon />,
      },
    },
    showText: {
      control: {
        type: 'boolean',
      },
    },
  },
};
