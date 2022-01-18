import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import './AddLiquidityPage.scss';
import TokenInput from 'components/TokenInput';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
    selectWalletAdapter,
    selectWalletBalances,
    selectWalletConnectionStatus,
    selectWalletPermissions
} from 'store/wallet/walletSlice';
import {
    selectLiquidityInput0,
    selectLiquidityTxType,
    selectLiquidityInput1,
    setLiquidityInput0Amount,
    setLiquidityInput0Token,
    setLiquidityInput1Amount,
    setLiquidityInput1Token,
    switchLiquidityTokens,
    resetLiquidity,
    selectLiquidityLoading,
} from 'store/liquidity/liquiditySlice';
import {
    connectWallet,
    getWalletBalance,
    getWalletUseTokenPermission,
    setWalletUseTokenPermission
} from 'store/wallet/walletThunks';
import {
    estimateLiquidityTransaction,
    getLiquidityPoolToken,
    getLiquidityToken
} from 'store/liquidity/liquidityThunks';
import { EstimateTxType } from 'types/transactionInterfaces';
import { WALLET_TX_UPDATE_INTERVAL } from 'constants/swap';
import LiquidityInfo from './LiquidityInfo';
import AddLiquidityConfirm from './AddLiquidityConfirm';
import TokenUtils from 'utils/tokenUtils';
import { WalletStatus, WalletType } from 'types/walletAdapterInterface';
import DexForm from 'components/DexForm';
import Button from 'components/Button';

export function AddLiquidityPage() {
    const dispatch = useAppDispatch();
    const {token0, token1} = useParams();
    const {t} = useTranslation();

    const [showAddLiquidityConfirm, setShowAddLiquidityConfirm] = useState(false);
    const walletAdapter = useAppSelector(selectWalletAdapter);
    const walletBalances = useAppSelector(selectWalletBalances);
    const walletPermissions = useAppSelector(selectWalletPermissions);
    const walletConnectionStatus = useAppSelector(selectWalletConnectionStatus);
    const input0 = useAppSelector(selectLiquidityInput0);
    const input1 = useAppSelector(selectLiquidityInput1);
    const txType = useAppSelector(selectLiquidityTxType);
    const loading = useAppSelector(selectLiquidityLoading);

    const isFilled = useMemo(() => {
        return TokenUtils.isFilled(input0) && TokenUtils.isFilled(input1)
    }, [input0, input1]);

    const insufficientToken0Balance = useMemo(() => {
        if (TokenUtils.isFilled(input0)) {
            return TokenUtils.compareAmount(input0, walletBalances[input0.token.symbol]) === 1;
        }
        return false;
    }, [input0, walletBalances]);

    const insufficientToken1Balance = useMemo(() => {
        if (TokenUtils.isFilled(input1)) {
            return TokenUtils.compareAmount(input1, walletBalances[input1.token.symbol]) === 1;
        }
        return false;
    }, [input1, walletBalances]);

    const insufficientBalance = useMemo(() => {
        return insufficientToken0Balance || insufficientToken1Balance;
    }, [insufficientToken0Balance, insufficientToken1Balance]);

    const supplyButtonText = useMemo(() => {
        if (!TokenUtils.isFilled(input0)) {
            return t('Enter an amount');
        }
        if (!input1.token || !input0.token) {
            return t('Invalid pair');
        }
        if (insufficientToken0Balance) {
            return t(`Insufficient {{symbol0}} balance`, {symbol0: input0.token.symbol});
        }
        if (insufficientToken1Balance) {
            return t(`Insufficient {{symbol0}} balance`, {symbol0: input1.token.symbol});
        }
        return t('Supply');
    }, [t, input0, input1, insufficientToken0Balance, insufficientToken1Balance]);

    useEffect(() => {
        return () => {
            dispatch(resetLiquidity());
        };
    }, [dispatch]);

    useEffect(() => {
        if (token0) {
            dispatch(getLiquidityToken({address: token0, position: 'input0'}));
        }
        if (token1) {
            dispatch(getLiquidityToken({address: token1, position: 'input1'}));
        }
    }, [dispatch, token0, token1]);

    useEffect(() => {
        if (input0.token && input1.token) {
            dispatch(getLiquidityPoolToken({token0: input0.token, token1: input1.token}));
        }
    }, [dispatch, input0.token, input1.token])

    // Estimate EXACT_IN transaction
    useEffect((): any => {
        if (txType === EstimateTxType.EXACT_IN && !TokenUtils.hasAmount(input0)) {
            return dispatch(setLiquidityInput1Amount({
                value: null,
                txType,
            }));
        }
        if (txType === EstimateTxType.EXACT_IN && input1.token && TokenUtils.isFilled(input0)) {
            return dispatch(estimateLiquidityTransaction({
                input: input0,
                token: input1.token,
                txType,
            }))
        }
    }, [dispatch, input0, input1.token, txType]);

    // Estimate EXACT_OUT transaction
    useEffect((): any => {
        if (txType === EstimateTxType.EXACT_OUT && !TokenUtils.hasAmount(input1)) {
            return dispatch(setLiquidityInput0Amount({
                value: null,
                txType,
            }));
        }
        if (txType === EstimateTxType.EXACT_OUT && input0.token && TokenUtils.isFilled(input1)) {
            return dispatch(estimateLiquidityTransaction({
                input: input1,
                token: input0.token,
                txType: EstimateTxType.EXACT_OUT,
            }))
        }
    }, [dispatch, input0.token, input1, txType]);

    // Update balances and transaction estimation every {WALLET_TX_UPDATE_INTERVAL} milliseconds
    useEffect((): any => {
        if (!walletAdapter) {
            return;
        }
        const intervalId = setInterval(() => {
            if (input0.token) {
                dispatch(getWalletBalance(input0.token));
            }
            if (input1.token) {
                dispatch(getWalletBalance(input1.token));
            }
            if (txType === EstimateTxType.EXACT_IN && input1.token && TokenUtils.isFilled(input0)) {
                dispatch(estimateLiquidityTransaction({
                    input: input0,
                    token: input1.token,
                    txType,
                    source: 'auto',
                }));
            }
            if (txType === EstimateTxType.EXACT_OUT && input0.token && TokenUtils.isFilled(input1)) {
                dispatch(estimateLiquidityTransaction({
                    input: input1,
                    token: input0.token,
                    txType,
                    source: 'auto',
                }));
            }
        }, WALLET_TX_UPDATE_INTERVAL);
        return () => clearInterval(intervalId);
    }, [dispatch, walletAdapter, input0, input1, txType]);

    //Update balance and check token permissions on token0 update
    useEffect(() => {
        if (walletAdapter && input0.token) {
            dispatch(getWalletBalance(input0.token));
            dispatch(getWalletUseTokenPermission(input0.token));
        }
    }, [dispatch, input0.token, walletAdapter]);

    //Update balance and check token permissions on token1 update
    useEffect(() => {
        if (walletAdapter && input1.token) {
            dispatch(getWalletBalance(input1.token));
            dispatch(getWalletUseTokenPermission(input1.token));
        }
    }, [dispatch, input1.token, walletAdapter])

    const handleSwitchTokens = useCallback(() => {
        dispatch(switchLiquidityTokens());
    }, [dispatch]);

    const handleSelectToken = useCallback((input, token) => {
        if (!token) {
            return;
        }
        if (input1.token && input === 'input0' && input1.token.symbol === token.symbol) {
            return handleSwitchTokens();
        }
        if (input0.token && input === 'input1' && input0.token.symbol === token.symbol) {
            return handleSwitchTokens();
        }
        if (input === 'input0') {
            return dispatch(setLiquidityInput0Token(token));
        }
        dispatch(setLiquidityInput1Token(token));
    }, [dispatch, input0, input1, handleSwitchTokens]);

    const handleInput0TokenAmount = useCallback((value) => {
        dispatch(setLiquidityInput0Amount({
            value,
            txType: EstimateTxType.EXACT_IN
        }));
    }, [dispatch]);

    const handleInput1TokenAmount = useCallback((value) => {
        dispatch(setLiquidityInput1Amount({
            value,
            txType: EstimateTxType.EXACT_OUT
        }));
    }, [dispatch]);

    const handleAllowUseToken0 = useCallback(() => {
        dispatch(setWalletUseTokenPermission(input0.token!));
    }, [dispatch, input0]);

    const handleAllowUseToken1 = useCallback(() => {
        dispatch(setWalletUseTokenPermission(input1.token!));
    }, [dispatch, input1]);

    const handleConnectWallet = useCallback(() => {
        dispatch(connectWallet(WalletType.stubWallet));
    }, [dispatch]);

    const handleSupply = useCallback(() => {
        setShowAddLiquidityConfirm(true);
    }, []);

    return (
        <>
            <DexForm backLink="/pool"
                     header={t('Add Liquidity')}
                     headerTooltip={t('When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.')}
                     subheader={t('Add liquidity to receive LP tokens')}
                     content={
                          <>
                              <TokenInput token={input0.token}
                                          balance={walletBalances[input0.token?.symbol || '']}
                                          balancesFirst={true}
                                          value={input0.amount}
                                          showMax={true}
                                          onSelect={handleSelectToken.bind(null, 'input0')}
                                          onChange={handleInput0TokenAmount}
                                          selectable={true}
                                          editable={true}
                                          loading={txType === EstimateTxType.EXACT_OUT && loading}
                                          primary={txType === EstimateTxType.EXACT_IN}
                              />
                              <div className="btn-icon">
                                  +
                              </div>
                              <TokenInput token={input1.token}
                                          balance={walletBalances[input1.token?.symbol || '']}
                                          balancesFirst={true}
                                          value={input1.amount}
                                          showMax={true}
                                          onSelect={handleSelectToken.bind(null, 'input1')}
                                          onChange={handleInput1TokenAmount}
                                          selectable={true}
                                          editable={true}
                                          loading={txType === EstimateTxType.EXACT_IN && loading}
                                          primary={txType === EstimateTxType.EXACT_OUT}
                              />
                              {
                                  isFilled && <LiquidityInfo/>
                              }
                          </>
                      }
                     actions={
                          <>
                              {
                                  walletConnectionStatus === WalletStatus.CONNECTED &&
                                  isFilled &&
                                  !walletPermissions[input0.token!.symbol] &&
                                  !insufficientToken0Balance &&
                                <Button type={'primary'}
                                        className={'supply__btn'}
                                        onClick={handleAllowUseToken0}
                                >
                                  <Trans>
                                    Allow the TONSwap Protocol to use your {{symbol0: input0.token.symbol}}
                                  </Trans>
                                </Button>
                              }
                              {
                                  walletConnectionStatus === WalletStatus.CONNECTED &&
                                  isFilled &&
                                  !walletPermissions[input1.token!.symbol] &&
                                  !insufficientToken1Balance &&
                                <Button type={'primary'}
                                        className={'supply__btn'}
                                        onClick={handleAllowUseToken1}
                                >
                                  <Trans>
                                    Allow the TONSwap Protocol to use your {{symbol0: input1.token.symbol}}
                                  </Trans>
                                </Button>
                              }
                              {
                                  walletConnectionStatus === WalletStatus.CONNECTED &&
                                <Button type={'primary'}
                                        className={'supply__btn'}
                                        disabled={!isFilled
                                            || insufficientBalance
                                            || (!!input0.token && !walletPermissions[input0.token.symbol])
                                            || (!!input1.token && !walletPermissions[input1.token.symbol])
                                            || loading}
                                        loading={loading}
                                        onClick={handleSupply}
                                >
                                    {supplyButtonText}
                                </Button>
                              }
                              {
                                  walletConnectionStatus !== WalletStatus.CONNECTED &&
                                <Button type={'outline'}
                                        className={'supply__btn'}
                                        loading={walletConnectionStatus === WalletStatus.CONNECTING}
                                        onClick={handleConnectWallet}
                                >
                                    {t('Connect Wallet')}
                                </Button>
                              }
                          </>
                      }
            />
            {
                showAddLiquidityConfirm && <AddLiquidityConfirm onClose={() => setShowAddLiquidityConfirm(false)}/>
            }
        </>
    )
}

export default AddLiquidityPage;
