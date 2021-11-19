import { useCallback, useEffect, useMemo, useState } from 'react';
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
    selectSwapFrom,
    selectSwapFromAmount,
    selectSwapLastSwapType,
    selectSwapTo,
    selectSwapToAmount,
    setSwapFromToken,
    setSwapFromTokenAmount,
    setSwapToToken,
    setSwapToTokenAmount,
    switchSwapTokens
} from 'store/swap/swap.slice';
import { selectWalletAdapter, selectWalletBalances } from 'store/wallet/wallet.slice';
import { connectWallet, getWalletBalance } from 'store/wallet/wallet.thunks';
import { estimateTransaction } from '../../store/swap/swap.thunks';
import { SwapType } from '../../interfaces/swap.type';

function SwapPage() {
    const dispatch = useDispatch();
    const [showSettings, setShowSettings] = useState(false);
    const [showSwapInfo, setShowSwapInfo] = useState(false);
    const [showTokenSelect, setShowTokenSelect] = useState(false);
    const [tokenSelectType, setTokenSelectType] = useState('from');
    const [swapButtonText, setSwapButtonText] = useState('Swap');
    const tokens = useAppSelector(selectTokens);
    const fromToken = useAppSelector(selectSwapFrom);
    const toToken = useAppSelector(selectSwapTo);
    const fromTokenAmount = useAppSelector(selectSwapFromAmount);
    const toTokenAmount = useAppSelector(selectSwapToAmount);
    const walletBalances = useAppSelector(selectWalletBalances);
    const walletAdapter = useAppSelector(selectWalletAdapter);
    const swapType = useAppSelector(selectSwapLastSwapType);

    const fromSymbol = fromToken ? fromToken.symbol : '';
    const toSymbol = toToken ? toToken.symbol : '';
    const isFilled = useMemo(() => {
        return fromTokenAmount && toTokenAmount
    }, [fromTokenAmount, toTokenAmount]);
    const insufficientBalance = useMemo(() => {
        return fromToken && fromTokenAmount && walletBalances[fromToken.symbol] < parseFloat(fromTokenAmount);
    }, [fromToken, fromTokenAmount, walletBalances]);

    useEffect(() => {
        dispatch(fetchTokens());
    }, [dispatch]);

    useEffect(() => {
        if (!fromTokenAmount) {
            return setSwapButtonText('Enter an amount');
        }
        if (fromTokenAmount && !toToken) {
            return setSwapButtonText('Select a token');
        }
        if (fromToken && insufficientBalance) {
            return setSwapButtonText(`Insufficient ${fromToken.symbol} balance`);
        }
        setSwapButtonText('Swap');
    }, [fromToken, fromTokenAmount, toToken, insufficientBalance])

    const openFromTokenSelect = useCallback(() => {
        setShowTokenSelect(!showTokenSelect);
        setTokenSelectType('from');
    }, [showTokenSelect, setShowTokenSelect]);

    const openToTokenSelect = useCallback(() => {
        setShowTokenSelect(!showTokenSelect);
        setTokenSelectType('to');
    }, [showTokenSelect, setShowTokenSelect]);

    const handleTransaction = useCallback((fromToken, toToken, fromTokenAmount, toTokenAmount, type) => {
        if (toToken && fromToken && fromTokenAmount) {
            dispatch(estimateTransaction({
                from: fromToken,
                to: toToken,
                fromAmount: fromTokenAmount,
                toAmount: toTokenAmount,
                type: type,
            }))
        }
    }, [dispatch]);

    const handleSelectToken = useCallback((token) => {
        setShowTokenSelect(false);
        if (!token) {
            return;
        }
        if (walletAdapter) {
            dispatch(getWalletBalance(token));
        }
        if (tokenSelectType === 'from') {
            handleTransaction(token, toToken, fromTokenAmount, toTokenAmount, swapType);
            return dispatch(setSwapFromToken(token));
        }
        handleTransaction(fromToken, token, fromTokenAmount, toTokenAmount, swapType);
        dispatch(setSwapToToken(token));
    }, [dispatch, tokenSelectType, walletAdapter, swapType, handleTransaction, toToken, fromToken, toTokenAmount, fromTokenAmount]);

    const handleSwitchTokens = useCallback(() => {
        dispatch(switchSwapTokens());
        const reversedSwapType = swapType === SwapType.EXACT_IN ? SwapType.EXACT_OUT : SwapType.EXACT_IN;
        handleTransaction(toToken, fromToken, toTokenAmount, fromTokenAmount, reversedSwapType);
    }, [dispatch, swapType, handleTransaction, toToken, fromToken, toTokenAmount, fromTokenAmount]);

    const handleFromTokenAmount = useCallback((value) => {
        dispatch(setSwapFromTokenAmount(value));
        handleTransaction(fromToken, toToken, value, toTokenAmount, SwapType.EXACT_IN);
    }, [dispatch, toToken, fromToken, toTokenAmount, handleTransaction]);

    const handleToTokenAmount = useCallback((value) => {
        dispatch(setSwapToTokenAmount(value));
        handleTransaction(fromToken, toToken, fromTokenAmount, value, SwapType.EXACT_OUT);
    }, [dispatch, toToken, fromToken, fromTokenAmount, handleTransaction]);

    const handleConnectWallet = useCallback(() => {
        dispatch(connectWallet());
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
            {
                walletAdapter && <button className="btn btn-primary swap__btn"
                                         disabled={!isFilled}>
                    {swapButtonText}
                </button>
            }
            {
                !walletAdapter && <button className="btn btn-outline swap__btn"
                                          onClick={handleConnectWallet}>Connect Wallet</button>
            }
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
