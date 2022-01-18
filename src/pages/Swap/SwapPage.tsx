import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import './SwapPage.scss';
import ChevronDownIcon from 'components/icons/ChevronDownIcon';
import InfoIcon from 'components/icons/InfoIcon';
import TokenInput from 'components/TokenInput';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
    selectWalletAdapter,
    selectWalletBalances,
    selectWalletConnectionStatus,
    selectWalletPermissions
} from 'store/wallet/walletSlice';
import {
    connectWallet,
    getWalletBalance,
    getWalletUseTokenPermission,
    setWalletUseTokenPermission
} from 'store/wallet/walletThunks';
import { estimateTransaction, getSwapToken } from 'store/swap/swapThunks';
import { EstimateTxType } from 'types/transactionInterfaces';
import {
    selectSwapInput0,
    selectSwapInput1,
    selectSwapTxType,
    setSwapInput0Token,
    setSwapInput0Amount,
    setSwapInput1Token,
    setSwapInput1Amount,
    switchSwapTokens,
    resetSwap,
    selectSwapTrade, selectSwapLoading,
} from 'store/swap/swapSlice';
import SwapInfo from './SwapInfo';
import SwapConfirm from './SwapConfirm';
import Tooltip from 'components/Tooltip';
import { WALLET_TX_UPDATE_INTERVAL } from 'constants/swap';
import TokenUtils from 'utils/tokenUtils';
import { WalletStatus, WalletType } from 'types/walletAdapterInterface';
import DexForm from 'components/DexForm';
import Button from 'components/Button';

function SwapPage() {
    const dispatch = useAppDispatch();
    const {token0, token1} = useParams();
    const {t} = useTranslation();

    const [showSwapConfirm, setShowSwapConfirm] = useState(false);
    const input0 = useAppSelector(selectSwapInput0);
    const input1 = useAppSelector(selectSwapInput1);
    const txType = useAppSelector(selectSwapTxType);
    const trade = useAppSelector(selectSwapTrade);
    const loading = useAppSelector(selectSwapLoading);
    const walletBalances = useAppSelector(selectWalletBalances);
    const walletAdapter = useAppSelector(selectWalletAdapter);
    const walletConnectionStatus = useAppSelector(selectWalletConnectionStatus);
    const walletPermissions = useAppSelector(selectWalletPermissions);

    const isFilled = useMemo(() => {
        return TokenUtils.isFilled(input0) && TokenUtils.isFilled(input1);
    }, [input0, input1]);

    const insufficientBalance = useMemo(() => {
        if (TokenUtils.isFilled(input0)) {
            return TokenUtils.compareAmount(input0, walletBalances[input0.token.symbol]) === 1;
        }
        return false;
    }, [input0, walletBalances]);

    const hasErrors = useMemo(() => {
        return !isFilled ||
            insufficientBalance ||
            (!!input0.token && !walletPermissions[input0.token.symbol]) ||
            trade.insufficientLiquidity;
    }, [isFilled, insufficientBalance, input0, walletPermissions, trade]);

    const swapButtonText = useMemo(() => {
        if (trade.insufficientLiquidity && input0.amount) {
            return t(`Insufficient liquidity for this trade.`);
        }
        if (!TokenUtils.isFilled(input0)) {
            return t('Enter an amount');
        }
        if (!input1.token || !input0.token) {
            return t('Select a token');
        }
        if (insufficientBalance) {
            return t(`Insufficient {{symbol0}} balance`, {symbol0: input0.token.symbol});
        }
        return t('Swap');
    }, [t, input0, input1, insufficientBalance, trade]);

    useEffect(() => {
        return () => {
            dispatch(resetSwap());
        };
    }, [dispatch]);

    useEffect(() => {
        if (token0) {
            dispatch(getSwapToken({address: token0, position: 'input0'}));
        }
        if (token1) {
            dispatch(getSwapToken({address: token1, position: 'input1'}));
        }
    }, [dispatch, token0, token1]);

    // Estimate EXACT_IN transaction
    useEffect((): any => {
        if (txType !== EstimateTxType.EXACT_IN) {
            return;
        }
        if (!TokenUtils.hasAmount(input0)) {
            return dispatch(setSwapInput1Amount({
                value: null,
                txType,
            }));
        }
        if (input1.token && TokenUtils.isFilled(input0)) {
            return dispatch(estimateTransaction({
                input: input0,
                token: input1.token,
                txType,
            }))
        }
    }, [dispatch, input0, input1.token, txType]);

    // Estimate EXACT_OUT transaction
    useEffect((): any => {
        if (txType !== EstimateTxType.EXACT_OUT) {
            return;
        }
        if (!TokenUtils.hasAmount(input1)) {
            return dispatch(setSwapInput0Amount({
                value: null,
                txType,
            }));
        }
        if (input0.token && TokenUtils.isFilled(input1)) {
            return dispatch(estimateTransaction({
                input: input1,
                token: input0.token,
                txType,
            }))
        }
    }, [dispatch, input0.token, input1, txType]);

    // Update balances and transaction estimation every {WALLET_TX_UPDATE_INTERVAL} milliseconds
    useEffect((): any => {
        if (!walletAdapter) {
            return;
        }
        const intervalId = setInterval(() => {
            if (input1.token) {
                dispatch(getWalletBalance(input1.token));
            }
            if (input0.token) {
                dispatch(getWalletBalance(input0.token));
            }
            if (txType === EstimateTxType.EXACT_IN && input1.token && TokenUtils.isFilled(input0)) {
                dispatch(estimateTransaction({
                    input: input0,
                    token: input1.token,
                    txType,
                    source: 'auto',
                }));
            }
            if (txType === EstimateTxType.EXACT_OUT && input0.token && TokenUtils.isFilled(input1)) {
                dispatch(estimateTransaction({
                    input: input1,
                    token: input0.token,
                    txType,
                    source: 'auto',
                }));
            }
        }, WALLET_TX_UPDATE_INTERVAL);
        return () => clearInterval(intervalId);
    }, [dispatch, walletAdapter, input0, input1, txType]);

    const handleSwitchTokens = useCallback(() => {
        dispatch(switchSwapTokens());
    }, [dispatch]);

    const handleSelectToken = useCallback((input, token) => {
        if (!token) {
            return;
        }
        if (walletAdapter) {
            dispatch(getWalletBalance(token));
            dispatch(getWalletUseTokenPermission(token));
        }
        if (input === 'input0' && TokenUtils.compareToken(input1, token)) {
            return handleSwitchTokens();
        }
        if (input === 'input1' && TokenUtils.compareToken(input0, token)) {
            return handleSwitchTokens();
        }
        if (input === 'input0') {
            return dispatch(setSwapInput0Token(token));
        }
        dispatch(setSwapInput1Token(token));
    }, [dispatch, input0, input1, walletAdapter, handleSwitchTokens]);

    const handleInput0TokenAmount = useCallback((value) => {
        dispatch(setSwapInput0Amount({
            value,
            txType: EstimateTxType.EXACT_IN
        }));
    }, [dispatch]);

    const handleInput1TokenAmount = useCallback((value) => {
        dispatch(setSwapInput1Amount({
            value,
            txType: EstimateTxType.EXACT_OUT
        }));
    }, [dispatch]);

    const handleConnectWallet = useCallback(() => {
        dispatch(connectWallet(WalletType.stubWallet));
    }, [dispatch]);

    const handleAllowUseToken = useCallback(() => {
        dispatch(setWalletUseTokenPermission(input0.token));
    }, [dispatch, input0]);

    const handleSwap = useCallback(() => {
        setShowSwapConfirm(true);
    }, [])

    return (
        <>
            <DexForm header={t('Swap')}
                     subheader={t('Trade tokens in an instant')}
                     content={(
                         <>
                             <TokenInput token={input0.token}
                                         balance={walletBalances[input0.token?.symbol || '']}
                                         value={input0.amount}
                                         showMax={true}
                                         onSelect={handleSelectToken.bind(null, 'input0')}
                                         onChange={handleInput0TokenAmount}
                                         selectable={true}
                                         editable={true}
                                         loading={txType === EstimateTxType.EXACT_OUT && loading}
                                         primary={txType === EstimateTxType.EXACT_IN}
                             />
                             <div className="switch__btn btn-icon" onClick={handleSwitchTokens}>
                                 <ChevronDownIcon/>
                             </div>
                             <TokenInput token={input1.token}
                                         balance={walletBalances[input1.token?.symbol || '']}
                                         value={input1.amount}
                                         showMax={false}
                                         onSelect={handleSelectToken.bind(null, 'input1')}
                                         onChange={handleInput1TokenAmount}
                                         selectable={true}
                                         editable={true}
                                         loading={txType === EstimateTxType.EXACT_IN && loading}
                                         primary={txType === EstimateTxType.EXACT_OUT}
                             />
                             {
                                 isFilled &&
                               <div className={`swap-info text-small ${loading ? 'loading' : ''}`}>
                                <span className={`text-small`}>
                                  1 {input1.token.symbol} = {TokenUtils.getNumberDisplay(trade.rate)} {input0.token.symbol}
                                </span>
                                 <Tooltip content={<SwapInfo/>} direction="left">
                                   <div className="btn-icon">
                                     <InfoIcon/>
                                   </div>
                                 </Tooltip>
                               </div>
                             }
                         </>
                     )}
                     actions={(
                         <>
                             {
                                 walletConnectionStatus === WalletStatus.CONNECTED &&
                                 isFilled &&
                                 !insufficientBalance &&
                                 !walletPermissions[input0.token.symbol] &&
                               <Button type={'primary'}
                                       className={'swap__btn'}
                                       onClick={handleAllowUseToken}
                               >
                                 <Trans>
                                   Allow the TONSwap Protocol to use your {{symbol0: input0.token.symbol}}
                                 </Trans>
                               </Button>
                             }
                             {
                                 walletConnectionStatus === WalletStatus.CONNECTED &&
                               <Button type={'primary'}
                                       className={'swap__btn'}
                                       disabled={loading || hasErrors}
                                       loading={loading}
                                       onClick={handleSwap}
                               >
                                   {swapButtonText}
                               </Button>
                             }
                             {
                                 walletConnectionStatus !== WalletStatus.CONNECTED &&
                               <Button type={'outline'}
                                       className={'swap__btn'}
                                       loading={walletConnectionStatus === WalletStatus.CONNECTING}
                                       onClick={handleConnectWallet}
                               >
                                   {t('Connect Wallet')}
                               </Button>
                             }
                         </>
                     )}
            />
            {
                showSwapConfirm && <SwapConfirm onClose={() => setShowSwapConfirm(false)}/>
            }
        </>
    )
}

export default SwapPage;
