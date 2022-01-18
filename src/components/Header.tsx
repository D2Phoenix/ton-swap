import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import './Header.scss';
import { connectWallet } from 'store/wallet/walletThunks';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectWalletAddress, selectWalletBalances, selectWalletConnectionStatus } from 'store/wallet/walletSlice';
import Account from './Modals/Account';
import { WalletStatus } from 'types/walletAdapterInterface';
import Button from './Button';
import SunIcon from './icons/SunIcon';
import NavList from './NavList';

function Header() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const balances = useAppSelector(selectWalletBalances);
    const walletConnectionStatus = useAppSelector(selectWalletConnectionStatus)
    const walletAddress = useAppSelector(selectWalletAddress)
    const [showAccount ,setShowAccount] = useState(false);

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
           }
       ]
    }, [t]);

    const visibleWalletAddress = useMemo(() => {
        if (walletAddress) {
            return walletAddress.substring(0, 8) + '...' + walletAddress.substring(walletAddress.length - 6);
        }
        return '';
    }, [walletAddress]);


    const handleConnectWallet = useCallback(() => {
        dispatch(connectWallet());
    }, [dispatch]);

    const handleShowAccount = useCallback(() => {
        setShowAccount(true);
    }, []);

    const handleCloseAccount = useCallback(() => {
        setShowAccount(false);
    }, []);

    return (
        <div className="header-wrapper">
            <header>
                <a href="/" className="logo">
                    <img src="/images/toncoin_symbol.svg" alt="" />
                    <h4>TON Dex</h4>
                </a>
            </header>
            <NavList links={links} />
            <div className="header-buttons">
                {
                    balances['TON'] &&
                  <div className="nav-item balance">
                    <Button type={'primary'}
                            className={'large'}
                            onClick={() => {}}>
                        {balances['TON']} TON
                    </Button>
                  </div>
                }
                <div className="nav-item wallet">
                    {
                        walletConnectionStatus !== WalletStatus.CONNECTED &&
                      <Button type={'secondary'}
                              className={'large'}
                              loading={walletConnectionStatus === WalletStatus.CONNECTING}
                              onClick={handleConnectWallet}
                      >
                          {t('Connect Wallet')}
                      </Button>
                    }
                    {
                        walletAddress &&
                      <Button type={'secondary'}
                              className={'large'}
                              onClick={handleShowAccount}
                      >
                          {visibleWalletAddress}
                      </Button>
                    }
                </div>
                <div className="nav-item">
                    <Button type={'secondary'} onClick={() => {}}>
                        <SunIcon />
                    </Button>
                </div>
            </div>
            {
                showAccount && <Account onClose={handleCloseAccount} />
            }
        </div>
    )
}

export default Header;
