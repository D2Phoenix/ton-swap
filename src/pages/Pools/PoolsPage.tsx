import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PoolItemInterface from 'types/poolItemInterface';

import CurrencyUtils from 'utils/currencyUtils';

import Input from 'components/Input';
import Table from 'components/Table';
import { TableColumn } from 'components/Table/Table';
import TokenIcon from 'components/TokenIcon';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectPoolsList } from 'store/pools/poolsSlice';
import { fetchPools } from 'store/pools/poolsThunks';

import Button from '../../components/Button';
import './PoolsPage.scss';

function PoolsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [query, setQuery] = useState('');
  const pools = useAppSelector(selectPoolsList);

  useEffect(() => {
    dispatch(fetchPools());
  }, [dispatch]);

  const filteredPools = useMemo(() => {
    return pools.filter((pool) =>
      `${pool.token0.symbol}/${pool.token1.symbol}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [pools, query]);

  const handleSelectPools = useCallback(
    (pool: PoolItemInterface) => {
      navigate(pool.id);
    },
    [navigate],
  );

  const handleQuery = useCallback((event) => {
    setQuery(event.target.value);
  }, []);

  return (
    <div className="pools-wrapper">
      <div className="pools-header-wrapper">
        <div className="pools-header">
          <h5>{t('Pools')}</h5>
        </div>
        <Button onClick={navigate.bind(null, '/pool/add')}>{t('Create a Pair')}</Button>
      </div>
      <Input inputSize={'small'} placeholder={t('Search Pool')} value={query} onChange={handleQuery} />
      <Table
        items={filteredPools}
        defaultSort={'-totalValueLockedUSD'}
        onRowSelect={handleSelectPools}
        emptyText={t('No pools found')}
      >
        <TableColumn
          name={t('#')}
          field={'position'}
          template={(pool: PoolItemInterface, index: number) => {
            return <p>{index}</p>;
          }}
          sortable={true}
          flex={'0 1 30px'}
        ></TableColumn>
        <TableColumn
          name={t('Name')}
          field={'name'}
          template={(pool: PoolItemInterface) => {
            return (
              <div className="pool-name">
                <TokenIcon address={pool.token0.id} name={pool.token0.name} />
                <TokenIcon address={pool.token1.id} name={pool.token1.name} />
                <p>{`${pool.token0.symbol}/${pool.token1.symbol}`}</p>
              </div>
            );
          }}
          sortable={true}
          sortFormatter={(pool: PoolItemInterface) => `${pool.token0.symbol}/${pool.token1.symbol}`}
          flex={'1 1 auto'}
        ></TableColumn>
        <TableColumn
          name={t('TVL')}
          field={'totalValueLockedUSD'}
          formatter={CurrencyUtils.toUSDDisplay}
          sortable={true}
          flex={'0 1 110px'}
          position={'flex-end'}
        ></TableColumn>
        <TableColumn
          name={t('Volume 24h')}
          field={'volume24USD'}
          formatter={CurrencyUtils.toUSDDisplay}
          sortable={true}
          flex={'0 1 110px'}
          position={'flex-end'}
        ></TableColumn>
        <TableColumn
          name={t('Volume 7d')}
          field={'volume7dUSD'}
          formatter={CurrencyUtils.toUSDDisplay}
          sortable={true}
          flex={'0 1 110px'}
          position={'flex-end'}
        ></TableColumn>
      </Table>
    </div>
  );
}

export default PoolsPage;
