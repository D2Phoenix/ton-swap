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
    selectSwapTo,
    selectSwapSwapType,
    setSwapFromToken,
    setSwapFromTokenAmount,
    setSwapToToken,
    setSwapToTokenAmount,
    switchSwapTokens
} from 'store/swap/swap.slice';
import { selectWalletAdapter, selectWalletBalances, selectWalletPermissions } from 'store/wallet/wallet.slice';
import {
    connectWallet,
    getWalletBalance,
    getWalletUseTokenPermission,
    setWalletUseTokenPermission
} from 'store/wallet/wallet.thunks';
import { estimateTransaction } from '../../store/swap/swap.thunks';
import { SwapTypes } from '../../interfaces/swap.types';
import SwapConfirm from './SwapConfirm';

function SwapPage() {
    const dispatch = useDispatch();
    const [showSettings, setShowSettings] = useState(false);
    const [showSwapInfo, setShowSwapInfo] = useState(false);
    const [showTokenSelect, setShowTokenSelect] = useState(false);
    const [showSwapConfirm, setShowSwapConfirm] = useState(false);
    const [tokenSelectType, setTokenSelectType] = useState('from');
    const [swapButtonText, setSwapButtonText] = useState('Swap');
    const tokens = useAppSelector(selectTokens);
    const from = useAppSelector(selectSwapFrom);
    const to = useAppSelector(selectSwapTo);
    const swapType = useAppSelector(selectSwapSwapType);
    const walletBalances = useAppSelector(selectWalletBalances);
    const walletAdapter = useAppSelector(selectWalletAdapter);
    const walletPermissions = useAppSelector(selectWalletPermissions);

    const fromSymbol = from.token ? from.token.symbol : '';
    const toSymbol = to.token ? to.token.symbol : '';
    const isFilled = useMemo(() => {
        return from.amount && to.amount && from && to
            && !to.amount.eq('0')
    }, [from, to]);
    const insufficientBalance = useMemo(() => {
        if (from.token && from.amount) {
            const balance = walletBalances[from.token.symbol] || new BigNumber('0');
            return from.amount.gt(balance);
        }
        return false;
    }, [from, walletBalances]);
    const calcFrom = useMemo(() => {
        if (!from.amount || !to.amount || !to.token || !from.token) {
            return;
        }
        return from.amount.div(to.amount.shiftedBy(from.token.decimals - to.token.decimals)).precision(6).toFixed();
    }, [from, to])

    useEffect(() => {
        dispatch(fetchTokens());
    }, [dispatch]);

    useEffect(() => {
        if (!from.amount || from.amount.eq('0')) {
            return setSwapButtonText('Enter an amount');
        }
        if (!to.token || !from.token) {
            return setSwapButtonText('Select a token');
        }
        if (from.token && insufficientBalance) {
            return setSwapButtonText(`Insufficient ${from.token.symbol} balance`);
        }
        setSwapButtonText('Swap');
    }, [from, to, insufficientBalance])

    useEffect((): any => {
        if (swapType === SwapTypes.EXACT_IN && (!from.amount || from.amount.eq('0'))) {
            return dispatch(setSwapToTokenAmount({
                value: null,
                swapType,
            }));
        }
        if (swapType === SwapTypes.EXACT_IN && to.token && from && from.amount && !from.amount.eq('0')) {
            return dispatch(estimateTransaction({
                from: from,
                to: {
                  token: to.token,
                },
                type: swapType,
            }))
        }
    }, [dispatch, from, to.token, swapType]);

    useEffect((): any => {
        if (swapType === SwapTypes.EXACT_OUT && (!to.amount || to.amount.eq('0'))) {
            return dispatch(setSwapFromTokenAmount({
                value: null,
                swapType,
            }));
        }
        if (swapType === SwapTypes.EXACT_OUT && from.token && to && to.amount && !to.amount.eq('0')) {
            return dispatch(estimateTransaction({
                from: {
                    token: from.token,
                },
                to: to,
                type: swapType,
            }))
        }
    }, [dispatch, from.token, to, swapType]);

    const openFromTokenSelect = useCallback(() => {
        setShowTokenSelect(!showTokenSelect);
        setTokenSelectType('from');
    }, [showTokenSelect]);

    const openToTokenSelect = useCallback(() => {
        setShowTokenSelect(!showTokenSelect);
        setTokenSelectType('to');
    }, [showTokenSelect]);

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
            dispatch(getWalletUseTokenPermission(token));
        }
        if (to.token && tokenSelectType === 'from' && to.token.symbol === token.symbol) {
            return handleSwitchTokens();
        }
        if (from.token && tokenSelectType === 'to' && from.token.symbol === token.symbol) {
            return handleSwitchTokens();
        }
        if (tokenSelectType === 'from') {
            return dispatch(setSwapFromToken(token));
        }
        dispatch(setSwapToToken(token));
    }, [dispatch, from, to, tokenSelectType, walletAdapter, handleSwitchTokens]);

    const handleFromTokenAmount = useCallback((value) => {
        dispatch(setSwapFromTokenAmount({
            value,
            swapType: SwapTypes.EXACT_IN
        }));
    }, [dispatch]);

    const handleToTokenAmount = useCallback((value) => {
        dispatch(setSwapToTokenAmount({
            value,
            swapType: SwapTypes.EXACT_OUT
        }));
    }, [dispatch]);

    const handleConnectWallet = useCallback(() => {
        dispatch(connectWallet());
    }, [dispatch]);

    const handleAllowUseToken = useCallback(() => {
        dispatch(setWalletUseTokenPermission(from.token!));
    }, [dispatch, from]);

    const handleSwap = useCallback(() => {
        setShowSwapConfirm(true);
    }, [])

    return (
        <div className="swap-wrapper">
            <div className="swap-header">
                <span className="text-semibold">Swap</span>
                <div className="btn-icon" onClick={() => setShowSettings(!showSettings)}>
                    <SettingsIcon/>
                </div>
            </div>
            <TokenInput token={from.token}
                        balance={walletBalances[fromSymbol]}
                        value={from.amount}
                        showMax={true}
                        onSelect={openFromTokenSelect}
                        onChange={handleFromTokenAmount}
                        editable={true}/>
            <div className="switch__btn btn-icon" onClick={handleSwitchTokens}>
                <ChevronDownIcon />
            </div>
            <TokenInput token={to.token}
                        balance={walletBalances[toSymbol]}
                        value={to.amount}
                        showMax={false}
                        onSelect={openToTokenSelect}
                        onChange={handleToTokenAmount}
                        editable={true}/>
            {
                isFilled && <div className="swap-info text-small">
                <span>
                  1 {to.token!.symbol} = {calcFrom} {from.token!.symbol}
                </span>
                  <div className="btn-icon" onMouseOver={() => setShowSwapInfo(true)} onMouseLeave={() => setShowSwapInfo(false)}>
                    <InfoIcon/>
                      {
                          showSwapInfo && <SwapInfo className={"swap-info-popup"}/>
                      }
                  </div>
                </div>
            }
            {
                walletAdapter && isFilled && !walletPermissions[from.token!.symbol] && !insufficientBalance &&
                    <button className="btn btn-primary swap__btn"
                            onClick={handleAllowUseToken}>
                      Allow the TONSwap Protocol to use your {from.token!.symbol}
                    </button>
            }
            {
                walletAdapter && <button className="btn btn-primary swap__btn"
                                         disabled={!isFilled || insufficientBalance || (!!from.token && !walletPermissions[from.token.symbol])}
                                         onClick={handleSwap}>
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
            {
                showSwapConfirm && <SwapConfirm onClose={() => setShowSwapConfirm(false)} />
            }
        </div>
    )
}

export default SwapPage;
