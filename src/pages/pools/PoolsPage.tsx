import { useCallback, useEffect, useMemo, useState } from 'react';

import './PoolsPage.scss';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectPoolsList } from 'store/pools/pools.slice';
import { fetchPools } from 'store/pools/pools.thunks';
import ChevronDownIcon from '../../components/icons/ChevronDownIcon';
import ChevronRightIcon from '../../components/icons/ChevronRightIcon';
import CurrencyUtils from '../../utils/currencyUtils';

function PoolsPage() {
    const dispatch = useAppDispatch();
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('totalVolume');
    const [page, setPage] = useState(1);
    const pools = useAppSelector(selectPoolsList);

    useEffect(() => {
        dispatch(fetchPools());
    }, [dispatch]);

    const filteredPools = useMemo(() => {
        return pools.filter((pool) => `${pool.token0.symbol}/${pool.token1.symbol}`.toLowerCase().includes(query.toLowerCase()));
    }, [pools, query])

    const visiblePools = useMemo(() => {
        const sortKey: any = sort.startsWith('-') ? sort.split('-')[1] : sort;
        const sortDirection = sort.startsWith('-') ? -1 : 1;
        filteredPools.sort((a: any, b: any) => {
            const aValue = sortKey === 'name' ? `${a.token0.symbol}/${a.token1.symbol}` : parseFloat(a[sortKey]);
            const bValue = sortKey === 'name' ? `${b.token0.symbol}/${b.token1.symbol}` : parseFloat(b[sortKey]);
            if (aValue > bValue) {
                return 1 * sortDirection;
            }
            if (bValue > aValue) {
                return -1 * sortDirection;
            }
            return 0;
        });
        return filteredPools.slice((page - 1) * 10, page * 10);
    }, [filteredPools, sort, page]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredPools.length / 10);
    }, [filteredPools]);

    const handleSort = useCallback((value: string) => {
        setSort(prev => (prev.startsWith(value) ? `-${value}` : value))
    }, []);

    const handlePageChange = useCallback((value: number) => {
        setPage((prev) => prev + value);
    }, []);

    return (
        <div className="pools-wrapper">
            <span className="text-semibold">All Pools</span>
            <input placeholder="Search pools"
                   value={query}
                   onChange={(event) => setQuery(event.target.value)}/>
            <div className="pools-list-wrapper">
                <div className="pools-list-header">
                    <div className="position__column">#</div>
                    <div className="name__column" onClick={handleSort.bind(null, 'name')}>
                        Name
                        {
                            sort.includes('name') && <ChevronDownIcon revert={!sort.startsWith('-')}/>
                        }
                    </div>
                    <div className="tvl__column" onClick={handleSort.bind(null, 'totalValueLockedUSD')}>
                        TVL
                        {
                            sort.includes('totalValueLockedUSD') && <ChevronDownIcon revert={!sort.startsWith('-')}/>
                        }
                    </div>
                    <div className="total-day__column" onClick={handleSort.bind(null, 'volume24USD')}>
                        Volume 24h
                        {
                            sort.includes('volume24USD') && <ChevronDownIcon revert={!sort.startsWith('-')}/>
                        }
                    </div>
                    <div className="total-7day__column" onClick={handleSort.bind(null, 'volume7dUSD')}>
                        Volume 7d
                        {
                            sort.includes('volume7dUSD') && <ChevronDownIcon revert={!sort.startsWith('-')}/>
                        }
                    </div>
                </div>
                {
                    visiblePools.map((pool, index) => {
                        return (
                            <div key={index} className="pool-list__item">
                                <div className="position__column">{index + 1}</div>
                                <div className="name__column">{`${pool.token0.symbol}/${pool.token1.symbol}`}</div>
                                <div className="tvl__column">{CurrencyUtils.toUSDDisplay(pool.totalValueLockedUSD)}</div>
                                <div className="total-day__column">{CurrencyUtils.toUSDDisplay(pool.volume24USD)}</div>
                                <div className="total-7day__column">{CurrencyUtils.toUSDDisplay(pool.volume7dUSD)}</div>
                            </div>
                        )
                    })
                }
                <div className="pools-list-pagination">
                    {
                        (page - 1) !== 0 && <div className="btn-icon" onClick={handlePageChange.bind(null, -1)}>
                          <ChevronRightIcon revert={true}/>
                        </div>
                    }
                    Page {page} of {totalPages}
                    {
                        page !== totalPages && <div className="btn-icon" onClick={handlePageChange.bind(null, 1)}>
                          <ChevronRightIcon/>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default PoolsPage;
