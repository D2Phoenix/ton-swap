import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import './Header.scss';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectWalletAddress, selectWalletBalances } from 'store/wallet/walletSlice';
import Account from './Modals/Account';
import Button from './Button';
import SunIcon from './icons/SunIcon';
import NavList from './NavList';
import SelectWallet from './Modals/SelectWallet';

function Header() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const balances = useAppSelector(selectWalletBalances);
    const walletAddress = useAppSelector(selectWalletAddress)
    const [showAccount ,setShowAccount] = useState(false);
    const [showConnectWallet , setShowConnectWallet] = useState(false);

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


    const connectWalletHandler = useCallback(() => {
        setShowConnectWallet(true);
    }, []);

    const showAccountHandler = useCallback(() => {
        setShowAccount(true);
    }, []);

    const closeAccountHandler = useCallback(() => {
        setShowAccount(false);
    }, []);

    const closeConnectWalletHandler = useCallback(() => {
        setShowConnectWallet(false);
    }, [])

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
                        !walletAddress &&
                      <Button type={'secondary'}
                              className={'large'}
                              onClick={connectWalletHandler}
                      >
                          {t('Connect Wallet')}
                      </Button>
                    }
                    {
                        walletAddress &&
                      <Button type={'secondary'}
                              className={'large'}
                              onClick={showAccountHandler}
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
                showAccount && <Account onClose={closeAccountHandler} onConnect={connectWalletHandler} />
            }
            {
                showConnectWallet && <SelectWallet onClose={closeConnectWalletHandler} />
            }
        </div>
    )
}

export default Header;
