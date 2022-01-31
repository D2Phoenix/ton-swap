import React, { HTMLProps, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';

import Button from 'components/Button';
import BoxDeleteIcon from 'components/Icons/BoxDeleteIcon';
import ChevronDownIcon from 'components/Icons/ChevronDownIcon';
import ChevronRightIcon from 'components/Icons/ChevronRightIcon';

import './Table.scss';

interface TableColumnProps<T> {
  name: string;
  field: string;
  formatter?: (value: any) => JSX.Element | string;
  template?: (row: T, index: number) => JSX.Element;
  sortable?: boolean;
  sortValue?: string;
  sortFormatter?: (value: T) => string;
  flex?: string;
  position?: string;
  onSort?: (key: string, value: string) => void;
}

export function TableColumn<T>({
  name,
  field,
  sortable = false,
  sortValue = '',
  flex = 'auto',
  position = 'start',
  onSort,
}: TableColumnProps<T> & HTMLProps<HTMLDivElement>) {
  const sortHandler = useCallback(() => {
    sortable && onSort && onSort(field, sortValue.startsWith(field) ? `-${field}` : field);
  }, [field, sortable, sortValue, onSort]);
  const classList = [
    'table__column',
    `table__column-${field.toLowerCase()}`,
    sortable ? 'table__column--sortable' : '',
  ];

  return (
    <div className={classList.join(' ')} style={{ flex, justifyContent: position }} onClick={sortHandler}>
      <p>{name}</p>
      {sortable && sortValue?.includes(field) && <ChevronDownIcon revert={!sortValue.startsWith('-')} />}
    </div>
  );
}

interface TableProps<T> {
  children: JSX.Element[];
  items: T[];
  defaultSort?: string;
  itemsPerPage?: number;
  emptyText?: string;
  onRowSelect?: (row: T) => void;
}

export function Table<T>({
  children = [],
  items,
  defaultSort = '',
  itemsPerPage = 10,
  onRowSelect,
  emptyText,
}: TableProps<T> & HTMLProps<HTMLDivElement>) {
  const [sort, setSort] = useState(defaultSort);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [items]);

  const columns = useMemo((): TableColumnProps<T>[] => {
    return children.map((child: JSX.Element) => {
      return {
        ...child.props,
      };
    });
  }, [children]);

  const visibleItems: T[] = useMemo(() => {
    const sortKey: string = sort.startsWith('-') ? sort.split('-')[1] : sort;
    const sortDirection = sort.startsWith('-') ? -1 : 1;
    const result = [...items].sort((a: any, b: any) => {
      const column = columns.find((column) => column.field === sortKey);
      const aValue =
        column && column.sortFormatter
          ? column.sortFormatter(a)
          : typeof a === 'string'
          ? a[sortKey as any]
          : parseFloat(a[sortKey]);
      const bValue =
        column && column.sortFormatter
          ? column.sortFormatter(b)
          : typeof b === 'string'
          ? b[sortKey as any]
          : parseFloat(b[sortKey]);
      if (aValue > bValue) {
        return 1 * sortDirection;
      }
      if (bValue > aValue) {
        return -1 * sortDirection;
      }
      return 0;
    });
    return result.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [items, sort, page]);

  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage);
  }, [items, itemsPerPage]);

  const sortHandler = useCallback((value: string) => {
    setSort((prev) => (prev.startsWith(value) ? `-${value}` : value));
  }, []);

  const pageChangeHandler = useCallback((value: number) => {
    setPage((prev) => prev + value);
  }, []);

  const selectHandler = useCallback(
    (item) => {
      onRowSelect && onRowSelect(item);
    },
    [onRowSelect],
  );

  return (
    <div className="table">
      <div className="table__header">
        {columns.map((column) => {
          return <TableColumn key={column.field} sortValue={sort} onSort={sortHandler} {...column} />;
        })}
      </div>
      <div className="table__content">
        {visibleItems.length === 0 && (
          <div className="table__content--empty">
            <BoxDeleteIcon />
            <p>{emptyText}</p>
          </div>
        )}
        {visibleItems.map((item: any, index) => {
          return (
            <div key={index} className={'table__row'} onClick={selectHandler.bind(null, item)}>
              {columns.map((column) => {
                return (
                  <div
                    key={column.field}
                    className={`table__cell table__column-${column.field.toLowerCase()}`}
                    style={{ flex: column.flex, justifyContent: column.position }}
                  >
                    {column.template ? (
                      column.template(item, (page - 1) * itemsPerPage + index + 1)
                    ) : (
                      <p>{column.formatter ? column.formatter(item[column.field]) : item[column.field]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="table__pagination">
        <Button
          variant={'default'}
          icon={<ChevronRightIcon revert={true} />}
          disabled={page - 1 === 0}
          onClick={pageChangeHandler.bind(null, -1)}
        />
        <p>
          <Trans>
            Page {{ page: totalPages === 0 ? 0 : page }} of {{ total: totalPages }}
          </Trans>
        </p>
        <Button
          variant={'default'}
          icon={<ChevronRightIcon />}
          disabled={page >= totalPages}
          onClick={pageChangeHandler.bind(null, 1)}
        />
      </div>
    </div>
  );
}
