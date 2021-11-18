import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { connectWallet } from '../store/wallet/wallet.thunks';

function Header() {
    const dispatch = useDispatch();

    const handleConnectWallet = useCallback(() => {
        dispatch(connectWallet());
    }, [dispatch]);

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
                        <div className="nav-item">
                            <div className="btn btn-outline"
                                 onClick={handleConnectWallet}>Connect Wallet</div>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Header;
