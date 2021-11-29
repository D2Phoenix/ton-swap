import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import './Account.scss';
import Modal from './Modal';
import { selectWalletAddress, selectWalletTransactions } from 'store/wallet/walletSlice';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { disconnectWallet } from 'store/wallet/walletThunks';
import { TxType } from 'types/transactionInterfaces';


interface AccountProps {
    onClose: Function;
}

function Account({onClose}: AccountProps) {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
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
                <span className="text-semibold">{t('Account')}</span>
                <div className="account-info text-semibold">
                    <span className="text-small">{t('Address')}</span>
                    <a href={`https://ton.sh/address/${walletAddress}`} rel="noreferrer" target="_blank" className="text-semibold">{walletAddress}</a>
                </div>
                <span className="text-small">{t('Transactions')}</span>
                <div className="transactions-list">
                    {
                        visibleTxs.length === 0 && (
                            <div className="transactions-empty">{t('Your transactions will appear here...')}</div>
                        )
                    }
                    {
                        visibleTxs.map((tx, index) => {
                            return (
                                <div key={tx.id} className="transaction-item">
                                    {
                                        tx.type === TxType.SWAP && <a>
                                          <Trans>
                                            Swap {{amount0: tx.amount0}} {{symbol0: tx.token0.symbol}} for {{amount1: tx.amount1}} {{symbol1: tx.token1.symbol}}
                                          </Trans>
                                        </a>
                                    }
                                    {
                                        tx.type === TxType.MINT && <a>
                                          <Trans>
                                            Add {{amount0: tx.amount0}} {{symbol0: tx.token0.symbol}} and {{amount1: tx.amount1}} {{symbol1: tx.token1.symbol}}
                                          </Trans>
                                        </a>
                                    }
                                    {
                                        tx.type === TxType.BURN && <a>
                                          <Trans>
                                            Remove {{amount0: tx.amount0}} {{symbol0: tx.token0.symbol}} and {{amount1: tx.amount1}} {{symbol1: tx.token1.symbol}}
                                          </Trans>
                                        </a>
                                    }
                                </div>
                            )
                        })
                    }
                    <div ref={loader}/>
                </div>
                <span className="btn btn-primary" onClick={handleDisconnect}>
                    {
                        t('Disconnect')
                    }
                </span>
            </div>
        </Modal>
    )
}

export default Account;
