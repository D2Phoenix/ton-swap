import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
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
                            <Link to="/swap">
                                <a className="nav-item__btn">Swap</a>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link to="/pool">
                                <a className="nav-item__btn">Pool</a>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <Link to="/pools">
                                <a className="nav-item__btn">Top Pools</a>
                            </Link>
                        </div>
                        <div className="nav-item">
                            <div className="btn btn-outline">Connect Wallet</div>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Header;
