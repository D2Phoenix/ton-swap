import React, { CSSProperties } from 'react';

import SettingsIcon from '../Icons/SettingsIcon';
import { List as ListElement, ListItem as ListItemElement } from './List';
import './List.scss';

const ListTemplate = (args: any) => {
  const result: any = [];
  for (let i = 0; i < args.itemCount; i++) {
    result.push({ title: 'Title', subtitle: 'Subtitle', total: '0', icon: <SettingsIcon /> });
  }
  return (
    <div style={{ width: '400px' }}>
      <ListElement height={args.height} itemCount={args.itemCount} emptyText={args.emptyText}>
        {(index: number, style: CSSProperties) => {
          const item = result[index];
          return (
            <ListItemElement
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              total={item.total}
              style={style}
            />
          );
        }}
      </ListElement>
    </div>
  );
};

interface DefaultListProps {
  [key: string]: any;
}

//👇 Each story then reuses that template
export const List: DefaultListProps = ListTemplate.bind({});
List.args = {
  height: 300,
  itemCount: 10,
  emptyText: 'No items found',
};

export default {
  component: ListElement,
  title: 'components/List',
  parameters: {
    layout: 'centered',
  },
};
