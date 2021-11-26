import './RemoveLiquidityPage.scss';
import TokenInput from '../../components/TokenInput';
import SettingsIcon from '../../components/icons/SettingsIcon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectWalletAdapter } from '../../store/wallet/wallet.slice';
import {
    selectLiquidityOne,
    selectLiquidityTwo,
    resetLiquidity,
    selectLiquidityPool,
    setLiquidityOneBurnAmount,
    setLiquidityTwoBurnAmount,
    setLiquidityPoolBurnAmount, selectLiquidityBurnApproveTx,
} from '../../store/liquidity/liquidity.slice';
import {
    getWalletBalance,
    getWalletUseTokenPermission,
} from '../../store/wallet/wallet.thunks';
import Settings from '../../components/Settings';
import { Link, useParams } from 'react-router-dom';
import ChevronRightIcon from '../../components/icons/ChevronRightIcon';
import LiquidityInfo from './LiquidityInfo';
import ChevronDownIcon from '../../components/icons/ChevronDownIcon';
import { approveBurn, fetchPoolToken } from '../../store/liquidity/liquidity.thunks';
import TokenUtils from '../../utils/tokenUtils';
import { WalletTxStatus } from '../../interfaces/transactionInterfaces';
import Spinner from '../../components/Spinner';
import RemoveLiquidityConfirm from './RemoveLiquidityConfirm';

export function RemoveLiquidityPage() {
    const dispatch = useAppDispatch();
    const params = useParams();

    const [showSettings, setShowSettings] = useState(false);
    const [removeButtonText, setRemoveButtonText] = useState('Remove');
    const [showRemoveLiquidityConfirm, setShowRemoveLiquidityConfirm] = useState(false);
    const walletAdapter = useAppSelector(selectWalletAdapter);
    const one = useAppSelector(selectLiquidityOne);
    const two = useAppSelector(selectLiquidityTwo);
    const pool = useAppSelector(selectLiquidityPool);
    const burnApproveTx = useAppSelector(selectLiquidityBurnApproveTx);

    const isFilled = useMemo(() => {
        return TokenUtils.isBurnFilled(one) && TokenUtils.isBurnFilled(two) && TokenUtils.hasBurnAmount(pool);
    }, [one, two, pool]);

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
        if (!TokenUtils.isBurnFilled(one) || !TokenUtils.isBurnFilled(two) || !TokenUtils.hasBurnAmount(pool)) {
            return setRemoveButtonText('Enter an amount');
        }
        setRemoveButtonText('Remove');
    }, [one, two, pool]);

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

    const handleApprove = useCallback(() => {
        dispatch(approveBurn(pool))
    }, [dispatch, pool]);

    const handleSupply = useCallback(() => {
        setShowRemoveLiquidityConfirm(true);
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
            <LiquidityInfo />
            <div className="actions-wrapper">
                {
                    walletAdapter && <button className="btn btn-primary remove__btn"
                                             disabled={!isFilled || [WalletTxStatus.PENDING, WalletTxStatus.CONFIRMED].indexOf(burnApproveTx.status) > -1}
                                             onClick={handleApprove}>
                        {
                            burnApproveTx.status === WalletTxStatus.PENDING && <Spinner className="btn"/>
                        }
                        {
                            burnApproveTx.status !== WalletTxStatus.PENDING && 'Approve'
                        }
                    </button>
                }
                {
                    walletAdapter && <button className="btn btn-primary remove__btn"
                                             disabled={!isFilled || burnApproveTx.status !== WalletTxStatus.CONFIRMED}
                                             onClick={handleSupply}>
                        {removeButtonText}
                    </button>
                }
            </div>
            {
                showSettings && <Settings onClose={() => setShowSettings(false)}/>
            }
            {
                showRemoveLiquidityConfirm && <RemoveLiquidityConfirm onClose={() => setShowRemoveLiquidityConfirm(false)}/>
            }
        </div>
    )
}

export default RemoveLiquidityPage;
