import { useCallback, useMemo } from 'react';
import BigNumber from 'bignumber.js';

import './SwapConfirm.scss';
import Modal from 'components/Modal';
import TokenInput from 'components/TokenInput';
import ChevronDownIcon from 'components/icons/ChevronDownIcon';
import SwapInfo from './SwapInfo';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
    resetSwap,
    selectSwapFrom,
    selectSwapSwapType,
    selectSwapTo,
} from 'store/swap/swap.slice';
import { resetTransaction, selectWalletBalances, selectWalletTransaction } from 'store/wallet/wallet.slice';
import { toDecimals } from 'utils/decimals';
import { DEFAULT_SLIPPAGE, TOKEN_PRECISION } from 'constants/swap';
import { WalletTransactionStatus, SwapTypes } from 'interfaces/swap.types';
import { walletSwap } from 'store/wallet/wallet.thunks';
import Spinner from 'components/Spinner';
import { selectSettings } from '../../store/app/app.slice';

function SwapConfirm({onClose}: any) {
    const dispatch = useAppDispatch();
    const from = useAppSelector(selectSwapFrom);
    const to = useAppSelector(selectSwapTo);
    const walletBalances = useAppSelector(selectWalletBalances);
    const swapType = useAppSelector(selectSwapSwapType);
    const settings = useAppSelector(selectSettings);
    const walletTransaction = useAppSelector(selectWalletTransaction);

    const className = useMemo(() => {
        return walletTransaction.status !== WalletTransactionStatus.INITIAL ? 'swap-confirm-modal mini' : 'swap-confirm-modal';
    }, [walletTransaction]);
    const calcFrom = useMemo(() => {
        if (!from.amount || !to.amount || !to.token || !from.token) {
            return;
        }
        return from.amount.div(to.amount.shiftedBy(from.token.decimals - to.token.decimals)).precision(TOKEN_PRECISION).toFixed();
    }, [from, to]);
    const minimumReceived = useMemo(() => {
        return toDecimals(to.amount!, to.token!.decimals)
            .multipliedBy(new BigNumber('100').minus(new BigNumber(settings.slippage || DEFAULT_SLIPPAGE)).div('100'))
            .precision(TOKEN_PRECISION).toFixed();
    }, [to, settings]);
    const maximumSent = useMemo(() => {
        return toDecimals(from.amount!, from.token!.decimals)
            .multipliedBy(new BigNumber('100').plus(new BigNumber(settings.slippage || DEFAULT_SLIPPAGE)).div('100'))
            .precision(TOKEN_PRECISION).toFixed();
    }, [from, settings]);
    const toAmount = useMemo(() => {
        return toDecimals(to.amount!, to.token!.decimals)
            .precision(TOKEN_PRECISION).toFixed();
    }, [to]);
    const fromAmount = useMemo(() => {
        return toDecimals(from.amount!, from.token!.decimals)
            .precision(TOKEN_PRECISION).toFixed();
    }, [from]);

    const handleConfirmSwap = useCallback(() => {
        dispatch(walletSwap());
    }, [dispatch]);
    const handleClose = useCallback(() => {
        dispatch(resetTransaction());
        if (walletTransaction.status === WalletTransactionStatus.CONFIRMED) {
            dispatch(resetSwap());
        }
        onClose && onClose();
    }, [dispatch, walletTransaction, onClose]);

    return (
        <Modal className={className} onClose={handleClose}>
            {
                walletTransaction.status === WalletTransactionStatus.INITIAL && <>
                  <h4>Confirm Swap</h4>
                  <div className="swap-confirm-wrapper">
                    <TokenInput token={from.token}
                                balance={walletBalances[from.token!.symbol]}
                                value={from.amount}
                                showMax={true}
                                editable={false}
                    />
                    <div className="switch__btn btn-icon">
                      <ChevronDownIcon/>
                    </div>
                    <TokenInput token={to.token}
                                balance={walletBalances[to.token!.symbol]}
                                value={to.amount}
                                showMax={false}
                                editable={false}
                    />
                    <div className="swap-info">
                      <span className="text-small">Price</span>
                      <span className="text-small">
                1 {to.token!.symbol} = {calcFrom} {from.token!.symbol}
                </span>
                    </div>
                    <SwapInfo/>
                      {
                          swapType === SwapTypes.EXACT_IN && <span className="help-text text-small">
                Output is estimated. You will receive at least <span
                            className="text-semibold text-small">{minimumReceived} {to.token!.symbol}</span>  or the transaction will revert.
                </span>
                      }
                      {
                          swapType === SwapTypes.EXACT_OUT && <span className="help-text text-small">
                Input is estimated. You will sell at most <span
                            className="text-semibold text-small">{maximumSent} {from.token!.symbol}</span> or the transaction will revert.
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
                walletTransaction.status === WalletTransactionStatus.PENDING && <>
                    <div className="swap-confirm-wrapper">
                      <div className="swap-status">
                        <Spinner />
                        <span>
                            Swapping {fromAmount} {from.token!.symbol} for {toAmount} {to.token!.symbol}
                        </span>
                        <span className="text-small">
                          Confirm this transaction in your wallet
                        </span>
                      </div>
                    </div>
                </>
            }
            {
                walletTransaction.status === WalletTransactionStatus.CONFIRMED && <>
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
                walletTransaction.status === WalletTransactionStatus.REJECTED && <>
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
