import './SwapInfo.scss';
import { useAppSelector } from 'store/hooks';
import {
    selectSwapDetails,
    selectSwapFrom,
    selectSwapTxType,
    selectSwapTo
} from 'store/swap/swap.slice';
import { TxType } from 'interfaces/transactionInterfaces';
import { DEFAULT_SLIPPAGE, FEE_PRECISION, TOKEN_PRECISION } from 'constants/swap';
import { useMemo } from 'react';
import { toDecimals } from 'utils/decimals';
import BigNumber from 'bignumber.js';
import { selectSettings } from 'store/app/app.slice';

function SwapInfo() {
    const from = useAppSelector(selectSwapFrom);
    const to = useAppSelector(selectSwapTo);
    const type = useAppSelector(selectSwapTxType);
    const settings = useAppSelector(selectSettings);
    const details = useAppSelector(selectSwapDetails);

    const liquidityFee = useMemo(() => {
        const fee = from.amount!.multipliedBy(details!.fee);
        return toDecimals(fee, from.token!.decimals).precision(FEE_PRECISION).toFixed();
    }, [from, details]);

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

    return (
        <div className={"swap-info-wrapper"}>
            <span className="text-semibold">Transaction Details</span>
            <div>
                <span className="text-small">Liquidity Provider Fee</span>
                <span className="text-small text-semibold">{liquidityFee} {from.token!.symbol}</span>
            </div>
            <div>
                <span className="text-small">Price Impact</span>
                <span className="text-small text-semibold">{details.priceImpact.toFixed()} %</span>
            </div>
            <div>
                <span className="text-small">Allowed slippage</span>
                <span className="text-small text-semibold">{settings.slippage || DEFAULT_SLIPPAGE} %</span>
            </div>
            {
                type === TxType.EXACT_IN && to && <div>
                  <span className="text-small">Minimum received</span>
                  <span className="text-small text-semibold">{minimumReceived} {to.token!.symbol}</span>
                </div>
            }
            {
                type === TxType.EXACT_OUT && from && <div>
                  <span className="text-small">Maximum sent</span>
                  <span className="text-small text-semibold">{maximumSent} {from.token!.symbol}</span>
                </div>
            }
        </div>
    )
}

export default SwapInfo;
