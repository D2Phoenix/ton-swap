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
    setLiquidityOneRemoveAmount,
    setLiquidityTwoRemoveAmount,
    setLiquidityPoolRemoveAmount,
    selectLiquidityRemoveApproveTx, setLiquidityPercentRemoveAmount,
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
import { approveRemove, getLiquidityPool } from '../../store/liquidity/liquidity.thunks';
import TokenUtils from '../../utils/tokenUtils';
import { WalletTxStatus } from '../../interfaces/transactionInterfaces';
import Spinner from '../../components/Spinner';
import RemoveLiquidityConfirm from './RemoveLiquidityConfirm';
import InputSlider from '../../components/InputSlider';
import QuestionIcon from '../../components/icons/QuestionIcon';
import Tooltip from '../../components/Tooltip';

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
    const removeApproveTx = useAppSelector(selectLiquidityRemoveApproveTx);

    const isFilled = useMemo(() => {
        return TokenUtils.isRemoveFilled(one) && TokenUtils.isRemoveFilled(two) && TokenUtils.hasRemoveAmount(pool);
    }, [one, two, pool]);

    const removePercent = useMemo(() => {
        if (!pool.removeAmount) {
            return '0';
        }
        const percent = pool.removeAmount.div(pool.amount).multipliedBy('100');
        if (percent.gt('100') || percent.isNaN()) {
            return '0';
        }
        return percent.toFixed(0);
    }, [pool])

    useEffect(() => {
        return () => {
            dispatch(resetLiquidity());
        };
    }, [dispatch]);

    useEffect(() => {
        if (params.token0 && params.token1) {
            dispatch(getLiquidityPool(`${params.token0}:${params.token1}`));
        }
    }, [dispatch, params]);

    //Handle remove button text
    useEffect(() => {
        if (!TokenUtils.isRemoveFilled(one) || !TokenUtils.isRemoveFilled(two) || !TokenUtils.hasRemoveAmount(pool)) {
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

    const handleInputSliderChange = useCallback((value) => {
        dispatch(setLiquidityPercentRemoveAmount({
            value,
        }));
    }, [dispatch])

    const handleOneTokenAmount = useCallback((value) => {
        dispatch(setLiquidityOneRemoveAmount({
            value,
        }));
    }, [dispatch]);

    const handleTwoTokenAmount = useCallback((value) => {
        dispatch(setLiquidityTwoRemoveAmount({
            value,
        }));
    }, [dispatch]);

    const handlePoolTokenAmount = useCallback((value) => {
        dispatch(setLiquidityPoolRemoveAmount({
            value,
        }));
    }, [dispatch]);

    const handleApprove = useCallback(() => {
        dispatch(approveRemove(pool))
    }, [dispatch, pool]);

    const handleSupply = useCallback(() => {
        setShowRemoveLiquidityConfirm(true);
    }, []);

    return (
        <div className="remove-liquidity-wrapper">
            <div className="remove-liquidity-header">
                <Link className="btn-icon chevron" to="/pool">
                    <ChevronRightIcon/>
                </Link>
                <div className="text-semibold">
                    Remove Liquidity
                    <Tooltip content={<span className="text-small">Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.</span>}
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
            <InputSlider value={removePercent} pnChange={handleInputSliderChange}/>
            <TokenInput token={pool.token}
                        balance={pool.amount}
                        value={pool.removeAmount}
                        showMax={true}
                        onChange={handlePoolTokenAmount}
                        selectable={false}
                        editable={true}/>
            <div className="btn-icon">
                <ChevronDownIcon/>
            </div>
            <TokenInput token={one.token}
                        value={one.removeAmount}
                        balance={one.amount}
                        showMax={true}
                        onChange={handleOneTokenAmount}
                        selectable={false}
                        editable={true}/>
            <div className="btn-icon">
                +
            </div>
            <TokenInput token={two.token}
                        value={two.removeAmount}
                        balance={two.amount}
                        showMax={true}
                        onChange={handleTwoTokenAmount}
                        selectable={false}
                        editable={true}/>
            <LiquidityInfo />
            <div className="actions-wrapper">
                {
                    walletAdapter && <button className="btn btn-primary remove__btn"
                                             disabled={!isFilled || [WalletTxStatus.PENDING, WalletTxStatus.CONFIRMED].indexOf(removeApproveTx.status) > -1}
                                             onClick={handleApprove}>
                        {
                            removeApproveTx.status === WalletTxStatus.PENDING && <Spinner className="btn"/>
                        }
                        {
                            removeApproveTx.status !== WalletTxStatus.PENDING && 'Approve'
                        }
                    </button>
                }
                {
                    walletAdapter && <button className="btn btn-primary remove__btn"
                                             disabled={!isFilled || removeApproveTx.status !== WalletTxStatus.CONFIRMED}
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
