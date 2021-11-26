import './RemoveLiquidityPage.scss';
import TokenInput from '../../components/TokenInput';
import SettingsIcon from '../../components/icons/SettingsIcon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectWalletAdapter, selectWalletBalances } from '../../store/wallet/wallet.slice';
import {
    selectLiquidityOne,
    selectLiquidityTwo,
    setLiquidityOneAmount,
    setLiquidityTwoAmount,
    resetLiquidity,
    selectLiquidityPool,
    setLiquidityOneBurnAmount,
    setLiquidityTwoBurnAmount,
    setLiquidityPoolBurnAmount,
} from '../../store/liquidity/liquidity.slice';
import {
    getWalletBalance,
    getWalletUseTokenPermission,
} from '../../store/wallet/wallet.thunks';
import Settings from '../../components/Settings';
import BigNumber from 'bignumber.js';
import { Link, useParams } from 'react-router-dom';
import ChevronRightIcon from '../../components/icons/ChevronRightIcon';
import LiquidityInfo from './LiquidityInfo';
import AddLiquidityConfirm from './AddLiquidityConfirm';
import ChevronDownIcon from '../../components/icons/ChevronDownIcon';
import { fetchPoolToken } from '../../store/liquidity/liquidity.thunks';

export function RemoveLiquidityPage() {
    const dispatch = useAppDispatch();
    const params = useParams();

    const [showSettings, setShowSettings] = useState(false);
    const [supplyButtonText, setSupplyButtonText] = useState('Supply');
    const [showAddLiquidityConfirm, setShowAddLiquidityConfirm] = useState(false);
    const walletAdapter = useAppSelector(selectWalletAdapter);
    const one = useAppSelector(selectLiquidityOne);
    const two = useAppSelector(selectLiquidityTwo);
    const pool = useAppSelector(selectLiquidityPool);
    const walletBalances = useAppSelector(selectWalletBalances);

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
        if (params.oneToken && params.twoToken) {
            dispatch(fetchPoolToken(`${params.oneToken}:${params.twoToken}`));
        }
    }, [dispatch, params]);

    //Handle remove button text
    useEffect(() => {
        if (!one.amount || one.amount.eq('0')) {
            return setSupplyButtonText('Enter an amount');
        }
        if (one.token && insufficientFromBalance) {
            return setSupplyButtonText(`Insufficient ${one.token.symbol} balance`);
        }
        if (two.token && insufficientToBalance) {
            return setSupplyButtonText(`Insufficient ${two.token.symbol} balance`);
        }
        setSupplyButtonText('Remove');
    }, [one, two, insufficientFromBalance, insufficientToBalance]);

    //Update balance and check token permissions on one token update
    useEffect(() => {
        if (walletAdapter && one.token) {
            dispatch(getWalletBalance(one.token));
            dispatch(getWalletUseTokenPermission(one.token));
        }
    }, [dispatch, one.token, walletAdapter]);

    const handleOneTokenAmount = useCallback((value) => {
        dispatch(setLiquidityOneBurnAmount({
            value,
        }));
    }, [dispatch]);

    const handleTwoTokenAmount = useCallback((value) => {
        dispatch(setLiquidityTwoBurnAmount({
            value,
        }));
    }, [dispatch]);

    const handlePoolTokenAmount = useCallback((value) => {
        dispatch(setLiquidityPoolBurnAmount({
            value,
        }));
    }, [dispatch]);

    const handleSupply = useCallback(() => {
        setShowAddLiquidityConfirm(true);
    }, []);

    return (
        <div className="remove-liquidity-wrapper">
            <div className="remove-liquidity-header">
                <Link className="btn-icon" to="/pool">
                    <ChevronRightIcon/>
                </Link>
                <span className="text-semibold">Remove Liquidity</span>
                <div className="btn-icon" onClick={() => setShowSettings(!showSettings)}>
                    <SettingsIcon/>
                </div>
            </div>
            <TokenInput token={pool.token}
                        balance={pool.amount}
                        value={pool.burnAmount}
                        showMax={true}
                        onChange={handlePoolTokenAmount}
                        selectable={false}
                        editable={true}/>
            <div className="btn-icon">
                <ChevronDownIcon/>
            </div>
            <TokenInput token={one.token}
                        value={one.burnAmount}
                        balance={one.amount}
                        showMax={true}
                        onChange={handleOneTokenAmount}
                        selectable={false}
                        editable={true}/>
            <div className="btn-icon">
                +
            </div>
            <TokenInput token={two.token}
                        value={two.burnAmount}
                        balance={two.amount}
                        showMax={true}
                        onChange={handleTwoTokenAmount}
                        selectable={false}
                        editable={true}/>
            {
                isFilled && <LiquidityInfo />
            }
            <div className="actions-wrapper">
                {
                    walletAdapter && <button className="btn btn-primary remove__btn"
                                             disabled={!isFilled || insufficientBalance}
                                             onClick={handleSupply}>
                      Approve
                    </button>
                }
                {
                    walletAdapter && <button className="btn btn-primary remove__btn"
                                             disabled={!isFilled || insufficientBalance}
                                             onClick={handleSupply}>
                        {supplyButtonText}
                    </button>
                }
            </div>
            {
                showSettings && <Settings onClose={() => setShowSettings(false)}/>
            }
            {
                showAddLiquidityConfirm && <AddLiquidityConfirm onClose={() => setShowAddLiquidityConfirm(false)}/>
            }
        </div>
    )
}

export default RemoveLiquidityPage;
