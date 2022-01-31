import BigNumber from 'bignumber.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

import CurrencyUtils from 'utils/currencyUtils';
import DateUtils from 'utils/dateUtils';

import Button from 'components/Button';
import ChevronDownIcon from 'components/Icons/ChevronDownIcon';
import Tag from 'components/Tag';
import TokenIcon from 'components/TokenIcon';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { resetPoolDetails, selectPoolsChartData, selectPoolsPool } from 'store/pools/poolsSlice';
import { fetchPool } from 'store/pools/poolsThunks';

import Card from '../../components/Card';
import './PoolDetailsPage.scss';
import PoolTransactionsTable from './PoolTransactionsTable';

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <h6>{CurrencyUtils.toUSDDisplay(payload[0].value)}</h6>
        <span className="text-small">{DateUtils.toShortFormat(new Date(label * 1000))} (UTC)</span>
      </div>
    );
  }

  return null;
};

function PoolDetailsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { address } = useParams();
  const { t } = useTranslation();

  const [chart, setChart] = useState('volume');
  const pool = useAppSelector(selectPoolsPool);
  const chartData = useAppSelector(selectPoolsChartData);

  useEffect(() => {
    return () => {
      dispatch(resetPoolDetails());
    };
  }, [dispatch]);

  useEffect(() => {
    if (address) {
      dispatch(fetchPool(address));
    }
  }, [dispatch, address]);

  const fee24Display = useMemo(() => {
    if (chartData.length) {
      const previousDate = new Date(chartData[chartData.length - 1].date * 1000);
      previousDate.setDate(previousDate.getDate() - 1);
      const data24 = chartData.filter((data) => new Date(data.date * 1000) >= previousDate);
      const result = data24.reduce((result, data) => result.plus(new BigNumber(data.feesUSD)), new BigNumber('0'));
      return CurrencyUtils.toUSDDisplay(result.toString());
    }
    return '$0.00';
  }, [chartData]);

  const tvlChangeDisplay = useMemo(() => {
    if (pool) {
      return `${new BigNumber(pool.totalValueLockedChange).toFixed(2)}`;
    }
    return '0';
  }, [pool]);

  const volume24ChangeDisplay = useMemo(() => {
    if (pool) {
      return `${new BigNumber(pool.volume24Change).toFixed(2)}`;
    }
    return '0';
  }, [pool]);

  const tvlChangeDirection = useMemo(() => {
    return parseFloat(tvlChangeDisplay);
  }, [tvlChangeDisplay]);

  const volume24ChangeDirection = useMemo(() => {
    return parseFloat(volume24ChangeDisplay);
  }, [volume24ChangeDisplay]);

  const formatXAxis = useCallback((value) => {
    return DateUtils.toDayMonthFormat(new Date(value * 1000));
  }, []);

  return (
    <div className="pool-details">
      <div className="pool-details__header">
        <div className="pool-details__pair">
          <TokenIcon address={pool?.token0.id} name={pool?.token0.name} />
          <TokenIcon address={pool?.token1.id} name={pool?.token1.name} />
          <h5 className="text-semibold">
            {pool?.token0.symbol} / {pool?.token1.symbol}
          </h5>
        </div>
        <div className="pool-details__header-actions">
          <Button onClick={navigate.bind(null, `/pool/add/${pool?.token0.id}/${pool?.token1.id}`)}>
            {t('Add Liquidity')}
          </Button>
          <Button onClick={navigate.bind(null, `/swap/${pool?.token0.id}/${pool?.token1.id}`)}>{t('Swap')}</Button>
        </div>
      </div>
      <div className="pool-details__content">
        <div className="pool__info">
          <Card>
            <p className="title-1">{t('Tokens Locked')}</p>
            <p className="sub-title-1">
              {CurrencyUtils.toDisplay(pool?.totalValueLockedToken0)} {pool?.token0.symbol}
            </p>
            <p className="sub-title-1">
              {CurrencyUtils.toDisplay(pool?.totalValueLockedToken1)} {pool?.token1.symbol}
            </p>
          </Card>
          <Card>
            <p className="title-1">{t('TVL')}</p>
            <p className="sub-title-1">{CurrencyUtils.toUSDDisplay(pool?.totalValueLockedUSD)}</p>
            {tvlChangeDirection !== 0 && (
              <p className={tvlChangeDirection > 0 ? 'sub-title-1 positive' : 'sub-title-1 negative'}>
                <ChevronDownIcon revert={tvlChangeDirection > 0} />
                {tvlChangeDisplay}%
              </p>
            )}
          </Card>
          <Card>
            <p className="title-1">{t('Volume 24h')}</p>
            <p className="sub-title-1">{CurrencyUtils.toUSDDisplay(pool?.volume24USD)}</p>
            {volume24ChangeDirection !== 0 && (
              <p className={volume24ChangeDirection > 0 ? 'sub-title-1 positive' : 'sub-title-1 negative'}>
                <ChevronDownIcon revert={volume24ChangeDirection > 0} />
                {volume24ChangeDisplay}%
              </p>
            )}
          </Card>
          <Card>
            <p className="title-1">{t('24h Fees')}</p>
            <p className="sub-title-1">{fee24Display}</p>
          </Card>
        </div>
        <div className="pool-charts">
          <div className="pool-charts__tags">
            <Tag selected={chart === 'volume'} onClick={setChart.bind(null, 'volume')}>
              {t('Volume')}
            </Tag>
            <Tag selected={chart === 'tvl'} onClick={setChart.bind(null, 'tvl')}>
              {t('TVL')}
            </Tag>
            <Tag selected={chart === 'fees'} onClick={setChart.bind(null, 'fees')}>
              {t('Fees')}
            </Tag>
          </div>
          {chart === 'volume' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <Bar dataKey="volumeUSD" fill="var(--primary-color)" />
                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ stroke: 'currentColor' }} />
                <Tooltip
                  content={<ChartTooltip />}
                  position={{ x: 0, y: 0 }}
                  cursor={{ fill: 'var(--primary-hover-color)', opacity: '0.08' }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
          {chart === 'tvl' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTvlUSD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.6} />
                    <stop offset="90%" stopColor="var(--primary-color)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="tvlUSD"
                  stroke="var(--primary-color)"
                  strokeWidth={1}
                  fillOpacity={1}
                  fill="url(#colorTvlUSD)"
                />
                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ stroke: 'currentColor' }} />
                <Tooltip
                  content={<ChartTooltip />}
                  position={{ x: 0, y: 0 }}
                  cursor={{ fill: 'var(--primary-hover-color)', opacity: '0.08' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {chart === 'fees' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <Bar dataKey="feesUSD" fill="var(--primary-color)" />
                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ stroke: 'currentColor' }} />
                <Tooltip
                  content={<ChartTooltip />}
                  position={{ x: 0, y: 0 }}
                  cursor={{ fill: 'var(--primary-hover-color)', opacity: '0.08' }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <h5 className="text-semibold">{t('Transactions')}</h5>
      <PoolTransactionsTable />
    </div>
  );
}

export default PoolDetailsPage;
