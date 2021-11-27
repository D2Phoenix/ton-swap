import { useCallback, useMemo, useState } from 'react';

import './PoolTransactionsTable.scss';
import ChevronDownIcon from 'components/icons/ChevronDownIcon';
import CurrencyUtils from 'utils/currencyUtils';
import ChevronRightIcon from 'components/icons/ChevronRightIcon';
import { useAppSelector } from 'store/hooks';
import { selectPoolsTransactions } from 'store/pools/pools.slice';
import DateUtils from 'utils/dateUtils';

function PoolTransactionsTable() {
    const [sort, setSort] = useState('-name');
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('');
    const transactions = useAppSelector(selectPoolsTransactions);

    const filteredTxs = useMemo(() => {
        return transactions.filter((tx) => !filter || tx.__typename === filter);
    }, [transactions, filter])

    const visibleTxs = useMemo(() => {
        const sortKey: any = sort.startsWith('-') ? sort.split('-')[1] : sort;
        const sortDirection = sort.startsWith('-') ? -1 : 1;
        filteredTxs.sort((a: any, b: any) => {
            const aValue = parseFloat(a[sortKey]);
            const bValue = parseFloat(b[sortKey]);
            if (aValue > bValue) {
                return 1 * sortDirection;
            }
            if (bValue > aValue) {
                return -1 * sortDirection;
            }
            return 0;
        });
        return filteredTxs.slice((page - 1) * 10, page * 10);
    }, [filteredTxs, sort, page]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredTxs.length / 10);
    }, [filteredTxs]);

    const handleSort = useCallback((value: string) => {
        setSort(prev => (prev.startsWith(value) ? `-${value}` : value))
    }, []);

    const handlePageChange = useCallback((value: number) => {
        setPage((prev) => prev + value);
    }, []);

    const handleFilter = useCallback((value) => {
        setFilter(value);
        setPage(1);
    }, []);

    return (
        <>
            <div className="pool-transactions-wrapper">
                <div className="pool-transactions-header">
                    <div className="buttons__column">
                        <div className={`link__btn ${filter === '' ? 'active' : ''}`}
                             onClick={handleFilter.bind(null, '')}>
                            All
                        </div>
                        <div className={`link__btn ${filter === 'Swap' ? 'active' : ''}`}
                             onClick={handleFilter.bind(null, 'Swap')}>
                            Swaps
                        </div>
                        <div className={`link__btn ${filter === 'Mint' ? 'active' : ''}`}
                             onClick={handleFilter.bind(null, 'Mint')}>
                            Adds
                        </div>
                        <div className={`link__btn ${filter === 'Burn' ? 'active' : ''}`}
                             onClick={handleFilter.bind(null, 'Burn')}>
                            Removes
                        </div>
                    </div>
                    <div className="column" onClick={handleSort.bind(null, 'amountUSD')}>
                        Total Value
                        {
                            sort.includes('amountUSD') && <ChevronDownIcon revert={!sort.startsWith('-')}/>
                        }
                    </div>
                    <div className="column" onClick={handleSort.bind(null, 'amount0')}>
                        Token Amount
                        {
                            sort.includes('amount0') && <ChevronDownIcon revert={!sort.startsWith('-')}/>
                        }
                    </div>
                    <div className="column" onClick={handleSort.bind(null, 'amount1')}>
                        Token Amount
                        {
                            sort.includes('amount1') && <ChevronDownIcon revert={!sort.startsWith('-')}/>
                        }
                    </div>
                    <div className="account__column" onClick={handleSort.bind(null, 'owner')}>
                        Account
                        {
                            sort.includes('owner') && <ChevronDownIcon revert={!sort.startsWith('-')}/>
                        }
                    </div>
                    <div className="column" onClick={handleSort.bind(null, 'timestamp')}>
                        Time
                        {
                            sort.includes('timestamp') && <ChevronDownIcon revert={!sort.startsWith('-')}/>
                        }
                    </div>
                </div>
                {
                    visibleTxs.map((tx: any, index: number) => {
                        return (
                            <div key={index} className="pool-transactions__item">
                                <div className="buttons__column">
                                    {
                                        tx.__typename === 'Swap' && <a>
                                            Swap {tx.pool.token0.symbol} for {tx.pool.token1.symbol}
                                        </a>
                                    }
                                    {
                                        tx.__typename === 'Mint' && <a>
                                            Add {tx.pool.token0.symbol} and {tx.pool.token1.symbol}
                                        </a>
                                    }
                                    {
                                        tx.__typename === 'Burn' && <a>
                                          Remove {tx.pool.token0.symbol} and {tx.pool.token1.symbol}
                                        </a>
                                    }
                                </div>
                                <div className="column">{CurrencyUtils.toUSDDisplay(tx.amountUSD)}</div>
                                <div className="column">
                                    {CurrencyUtils.toDisplay(tx.amount0)} {tx.pool.token0.symbol}
                                </div>
                                <div className="column">
                                    {CurrencyUtils.toDisplay(tx.amount1)} {tx.pool.token1.symbol}
                                </div>
                                <div className="account__column">
                                    <a>{tx.owner || tx.origin}</a>
                                </div>
                                <div className="column">{DateUtils.timeSince(new Date(tx.timestamp * 1000))}</div>
                            </div>
                        )
                    })
                }
            </div>
            <div className="pool-transactions-pagination">
                <button className="btn-icon btn"
                        disabled={(page - 1) === 0}
                        onClick={handlePageChange.bind(null, -1)}>
                    <ChevronRightIcon revert={true}/>
                </button>
                Page {page} of {totalPages}
                <button className="btn-icon btn"
                        disabled={page >= totalPages}
                        onClick={handlePageChange.bind(null, 1)}>
                    <ChevronRightIcon/>
                </button>
            </div>
        </>
    )
}

export default PoolTransactionsTable;
