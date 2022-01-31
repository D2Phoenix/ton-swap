import React, { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import PoolItemInterface from 'types/poolItemInterface';

import CurrencyUtils from 'utils/currencyUtils';
import DateUtils from 'utils/dateUtils';

import Table, { TableColumn } from 'components/Table';

import { useAppSelector } from 'store/hooks';
import { selectPoolsTransactions } from 'store/pools/poolsSlice';

import './PoolTransactionsTable.scss';

function PoolTransactionsTable() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const transactions = useAppSelector(selectPoolsTransactions);

  const filteredTxs = useMemo(() => {
    return transactions.filter((tx) => !filter || tx.__typename === filter);
  }, [transactions, filter]);

  const handleFilter = useCallback((value) => {
    setFilter(value);
  }, []);

  const calcWalletAddress = useCallback((address: string) => {
    if (address) {
      return address.substring(0, 8) + '...' + address.substring(address.length - 6);
    }
    return '';
  }, []);

  return (
    <Table items={filteredTxs} defaultSort={'-timestamp'} emptyText={t('No transactions found')}>
      <TableColumn
        name={t('Name')}
        field={'name'}
        template={(tx: any) => {
          return (
            <div className="buttons__column">
              {tx.__typename === 'Swap' && (
                <a>
                  <Trans>
                    Swap {{ symbol0: tx.pool.token0.symbol }} for {{ symbol1: tx.pool.token1.symbol }}
                  </Trans>
                </a>
              )}
              {tx.__typename === 'Mint' && (
                <a>
                  <Trans>
                    Add {{ symbol0: tx.pool.token0.symbol }} and {{ symbol1: tx.pool.token1.symbol }}
                  </Trans>
                </a>
              )}
              {tx.__typename === 'Burn' && (
                <a>
                  <Trans>
                    Remove {{ symbol0: tx.pool.token0.symbol }} and {{ symbol1: tx.pool.token1.symbol }}
                  </Trans>
                </a>
              )}
            </div>
          );
        }}
        sortable={true}
        sortFormatter={(pool: PoolItemInterface) => `${pool.token0.symbol}/${pool.token1.symbol}`}
        flex={'1 1 auto'}
      ></TableColumn>
      <TableColumn
        name={t('Total Value')}
        field={'amountUSD'}
        formatter={CurrencyUtils.toUSDDisplay}
        sortable={true}
        flex={'0 1 100px'}
        position={'flex-end'}
      ></TableColumn>
      <TableColumn
        name={t('Token Amount')}
        field={'amount0'}
        template={(tx: any) => {
          return (
            <p>
              {CurrencyUtils.toDisplay(tx.amount0)} {tx.pool.token0.symbol}
            </p>
          );
        }}
        formatter={CurrencyUtils.toUSDDisplay}
        flex={'0 1 100px'}
        position={'flex-end'}
      ></TableColumn>
      <TableColumn
        name={t('Token Amount')}
        field={'amount1'}
        template={(tx: any) => {
          return (
            <p>
              {CurrencyUtils.toDisplay(tx.amount1)} {tx.pool.token1.symbol}
            </p>
          );
        }}
        flex={'0 1 100px'}
        position={'flex-end'}
      ></TableColumn>
      <TableColumn
        name={t('Account')}
        field={'account'}
        template={(tx: any) => {
          return <p>{calcWalletAddress(tx.owner || tx.origin)}</p>;
        }}
        flex={'0 1 130px'}
      ></TableColumn>
      <TableColumn
        name={t('Time')}
        field={'time'}
        template={(tx: any) => {
          return <p>{DateUtils.timeSince(new Date(tx.timestamp * 1000))}</p>;
        }}
        sortable={true}
        flex={'0 1 100px'}
        position={'flex-end'}
      ></TableColumn>
    </Table>
  );
}

export default PoolTransactionsTable;
