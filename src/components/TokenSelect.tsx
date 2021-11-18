import { useCallback, useEffect, useRef, useState } from 'react';

import './TokenSelect.scss';
import Modal from './Modal';
import TokenInterface from 'interfaces/token.interface';


interface TokenSelectParams {
    tokens: TokenInterface[],
    onClose: Function;
    onSelect: Function;
}

function TokenSelect({tokens, onClose, onSelect}: TokenSelectParams) {
    const list = useRef(null);
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
            root: list.current,
            rootMargin: "0px",
            threshold: 1.0
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (loader.current) {
            observer.observe(loader.current);
        }
    }, [handleObserver]);

    const visibleCoins = tokens.filter((token) => token.symbol.includes(query) || token.address.includes(query))
        .slice(0, (page - 1) * 10);

    return (
        <Modal className={'token-select-modal'} onClose={onClose}>
            <div className="token-select-wrapper">
                <span className="text-semibold">Select a token</span>
                <input placeholder="Search name or paste address"
                       value={query}
                       onChange={(event) => setQuery(event.target.value)}/>
                <div className="token-select-list" ref={list}>
                    {
                        visibleCoins.map((token, index) => {
                            return (
                                <div key={token.address} className="token-select-item" onClick={() => onSelect(token)}>
                                    <img className="token__img" src={token.logoURI} alt={token.name}/>
                                    <div className="token-name">
                                        <span className="text-semibold">{token.symbol}</span>
                                        <span className="text-small">{token.name}</span>
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
