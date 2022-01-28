import * as React from 'react';
import { CSSProperties, HTMLProps } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import BoxDeleteIcon from '../Icons/BoxDeleteIcon';
import './List.scss';

interface ListItemProps {
  icon?: JSX.Element;
  title: string;
  subtitle?: string;
  total?: string;
}

export function ListItem({ style, icon, title, subtitle, total, ...props }: ListItemProps & HTMLProps<HTMLDivElement>) {
  return (
    <div className="list__item-wrapper" style={style} {...props}>
      <div className="list__item">
        {!!icon && icon}
        <div className="list__title">
          <div className="title-2 text-ellipsis">{title}</div>
          {!!subtitle && <label className="small text-ellipsis">{subtitle}</label>}
        </div>
        {!!total && <p className="list__total">{total}</p>}
      </div>
    </div>
  );
}

interface ListProps {
  children: (index: number, style: CSSProperties) => JSX.Element;
  height?: number;
  itemCount: number;
  emptyText?: string;
}

export function List({ children, height, itemCount, emptyText }: ListProps & HTMLProps<HTMLDivElement>) {
  return (
    <div className="list" style={{ height: height + 'px' }}>
      <AutoSizer defaultHeight={height}>
        {({ width, height }: { width: number; height: number }) => {
          if (itemCount === 0) {
            return (
              <div className="list__content list__content--empty" style={{ width, height }}>
                <div>
                  <BoxDeleteIcon />
                  <p>{emptyText}</p>
                </div>
              </div>
            );
          }
          return (
            <FixedSizeList className="list__content" height={height} width={width} itemCount={itemCount} itemSize={74}>
              {({ index, style }: { index: number; style: CSSProperties }) => {
                const newStyle = Object.assign({}, style, { width: 'calc(100% - 6px)' });
                return children(index, newStyle);
              }}
            </FixedSizeList>
          );
        }}
      </AutoSizer>
    </div>
  );
}
