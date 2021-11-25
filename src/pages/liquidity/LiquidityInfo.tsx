import './LiquidityInfo.scss';
import { useAppSelector } from '../../store/hooks';
import { selectLiquidityPool, selectLiquidityOne, selectLiquidityTwo } from '../../store/liquidity/liquidity.slice';
import { useMemo } from 'react';
import { TOKEN_PRECISION } from '../../constants/swap';

function LiquidityInfo() {
    const one = useAppSelector(selectLiquidityOne);
    const two = useAppSelector(selectLiquidityTwo);
    const pool = useAppSelector(selectLiquidityPool);

    const onePerTwo = useMemo(() => {
        if (!one.amount || !two.amount || !two.token || !one.token) {
            return;
        }
        return one.amount.div(two.amount.shiftedBy(one.token.decimals - two.token.decimals)).precision(TOKEN_PRECISION).toFixed();
    }, [one, two]);

    const twoPerOne = useMemo(() => {
        if (!one.amount || !two.amount || !two.token || !one.token) {
            return;
        }
        return two.amount.div(one.amount.shiftedBy(two.token.decimals - one.token.decimals)).precision(TOKEN_PRECISION).toFixed();
    }, [one, two]);

    const share = useMemo(() => {
        const result = pool.amount!.multipliedBy('100').div(pool.overallAmount!).precision(2);
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
                        {twoPerOne}
                    </div>
                    <div className="text-small">
                        {two.token!.symbol} per {one.token!.symbol}
                    </div>
                </div>
                <div className="liquidity-price">
                    <div className="text-semibold">
                        {onePerTwo}
                    </div>
                    <div className="text-small">
                        {one.token!.symbol} per {two.token!.symbol}
                    </div>
                </div>
                <div className="liquidity-price">
                    <div className="text-semibold">
                        {share}
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
