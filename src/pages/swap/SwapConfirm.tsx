import { useDispatch } from 'react-redux';

import './SwapConfirm.scss';
import Modal from 'components/Modal';
import TokenInput from 'components/TokenInput';
import ChevronDownIcon from 'components/icons/ChevronDownIcon';
import SwapInfo from './SwapInfo';
import { useAppSelector } from 'store/hooks';
import {
    selectSwapFrom,
    selectSwapFromAmount, selectSwapLastSwapType, selectSwapSettings,
    selectSwapTo,
    selectSwapToAmount
} from 'store/swap/swap.slice';
import { resetTransaction, selectWalletBalances, selectWalletTransaction } from 'store/wallet/wallet.slice';
import { useCallback, useMemo } from 'react';
import { toDecimals } from '../../utils/decimals';
import BigNumber from 'bignumber.js';
import { DEFAULT_SLIPPAGE } from '../../constants/swap';
import { WalletTransactionStatus, SwapTypes } from '../../interfaces/swap.types';
import { walletSwap } from '../../store/wallet/wallet.thunks';
import Spinner from '../../components/Spinner';

const PRECISION = 6;

function SwapConfirm({onClose}: any) {
    const dispatch = useDispatch();
    const fromToken = useAppSelector(selectSwapFrom);
    const toToken = useAppSelector(selectSwapTo);
    const fromTokenAmount = useAppSelector(selectSwapFromAmount);
    const toTokenAmount = useAppSelector(selectSwapToAmount);
    const walletBalances = useAppSelector(selectWalletBalances);
    const swapType = useAppSelector(selectSwapLastSwapType);
    const swapSettings = useAppSelector(selectSwapSettings);
    const walletTransaction = useAppSelector(selectWalletTransaction);

    const className = useMemo(() => {
        return walletTransaction.status !== WalletTransactionStatus.INITIAL ? 'swap-confirm-modal mini' : 'swap-confirm-modal';
    }, [walletTransaction]);
    const calcFrom = useMemo(() => {
        if (!fromTokenAmount || !toTokenAmount || !toToken || !fromToken) {
            return;
        }
        return fromTokenAmount.div(toTokenAmount.shiftedBy(fromToken.decimals - toToken.decimals)).precision(PRECISION).toFixed();
    }, [fromToken, toToken, fromTokenAmount, toTokenAmount]);
    const minimumReceived = useMemo(() => {
        return toDecimals(toTokenAmount!, toToken!.decimals)
            .multipliedBy(new BigNumber('100').minus(new BigNumber(swapSettings.slippage || DEFAULT_SLIPPAGE)).div('100'))
            .precision(PRECISION).toFixed();
    }, [toToken, toTokenAmount, swapSettings]);
    const maximumSent = useMemo(() => {
        return toDecimals(fromTokenAmount!, fromToken!.decimals)
            .multipliedBy(new BigNumber('100').plus(new BigNumber(swapSettings.slippage || DEFAULT_SLIPPAGE)).div('100'))
            .precision(PRECISION).toFixed();
    }, [fromToken, fromTokenAmount, swapSettings]);
    const toAmount = useMemo(() => {
        return toDecimals(toTokenAmount!, toToken!.decimals)
            .precision(PRECISION).toFixed();
    }, [toToken, toTokenAmount]);
    const fromAmount = useMemo(() => {
        return toDecimals(fromTokenAmount!, fromToken!.decimals)
            .precision(PRECISION).toFixed();
    }, [fromToken, fromTokenAmount]);

    const handleConfirmSwap = useCallback(() => {
        dispatch(walletSwap());
    }, [dispatch]);
    const handleClose = useCallback(() => {
        dispatch(resetTransaction());
        onClose && onClose();
    }, [dispatch, onClose]);

    return (
        <Modal className={className} onClose={handleClose}>
            {
                walletTransaction.status === WalletTransactionStatus.INITIAL && <>
                  <h4>Confirm Swap</h4>
                  <div className="swap-confirm-wrapper">
                    <TokenInput token={fromToken}
                                balance={walletBalances[fromToken!.symbol]}
                                value={fromTokenAmount}
                                showMax={true}
                                editable={false}
                    />
                    <div className="switch__btn btn-icon">
                      <ChevronDownIcon/>
                    </div>
                    <TokenInput token={toToken}
                                balance={walletBalances[toToken!.symbol]}
                                value={toTokenAmount}
                                showMax={false}
                                editable={false}
                    />
                    <div className="swap-info">
                      <span className="text-small">Price</span>
                      <span className="text-small">
                1 {toToken!.symbol} = {calcFrom} {fromToken!.symbol}
                </span>
                    </div>
                    <SwapInfo/>
                      {
                          swapType === SwapTypes.EXACT_IN && <span className="help-text text-small">
                Output is estimated. You will receive at least <span
                            className="text-semibold text-small">{minimumReceived} {toToken!.symbol}</span>  or the transaction will revert.
                </span>
                      }
                      {
                          swapType === SwapTypes.EXACT_OUT && <span className="help-text text-small">
                Input is estimated. You will sell at most <span
                            className="text-semibold text-small">{maximumSent} {fromToken!.symbol}</span> or the transaction will revert.
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
                            Swapping {fromAmount} {fromToken!.symbol} for {toAmount} {toToken!.symbol}
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
