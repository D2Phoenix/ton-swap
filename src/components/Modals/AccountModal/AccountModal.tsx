import BigNumber from 'bignumber.js';
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { TxType } from 'types/transactionInterfaces';

import { copyToClipboard } from 'utils/domUtils';

import Button from 'components/Button';
import CopyIcon from 'components/Icons/CopyIcon';
import DirectIcon from 'components/Icons/DirectIcon';
import SwitchExchangeIcon from 'components/Icons/SwitchExchangeIcon';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectWalletAddress, selectWalletTransactions } from 'store/wallet/walletSlice';
import { disconnectWallet } from 'store/wallet/walletThunks';

import { BALANCE_PRECISION } from '../../../constants/swap';
import List, { ListItem } from '../../List';
import TokenIcon from '../../TokenIcon';
import './AccountModal.scss';

interface AccountProps {
  onClose: (action?: string) => void;
}

export const AccountModalOptions = {
  header: 'Account',
  className: 'account-modal',
};

export function AccountModal({ onClose }: AccountProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const loader = useRef(null);
  const [page, setPage] = useState(1);
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

  const disconnectHandler = useCallback(() => {
    dispatch(disconnectWallet());
    onClose();
  }, [dispatch, onClose]);

  const switchWalletHandler = useCallback(() => {
    onClose('showSelectWallet');
  }, [onClose]);

  return (
    <div className="account">
      <div className="account__info">
        <div className="title-1">{visibleWalletAddress}</div>
        <Button
          variant={'secondary'}
          icon={<DirectIcon />}
          title={t('Open at explorer')}
          onClick={openAtExplorerHandler}
        />
        <Button
          variant={'secondary'}
          icon={<CopyIcon />}
          title={t('Copy to clipboard')}
          onClick={copyToClipboardHandler}
        />
      </div>
      <div className="account__actions">
        <Button variant={'secondary'} className="title-2" icon={<SwitchExchangeIcon />} onClick={switchWalletHandler}>
          {t('Switch Wallet')}
        </Button>
        <Button variant={'primary'} className="title-2" onClick={disconnectHandler}>
          {t('Disconnect')}
        </Button>
      </div>
      <div className="title-2">{t('Recent Transactions')}</div>
      <List height={436} itemCount={visibleTxs.length} emptyText={t('No Transactions Found')}>
        {(index: number, style: CSSProperties) => {
          const tx = visibleTxs[index];
          let title = '';
          let subTitle = '';
          if (tx.type === TxType.SWAP) {
            title = t('Swap');
            subTitle = `${tx.amount0} ${tx.token0.symbol} to ${tx.amount1} ${tx.token1.symbol}`;
          }
          if (tx.type === TxType.MINT) {
            title = t('Add Liquidity');
            subTitle = `${tx.amount0} ${tx.token0.symbol} and ${tx.amount1} ${tx.token1.symbol}`;
          }
          if (tx.type === TxType.BURN) {
            title = t('Remove Liquidity');
            subTitle = `${tx.amount0} ${tx.token0.symbol} and ${tx.amount1} ${tx.token1.symbol}`;
          }
          return <ListItem title={title} subtitle={subTitle} style={style} />;
        }}
      </List>
    </div>
  );
}
