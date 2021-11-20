import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';

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
        return fromTokenAmount && toTokenAmount && fromToken && toToken
            && !toTokenAmount.eq('0')
    }, [fromToken, toToken, fromTokenAmount, toTokenAmount]);
    const insufficientBalance = useMemo(() => {
        if (fromToken && fromTokenAmount) {
            const balance = walletBalances[fromToken.symbol] || new BigNumber('0');
            return fromTokenAmount.gt(balance);
        }
        return false;
    }, [fromToken, fromTokenAmount, walletBalances]);
    const calcFrom = useMemo(() => {
        if (!fromTokenAmount || !toTokenAmount || !toToken || !fromToken) {
            return;
        }
        return fromTokenAmount.div(toTokenAmount.shiftedBy(fromToken.decimals - toToken.decimals)).toFixed();
    }, [fromToken, toToken, fromTokenAmount, toTokenAmount])

    useEffect(() => {
        dispatch(fetchTokens());
    }, [dispatch]);

    useEffect(() => {
        if (!fromTokenAmount || fromTokenAmount.eq('0')) {
            return setSwapButtonText('Enter an amount');
        }
        if (!toToken || !fromToken) {
            return setSwapButtonText('Select a token');
        }
        if (fromToken && insufficientBalance) {
            return setSwapButtonText(`Insufficient ${fromToken.symbol} balance`);
        }
        setSwapButtonText('Swap');
    }, [fromToken, fromTokenAmount, toToken, insufficientBalance])

    useEffect((): any => {
        if (swapType === SwapType.EXACT_IN && (!fromTokenAmount || fromTokenAmount.eq('0'))) {
            return dispatch(setSwapToTokenAmount({
                value: null,
                swapType: SwapType.EXACT_IN
            }));
        }
        if (swapType === SwapType.EXACT_IN && fromToken && toToken && fromTokenAmount && !fromTokenAmount.eq('0')) {
            return dispatch(estimateTransaction({
                from: fromToken,
                to: toToken,
                fromAmount: fromTokenAmount,
                toAmount: null,
                type: swapType,
            }))
        }
    }, [dispatch, fromToken, toToken, fromTokenAmount, swapType]);

    useEffect((): any => {
        if (swapType === SwapType.EXACT_OUT && (!toTokenAmount || toTokenAmount.eq('0'))) {
            return dispatch(setSwapFromTokenAmount({
                value: null,
                swapType: SwapType.EXACT_OUT
            }));
        }
        if (swapType === SwapType.EXACT_OUT && fromToken && toToken && toTokenAmount && !toTokenAmount.eq('0')) {
            return dispatch(estimateTransaction({
                from: fromToken,
                to: toToken,
                fromAmount: null,
                toAmount: toTokenAmount,
                type: swapType,
            }))
        }
    }, [dispatch, fromToken, toToken, toTokenAmount, swapType]);

    const openFromTokenSelect = useCallback(() => {
        setShowTokenSelect(!showTokenSelect);
        setTokenSelectType('from');
    }, [showTokenSelect, setShowTokenSelect]);

    const openToTokenSelect = useCallback(() => {
        setShowTokenSelect(!showTokenSelect);
        setTokenSelectType('to');
    }, [showTokenSelect, setShowTokenSelect]);

    const handleSwitchTokens = useCallback(() => {
        dispatch(switchSwapTokens());
    }, [dispatch]);

    const handleSelectToken = useCallback((token) => {
        setShowTokenSelect(false);
        if (!token) {
            return;
        }
        if (walletAdapter) {
            dispatch(getWalletBalance(token));
        }
        if (toToken && tokenSelectType === 'from' && toToken.symbol === token.symbol) {
            return handleSwitchTokens();
        }
        if (fromToken && tokenSelectType === 'to' && fromToken.symbol === token.symbol) {
            return handleSwitchTokens();
        }
        if (tokenSelectType === 'from') {
            return dispatch(setSwapFromToken(token));
        }
        dispatch(setSwapToToken(token));
    }, [dispatch, fromToken, toToken, tokenSelectType, walletAdapter, handleSwitchTokens]);

    const handleFromTokenAmount = useCallback((value) => {
        dispatch(setSwapFromTokenAmount({
            value,
            swapType: SwapType.EXACT_IN
        }));
    }, [dispatch]);

    const handleToTokenAmount = useCallback((value) => {
        dispatch(setSwapToTokenAmount({
            value,
            swapType: SwapType.EXACT_OUT
        }));
    }, [dispatch]);

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
                        showMax={true}
                        onSelect={openFromTokenSelect}
                        onChange={handleFromTokenAmount}/>
            <div className="switch__btn btn-icon" onClick={handleSwitchTokens}>
                <ChevronDownIcon />
            </div>
            <TokenInput token={toToken}
                        balance={walletBalances[toSymbol]}
                        value={toTokenAmount}
                        showMax={false}
                        onSelect={openToTokenSelect}
                        onChange={handleToTokenAmount}/>
            <div className="swap-info text-small">
                {
                    isFilled && <span>
                      1 {toToken!.symbol} = {calcFrom} {fromToken!.symbol}
                    </span>
                }
                <div className="btn-icon" onMouseOver={() => setShowSwapInfo(true)} onMouseLeave={() => setShowSwapInfo(false)}>
                    <InfoIcon/>
                    {
                        showSwapInfo && <SwapInfo />
                    }
                </div>

            </div>
            {
                walletAdapter && <button className="btn btn-primary swap__btn"
                                         disabled={!isFilled || insufficientBalance}>
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
