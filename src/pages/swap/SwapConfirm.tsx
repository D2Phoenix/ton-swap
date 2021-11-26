import { useCallback, useMemo } from 'react';

import './SwapConfirm.scss';
import Modal from 'components/Modal';
import TokenInput from 'components/TokenInput';
import ChevronDownIcon from 'components/icons/ChevronDownIcon';
import SwapInfo from './SwapInfo';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
    resetSwap,
    selectSwapFrom,
    selectSwapTxType,
    selectSwapTo,
} from 'store/swap/swap.slice';
import { resetTransaction, selectWalletTransaction } from 'store/wallet/wallet.slice';
import { DEFAULT_SLIPPAGE } from 'constants/swap';
import { WalletTxStatus, TxType } from 'interfaces/transactionInterfaces';
import { walletSwap } from 'store/wallet/wallet.thunks';
import Spinner from 'components/Spinner';
import { selectSettings } from 'store/app/app.slice';
import TokenUtils from 'utils/tokenUtils';

function SwapConfirm({onClose}: any) {
    const dispatch = useAppDispatch();
    const from = useAppSelector(selectSwapFrom);
    const to = useAppSelector(selectSwapTo);
    const txType = useAppSelector(selectSwapTxType);
    const settings = useAppSelector(selectSettings);
    const walletTransaction = useAppSelector(selectWalletTransaction);

    const className = useMemo(() => {
        return walletTransaction.status !== WalletTxStatus.INITIAL ? 'swap-confirm-modal mini' : 'swap-confirm-modal';
    }, [walletTransaction]);

    const tokenSwapRate = useMemo(() => {
        if (!TokenUtils.isFilled(from) || !TokenUtils.isFilled(to)) {
            return;
        }
        return TokenUtils.getDisplayRate(from, to);
    }, [from, to]);

    const minimumReceived = useMemo(() => {
        return TokenUtils.getMinimumDisplayWithSlippage(to, settings.slippage || DEFAULT_SLIPPAGE);
    }, [to, settings]);

    const maximumSent = useMemo(() => {
        return TokenUtils.getMaximumDisplayWithSlippage(from, settings.slippage || DEFAULT_SLIPPAGE);
    }, [from, settings]);

    const toAmount = useMemo(() => {
        return TokenUtils.getDisplay(to);
    }, [to]);

    const fromAmount = useMemo(() => {
        return TokenUtils.getDisplay(from);
    }, [from]);

    const handleConfirmSwap = useCallback(() => {
        dispatch(walletSwap());
    }, [dispatch]);

    const handleClose = useCallback(() => {
        dispatch(resetTransaction());
        if (walletTransaction.status === WalletTxStatus.CONFIRMED) {
            dispatch(resetSwap());
        }
        onClose && onClose();
    }, [dispatch, walletTransaction, onClose]);

    return (
        <Modal className={className} onClose={handleClose}>
            {
                walletTransaction.status === WalletTxStatus.INITIAL && <>
                  <h4>Confirm Swap</h4>
                  <div className="swap-confirm-wrapper">
                    <TokenInput token={from.token}
                                value={from.amount}
                                showMax={true}
                                selectable={false}
                                editable={false}
                    />
                    <div className="switch__btn btn-icon">
                      <ChevronDownIcon/>
                    </div>
                    <TokenInput token={to.token}
                                value={to.amount}
                                showMax={false}
                                selectable={false}
                                editable={false}
                    />
                    <div className="swap-info">
                      <span className="text-small">Price</span>
                      <span className="text-small">
                1 {to.token.symbol} = {tokenSwapRate} {from.token.symbol}
                </span>
                    </div>
                    <SwapInfo/>
                      {
                          txType === TxType.EXACT_IN && <span className="help-text text-small">
                Output is estimated. You will receive at least <span
                            className="text-semibold text-small">{minimumReceived} {to.token.symbol}</span>  or the transaction will revert.
                </span>
                      }
                      {
                          txType === TxType.EXACT_OUT && <span className="help-text text-small">
                Input is estimated. You will sell at most <span
                            className="text-semibold text-small">{maximumSent} {from.token.symbol}</span> or the transaction will revert.
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
                walletTransaction.status === WalletTxStatus.PENDING && <>
                    <div className="swap-confirm-wrapper">
                      <div className="swap-status">
                        <Spinner />
                        <span>
                            Swapping {fromAmount} {from.token.symbol} for {toAmount} {to.token.symbol}
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
                walletTransaction.status === WalletTxStatus.REJECTED && <>
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
