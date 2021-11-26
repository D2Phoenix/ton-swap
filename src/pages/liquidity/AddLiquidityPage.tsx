import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BigNumber from 'bignumber.js';

import './AddLiquidityPage.scss';
import TokenInput from 'components/TokenInput';
import SettingsIcon from 'components/icons/SettingsIcon';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectWalletAdapter, selectWalletBalances, selectWalletPermissions } from 'store/wallet/wallet.slice';
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
import { TxType } from 'interfaces/transactionInterfaces';
import TokenSelect from 'components/TokenSelect';
import Settings from 'components/Settings';
import { WALLET_TX_UPDATE_INTERVAL } from 'constants/swap';
import ChevronRightIcon from 'components/icons/ChevronRightIcon';
import LiquidityInfo from './LiquidityInfo';
import AddLiquidityConfirm from './AddLiquidityConfirm';
import TokenUtils from '../../utils/tokenUtils';

export function AddLiquidityPage() {
    const dispatch = useAppDispatch();
    const params = useParams();

    const [showSettings, setShowSettings] = useState(false);
    const [showTokenSelect, setShowTokenSelect] = useState(false);
    const [tokenSelectType, setTokenSelectType] = useState('from');
    const [supplyButtonText, setSupplyButtonText] = useState('Supply');
    const [showAddLiquidityConfirm, setShowAddLiquidityConfirm] = useState(false);
    const walletAdapter = useAppSelector(selectWalletAdapter);
    const walletBalances = useAppSelector(selectWalletBalances);
    const walletPermissions = useAppSelector(selectWalletPermissions);
    const tokens = useAppSelector(selectTokens);
    const one = useAppSelector(selectLiquidityOne);
    const two = useAppSelector(selectLiquidityTwo);
    const txType = useAppSelector(selectLiquidityTxType);

    const isFilled = useMemo(() => {
        return TokenUtils.isFilled(one) && TokenUtils.isFilled(two)
    }, [one, two]);

    const insufficientOneBalance = useMemo(() => {
        if (TokenUtils.isFilled(one)) {
            return TokenUtils.compareAmount(one, walletBalances[one.token.symbol]) === 1;
        }
        return false;
    }, [one, walletBalances]);

    const insufficientTwoBalance = useMemo(() => {
        if (TokenUtils.isFilled(two)) {
            return TokenUtils.compareAmount(two, walletBalances[two.token.symbol]) === 1;
        }
        return false;
    }, [two, walletBalances]);

    const insufficientBalance = useMemo(() => {
        return insufficientOneBalance || insufficientTwoBalance;
    }, [insufficientOneBalance, insufficientTwoBalance]);

    useEffect(() => {
        return () => {
            dispatch(resetLiquidity());
        };
    }, [dispatch]);

    useEffect(() => {
        if (params.oneToken) {
            dispatch(getLiquidityToken({address: params.oneToken, position: 'one'}));
        }
        if (params.twoToken) {
            dispatch(getLiquidityToken({address: params.twoToken, position: 'two'}));
        }
    }, [dispatch, params]);

    useEffect(() => {
        if (one.token && two.token) {
            dispatch(getLiquidityPoolToken({one: one.token, two: two.token}));
        }
    }, [dispatch, one.token, two.token])

    //Handle supply button text
    useEffect(() => {
        if (!TokenUtils.isFilled(one)) {
            return setSupplyButtonText('Enter an amount');
        }
        if (!two.token || !one.token) {
            return setSupplyButtonText('Invalid pair');
        }
        if (insufficientOneBalance) {
            return setSupplyButtonText(`Insufficient ${one.token.symbol} balance`);
        }
        if (insufficientTwoBalance) {
            return setSupplyButtonText(`Insufficient ${two.token.symbol} balance`);
        }
        setSupplyButtonText('Supply');
    }, [one, two, insufficientOneBalance, insufficientTwoBalance]);

    // Estimate EXACT_IN transaction
    useEffect((): any => {
        if (txType === TxType.EXACT_IN && !TokenUtils.hasAmount(one)) {
            return dispatch(setLiquidityTwoAmount({
                value: null,
                txType,
            }));
        }
        if (txType === TxType.EXACT_IN && two.token && TokenUtils.hasAmount(one)) {
            return dispatch(estimateLiquidityTransaction({
                in: one,
                token: two.token,
                txType,
            }))
        }
    }, [dispatch, one, two.token, txType]);

    // Estimate EXACT_OUT transaction
    useEffect((): any => {
        if (txType === TxType.EXACT_OUT && !TokenUtils.hasAmount(two)) {
            return dispatch(setLiquidityOneAmount({
                value: null,
                txType,
            }));
        }
        if (txType === TxType.EXACT_OUT && one.token && TokenUtils.hasAmount(two)) {
            return dispatch(estimateLiquidityTransaction({
                token: one.token,
                out: two,
                txType: TxType.EXACT_OUT,
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
            if (txType === TxType.EXACT_IN && two.token && TokenUtils.isFilled(one)) {
                dispatch(estimateLiquidityTransaction({
                    in: one,
                    token: two.token,
                    txType,
                }));
            }
            if (txType === TxType.EXACT_OUT && one.token && TokenUtils.isFilled(two)) {
                dispatch(estimateLiquidityTransaction({
                    token: one.token,
                    out: two,
                    txType,
                }));
            }
        }, WALLET_TX_UPDATE_INTERVAL);
        return () => clearInterval(intervalId);
    },[dispatch, walletAdapter, one, two, txType]);

    //Update balance and check token permissions on one token update
    useEffect(() => {
        if (walletAdapter && one.token) {
            dispatch(getWalletBalance(one.token));
            dispatch(getWalletUseTokenPermission(one.token));
        }
    }, [dispatch, one.token, walletAdapter]);

    //Update balance and check token permissions on two token update
    useEffect(() => {
        if (walletAdapter && two.token) {
            dispatch(getWalletBalance(two.token));
            dispatch(getWalletUseTokenPermission(two.token));
        }
    }, [dispatch, two.token, walletAdapter])


    const openOneTokenSelect = useCallback(() => {
        setShowTokenSelect(!showTokenSelect);
        setTokenSelectType('one');
        if (walletAdapter) {
            dispatch(getWalletBalances(tokens));
        }
    }, [showTokenSelect, dispatch, walletAdapter, tokens]);

    const openTwoTokenSelect = useCallback(() => {
        setShowTokenSelect(!showTokenSelect);
        setTokenSelectType('two');
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
        if (two.token && tokenSelectType === 'one' && two.token.symbol === token.symbol) {
            return handleSwitchTokens();
        }
        if (one.token && tokenSelectType === 'two' && one.token.symbol === token.symbol) {
            return handleSwitchTokens();
        }
        if (tokenSelectType === 'one') {
            return dispatch(setLiquidityOneToken(token));
        }
        dispatch(setLiquidityTwoToken(token));
    }, [dispatch, one, two, tokenSelectType, handleSwitchTokens]);

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
                        onSelect={openOneTokenSelect}
                        onChange={handleFromTokenAmount}
                        selectable={true}
                        editable={true}/>
            <div className="btn-icon">
                +
            </div>
            <TokenInput token={two.token}
                        balance={walletBalances[two.token?.symbol || '']}
                        value={two.amount}
                        showMax={true}
                        onSelect={openTwoTokenSelect}
                        onChange={handleToTokenAmount}
                        selectable={true}
                        editable={true}/>
            {
                isFilled && <LiquidityInfo />
            }
            {
                walletAdapter && isFilled && !walletPermissions[one.token!.symbol] && !insufficientOneBalance &&
                <button className="btn btn-primary supply__btn"
                        onClick={handleAllowUseOneToken}>
                  Allow the TONSwap Protocol to use your {one.token!.symbol}
                </button>
            }
            {
                walletAdapter && isFilled && !walletPermissions[two.token!.symbol] && !insufficientTwoBalance &&
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
