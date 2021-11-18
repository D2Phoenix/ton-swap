import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import './SwapPage.scss';
import ChevronDownIcon from 'components/icons/ChevronDownIcon';
import SettingsIcon from 'components/icons/SettingsIcon';
import InfoIcon from 'components/icons/InfoIcon';
import TokenInput from 'components/TokenInput';
import SwapSettings from './SwapSettings';
import SwapInfo from './SwapInfo';
import TokenSelect from 'components/TokenSelect';
import { useAppSelector } from 'store/hooks';
import { selectTokens } from 'store/app/app.slice';
import { fetchTokens } from 'store/app/app.thunks';
import {
    selectSwapFrom, selectSwapFromAmount,
    selectSwapTo, selectSwapToAmount,
    setSwapFromToken, setSwapFromTokenAmount,
    setSwapToToken, setSwapToTokenAmount,
    switchSwapTokens
} from 'store/swap/swap.slice';
import { selectWalletAdapter, selectWalletBalances } from 'store/wallet/wallet.slice';
import { getWalletBalance } from 'store/wallet/wallet.thunks';

function SwapPage() {
    const dispatch = useDispatch();
    const [showSettings, setShowSettings] = useState(false);
    const [showSwapInfo, setShowSwapInfo] = useState(false);
    const [showTokenSelect, setShowTokenSelect] = useState(false);
    const [tokenSelectType, setTokenSelectType] = useState('from');
    const tokens = useAppSelector(selectTokens);
    const fromToken = useAppSelector(selectSwapFrom);
    const toToken = useAppSelector(selectSwapTo);
    const fromTokenAmount = useAppSelector(selectSwapFromAmount);
    const toTokenAmount = useAppSelector(selectSwapToAmount);
    const walletBalances = useAppSelector(selectWalletBalances);
    const walletAdapter = useAppSelector(selectWalletAdapter);
    const fromSymbol = fromToken ? fromToken.symbol : '';
    const toSymbol = toToken ? toToken.symbol : '';

    useEffect(() => {
        dispatch(fetchTokens());
    }, [dispatch]);

    const openFromTokenSelect = useCallback(() => {
        setShowTokenSelect(!showTokenSelect);
        setTokenSelectType('from');
    }, [showTokenSelect, setShowTokenSelect]);

    const openToTokenSelect = useCallback(() => {
        setShowTokenSelect(!showTokenSelect);
        setTokenSelectType('to');
    }, [showTokenSelect, setShowTokenSelect]);

    const handleSelectToken = useCallback((token) => {
        setShowTokenSelect(false);
        if (!token) {
            return;
        }
        if (walletAdapter) {
            dispatch(getWalletBalance(token));
        }
        if (tokenSelectType === 'from') {
            return dispatch(setSwapFromToken(token));
        }
        dispatch(setSwapToToken(token));
    }, [dispatch, tokenSelectType, walletAdapter]);

    const handleSwitchTokens = useCallback(() => {
        dispatch(switchSwapTokens());
    }, [dispatch]);

    const handleFromTokenAmount = useCallback((value) => {
        dispatch(setSwapFromTokenAmount(value));
    }, [dispatch]);

    const handleToTokenAmount = useCallback((value) => {
        dispatch(setSwapToTokenAmount(value));
    }, [dispatch]);

    return (
        <div className="swap-wrapper">
            <div className="swap-header">
                <span className="text-semibold">Swap</span>
                <div className="btn-icon" onClick={() => setShowSettings(!showSettings)}>
                    <SettingsIcon/>
                </div>
            </div>
            <TokenInput token={fromToken}
                        balance={walletBalances[fromSymbol]}
                        value={fromTokenAmount}
                        onSelect={openFromTokenSelect}
                        onChange={handleFromTokenAmount}/>
            <div className="switch__btn btn-icon" onClick={handleSwitchTokens}>
                <ChevronDownIcon />
            </div>
            <TokenInput token={toToken}
                        balance={walletBalances[toSymbol]}
                        value={toTokenAmount}
                        onSelect={openToTokenSelect}
                        onChange={handleToTokenAmount}/>
            <div className="swap-info text-small">
                <span>1 ETH = 487.7 DAI</span>
                <div className="btn-icon" onMouseOver={() => setShowSwapInfo(true)} onMouseLeave={() => setShowSwapInfo(false)}>
                    <InfoIcon/>
                    {
                        showSwapInfo && <SwapInfo />
                    }
                </div>

            </div>
            <button className="btn btn-primary swap__btn">Swap</button>
            {
                showSettings && <SwapSettings onClose={() => setShowSettings(false)}/>
            }
            {
                showTokenSelect && <TokenSelect tokens={tokens}
                                               onClose={handleSelectToken}
                                               onSelect={handleSelectToken}/>
            }
        </div>
    )
}

export default SwapPage;
