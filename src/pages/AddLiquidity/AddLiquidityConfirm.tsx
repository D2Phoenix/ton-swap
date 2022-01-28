import React, { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { DEFAULT_SLIPPAGE } from 'constants/swap';

import { TxStatus } from 'types/transactionInterfaces';

import TokenUtils from 'utils/tokenUtils';

import Button from 'components/Button';
import TokenInput from 'components/TokenInput';

import { selectSettings } from 'store/app/appSlice';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectLiquidityInput0, selectLiquidityInput1, selectLiquidityPool } from 'store/liquidity/liquiditySlice';
import { walletAddLiquidity } from 'store/wallet/walletThunks';

import './AddLiquidityConfirm.scss';
import LiquidityInfo from './LiquidityInfo';

interface AddLiquidityConfirmProps {
  onClose: (result?: boolean) => void;
}

export const AddLiquidityConfirmOptions = {
  header: 'Confirm Supply',
  className: 'add-liquidity-confirm-modal',
};

function AddLiquidityConfirm({ onClose }: AddLiquidityConfirmProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const input0 = useAppSelector(selectLiquidityInput0);
  const input1 = useAppSelector(selectLiquidityInput1);
  const pool = useAppSelector(selectLiquidityPool);
  const settings = useAppSelector(selectSettings);

  const poolDisplay = useMemo(() => {
    return TokenUtils.toDisplay(pool);
  }, [pool]);

  const handleConfirmSupply = useCallback(() => {
    dispatch(walletAddLiquidity({ input0, input1 }));
    onClose(true);
  }, [dispatch]);

  return (
    <div className="add-liquidity-confirm-wrapper">
      <TokenInput token={input0.token} value={input0.amount} showMax={true} selectable={false} editable={false} />
      <div className="btn-icon">+</div>
      <TokenInput token={input1.token} value={input1.amount} showMax={false} selectable={false} editable={false} />
      <LiquidityInfo />
      <div className="pool-tokens-info">
        <span>{t('You will receive')} </span>
        <span className="text-semibold">{poolDisplay}</span>
        <span>
          {input0.token?.symbol}/{input1.token?.symbol} {t('Pool Tokens')}
        </span>
      </div>
      {
        <span className="help-text text-small">
          <Trans>
            Output is estimated. If the price changes by more than {{ slippage: settings.slippage || DEFAULT_SLIPPAGE }}
            % your transaction will revert.
          </Trans>
        </span>
      }
      <Button variant={'primary'} className={'supply__btn'} onClick={handleConfirmSupply}>
        {t('Confirm Supply')}
      </Button>
    </div>
  );
}

export default AddLiquidityConfirm;
