import { useMemo } from 'react';

import './LiquidityInfo.scss';
import { useAppSelector } from 'store/hooks';
import { selectLiquidityPool, selectLiquidityOne, selectLiquidityTwo } from 'store/liquidity/liquidity.slice';
import TokenUtils from 'utils/tokenUtils';

function LiquidityInfo() {
    const one = useAppSelector(selectLiquidityOne);
    const two = useAppSelector(selectLiquidityTwo);
    const pool = useAppSelector(selectLiquidityPool);

    const onePerTwoDisplay = useMemo(() => {
        if (!TokenUtils.isFilled(one) || !TokenUtils.isFilled(two)) {
            return;
        }
        return TokenUtils.getDisplayRate(one, two);
    }, [one, two]);

    const twoPerOneDisplay = useMemo(() => {
        if (!TokenUtils.isFilled(one) || !TokenUtils.isFilled(two)) {
            return;
        }
        return TokenUtils.getDisplayRate(two, one);
    }, [one, two]);

    const shareDisplay = useMemo(() => {
        if (!pool.amount) {
            return '0%';
        }
        const result = pool.amount.multipliedBy('100').div(pool.overallAmount!).precision(2);
        if (result.lt('0.01')) {
            return '<0.01%';
        }
        return `${result.toFixed()}%`;
    }, [pool]);

    return (
        <div className="liquidity-info-wrapper">
            <span>Prices and pool share</span>
            <div className="liquidity-price-wrapper">
                <div className="liquidity-price">
                    <div className="text-semibold">
                        {twoPerOneDisplay}
                    </div>
                    <div className="text-small">
                        {two.token?.symbol} per {one.token?.symbol}
                    </div>
                </div>
                <div className="liquidity-price">
                    <div className="text-semibold">
                        {onePerTwoDisplay}
                    </div>
                    <div className="text-small">
                        {one.token?.symbol} per {two.token?.symbol}
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
