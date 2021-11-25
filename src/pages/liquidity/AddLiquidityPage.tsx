import './AddLiquidityPage.scss';
import TokenInput from '../../components/TokenInput';
import SettingsIcon from '../../components/icons/SettingsIcon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectWalletAdapter, selectWalletBalances, selectWalletPermissions } from '../../store/wallet/wallet.slice';
import {
    selectLiquidityOne,
    selectLiquidityTxType,
    selectLiquidityTwo,
    setLiquidityOneAmount,
    setLiquidityOneToken,
    setLiquidityTwoAmount,
    setLiquidityTwoToken,
    switchLiquidityTokens,
    resetLiquidity,
} from '../../store/liquidity/liquidity.slice';
import {
    connectWallet,
    getWalletBalance, getWalletBalances,
    getWalletUseTokenPermission,
    setWalletUseTokenPermission
} from '../../store/wallet/wallet.thunks';
import { TxType } from '../../interfaces/transactionInterfaces';
import TokenSelect from '../../components/TokenSelect';
import { selectTokens } from '../../store/app/app.slice';
import Settings from '../../components/Settings';
import BigNumber from 'bignumber.js';
import { estimateLiquidityTransaction, fetchOneToken, fetchTwoToken } from '../../store/liquidity/liquidity.thunks';
import { WALLET_TX_UPDATE_INTERVAL } from '../../constants/swap';
import { Link, useParams } from 'react-router-dom';
import ChevronRightIcon from '../../components/icons/ChevronRightIcon';
import LiquidityInfo from './LiquidityInfo';
import AddLiquidityConfirm from './AddLiquidityConfirm';

export function AddLiquidityPage() {
    const dispatch = useAppDispatch();
    const params = useParams();

    const [showSettings, setShowSettings] = useState(false);
    const [showTokenSelect, setShowTokenSelect] = useState(false);
    const [tokenSelectType, setTokenSelectType] = useState('from');
    const [supplyButtonText, setSupplyButtonText] = useState('Supply');
    const [showAddLiquidityConfirm, setShowAddLiquidityConfirm] = useState(false);
    const walletAdapter = useAppSelector(selectWalletAdapter);
    const tokens = useAppSelector(selectTokens);
    const one = useAppSelector(selectLiquidityOne);
    const two = useAppSelector(selectLiquidityTwo);
    const txType = useAppSelector(selectLiquidityTxType);
    const walletBalances = useAppSelector(selectWalletBalances);
    const walletPermissions = useAppSelector(selectWalletPermissions);

    const isFilled = useMemo(() => {
        return one.amount && two.amount && one.token && two.token
            && !two.amount.eq('0')
    }, [one, two]);
    const insufficientFromBalance = useMemo(() => {
        if (one.token && one.amount) {
            const balance = walletBalances[one.token.symbol] || new BigNumber('0');
            return one.amount.gt(balance);
        }
        return false;
    }, [one, walletBalances]);
    const insufficientToBalance = useMemo(() => {
        if (two.token && two.amount) {
            const balance = walletBalances[two.token.symbol] || new BigNumber('0');
            return two.amount.gt(balance);
        }
        return false;
    }, [two, walletBalances]);
    const insufficientBalance = useMemo(() => {
        return insufficientFromBalance || insufficientToBalance;
    }, [insufficientFromBalance, insufficientToBalance]);

    useEffect(() => {
        return () => {
            dispatch(resetLiquidity());
        };
    }, [dispatch]);

    useEffect(() => {
        if (params.oneToken) {
            dispatch(fetchOneToken(params.oneToken));
        }
        if (params.twoToken) {
            dispatch(fetchTwoToken(params.twoToken));
        }
    }, [dispatch, params]);

    //Handle swap button text
    useEffect(() => {
        if (!one.amount || one.amount.eq('0')) {
            return setSupplyButtonText('Enter an amount');
        }
        if (!two.token || !one.token) {
            return setSupplyButtonText('Invalid pair');
        }
        if (one.token && insufficientFromBalance) {
            return setSupplyButtonText(`Insufficient ${one.token.symbol} balance`);
        }
        if (two.token && insufficientToBalance) {
            return setSupplyButtonText(`Insufficient ${two.token.symbol} balance`);
        }
        setSupplyButtonText('Supply');
    }, [one, two, insufficientFromBalance, insufficientToBalance]);

    // Estimate EXACT_IN transaction
    useEffect((): any => {
        if (txType === TxType.EXACT_IN && (!one.amount || one.amount.eq('0'))) {
            return dispatch(setLiquidityTwoAmount({
                value: null,
                txType,
            }));
        }
        if (txType === TxType.EXACT_IN && two.token && one.token && one.amount && !one.amount.eq('0')) {
            return dispatch(estimateLiquidityTransaction({
                one,
                two: {
                    token: two.token,
                },
                txType,
            }))
        }
    }, [dispatch, one, two.token, txType]);
    // Estimate EXACT_OUT transaction
    useEffect((): any => {
        if (txType === TxType.EXACT_OUT && (!two.amount || two.amount.eq('0'))) {
            return dispatch(setLiquidityOneAmount({
                value: null,
                txType,
            }));
        }
        if (txType === TxType.EXACT_OUT && one.token && two.token && two.amount && !two.amount.eq('0')) {
            return dispatch(estimateLiquidityTransaction({
                one: {
                    token: one.token,
                },
                two: two,
                txType,
            }))
        }
    }, [dispatch, one.token, two, txType]);
    // Update balances and transaction estimation every {WALLET_TX_UPDATE_INTERVAL} milliseconds
    useEffect((): any => {
        if (!walletAdapter) {
            return;
        }
        const intervalId = setInterval(() => {
            if (one.token) {
                dispatch(getWalletBalance(one.token));
            }
            if (two.token) {
                dispatch(getWalletBalance(two.token));
            }
            if (one.token && two.token && one.amount && !one.amount.eq('0')) {
                dispatch(estimateLiquidityTransaction({
                    one: one,
                    two: two,
                    txType,
                }));
            }
        }, WALLET_TX_UPDATE_INTERVAL);
        return () => clearInterval(intervalId);
    },[dispatch, walletAdapter, one, two, txType]);

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
        dispatch(switchLiquidityTokens());
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
        if (two.token && tokenSelectType === 'from' && two.token.symbol === token.symbol) {
            return handleSwitchTokens();
        }
        if (one.token && tokenSelectType === 'to' && one.token.symbol === token.symbol) {
            return handleSwitchTokens();
        }
        if (tokenSelectType === 'from') {
            return dispatch(setLiquidityOneToken(token));
        }
        dispatch(setLiquidityTwoToken(token));
    }, [dispatch, one, two, tokenSelectType, walletAdapter, handleSwitchTokens]);

    const handleFromTokenAmount = useCallback((value) => {
        dispatch(setLiquidityOneAmount({
            value,
            txType: TxType.EXACT_IN
        }));
    }, [dispatch]);

    const handleToTokenAmount = useCallback((value) => {
        dispatch(setLiquidityTwoAmount({
            value,
            txType: TxType.EXACT_OUT
        }));
    }, [dispatch]);

    const handleAllowUseOneToken = useCallback(() => {
        dispatch(setWalletUseTokenPermission(one.token!));
    }, [dispatch, one]);

    const handleAllowUseTwoToken = useCallback(() => {
        dispatch(setWalletUseTokenPermission(two.token!));
    }, [dispatch, two]);

    const handleConnectWallet = useCallback(() => {
        dispatch(connectWallet());
    }, [dispatch]);

    const handleSupply = useCallback(() => {
        setShowAddLiquidityConfirm(true);
    }, []);

    return (
        <div className="add-liquidity-wrapper">
            <div className="add-liquidity-header">
                <Link className="btn-icon" to="/pool">
                    <ChevronRightIcon/>
                </Link>
                <span className="text-semibold">Add Liquidity</span>
                <div className="btn-icon" onClick={() => setShowSettings(!showSettings)}>
                    <SettingsIcon/>
                </div>
            </div>
            <TokenInput token={one.token}
                        balance={walletBalances[one.token?.symbol || '']}
                        value={one.amount}
                        showMax={true}
                        onSelect={openFromTokenSelect}
                        onChange={handleFromTokenAmount}
                        editable={true}/>
            <div className="btn-icon">
                +
            </div>
            <TokenInput token={two.token}
                        balance={walletBalances[two.token?.symbol || '']}
                        value={two.amount}
                        showMax={true}
                        onSelect={openToTokenSelect}
                        onChange={handleToTokenAmount}
                        editable={true}/>
            {
                isFilled && <LiquidityInfo />
            }
            {
                walletAdapter && isFilled && !walletPermissions[one.token!.symbol] && !insufficientFromBalance &&
                <button className="btn btn-primary supply__btn"
                        onClick={handleAllowUseOneToken}>
                  Allow the TONSwap Protocol to use your {one.token!.symbol}
                </button>
            }
            {
                walletAdapter && isFilled && !walletPermissions[two.token!.symbol] && !insufficientToBalance &&
                <button className="btn btn-primary supply__btn"
                        onClick={handleAllowUseTwoToken}>
                  Allow the TONSwap Protocol to use your {two.token!.symbol}
                </button>
            }
            {
                walletAdapter && <button className="btn btn-primary supply__btn"
                                         disabled={!isFilled
                                         || insufficientBalance
                                         || (!!one.token && !walletPermissions[one.token.symbol])
                                         || (!!two.token && !walletPermissions[two.token.symbol])
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
