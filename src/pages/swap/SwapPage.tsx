import { useCallback, useEffect, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';

import './SwapPage.scss';
import ChevronDownIcon from 'components/icons/ChevronDownIcon';
import SettingsIcon from 'components/icons/SettingsIcon';
import InfoIcon from 'components/icons/InfoIcon';
import TokenInput from 'components/TokenInput';
import Settings from 'components/Settings';
import TokenSelect from 'components/TokenSelect';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectTokens } from 'store/app/app.slice';
import { selectWalletAdapter, selectWalletBalances, selectWalletPermissions } from 'store/wallet/wallet.slice';
import {
    connectWallet,
    getWalletBalance,
    getWalletUseTokenPermission,
    setWalletUseTokenPermission
} from 'store/wallet/wallet.thunks';
import { estimateTransaction } from 'store/swap/swap.thunks';
import { TxType } from 'interfaces/transactionInterfaces';
import {
    selectSwapFrom,
    selectSwapTo,
    selectSwapTxType,
    setSwapFromToken,
    setSwapFromAmount,
    setSwapToToken,
    setSwapToAmount,
    switchSwapTokens, resetSwap
} from 'store/swap/swap.slice';
import SwapInfo from './SwapInfo';
import SwapConfirm from './SwapConfirm';
import Tooltip from '../../components/Tooltip';
import { WALLET_TX_UPDATE_INTERVAL } from 'constants/swap';

function SwapPage() {
    const dispatch = useAppDispatch();
    const [showSettings, setShowSettings] = useState(false);
    const [showTokenSelect, setShowTokenSelect] = useState(false);
    const [showSwapConfirm, setShowSwapConfirm] = useState(false);
    const [tokenSelectType, setTokenSelectType] = useState('from');
    const [swapButtonText, setSwapButtonText] = useState('Swap');
    const tokens = useAppSelector(selectTokens);
    const from = useAppSelector(selectSwapFrom);
    const to = useAppSelector(selectSwapTo);
    const txType = useAppSelector(selectSwapTxType);
    const walletBalances = useAppSelector(selectWalletBalances);
    const walletAdapter = useAppSelector(selectWalletAdapter);
    const walletPermissions = useAppSelector(selectWalletPermissions);

    const isFilled = useMemo(() => {
        return from.amount && to.amount && from.token && to.token
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
        return () => {
            dispatch(resetSwap());
        };
    }, [dispatch]);

    //Handle swap button text
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
    }, [from, to, insufficientBalance]);
    // Estimate EXACT_IN transaction
    useEffect((): any => {
        if (txType === TxType.EXACT_IN && (!from.amount || from.amount.eq('0'))) {
            return dispatch(setSwapToAmount({
                value: null,
                txType,
            }));
        }
        if (txType === TxType.EXACT_IN && to.token && from.token && from.amount && !from.amount.eq('0')) {
            return dispatch(estimateTransaction({
                from: from,
                to: {
                    token: to.token,
                },
                txType,
            }))
        }
    }, [dispatch, from, to.token, txType]);
    // Estimate EXACT_OUT transaction
    useEffect((): any => {
        if (txType === TxType.EXACT_OUT && (!to.amount || to.amount.eq('0'))) {
            return dispatch(setSwapFromAmount({
                value: null,
                txType,
            }));
        }
        if (txType === TxType.EXACT_OUT && from.token && to.token && to.amount && !to.amount.eq('0')) {
            return dispatch(estimateTransaction({
                from: {
                    token: from.token,
                },
                to: to,
                txType,
            }))
        }
    }, [dispatch, from.token, to, txType]);
    // Update balances and transaction estimation every {WALLET_TX_UPDATE_INTERVAL} milliseconds
    useEffect((): any => {
        if (!walletAdapter) {
            return;
        }
        const intervalId = setInterval(() => {
            if (to.token) {
                dispatch(getWalletBalance(to.token));
            }
            if (from.token) {
                dispatch(getWalletBalance(from.token));
            }
            if (from.token && to.token && from.amount && !from.amount.eq('0')) {
                dispatch(estimateTransaction({
                    from: from,
                    to: to,
                    txType,
                }));
            }
        }, WALLET_TX_UPDATE_INTERVAL);
        return () => clearInterval(intervalId);
    },[dispatch, walletAdapter, from, to, txType]);

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
        dispatch(setSwapFromAmount({
            value,
            txType: TxType.EXACT_IN
        }));
    }, [dispatch]);

    const handleToTokenAmount = useCallback((value) => {
        dispatch(setSwapToAmount({
            value,
            txType: TxType.EXACT_OUT
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
                        balance={walletBalances[from.token?.symbol || '']}
                        value={from.amount}
                        showMax={true}
                        onSelect={openFromTokenSelect}
                        onChange={handleFromTokenAmount}
                        editable={true}/>
            <div className="switch__btn btn-icon" onClick={handleSwitchTokens}>
                <ChevronDownIcon/>
            </div>
            <TokenInput token={to.token}
                        balance={walletBalances[to.token?.symbol || '']}
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
                  <Tooltip content={<SwapInfo/>} direction="left">
                    <div className="btn-icon">
                      <InfoIcon/>
                    </div>
                  </Tooltip>
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
                showSettings && <Settings onClose={() => setShowSettings(false)}/>
            }
            {
                showTokenSelect && <TokenSelect tokens={tokens}
                                                onClose={handleSelectToken}
                                                onSelect={handleSelectToken}/>
            }
            {
                showSwapConfirm && <SwapConfirm onClose={() => setShowSwapConfirm(false)}/>
            }
        </div>
    )
}

export default SwapPage;
