import { useCallback, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import './PoolDetails.scss';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { fetchPool } from 'store/pools/pools.thunks';
import { selectPoolsChartData, selectPoolsPool, selectPoolsTransactions } from 'store/pools/pools.slice';
import TokenIcon from '../../components/TokenIcon';
import CurrencyUtils from '../../utils/currencyUtils';
import BigNumber from 'bignumber.js';
import ChevronDownIcon from '../../components/icons/ChevronDownIcon';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DateUtils from '../../utils/dateUtils';


const TvlChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <h3>{CurrencyUtils.toUSDDisplay(payload[0].value)}</h3>
                <span>{DateUtils.toShortFormat(new Date(label * 1000))}</span>
            </div>
        );
    }

    return null;
};

function PoolDetails() {
    const dispatch = useAppDispatch();
    const params = useParams();
    const pool = useAppSelector(selectPoolsPool);
    const chartData = useAppSelector(selectPoolsChartData);
    const transactions = useAppSelector(selectPoolsTransactions);

    useEffect(() => {
        if (params.address) {
            dispatch(fetchPool(params.address));
        }
    }, [dispatch, params])

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

    return (
        <div className="pool-details-wrapper">
            {
                pool && (
                    <>
                        <span className="breadcrumbs">
                            <span>{'< '}</span>
                            <Link to="/pools">Back</Link>
                        </span>
                        <span className="pool-pair">
                            <TokenIcon address={pool.token0.id} name={pool.token0.name}/>
                            <TokenIcon address={pool.token1.id} name={pool.token1.name}/>
                            <span className="text-semibold">{pool.token0.symbol} / {pool.token1.symbol}</span>
                            <div className="pool-actions">
                                <Link to="/pool/add" className="btn btn-primary">
                                   Add Liquidity
                                </Link>
                                <Link to="/swap" className="btn btn-primary">
                                   Swap
                                </Link>
                            </div>
                        </span>
                        <div className="pool-details">
                            <div className="pool-info">
                                <span>Total Tokens Locked</span>
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
                                <span>TVL</span>
                                <div className="pool-info__section">
                                    <h3>{CurrencyUtils.toUSDDisplay(pool.totalValueLockedUSD)}</h3>
                                    {
                                        tvlChangeDirection !== 0 && <h4 className={tvlChangeDirection > 0 ? 'positive': 'negative'}>
                                        <ChevronDownIcon revert={tvlChangeDirection > 0}/>
                                            {tvlChangeDisplay}%
                                        </h4>
                                    }
                                </div>
                                <span>Volume 24h</span>
                                <div className="pool-info__section">
                                    <h3>{CurrencyUtils.toUSDDisplay(pool.volume24USD)}</h3>
                                    {
                                        volume24ChangeDirection !== 0 && <h4 className={volume24ChangeDirection > 0 ? 'positive': 'negative'}>
                                          <ChevronDownIcon revert={volume24ChangeDirection > 0}/>
                                            {volume24ChangeDisplay}%
                                        </h4>
                                    }
                                </div>
                                <span>24h Fees</span>
                                <div className="pool-info__section">
                                    <h3>{fee24Display}</h3>
                                </div>
                            </div>
                            <div className="pool-charts">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <Bar dataKey="volumeUSD" fill="#0088CC" />
                                        <XAxis dataKey="date"
                                               tickFormatter={formatXAxis}
                                               tick={{stroke: '#303757'}}
                                        />
                                        <Tooltip content={<TvlChartTooltip />}
                                                 position={{ x: 0, y: 0 }}
                                                 cursor={{ fill: 'rgba(48, 55, 87, 0.08)' }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="pool-transactions">
                        </div>
                    </>
                )
            }
        </div>
    )
}

export default PoolDetails;
