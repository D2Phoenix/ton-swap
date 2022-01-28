import React from 'react';

import SettingsIcon from '../Icons/SettingsIcon';
import SwapIcon from '../Icons/SwapIcon';
import { ListItem as ListItemElement } from './List';
import './List.scss';

const ListItemTemplate = (args: any) => {
  return (
    <div style={{ width: '400px' }}>
      <ListItemElement icon={args.icon} title={args.title} subtitle={args.subtitle} total={args.total} />
    </div>
  );
};

interface DefaultListProps {
  [key: string]: any;
}

export const ListItem: DefaultListProps = ListItemTemplate.bind({});
ListItem.args = {
  icon: 'Settings',
  title: 'Title',
  subtitle: 'Subtitle',
  total: '0',
};
ListItem.parameters = { controls: { exclude: ['height', 'itemCount'] } };
ListItem.argTypes = {
  icon: {
    options: ['None', 'Settings', 'Swap'],
    mapping: {
      None: null,
      Settings: <SettingsIcon />,
      Swap: <SwapIcon />,
    },
    control: {
      type: 'radio',
    },
  },
};

export default {
  component: ListItemElement,
  title: 'components/List',
  parameters: {
    layout: 'centered',
  },
};
