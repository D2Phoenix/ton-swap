import { useCallback, useMemo } from 'react';

import './SwapConfirm.scss';
import Modal from 'components/Modal';
import TokenInput from 'components/TokenInput';
import ChevronDownIcon from 'components/icons/ChevronDownIcon';
import SwapInfo from './SwapInfo';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
    resetSwap,
    selectSwapInput0,
    selectSwapInput1, selectSwapTrade,
} from 'store/swap/swapSlice';
import { resetTransaction, selectWalletTransaction } from 'store/wallet/walletSlice';
import { TxStatus } from 'types/transactionInterfaces';
import { walletSwap } from 'store/wallet/walletThunks';
import Spinner from 'components/Spinner';
import TokenUtils from 'utils/tokenUtils';

function SwapConfirm({onClose}: any) {
    const dispatch = useAppDispatch();
    const input0 = useAppSelector(selectSwapInput0);
    const input1 = useAppSelector(selectSwapInput1);
    const trade = useAppSelector(selectSwapTrade);
    const walletTransaction = useAppSelector(selectWalletTransaction);

    const className = useMemo(() => {
        return walletTransaction.status !== TxStatus.INITIAL ? 'swap-confirm-modal mini' : 'swap-confirm-modal';
    }, [walletTransaction]);

    const tokenSwapRate = useMemo(() => {
        if (!TokenUtils.isFilled(input0) || !TokenUtils.isFilled(input1)) {
            return;
        }
        return TokenUtils.getDisplayRate(input0, input1);
    }, [input0, input1]);

    const token0Amount = useMemo(() => {
        return TokenUtils.getDisplay(input1);
    }, [input1]);

    const token1Amount = useMemo(() => {
        return TokenUtils.getDisplay(input0);
    }, [input0]);

    const handleConfirmSwap = useCallback(() => {
        dispatch(walletSwap());
    }, [dispatch]);

    const handleClose = useCallback(() => {
        dispatch(resetTransaction());
        if (walletTransaction.status === TxStatus.CONFIRMED) {
            dispatch(resetSwap());
        }
        onClose && onClose();
    }, [dispatch, walletTransaction, onClose]);

    return (
        <Modal className={className} onClose={handleClose}>
            {
                walletTransaction.status === TxStatus.INITIAL && <>
                  <h4>Confirm Swap</h4>
                  <div className="swap-confirm-wrapper">
                    <TokenInput token={input0.token}
                                value={input0.amount}
                                showMax={true}
                                selectable={false}
                                editable={false}
                    />
                    <div className="switch__btn btn-icon">
                      <ChevronDownIcon/>
                    </div>
                    <TokenInput token={input1.token}
                                value={input1.amount}
                                showMax={false}
                                selectable={false}
                                editable={false}
                    />
                    <div className="swap-info">
                      <span className="text-small">Price</span>
                      <span className="text-small">
                1 {input1.token.symbol} = {tokenSwapRate} {input0.token.symbol}
                </span>
                    </div>
                    <SwapInfo/>
                      {
                          trade.minimumReceived && <span className="help-text text-small">
                Output is estimated. You will receive at least <span
                            className="text-semibold text-small">{TokenUtils.getNumberDisplay(trade.minimumReceived)} {input1.token.symbol}</span>  or the transaction will revert.
                </span>
                      }
                      {
                          trade.maximumSent && <span className="help-text text-small">
                Input is estimated. You will sell at most <span
                            className="text-semibold text-small">{TokenUtils.getNumberDisplay(trade.maximumSent)} {input0.token.symbol}</span> or the transaction will revert.
                </span>
                      }
                    <button className="btn btn-primary swap__btn"
                            onClick={handleConfirmSwap}>
                      Confirm Swap
                    </button>
                  </div>
                </>
            }
            {
                walletTransaction.status === TxStatus.PENDING && <>
                    <div className="swap-confirm-wrapper">
                      <div className="swap-status">
                        <Spinner />
                        <span>
                            Swapping {token1Amount} {input0.token.symbol} for {token0Amount} {input1.token.symbol}
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
                  <div className="swap-confirm-wrapper">
                    <div className="swap-status">
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
                  <div className="swap-confirm-wrapper">
                    <div className="swap-status">
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

export default SwapConfirm;
