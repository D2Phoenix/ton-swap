import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { TxType } from 'types/transactionInterfaces';

import { copyToClipboard } from 'utils/domUtils';

import Button from 'components/Button';
import CopyIcon from 'components/Icons/CopyIcon';
import DirectIcon from 'components/Icons/DirectIcon';
import SwitchExchangeIcon from 'components/Icons/SwitchExchangeIcon';
import Modal from 'components/Modal';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectWalletAddress, selectWalletTransactions } from 'store/wallet/walletSlice';
import { disconnectWallet } from 'store/wallet/walletThunks';

import './AccountModal.scss';

interface AccountProps {
  onClose: () => void;
  onConnect: () => void;
}

export function AccountModal({ onClose, onConnect }: AccountProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const loader = useRef(null);
  const [page, setPage] = useState(1);
  const [isClose, setIsClose] = useState(false);
  const walletAddress = useAppSelector(selectWalletAddress);
  const transactions = useAppSelector(selectWalletTransactions);

  const visibleWalletAddress = useMemo(() => {
    if (walletAddress) {
      return walletAddress.substring(0, 8) + '...' + walletAddress.substring(walletAddress.length - 6);
    }
    return '';
  }, [walletAddress]);

  const observerHandler = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setPage((prev) => prev + 1);
    }
  }, []);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '0px',
      threshold: 0.9,
    };
    const observer = new IntersectionObserver(observerHandler, option);
    if (loader.current) {
      observer.observe(loader.current);
    }
  }, [observerHandler]);

  const visibleTxs = useMemo(() => {
    return transactions.slice(0, page * 10);
  }, [transactions, page]);

  const openAtExplorerHandler = useCallback(() => {
    const refWindow = window!.open(`https://ton.sh/address/${walletAddress}`, '_blank');
    if (refWindow) {
      refWindow.focus();
    }
  }, [walletAddress]);

  const copyToClipboardHandler = useCallback(() => {
    copyToClipboard(walletAddress);
  }, [walletAddress]);

  const closeHandler = useCallback(() => {
    onClose();
  }, [onClose]);

  const disconnectHandler = useCallback(() => {
    dispatch(disconnectWallet());
    setIsClose(true);
  }, [dispatch]);

  const connectHandler = useCallback(() => {
    onConnect();
    setIsClose(true);
  }, [onConnect]);

  return (
    <Modal header={t('Account')} className={'account-modal'} close={isClose} onClose={closeHandler}>
      <div className="account-wrapper">
        <div className="account-info">
          <div className="title-1">{visibleWalletAddress}</div>
          <Button type={'secondary'} alt={t('Open at explorer')} onClick={openAtExplorerHandler}>
            <DirectIcon />
          </Button>
          <Button type={'secondary'} alt={t('Copy to clipboard')} onClick={copyToClipboardHandler}>
            <CopyIcon />
          </Button>
        </div>
        <div className="account-actions">
          <Button type={'secondary'} className="title-2" icon={<SwitchExchangeIcon />} onClick={connectHandler}>
            {t('Switch Wallet')}
          </Button>
          <Button type={'primary'} className="title-2" onClick={disconnectHandler}>
            {t('Disconnect')}
          </Button>
        </div>
        <div className="title-2">{t('Recent Transactions')}</div>
        <div className="transactions-list">
          {visibleTxs.length === 0 && (
            <div className="transactions-empty sub-title-2">{t('Your transactions will appear here...')}</div>
          )}
          {visibleTxs.map((tx, index) => {
            return (
              <div key={tx.id} className="transaction-item sub-title-2">
                {tx.type === TxType.SWAP && (
                  <Trans>
                    Swap
                    <label className="small">
                      {{ amount0: tx.amount0 }} {{ symbol0: tx.token0.symbol }} to {{ amount1: tx.amount1 }}{' '}
                      {{ symbol1: tx.token1.symbol }}
                    </label>
                  </Trans>
                )}
                {tx.type === TxType.MINT && (
                  <Trans>
                    Add Liquidity
                    <br />
                    <label className="small">
                      {{ amount0: tx.amount0 }} {{ symbol0: tx.token0.symbol }}
                      <br />
                      {{ amount1: tx.amount1 }} {{ symbol1: tx.token1.symbol }}
                    </label>
                  </Trans>
                )}
                {tx.type === TxType.BURN && (
                  <Trans>
                    Remove Liquidity
                    <br />
                    <label className="small">
                      {{ amount0: tx.amount0 }} {{ symbol0: tx.token0.symbol }}
                      <br />
                      {{ amount1: tx.amount1 }} {{ symbol1: tx.token1.symbol }}
                    </label>
                  </Trans>
                )}
              </div>
            );
          })}
          <div ref={loader} />
        </div>
      </div>
    </Modal>
  );
}