import React, { useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';

import './Header.scss';
import { connectWallet } from 'store/wallet/wallet.thunks';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectWalletAddress } from 'store/wallet/wallet.slice';
import Account from './Account';

function Header() {
    const dispatch = useAppDispatch();
    const [showAccount ,setShowAccount] = useState(false);

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
                <div className="container">
                    <a href="/" className="logo">
                        <img src="/images/toncoin_white.svg" alt="" />
                        <span>TONSwap</span>
                    </a>
                </div>
            </header>
            <nav>
                <div className="nav-wrapper">
                    <div className="nav-list">
                        <div className="nav-item">
                            <NavLink className="nav-item__btn" to="/swap">
                                Swap
                            </NavLink>
                        </div>
                        <div className="nav-item">
                            <NavLink className="nav-item__btn" to="/pool">
                                Pool
                            </NavLink>
                        </div>
                        <div className="nav-item">
                            <NavLink className="nav-item__btn" to="/pools">
                                Top Pools
                            </NavLink>
                        </div>
                        <div className="nav-item wallet">
                            {
                                !walletAddress && <div className="btn btn-outline"
                                                      onClick={handleConnectWallet}>Connect Wallet</div>
                            }
                            {
                                walletAddress && <div className="btn btn-primary" onClick={handleShowAccount}>{walletAddress}</div>
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
