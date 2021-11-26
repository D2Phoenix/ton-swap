import { useCallback, useEffect, useMemo, useState } from 'react';

import './PoolsPage.scss';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectPoolsList } from 'store/pools/pools.slice';
import { fetchPools } from 'store/pools/pools.thunks';
import ChevronDownIcon from '../../components/icons/ChevronDownIcon';
import ChevronRightIcon from '../../components/icons/ChevronRightIcon';

function PoolsPage() {
    const dispatch = useAppDispatch();
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('totalVolume');
    const [page, setPage] = useState(1);
    const pools = useAppSelector(selectPoolsList);

    useEffect(() => {
        dispatch(fetchPools());
    }, [dispatch]);

    const visiblePools = useMemo(() => {
        let result = pools.filter((pool) => pool.name.toLowerCase().includes(query.toLowerCase()));
        const sortKey: any = sort.startsWith('-') ? sort.split('-')[1] : sort;
        const sortDirection = sort.startsWith('-') ? -1 : 1;
        result.sort((a: any, b: any) => {
            const aValue = sortKey === 'name' ? a[sortKey] : parseFloat(a[sortKey]);
            const bValue = sortKey === 'name' ? b[sortKey] : parseFloat(b[sortKey]);
            if (aValue > bValue) {
                return 1 * sortDirection;
            }
            if (bValue > aValue) {
                return -1 * sortDirection;
            }
            return 0;
        });
        return result.slice((page - 1) * 10, page * 10);
    }, [pools, query, sort, page]);

    const totalPages = useMemo(() => {
        return Math.ceil(pools.filter((pool) => pool.name.toLowerCase().includes(query.toLowerCase())).length / 10);
    }, [pools, query]);

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
                    <div className="total-volume__column" onClick={handleSort.bind(null, 'totalVolume')}>
                        TVL
                        {
                            sort.includes('totalVolume') && <ChevronDownIcon revert={!sort.startsWith('-')}/>
                        }
                    </div>
                    <div className="total-day__column" onClick={handleSort.bind(null, 'total24')}>
                        Volume 24h
                        {
                            sort.includes('total24') && <ChevronDownIcon revert={!sort.startsWith('-')}/>
                        }
                    </div>
                    <div className="total-7day__column" onClick={handleSort.bind(null, 'total7d')}>
                        Volume 7d
                        {
                            sort.includes('total7d') && <ChevronDownIcon revert={!sort.startsWith('-')}/>
                        }
                    </div>
                </div>
                {
                    visiblePools.map((pool, index) => {
                        return (
                            <div key={index} className="pool-list__item">
                                <div className="position__column">{index + 1}</div>
                                <div className="name__column">{pool.name}</div>
                                <div className="total-volume__column">${pool.totalVolume}m</div>
                                <div className="total-day__column">${pool.total24}m</div>
                                <div className="total-7day__column">${pool.total7d}m</div>
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
                        page !== totalPages &&  <div className="btn-icon" onClick={handlePageChange.bind(null, 1)}>
                          <ChevronRightIcon />
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default PoolsPage;
