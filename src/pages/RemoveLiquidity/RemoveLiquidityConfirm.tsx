import { useCallback, useMemo } from 'react';

import './RemoveLiquidityConfirm.scss';
import Modal from 'components/Modal';
import TokenInput from 'components/TokenInput';
import LiquidityInfo from 'pages/AddLiquidity/LiquidityInfo';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
    selectLiquidityPool,
    selectLiquidityInput0,
    selectLiquidityInput1,
} from 'store/liquidity/liquiditySlice';
import { resetTransaction, selectWalletTransaction } from 'store/wallet/walletSlice';
import { DEFAULT_SLIPPAGE } from 'constants/swap';
import { TxStatus } from 'types/transactionInterfaces';
import {  walletRemoveLiquidity } from 'store/wallet/walletThunks';
import Spinner from 'components/Spinner';
import { selectSettings } from 'store/app/appSlice';
import TokenUtils from 'utils/tokenUtils';
import { getLiquidityPool } from 'store/liquidity/liquidityThunks';

function RemoveLiquidityConfirm({onClose}: any) {
    const dispatch = useAppDispatch();
    const input0 = useAppSelector(selectLiquidityInput0);
    const input1 = useAppSelector(selectLiquidityInput1);
    const pool = useAppSelector(selectLiquidityPool);
    const settings = useAppSelector(selectSettings);
    const walletTransaction = useAppSelector(selectWalletTransaction);

    const className = useMemo(() => {
        return walletTransaction.status !== TxStatus.INITIAL ? 'remove-liquidity-confirm-modal mini' : 'remove-liquidity-confirm-modal';
    }, [walletTransaction]);

    const token0RemoveDisplay = useMemo(() => {
        return TokenUtils.getRemoveDisplay(input0);
    }, [input0]);

    const token1RemoveDisplay = useMemo(() => {
        return TokenUtils.getRemoveDisplay(input1);
    }, [input1]);

    const poolRemoveDisplay = useMemo(() => {
        return TokenUtils.getRemoveDisplay(pool)
    }, [pool]);

    const handleConfirmRemove = useCallback(() => {
        dispatch(walletRemoveLiquidity());
    }, [dispatch]);

    const handleClose = useCallback(() => {
        dispatch(resetTransaction());
        if (walletTransaction.status === TxStatus.CONFIRMED) {
            dispatch(getLiquidityPool({
                token0: input0.token.address,
                token1: input1.token.address,
            }));
        }
        onClose && onClose();
    }, [dispatch, input0, input1, walletTransaction, onClose]);

    return (
        <Modal className={className} onClose={handleClose}>
            {
                walletTransaction.status === TxStatus.INITIAL && <>
                  <h4>Confirm Remove Liquidity</h4>
                  <div className="remove-liquidity-confirm-wrapper">
                    <span>You will receive</span>
                    <TokenInput token={input0.token}
                                value={input0.removeAmount}
                                showMax={true}
                                selectable={false}
                                editable={false}
                    />
                    <div className="btn-icon">
                      +
                    </div>
                    <TokenInput token={input1.token}
                                value={input1.removeAmount}
                                showMax={false}
                                selectable={false}
                                editable={false}
                    />
                    <LiquidityInfo/>
                    <div className="pool-tokens-info">
                      <span>You will burn </span>
                      <span className="text-semibold">{poolRemoveDisplay}</span>
                      <span> {input0.token.symbol}/{input1.token.symbol} Pool Tokens</span>
                    </div>
                    <span className="help-text text-small">
                      Output is estimated. If the price changes by more than {settings.slippage || DEFAULT_SLIPPAGE}% your transaction will revert.
                    </span>
                    <button className="btn btn-primary remove__btn"
                            onClick={handleConfirmRemove}>
                      Confirm Remove Liquidity
                    </button>
                  </div>
                </>
            }
            {
                walletTransaction.status === TxStatus.PENDING && <>
                    <div className="remove-liquidity-confirm-wrapper">
                      <div className="remove-liquidity-status">
                        <Spinner />
                        <span>
                            Removing {token0RemoveDisplay} {input0.token.symbol} and {token1RemoveDisplay} {input1.token.symbol}
                        </span>
                        <span className="text-small">
                          Confirm this transaction in your wallet
                        </span>
                      </div>
                    </div>
                </>
            }
            {
                walletTransaction.status === TxStatus.CONFIRMED && <>
                  <div className="remove-liquidity-confirm-wrapper">
                    <div className="remove-liquidity-status">
                      <h2 className="text-semibold">
                        Transaction submitted
                      </h2>
                      <a>View on Explorer</a>
                      <button className="btn btn-primary"
                              onClick={handleClose}>
                        Close
                      </button>
                    </div>
                  </div>
                </>
            }
            {
                walletTransaction.status === TxStatus.REJECTED && <>
                  <h4 className="text-error">Error</h4>
                  <div className="remove-liquidity-confirm-wrapper">
                    <div className="remove-liquidity-status">
                      <h2 className="text-semibold text-error">
                        Transaction rejected
                      </h2>
                      <button className="btn btn-primary"
                              onClick={handleClose}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                </>
            }
        </Modal>
    )
}

export default RemoveLiquidityConfirm;
