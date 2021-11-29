import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import BigNumber from 'bignumber.js';

import './PoolDetailsPage.scss';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { fetchPool } from 'store/pools/poolsThunks';
import { resetPoolDetails, selectPoolsChartData, selectPoolsPool } from 'store/pools/poolsSlice';
import TokenIcon from 'components/TokenIcon';
import CurrencyUtils from 'utils/currencyUtils';
import ChevronDownIcon from 'components/icons/ChevronDownIcon';
import DateUtils from 'utils/dateUtils';
import PoolTransactionsTable from './PoolTransactionsTable';
import Spinner from '../../components/Spinner';


const ChartTooltip = ({active, payload, label}: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <h3>{CurrencyUtils.toUSDDisplay(payload[0].value)}</h3>
                <span className="text-small">{DateUtils.toShortFormat(new Date(label * 1000))} (UTC)</span>
            </div>
        );
    }

    return null;
};

function PoolDetailsPage() {
    const dispatch = useAppDispatch();
    const params = useParams();
    const {t} = useTranslation();

    const [chart, setChart] = useState('volume');
    const pool = useAppSelector(selectPoolsPool);
    const chartData = useAppSelector(selectPoolsChartData);

    useEffect(() => {
        return () => {
            dispatch(resetPoolDetails());
        }
    }, [dispatch]);

    useEffect(() => {
        if (params.address) {
            dispatch(fetchPool(params.address));
        }
    }, [dispatch, params]);

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
    }, [])

    if (!pool) {
        return (
            <div className="lazy-loader">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="pool-details-wrapper">
            <span className="breadcrumbs">
                            <span>{'< '}</span>
                            <Link to="/pools">{t('Back')}</Link>
                        </span>
            <div className="pool-pair-wrapper">
                <div className="pool-pair">
                    <TokenIcon address={pool.token0.id} name={pool.token0.name}/>
                    <TokenIcon address={pool.token1.id} name={pool.token1.name}/>
                    <span className="text-semibold">{pool.token0.symbol} / {pool.token1.symbol}</span>
                </div>
                <div className="pool-actions">
                    <Link to={`/pool/add/${pool.token0.id}/${pool.token1.id}`} className="btn btn-primary">
                        {t('Add Liquidity')}
                    </Link>
                    <Link to={`/swap/${pool.token0.id}/${pool.token1.id}`} className="btn btn-primary">
                        {t('Swap')}
                    </Link>
                </div>
            </div>
            <div className="pool-details">
                <div className="pool-info">
                    <span>{t('Total Tokens Locked')}</span>
                    <div className="pool-info__section">
                        <div>
                            <TokenIcon address={pool.token0.id} name={pool.token0.name}/>
                            <span>{pool.token0.symbol}</span>
                            <span className="align-right text-semibold">{CurrencyUtils.toDisplay(pool.totalValueLockedToken0)}</span>
                        </div>
                        <div>
                            <TokenIcon address={pool.token1.id} name={pool.token1.name}/>
                            <span>{pool.token1.symbol}</span>
                            <span className="align-right text-semibold">{CurrencyUtils.toDisplay(pool.totalValueLockedToken1)}</span>
                        </div>
                    </div>
                    <span>{t('TVL')}</span>
                    <div className="pool-info__section">
                        <h3>{CurrencyUtils.toUSDDisplay(pool.totalValueLockedUSD)}</h3>
                        {
                            tvlChangeDirection !== 0 && <h4 className={tvlChangeDirection > 0 ? 'positive': 'negative'}>
                              <ChevronDownIcon revert={tvlChangeDirection > 0}/>
                                {tvlChangeDisplay}%
                            </h4>
                        }
                    </div>
                    <span>{t('Volume 24h')}</span>
                    <div className="pool-info__section">
                        <h3>{CurrencyUtils.toUSDDisplay(pool.volume24USD)}</h3>
                        {
                            volume24ChangeDirection !== 0 && <h4 className={volume24ChangeDirection > 0 ? 'positive': 'negative'}>
                              <ChevronDownIcon revert={volume24ChangeDirection > 0}/>
                                {volume24ChangeDisplay}%
                            </h4>
                        }
                    </div>
                    <span>{t('24h Fees')}</span>
                    <div className="pool-info__section">
                        <h3>{fee24Display}</h3>
                    </div>
                </div>
                <div className="pool-charts">
                    <div className="charts-select-wrapper">
                        <button className={`btn btn-outline mini ${chart === 'volume' ? 'active' : ''}`}
                                onClick={setChart.bind(null, 'volume')}>
                            {t('Volume')}
                        </button>
                        <button className={`btn btn-outline mini ${chart === 'tvl' ? 'active' : ''}`}
                                onClick={setChart.bind(null, 'tvl')}>
                            {t('TVL')}
                        </button>
                        <button className={`btn btn-outline mini ${chart === 'fees' ? 'active' : ''}`}
                                onClick={setChart.bind(null, 'fees')}>
                            {t('Fees')}
                        </button>
                    </div>
                    {
                        chart === 'volume' &&  <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <Bar dataKey="volumeUSD" fill="#0088CC" />
                            <XAxis dataKey="date"
                                   tickFormatter={formatXAxis}
                                   tick={{stroke: '#303757', fontSize: '13'}}
                            />
                            <Tooltip content={<ChartTooltip />}
                                     position={{ x: 0, y: 0 }}
                                     cursor={{ fill: 'rgba(48, 55, 87, 0.08)' }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                    }
                    {
                        chart === 'tvl' &&  <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorTvlUSD" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0088CC" stopOpacity={0.6}/>
                                <stop offset="90%" stopColor="#0088CC" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone"
                                  dataKey="tvlUSD"
                                  stroke="#0088CC"
                                  strokeWidth={1}
                                  fillOpacity={1}
                                  fill="url(#colorTvlUSD)" />
                            <XAxis dataKey="date"
                                   tickFormatter={formatXAxis}
                                   tick={{stroke: '#303757', fontSize: '13'}}
                            />
                            <Tooltip content={<ChartTooltip />}
                                     position={{ x: 0, y: 0 }}
                                     cursor={{ fill: 'rgba(48, 55, 87, 0.08)' }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                    }
                    {
                        chart === 'fees' &&  <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <Bar dataKey="feesUSD" fill="#0088CC" />
                            <XAxis dataKey="date"
                                   tickFormatter={formatXAxis}
                                   tick={{stroke: '#303757', fontSize: '13'}}
                            />
                            <Tooltip content={<ChartTooltip />}
                                     position={{ x: 0, y: 0 }}
                                     cursor={{ fill: 'rgba(48, 55, 87, 0.08)' }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                    }
                </div>
            </div>
            <h3 className="text-semibold">{t('Transactions')}</h3>
            <PoolTransactionsTable />
        </div>
    )
}

export default PoolDetailsPage;
