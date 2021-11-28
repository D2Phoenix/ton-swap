import { useMemo } from 'react';
import BigNumber from 'bignumber.js';

import './LiquidityInfo.scss';
import { useAppSelector } from 'store/hooks';
import {
    selectLiquidityInput0,
    selectLiquidityInput1,
    selectLiquidityLoading,
    selectLiquidityInfo
} from 'store/liquidity/liquiditySlice';
import TokenUtils from 'utils/tokenUtils';

function LiquidityInfo() {
    const input0 = useAppSelector(selectLiquidityInput0);
    const input1 = useAppSelector(selectLiquidityInput1);
    const loading = useAppSelector(selectLiquidityLoading);
    const info = useAppSelector(selectLiquidityInfo);

    const token0PerToken1Display = useMemo(() => {
        return TokenUtils.getNumberDisplay(info.token0PerToken1);
    }, [info.token0PerToken1]);

    const token1PerToken0Display = useMemo(() => {
        return TokenUtils.getNumberDisplay(info.token1PerToken0);
    }, [info.token1PerToken0]);

    const shareDisplay = useMemo(() => {
        if (!info.share) {
            return '0%';
        }
        const result = new BigNumber(info.share).precision(2);
        if (result.lt('0.01')) {
            return '<0.01%';
        }
        return `${result.toFixed()}%`;
    }, [info.share]);

    return (
        <div className={`liquidity-info-wrapper ${loading ? 'loading' : ''}`}>
            <span>Prices and pool share</span>
            <div className="liquidity-price-wrapper">
                <div className="liquidity-price">
                    <div className="text-semibold">
                        {token1PerToken0Display}
                    </div>
                    <div className="text-small">
                        {input1.token?.symbol} per {input0.token?.symbol}
                    </div>
                </div>
                <div className="liquidity-price">
                    <div className="text-semibold">
                        {token0PerToken1Display}
                    </div>
                    <div className="text-small">
                        {input0.token?.symbol} per {input1.token?.symbol}
                    </div>
                </div>
                <div className="liquidity-price">
                    <div className="text-semibold">
                        {shareDisplay}
                    </div>
                    <div className="text-small">
                        Share of Pool
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LiquidityInfo;
