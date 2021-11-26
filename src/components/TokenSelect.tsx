import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BigNumber from 'bignumber.js';

import './TokenSelect.scss';
import Modal from './Modal';
import TokenInterface from 'interfaces/tokenInterface';
import { BALANCE_PRECISION } from '../constants/swap';
import { toDecimals } from '../utils/decimals';


interface TokenSelectParams {
    tokens: TokenInterface[],
    balances: Record<string, BigNumber>
    onClose: Function;
    onSelect: Function;
    balancesFirst?: boolean;
}

function TokenSelect({tokens, balances, onClose, onSelect, balancesFirst}: TokenSelectParams) {
    const loader = useRef(null);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');

    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
            setPage((prev) => prev + 1);
        }
    }, []);

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: "0px",
            threshold: 0.9
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (loader.current) {
            observer.observe(loader.current);
        }
    }, [handleObserver]);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const visibleTokens = useMemo(() => {
        let result = tokens.filter((token) => token.symbol.toLowerCase().startsWith(query.toLowerCase())
            || token.address.toLowerCase().startsWith(query.toLowerCase()));
        if (balancesFirst) {
            result.sort((a: TokenInterface, b: TokenInterface) => {
                if (a.symbol === 'TON' || b.symbol === 'TON') {
                    return 1;
                }
                const aBalance = balances[a.symbol] || new BigNumber('0');
                const bBalance = balances[b.symbol] || new BigNumber('0')
                if (a.symbol > b.symbol) {
                    return bBalance.minus(aBalance).toNumber() || 1;
                }
                if (b.symbol > a.symbol) {
                    return bBalance.minus(aBalance).toNumber() || -1;
                }
                return 0;
            });
        }
        return result.slice(0, (page - 1) * 10);
    }, [tokens, page, query, balancesFirst, balances])

    return (
        <Modal className={'token-select-modal'} onClose={handleClose}>
            <div className="token-select-wrapper">
                <span className="text-semibold">Select a token</span>
                <input placeholder="Search name or paste address"
                       value={query}
                       onChange={(event) => setQuery(event.target.value)}/>
                <div className="token-select-list">
                    {
                        visibleTokens.map((token, index) => {
                            const balance = balances[token.symbol] ? toDecimals(balances[token.symbol], token.decimals).precision(BALANCE_PRECISION).toFixed() : '';
                            return (
                                <div key={token.address} className="token-select-item" onClick={() => onSelect(token)}>
                                    <img className="token__img" src={token.logoURI} alt={token.name}/>
                                    <div className="token-name">
                                        <span className="text-semibold">{token.symbol}</span>
                                        <span className="text-small">{token.name}</span>
                                    </div>
                                    <div className="token-balance">
                                        {balance}
                                    </div>
                                </div>
                            )
                        })
                    }
                    <div ref={loader}/>
                </div>
                {/*<span className="text-center link__btn">
                    Manage Token Lists
                </span>*/}
            </div>
        </Modal>
    )
}

export default TokenSelect;
