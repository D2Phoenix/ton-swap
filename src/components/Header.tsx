import React from 'react';

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
                            <a className="nav-item__btn">Swap</a>
                        </div>
                        <div className="nav-item">
                            <a className="nav-item__btn">Pool</a>
                        </div>
                        <div className="nav-item">
                            <a className="nav-item__btn">Top Pools</a>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Header;
