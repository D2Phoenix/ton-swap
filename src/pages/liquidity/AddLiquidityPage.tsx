import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import './AddLiquidityPage.scss';
import TokenInput from 'components/TokenInput';
import SettingsIcon from 'components/icons/SettingsIcon';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectWalletAdapter, selectWalletBalances, selectWalletPermissions } from 'store/wallet/wallet.slice';
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
} from 'store/liquidity/liquidity.slice';
import {
    connectWallet,
    getWalletBalance, getWalletBalances,
    getWalletUseTokenPermission,
    setWalletUseTokenPermission
} from 'store/wallet/wallet.thunks';
import { selectTokens } from 'store/app/app.slice';
import {
    estimateLiquidityTransaction,
    getLiquidityPoolToken,
    getLiquidityToken
} from 'store/liquidity/liquidity.thunks';
import { EstimateTxType } from 'types/transactionInterfaces';
import TokenSelect from 'components/TokenSelect';
import Settings from 'components/Settings';
import { WALLET_TX_UPDATE_INTERVAL } from 'constants/swap';
import ChevronRightIcon from 'components/icons/ChevronRightIcon';
import LiquidityInfo from './LiquidityInfo';
import AddLiquidityConfirm from './AddLiquidityConfirm';
import TokenUtils from 'utils/tokenUtils';
import QuestionIcon from 'components/icons/QuestionIcon';
import Tooltip from 'components/Tooltip';

export function AddLiquidityPage() {
    const dispatch = useAppDispatch();
    const params = useParams();

    const [showSettings, setShowSettings] = useState(false);
    const [showTokenSelect, setShowTokenSelect] = useState(false);
    const [activeInput, setActiveInput] = useState('input0');
    const [supplyButtonText, setSupplyButtonText] = useState('Supply');
    const [showAddLiquidityConfirm, setShowAddLiquidityConfirm] = useState(false);
    const walletAdapter = useAppSelector(selectWalletAdapter);
    const walletBalances = useAppSelector(selectWalletBalances);
    const walletPermissions = useAppSelector(selectWalletPermissions);
    const tokens = useAppSelector(selectTokens);
    const input0 = useAppSelector(selectLiquidityInput0);
    const input1 = useAppSelector(selectLiquidityInput1);
    const txType = useAppSelector(selectLiquidityTxType);

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

    useEffect(() => {
        return () => {
            dispatch(resetLiquidity());
        };
    }, [dispatch]);

    useEffect(() => {
        if (params.token0) {
            dispatch(getLiquidityToken({address: params.token0, position: 'input0'}));
        }
        if (params.token1) {
            dispatch(getLiquidityToken({address: params.token1, position: 'input1'}));
        }
    }, [dispatch, params]);

    useEffect(() => {
        if (input0.token && input1.token) {
            dispatch(getLiquidityPoolToken({token0: input0.token, token1: input1.token}));
        }
    }, [dispatch, input0.token, input1.token])

    //Handle supply button text
    useEffect(() => {
        if (!TokenUtils.isFilled(input0)) {
            return setSupplyButtonText('Enter an amount');
        }
        if (!input1.token || !input0.token) {
            return setSupplyButtonText('Invalid pair');
        }
        if (insufficientToken0Balance) {
            return setSupplyButtonText(`Insufficient ${input0.token.symbol} balance`);
        }
        if (insufficientToken1Balance) {
            return setSupplyButtonText(`Insufficient ${input1.token.symbol} balance`);
        }
        setSupplyButtonText('Supply');
    }, [input0, input1, insufficientToken0Balance, insufficientToken1Balance]);

    // Estimate EXACT_IN transaction
    useEffect((): any => {
        if (txType === EstimateTxType.EXACT_IN && !TokenUtils.hasAmount(input0)) {
            return dispatch(setLiquidityInput1Amount({
                value: null,
                txType,
            }));
        }
        if (txType === EstimateTxType.EXACT_IN && input1.token && TokenUtils.hasAmount(input0)) {
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
        if (txType === EstimateTxType.EXACT_OUT && input0.token && TokenUtils.hasAmount(input1)) {
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
                }));
            }
            if (txType === EstimateTxType.EXACT_OUT && input0.token && TokenUtils.isFilled(input1)) {
                dispatch(estimateLiquidityTransaction({
                    input: input1,
                    token: input0.token,
                    txType,
                }));
            }
        }, WALLET_TX_UPDATE_INTERVAL);
        return () => clearInterval(intervalId);
    },[dispatch, walletAdapter, input0, input1, txType]);

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


    const openTokenSelect = useCallback((activeInput) => {
        setShowTokenSelect(!showTokenSelect);
        setActiveInput(activeInput);
        if (walletAdapter) {
            dispatch(getWalletBalances(tokens));
        }
    }, [showTokenSelect, dispatch, walletAdapter, tokens]);

    const handleSwitchTokens = useCallback(() => {
        dispatch(switchLiquidityTokens());
    }, [dispatch]);

    const handleSelectToken = useCallback((token) => {
        setShowTokenSelect(false);
        if (!token) {
            return;
        }
        if (input1.token && activeInput === 'input0' && input1.token.symbol === token.symbol) {
            return handleSwitchTokens();
        }
        if (input0.token && activeInput === 'input1' && input0.token.symbol === token.symbol) {
            return handleSwitchTokens();
        }
        if (activeInput === 'input0') {
            return dispatch(setLiquidityInput0Token(token));
        }
        dispatch(setLiquidityInput1Token(token));
    }, [dispatch, input0, input1, activeInput, handleSwitchTokens]);

    const handleFromTokenAmount = useCallback((value) => {
        dispatch(setLiquidityInput0Amount({
            value,
            txType: EstimateTxType.EXACT_IN
        }));
    }, [dispatch]);

    const handleToTokenAmount = useCallback((value) => {
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
        dispatch(connectWallet());
    }, [dispatch]);

    const handleSupply = useCallback(() => {
        setShowAddLiquidityConfirm(true);
    }, []);

    return (
        <div className="add-liquidity-wrapper">
            <div className="add-liquidity-header">
                <Link className="btn-icon chevron" to="/pool">
                    <ChevronRightIcon/>
                </Link>
                <div className="text-semibold">
                    Add Liquidity
                    <Tooltip content={<span className="text-small">When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.</span>}
                             direction="bottom">
                        <div className="btn-icon">
                            <QuestionIcon />
                        </div>
                    </Tooltip>
                </div>
                <div className="btn-icon" onClick={() => setShowSettings(!showSettings)}>
                    <SettingsIcon/>
                </div>
            </div>
            <TokenInput token={input0.token}
                        balance={walletBalances[input0.token?.symbol || '']}
                        value={input0.amount}
                        showMax={true}
                        onSelect={openTokenSelect.bind(null, 'input0')}
                        onChange={handleFromTokenAmount}
                        selectable={true}
                        editable={true}/>
            <div className="btn-icon">
                +
            </div>
            <TokenInput token={input1.token}
                        balance={walletBalances[input1.token?.symbol || '']}
                        value={input1.amount}
                        showMax={true}
                        onSelect={openTokenSelect.bind(null, 'input1')}
                        onChange={handleToTokenAmount}
                        selectable={true}
                        editable={true}/>
            {
                isFilled && <LiquidityInfo />
            }
            {
                walletAdapter && isFilled && !walletPermissions[input0.token!.symbol] && !insufficientToken0Balance &&
                <button className="btn btn-primary supply__btn"
                        onClick={handleAllowUseToken0}>
                  Allow the TONSwap Protocol to use your {input0.token!.symbol}
                </button>
            }
            {
                walletAdapter && isFilled && !walletPermissions[input1.token!.symbol] && !insufficientToken1Balance &&
                <button className="btn btn-primary supply__btn"
                        onClick={handleAllowUseToken1}>
                  Allow the TONSwap Protocol to use your {input1.token!.symbol}
                </button>
            }
            {
                walletAdapter && <button className="btn btn-primary supply__btn"
                                         disabled={!isFilled
                                         || insufficientBalance
                                         || (!!input0.token && !walletPermissions[input0.token.symbol])
                                         || (!!input1.token && !walletPermissions[input1.token.symbol])
                                         }
                                         onClick={handleSupply}>
                    {supplyButtonText}
                </button>
            }
            {
                !walletAdapter && <button className="btn btn-outline supply__btn"
                                          onClick={handleConnectWallet}>Connect Wallet</button>
            }
            {
                showSettings && <Settings onClose={() => setShowSettings(false)}/>
            }
            {
                showTokenSelect && <TokenSelect tokens={tokens}
                                                balances={walletBalances}
                                                balancesFirst={true}
                                                onClose={handleSelectToken}
                                                onSelect={handleSelectToken}/>
            }
            {
                showAddLiquidityConfirm && <AddLiquidityConfirm onClose={() => setShowAddLiquidityConfirm(false)}/>
            }
        </div>
    )
}

export default AddLiquidityPage;
