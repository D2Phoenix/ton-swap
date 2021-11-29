import React, { useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import './Header.scss';
import { connectWallet } from 'store/wallet/walletThunks';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectWalletAddress, selectWalletConnectionStatus } from 'store/wallet/walletSlice';
import Account from './Account';
import Spinner from './Spinner';
import { WalletStatus } from 'types/walletAdapterInterface';

function Header() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const [showAccount ,setShowAccount] = useState(false);

    const walletConnectionStatus = useAppSelector(selectWalletConnectionStatus)
    const walletAddress = useAppSelector(selectWalletAddress)

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
                    <img src="/images/toncoin_white.svg" alt="" />
                    <span>TONSwap</span>
                </a>
            </header>
            <nav>
                <div className="nav-wrapper">
                    <div className="nav-list">
                        <div className="nav-item">
                            <NavLink className="nav-item__btn" to="/swap">
                                {t('Swap')}
                            </NavLink>
                        </div>
                        <div className="nav-item">
                            <NavLink className="nav-item__btn" to="/pool">
                                {t('Pool')}
                            </NavLink>
                        </div>
                        <div className="nav-item">
                            <NavLink className="nav-item__btn" to="/pools">
                                {t('Top Pools')}
                            </NavLink>
                        </div>
                        <div className="nav-item wallet">
                            {
                                walletConnectionStatus !== WalletStatus.CONNECTED &&
                                <button className="btn btn-outline"
                                     onClick={handleConnectWallet}>
                                    {
                                        walletConnectionStatus === WalletStatus.DISCONNECTED && t('Connect Wallet')
                                    }
                                    {
                                        walletConnectionStatus === WalletStatus.CONNECTING && <Spinner className="btn outline" />
                                    }
                                </button>
                            }
                            {
                                walletAddress &&
                                <div className="btn btn-primary" onClick={handleShowAccount}>
                                    {walletAddress}
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </nav>
            {
                showAccount && <Account onClose={handleCloseAccount} />
            }
        </div>
    )
}

export default Header;
