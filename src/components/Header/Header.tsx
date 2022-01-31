import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import TokenUtils from 'utils/tokenUtils';

import Button from 'components/Button';
import SunIcon from 'components/Icons/SunIcon';
import { useModal } from 'components/Modal';
import AccountModal, { AccountModalOptions } from 'components/Modals/AccountModal';
import SelectWalletModal, { SelectWalletModalOptions } from 'components/Modals/SelectWalletModal';
import NavList from 'components/NavList';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectWalletAddress, selectWalletBalances } from 'store/wallet/walletSlice';

import './Header.scss';

export function Header() {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const balances = useAppSelector(selectWalletBalances);
  const walletAddress = useAppSelector(selectWalletAddress);

  const selectWalletModal = useModal(SelectWalletModal, SelectWalletModalOptions);
  const accountModal = useModal(AccountModal, AccountModalOptions);

  accountModal.onClose((result: string) => {
    if (result === 'showSelectWallet') {
      selectWalletModal.open();
    }
  });

  const links = useMemo(() => {
    return [
      {
        to: '/swap',
        value: t('Swap'),
      },
      {
        to: '/pool',
        value: t('Pool'),
      },
      {
        to: '/pools',
        value: t('Top Pools'),
      },
    ];
  }, [t]);

  const visibleWalletAddress = useMemo(() => {
    if (walletAddress) {
      return walletAddress.substring(0, 8) + '...' + walletAddress.substring(walletAddress.length - 6);
    }
    return '';
  }, [walletAddress]);

  const switchThemeHandler = useCallback(() => {
    document.body.classList.toggle('light-theme');
  }, []);

  return (
    <div className="header-wrapper">
      <header>
        <a href="/" className="header__logo">
          <img src="/images/toncoin_symbol.svg" alt="" />
          <h4>Dex</h4>
        </a>
        <div className="header__buttons">
          <div className="wallet">
            {!walletAddress && (
              <Button variant={'secondary'} onClick={selectWalletModal.open}>
                {t('Connect Wallet')}
              </Button>
            )}
            {walletAddress && (
              <Button variant={'secondary'} onClick={accountModal.open}>
                {visibleWalletAddress}
              </Button>
            )}
          </div>
          <div className="theme" onClick={switchThemeHandler}>
            <Button variant={'secondary'} icon={<SunIcon />} />
          </div>
        </div>
      </header>
      <NavList links={links} />
      <div className="header__buttons">
        {balances['TON'] && (
          <div className="balance">
            <Button variant={'primary'}>{TokenUtils.toNumberDisplay(balances['TON'], 2)} TON</Button>
          </div>
        )}
        <div className="wallet">
          {!walletAddress && (
            <Button variant={'secondary'} onClick={selectWalletModal.open}>
              {t('Connect Wallet')}
            </Button>
          )}
          {walletAddress && (
            <Button variant={'secondary'} onClick={accountModal.open}>
              {visibleWalletAddress}
            </Button>
          )}
        </div>
        <div className="theme" onClick={switchThemeHandler}>
          <Button variant={'secondary'} icon={<SunIcon />} />
        </div>
      </div>
    </div>
  );
}
