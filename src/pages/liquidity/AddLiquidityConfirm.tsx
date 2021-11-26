import { useCallback, useMemo } from 'react';

import './AddLiquidityConfirm.scss';
import LiquidityInfo from './LiquidityInfo';
import Modal from 'components/Modal';
import TokenInput from 'components/TokenInput';
import Spinner from 'components/Spinner';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
    resetLiquidity,
    selectLiquidityPool,
    selectLiquidityOne,
    selectLiquidityTwo,
} from 'store/liquidity/liquidity.slice';
import { resetTransaction, selectWalletTransaction } from 'store/wallet/wallet.slice';
import { walletAddLiquidity } from 'store/wallet/wallet.thunks';
import { selectSettings } from 'store/app/app.slice';
import { DEFAULT_SLIPPAGE } from 'constants/swap';
import { WalletTxStatus } from 'interfaces/transactionInterfaces';
import TokenUtils from 'utils/tokenUtils';

function AddLiquidityConfirm({onClose}: any) {
    const dispatch = useAppDispatch();
    const one = useAppSelector(selectLiquidityOne);
    const two = useAppSelector(selectLiquidityTwo);
    const pool = useAppSelector(selectLiquidityPool);
    const settings = useAppSelector(selectSettings);
    const walletTransaction = useAppSelector(selectWalletTransaction);

    const modalClassName = useMemo(() => {
        return walletTransaction.status !== WalletTxStatus.INITIAL ? 'add-liquidity-confirm-modal mini' : 'add-liquidity-confirm-modal';
    }, [walletTransaction]);

    const oneDisplay = useMemo(() => {
        return TokenUtils.getDisplay(one);
    }, [one]);

    const twoDisplay = useMemo(() => {
        return TokenUtils.getDisplay(two);
    }, [two]);

    const poolDisplay = useMemo(() => {
        return TokenUtils.getDisplay(pool);
    }, [pool]);


    const handleConfirmSupply = useCallback(() => {
        dispatch(walletAddLiquidity());
    }, [dispatch]);

    const handleClose = useCallback(() => {
        dispatch(resetTransaction());
        if (walletTransaction.status === WalletTxStatus.CONFIRMED) {
            dispatch(resetLiquidity());
        }
        onClose && onClose();
    }, [dispatch, walletTransaction, onClose]);

    return (
        <Modal className={modalClassName} onClose={handleClose}>
            {
                walletTransaction.status === WalletTxStatus.INITIAL && <>
                  <h4>Confirm Supply</h4>
                  <div className="add-liquidity-confirm-wrapper">
                    <TokenInput token={one.token}
                                value={one.amount}
                                showMax={true}
                                selectable={false}
                                editable={false}
                    />
                    <div className="btn-icon">
                      +
                    </div>
                    <TokenInput token={two.token}
                                value={two.amount}
                                showMax={false}
                                selectable={false}
                                editable={false}
                    />
                    <LiquidityInfo/>
                    <div className="pool-tokens-info">
                      <span>You will receive </span>
                      <span className="text-semibold">{poolDisplay}</span>
                      <span> {one.token!.symbol}/{two.token!.symbol} Pool Tokens</span>
                    </div>
                      {
                          <span className="help-text text-small">
                              Output is estimated. If the price changes by more than {settings.slippage || DEFAULT_SLIPPAGE}% your transaction will revert.
                          </span>
                      }
                    <button className="btn btn-primary supply__btn"
                            onClick={handleConfirmSupply}>
                      Confirm Supply
                    </button>
                  </div>
                </>
            }
            {
                walletTransaction.status === WalletTxStatus.PENDING && <>
                    <div className="add-liquidity-confirm-wrapper">
                      <div className="add-liquidity-status">
                        <Spinner />
                        <span>
                            Supplying {oneDisplay} {one.token!.symbol} and {twoDisplay} {two.token!.symbol}
                        </span>
                        <span className="text-small">
                          Confirm this transaction in your wallet
                        </span>
                      </div>
                    </div>
                </>
            }
            {
                walletTransaction.status === WalletTxStatus.CONFIRMED && <>
                  <div className="add-liquidity-confirm-wrapper">
                    <div className="add-liquidity-status">
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
                walletTransaction.status === WalletTxStatus.REJECTED && <>
                  <h4 className="text-error">Error</h4>
                  <div className="add-liquidity-confirm-wrapper">
                    <div className="add-liquidity-status">
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

export default AddLiquidityConfirm;
