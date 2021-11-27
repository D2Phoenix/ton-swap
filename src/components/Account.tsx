import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BigNumber from 'bignumber.js';

import './Account.scss';
import Modal from './Modal';
import { selectWalletAddress, selectWalletTransactions } from 'store/wallet/wallet.slice';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { disconnectWallet } from '../store/wallet/wallet.thunks';
import { TxType } from '../types/transactionInterfaces';


interface AccountProps {
    onClose: Function;
}

function Account({onClose}: AccountProps) {
    const dispatch = useAppDispatch();
    const loader = useRef(null);
    const [page, setPage] = useState(1);
    const walletAddress = useAppSelector(selectWalletAddress);
    const transactions = useAppSelector(selectWalletTransactions);

    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
            setPage((prev) => prev + 1);
        }
    }, []);

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: "0px",
            threshold: 0.9
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (loader.current) {
            observer.observe(loader.current);
        }
    }, [handleObserver]);

    const visibleTxs = useMemo(() => {
        return transactions.slice(0, page * 10);
    }, [transactions, page]);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleDisconnect = useCallback(() => {
        dispatch(disconnectWallet());
        onClose();
    }, [dispatch, onClose]);

    return (
        <Modal className={'account-modal'} onClose={handleClose}>
            <div className="account-wrapper">
                <span className="text-semibold">Account</span>
                <div className="account-info text-semibold">
                    <span className="text-small">Address</span>
                    <a href={`https://ton.sh/address/${walletAddress}`} target="_blank" className="text-semibold">{walletAddress}</a>
                </div>
                <span className="text-small">Transactions</span>
                <div className="transactions-list">
                    {
                        visibleTxs.length === 0 && (
                            <div className="transactions-empty">Your transactions will appear here...</div>
                        )
                    }
                    {
                        visibleTxs.map((tx, index) => {
                            return (
                                <div key={tx.id} className="transaction-item">
                                    {
                                        tx.type === TxType.SWAP && <a>
                                          Swap {tx.amount0} {tx.token0.symbol} for {tx.amount1} {tx.token1.symbol}
                                        </a>
                                    }
                                    {
                                        tx.type === TxType.MINT && <a>
                                          Add {tx.amount0} {tx.token0.symbol} and {tx.amount1} {tx.token1.symbol}
                                        </a>
                                    }
                                    {
                                        tx.type === TxType.BURN && <a>
                                          Remove {tx.amount0} {tx.token0.symbol} and {tx.amount1} {tx.token1.symbol}
                                        </a>
                                    }
                                </div>
                            )
                        })
                    }
                    <div ref={loader}/>
                </div>
                <span className="btn btn-primary" onClick={handleDisconnect}>
                    Disconnect
                </span>
            </div>
        </Modal>
    )
}

export default Account;
