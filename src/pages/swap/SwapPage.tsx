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
    getWalletBalance, getWalletBalances,
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
import Tooltip from 'components/Tooltip';
import { WALLET_TX_UPDATE_INTERVAL } from 'constants/swap';
import TokenUtils from 'utils/tokenUtils';

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
        return TokenUtils.isFilled(from) && TokenUtils.isFilled(to);
    }, [from, to]);

    const insufficientBalance = useMemo(() => {
        if (TokenUtils.isFilled(from)) {
            return TokenUtils.compareAmount(from, walletBalances[from.token.symbol]) === 1;
        }
        return false;
    }, [from, walletBalances]);

    const hasErrors = useMemo(() => {
        return !isFilled || insufficientBalance || (!!from.token && !walletPermissions[from.token.symbol])
    }, [isFilled, insufficientBalance, from, walletPermissions]);

    const tokenSwapRate = useMemo(() => {
        if (!TokenUtils.isFilled(from) || !TokenUtils.isFilled(to)) {
            return;
        }
        return TokenUtils.getDisplayRate(from, to);
    }, [from, to])

    useEffect(() => {
        return () => {
            dispatch(resetSwap());
        };
    }, [dispatch]);

    //Handle swap button text
    useEffect(() => {
        if (!TokenUtils.isFilled(from)) {
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
        if (txType === TxType.EXACT_IN && !TokenUtils.hasAmount(from)) {
            return dispatch(setSwapToAmount({
                value: null,
                txType,
            }));
        }
        if (txType === TxType.EXACT_IN && to.token && TokenUtils.isFilled(from)) {
            return dispatch(estimateTransaction({
                in: from,
                token: to.token,
                txType,
            }))
        }
    }, [dispatch, from, to.token, txType]);
    // Estimate EXACT_OUT transaction
    useEffect((): any => {
        if (txType === TxType.EXACT_OUT && !TokenUtils.hasAmount(to)) {
            return dispatch(setSwapFromAmount({
                value: null,
                txType,
            }));
        }
        if (txType === TxType.EXACT_OUT && from.token && TokenUtils.isFilled(to)) {
            return dispatch(estimateTransaction({
                token: from.token,
                out: to,
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
            if (txType === TxType.EXACT_IN && to.token && TokenUtils.isFilled(from)) {
                dispatch(estimateTransaction({
                    in: from,
                    token: to.token,
                    txType,
                }));
            }
            if (txType === TxType.EXACT_OUT && from.token && TokenUtils.isFilled(to)) {
                dispatch(estimateTransaction({
                    out: to,
                    token: from.token,
                    txType,
                }));
            }
        }, WALLET_TX_UPDATE_INTERVAL);
        return () => clearInterval(intervalId);
    },[dispatch, walletAdapter, from, to, txType]);

    const openFromTokenSelect = useCallback(() => {
        setShowTokenSelect(!showTokenSelect);
        setTokenSelectType('from');
        if (walletAdapter) {
            dispatch(getWalletBalances(tokens));
        }
    }, [showTokenSelect, dispatch, walletAdapter, tokens]);

    const openToTokenSelect = useCallback(() => {
        setShowTokenSelect(!showTokenSelect);
        setTokenSelectType('to');
        if (walletAdapter) {
            dispatch(getWalletBalances(tokens));
        }
    }, [showTokenSelect, dispatch, walletAdapter, tokens]);

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
        if (tokenSelectType === 'from' && TokenUtils.compareToken(to, token)) {
            return handleSwitchTokens();
        }
        if (tokenSelectType === 'to' && TokenUtils.compareToken(from, token)) {
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
                        selectable={true}
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
                        selectable={true}
                        editable={true}/>
            {
                isFilled && <div className="swap-info text-small">
                    <span className="text-small">
                      1 {to.token!.symbol} = {tokenSwapRate} {from.token!.symbol}
                    </span>
                  <Tooltip content={<SwapInfo/>} direction="left">
                    <div className="btn-icon">
                      <InfoIcon/>
                    </div>
                  </Tooltip>
                </div>
            }
            {
                walletAdapter && isFilled && !walletPermissions[from.token.symbol] && !insufficientBalance &&
                <button className="btn btn-primary swap__btn"
                        onClick={handleAllowUseToken}>
                  Allow the TONSwap Protocol to use your {from.token!.symbol}
                </button>
            }
            {
                walletAdapter && <button className="btn btn-primary swap__btn"
                                         disabled={hasErrors}
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
                                                balances={walletBalances}
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
