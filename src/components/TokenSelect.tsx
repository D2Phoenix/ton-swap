import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BigNumber from 'bignumber.js';

import './TokenSelect.scss';
import Modal from './Modal';
import TokenInterface from 'types/tokenInterface';
import { BALANCE_PRECISION } from 'constants/swap';
import TokenIcon from './TokenIcon';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectTokens } from '../store/app/appSlice';
import { selectWalletAdapter, selectWalletBalances } from '../store/wallet/walletSlice';
import { getWalletBalances } from '../store/wallet/walletThunks';
import Spinner from './Spinner';


interface TokenSelectParams {
    onClose: Function;
    onSelect: Function;
    balancesFirst?: boolean;
}

function TokenSelect({onClose, onSelect, balancesFirst}: TokenSelectParams) {
    const dispatch = useAppDispatch();
    const tokens = useAppSelector(selectTokens);
    const balances = useAppSelector(selectWalletBalances);
    const walletAdapter = useAppSelector(selectWalletAdapter);
    const loader = useRef(null);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');

    const visibleTokens = useMemo(() => {
        let result = tokens.filter((token) => token.symbol.toLowerCase().startsWith(query.toLowerCase())
            || token.address.toLowerCase().startsWith(query.toLowerCase()));
        if (balancesFirst) {
            result.sort((a: TokenInterface, b: TokenInterface) => {
                if (a.symbol === 'TON' || b.symbol === 'TON') {
                    return 1;
                }
                const aBalance = new BigNumber(balances[a.symbol]) || new BigNumber('0');
                const bBalance = new BigNumber(balances[b.symbol])|| new BigNumber('0')
                if (a.symbol > b.symbol) {
                    return bBalance.minus(aBalance).toNumber() || 1;
                }
                if (b.symbol > a.symbol) {
                    return bBalance.minus(aBalance).toNumber() || -1;
                }
                return 0;
            });
        }
        return result.slice(0, page * 10);
    }, [tokens, page, query, balancesFirst, balances]);

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

    useEffect(() => {
        if (walletAdapter) {
            dispatch(getWalletBalances(tokens));
        }
    }, [dispatch, walletAdapter, balances, tokens]);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

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
                            const balance = balances[token.symbol] ? new BigNumber(balances[token.symbol]).precision(BALANCE_PRECISION).toFixed() : '';
                            return (
                                <div key={token.address} className="token-select-item" onClick={() => onSelect(token)}>
                                    <TokenIcon address={token.address} name={token.name}/>
                                    <div className="token-name">
                                        <span className="text-semibold">{token.symbol}</span>
                                        <span className="text-small">{token.name}</span>
                                    </div>
                                    <div className="token-balance">
                                        {balance}
                                        {
                                            walletAdapter && !balance && <Spinner className="btn outline" />
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                    <div ref={loader}/>
                </div>
                <span className="text-center link__btn">
                    Manage Token Lists
                </span>
            </div>
        </Modal>
    )
}

export default TokenSelect;
