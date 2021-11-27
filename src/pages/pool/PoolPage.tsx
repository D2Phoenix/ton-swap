import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import './PoolPage.scss';
import SettingsIcon from 'components/icons/SettingsIcon';
import Settings from 'components/Settings';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectWalletAdapter } from 'store/wallet/wallet.slice';
import { getPoolPools } from 'store/pool/pool.thunks';
import { selectPoolPools } from 'store/pool/pool.slice';
import Accordion from 'components/Accordion';
import TokenUtils from 'utils/tokenUtils';
import TokenIcon from '../../components/TokenIcon';
import QuestionIcon from '../../components/icons/QuestionIcon';
import SwapInfo from '../swap/SwapInfo';
import InfoIcon from '../../components/icons/InfoIcon';
import Tooltip from '../../components/Tooltip';


function PoolPage() {
    const dispatch = useAppDispatch();
    const [showSettings, setShowSettings] = useState(false);
    const walletAdapter = useAppSelector(selectWalletAdapter);
    const pools = useAppSelector(selectPoolPools);

    useEffect(() => {
        dispatch(getPoolPools());
    }, [dispatch])

    return (
        <div className="pool-wrapper">
            <div className="pool-header-wrapper">
                <div className="pool-header">
                    <div className="text-semibold">
                        Your Liquidity
                        <Tooltip content={<span className="text-small">When you add liquidity, you are given pool tokens that represent your share. If you don’t see a pool you joined in this list, try importing a pool below.</span>}
                                 direction="bottom">
                            <div className="btn-icon">
                                <QuestionIcon />
                            </div>
                        </Tooltip>
                    </div>
                    <span className="text-small">Remove liquidity to receive tokens back</span>
                </div>
                <div className="btn-icon" onClick={() => setShowSettings(!showSettings)}>
                    <SettingsIcon/>
                </div>
            </div>
            <div className="pool-list-wrapper">
                {
                    !walletAdapter && <span>
                      Connect to a wallet to view your liquidity.
                    </span>
                }
                {
                    walletAdapter && pools.length === 0 && <span>
                      No liquidity found.
                    </span>
                }
                {
                    walletAdapter && pools.length > 0 && (
                        <Accordion panels={pools.map((pool, index) => {
                            const share = pool.pool.amount.multipliedBy('100').div(pool.pool.overallAmount).precision(2);
                            const shareText = share.lt('0.01') ? '<0.01%' : `${share.toFixed()}%`;

                            return {
                                label: (
                                    <div key={index} className="pool-item-wrapper">
                                        <div>
                                            <TokenIcon address={pool.one.token.address} name={pool.one.token.name}/>
                                            <TokenIcon address={pool.two.token.address} name={pool.two.token.name}/>
                                        </div>
                                        <span>{pool.one.token.symbol}/{pool.two.token.symbol}</span>
                                    </div>
                                ),
                                content: (
                                    <div key={index} className="pool-item-details-wrapper">
                                        <div>
                                            <div>Pooled {pool.one.token.symbol}</div>
                                            <div>
                                                {TokenUtils.getDisplay(pool.one)}
                                                <TokenIcon address={pool.one.token.address}
                                                           name={pool.one.token.name}
                                                           size={'small'}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div>Pooled {pool.two.token.symbol}</div>
                                            <div>
                                                {TokenUtils.getDisplay(pool.two)}
                                                <TokenIcon address={pool.two.token.address}
                                                           name={pool.two.token.name}
                                                           size={'small'}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div>Your pool tokens</div>
                                            <div>{TokenUtils.getDisplay(pool.pool)}</div>
                                        </div>
                                        <div>
                                            <div>Your pool share</div>
                                            <div>{shareText}</div>
                                        </div>
                                        <div>
                                            <Link className="btn btn-primary" to={`add/${pool.one.token.symbol}/${pool.two.token.symbol}`}>
                                                Add
                                            </Link>
                                            <Link className="btn btn-primary" to={`remove/${pool.one.token.symbol}/${pool.two.token.symbol}`}>
                                                Remove
                                            </Link>
                                        </div>
                                    </div>
                                )
                            }
                        })} />
                    )
                }
            </div>
            <Link className="btn btn-primary" to="add">
                Add Liquidity
            </Link>
            <div className="import-pool">
                <span>Don't see a pool you joined?</span>
                <Link className="btn btn-outline" to="import">
                    Import Pool
                </Link>
            </div>
            {
                showSettings && <Settings onClose={() => setShowSettings(false)}/>
            }
        </div>
    )
}

export default PoolPage;
