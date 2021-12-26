import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import BigNumber from 'bignumber.js';

import './RemoveLiquidityPage.scss';
import TokenInput from 'components/TokenInput';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectWalletAdapter } from 'store/wallet/walletSlice';
import {
    selectLiquidityInput0,
    selectLiquidityInput1,
    resetLiquidity,
    selectLiquidityPool,
    setLiquidityInput0RemoveAmount,
    setLiquidityInput1RemoveAmount,
    setLiquidityPoolRemoveAmount,
    selectLiquidityRemoveApproveTx,
    setLiquidityPercentRemoveAmount,
} from 'store/liquidity/liquiditySlice';
import {
    getWalletBalance,
    getWalletUseTokenPermission,
} from 'store/wallet/walletThunks';
import LiquidityInfo from 'pages/AddLiquidity/LiquidityInfo';
import ChevronDownIcon from 'components/icons/ChevronDownIcon';
import { approveRemove, getLiquidityPool } from 'store/liquidity/liquidityThunks';
import TokenUtils from 'utils/tokenUtils';
import { TxStatus } from 'types/transactionInterfaces';
import RemoveLiquidityConfirm from './RemoveLiquidityConfirm';
import InputSlider from 'components/InputSlider';
import DexForm from 'components/DexForm';
import Button from 'components/Button';

export function RemoveLiquidityPage() {
    const dispatch = useAppDispatch();
    const {token0, token1} = useParams();
    const { t } = useTranslation();

    const [showRemoveLiquidityConfirm, setShowRemoveLiquidityConfirm] = useState(false);
    const walletAdapter = useAppSelector(selectWalletAdapter);
    const input0 = useAppSelector(selectLiquidityInput0);
    const input1 = useAppSelector(selectLiquidityInput1);
    const pool = useAppSelector(selectLiquidityPool);
    const removeApproveTx = useAppSelector(selectLiquidityRemoveApproveTx);

    const isFilled = useMemo(() => {
        return TokenUtils.isRemoveFilled(input0) && TokenUtils.isRemoveFilled(input1) && TokenUtils.hasRemoveAmount(pool);
    }, [input0, input1, pool]);

    const removePercent = useMemo(() => {
        if (!pool.removeAmount) {
            return '0';
        }
        const percent = new BigNumber(pool.removeAmount).div(pool.amount).multipliedBy('100');
        if (percent.gt('100') || percent.isNaN()) {
            return '0';
        }
        return percent.toFixed(0);
    }, [pool]);

    const removeButtonText = useMemo(() => {
        if (!TokenUtils.isRemoveFilled(input0) || !TokenUtils.isRemoveFilled(input1) || !TokenUtils.hasRemoveAmount(pool)) {
            return t('Enter an amount');
        }
        return t('Remove');
    }, [t, input0, input1, pool]);

    useEffect(() => {
        return () => {
            dispatch(resetLiquidity());
        };
    }, [dispatch]);

    useEffect(() => {
        if (token0 && token1) {
            dispatch(getLiquidityPool({
                token0: token0,
                token1: token1,
            }));
        }
    }, [dispatch, token0, token1]);

    //Update balance and check token permissions on token0 update
    useEffect(() => {
        if (walletAdapter && input0.token) {
            dispatch(getWalletBalance(input0.token));
            dispatch(getWalletUseTokenPermission(input0.token));
        }
    }, [dispatch, input0.token, walletAdapter]);

    const handleInputSliderChange = useCallback((value) => {
        dispatch(setLiquidityPercentRemoveAmount({
            value,
        }));
    }, [dispatch])

    const handleToken0Amount = useCallback((value) => {
        dispatch(setLiquidityInput0RemoveAmount({
            value,
        }));
    }, [dispatch]);

    const handleToken1Amount = useCallback((value) => {
        dispatch(setLiquidityInput1RemoveAmount({
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
        <>
            <DexForm backLink={'/pool'}
                     header={t('Remove Liquidity')}
                     headerTooltip={t('Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.')}
                     subheader={<Trans>
                         To receive {{symbol0: input0.token?.symbol}} and {{symbol1: input1.token?.symbol}}
                     </Trans>}
                     content={
                         <>
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
                             <TokenInput token={input0.token}
                                         value={input0.removeAmount}
                                         balance={input0.amount}
                                         showMax={true}
                                         onChange={handleToken0Amount}
                                         selectable={false}
                                         editable={true}/>
                             <div className="btn-icon">
                                 +
                             </div>
                             <TokenInput token={input1.token}
                                         value={input1.removeAmount}
                                         balance={input1.amount}
                                         showMax={true}
                                         onChange={handleToken1Amount}
                                         selectable={false}
                                         editable={true}/>
                             <LiquidityInfo />
                         </>
                     }
                     actions={
                         <div className="actions-wrapper">
                             {
                                 walletAdapter &&
                               <Button type={'primary'}
                                       className={'remove__btn'}
                                       disabled={!isFilled || [TxStatus.PENDING, TxStatus.CONFIRMED].indexOf(removeApproveTx.status) > -1}
                                       loading={removeApproveTx.status === TxStatus.PENDING}
                                       onClick={handleApprove}
                               >
                                   {t('Approve')}
                               </Button>
                             }
                             {
                                 walletAdapter &&
                               <Button type={'primary'}
                                       className={'remove__btn'}
                                       disabled={!isFilled || removeApproveTx.status !== TxStatus.CONFIRMED}
                                       onClick={handleSupply}
                               >
                                   {removeButtonText}
                               </Button>
                             }
                         </div>
                     }
            />
            {
                showRemoveLiquidityConfirm && <RemoveLiquidityConfirm onClose={() => setShowRemoveLiquidityConfirm(false)}/>
            }
        </>
    )
}

export default RemoveLiquidityPage;
