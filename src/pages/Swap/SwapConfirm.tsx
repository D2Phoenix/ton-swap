import { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

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

interface SwapConfirmProps {
    onClose: Function;
}

function SwapConfirm({onClose}: SwapConfirmProps) {
    const dispatch = useAppDispatch();
    const {t} = useTranslation();

    const input0 = useAppSelector(selectSwapInput0);
    const input1 = useAppSelector(selectSwapInput1);
    const trade = useAppSelector(selectSwapTrade);
    const walletTransaction = useAppSelector(selectWalletTransaction);

    const className = useMemo(() => {
        return walletTransaction.status !== TxStatus.INITIAL ? 'swap-confirm-modal mini' : 'swap-confirm-modal';
    }, [walletTransaction]);

    const tokenSwapRate = useMemo(() => {
        return TokenUtils.getNumberDisplay(trade.rate);
    }, [trade]);

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
                  <h4>{t('Confirm Swap')}</h4>
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
                      <span className="text-small">{t('Price')}</span>
                      <span className="text-small">
                1 {input1.token.symbol} = {tokenSwapRate} {input0.token.symbol}
                </span>
                    </div>
                    <SwapInfo/>
                      {
                          trade.minimumReceived &&
                          <span className="help-text text-small">
                            <Trans>
                              Output is estimated. You will receive at least <span
                              className="text-semibold text-small">{{amount0: TokenUtils.getNumberDisplay(trade.minimumReceived)}} {{symbol0: input1.token.symbol}}</span>  or the transaction will revert.
                            </Trans>
                          </span>
                      }
                      {
                          trade.maximumSent &&
                          <span className="help-text text-small">
                            <Trans>
                              Input is estimated. You will sell at most <span
                              className="text-semibold text-small">{{amount0: TokenUtils.getNumberDisplay(trade.maximumSent)}} {{symbol0: input0.token.symbol}}</span> or the transaction will revert.
                            </Trans>
                          </span>
                      }
                    <button className="btn btn-primary swap__btn"
                            onClick={handleConfirmSwap}>
                        {t('Confirm Swap')}
                    </button>
                  </div>
                </>
            }
            {
                walletTransaction.status === TxStatus.PENDING && <>
                  <div className="swap-confirm-wrapper">
                    <div className="swap-status">
                      <Spinner/>
                      <span>
                        <Trans>
                           Swapping {{amount0: token1Amount}} {{symbol0: input0.token.symbol}} for {{amount1: token0Amount}} {{symbol1: input1.token.symbol}}
                        </Trans>
                      </span>
                      <span className="text-small">
                         {t('Confirm this transaction in your wallet')}
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
                          {t('Transaction submitted')}
                      </h2>
                      <a>{t('View on Explorer')}</a>
                      <button className="btn btn-primary"
                              onClick={handleClose}>
                          {t('Close')}
                      </button>
                    </div>
                  </div>
                </>
            }
            {
                walletTransaction.status === TxStatus.REJECTED && <>
                  <h4 className="text-error">{t('Error')}</h4>
                  <div className="swap-confirm-wrapper">
                    <div className="swap-status">
                      <h2 className="text-semibold text-error">
                          {t('Transaction rejected')}
                      </h2>
                      <button className="btn btn-primary"
                              onClick={handleClose}>
                          {t('Dismiss')}
                      </button>
                    </div>
                  </div>
                </>
            }
        </Modal>
    )
}

export default SwapConfirm;
