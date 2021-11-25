import { useCallback, useEffect, useMemo, useState } from 'react';

import './PoolPage.scss';
import SettingsIcon from 'components/icons/SettingsIcon';
import Settings from '../../components/Settings';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectWalletAdapter } from '../../store/wallet/wallet.slice';
import { Link } from 'react-router-dom';
import { getPoolPools } from '../../store/pool/pool.thunks';
import { selectPoolPools } from '../../store/pool/pool.slice';
import ChevronDownIcon from '../../components/icons/ChevronDownIcon';
import ChevronRightIcon from '../../components/icons/ChevronRightIcon';
import Accordion from '../../components/Accordion';
import { TOKEN_PRECISION } from '../../constants/swap';
import { toDecimals } from '../../utils/decimals';


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
                    <span className="text-semibold">Your Liquidity</span>
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
                            const share = pool.details.poolAmount.multipliedBy('100').div(pool.details.poolTokens).precision(2);
                            const shareText = share.lt('0.01') ? '<0.01%' : `${share.toFixed()}%`;

                            return {
                                label: (
                                    <div key={index} className="pool-item-wrapper">
                                        <div>
                                            <img src={pool.one.token!.logoURI} alt={pool.one.token!.name}/>
                                            <img src={pool.two.token!.logoURI} alt={pool.two.token!.name}/>
                                        </div>
                                        <span>{pool.one.token!.symbol}/{pool.two.token!.symbol}</span>
                                    </div>
                                ),
                                content: (
                                    <div key={index} className="pool-item-details-wrapper">
                                        <div>
                                            <div>Pooled {pool.one.token!.symbol}</div>
                                            <div>
                                                {toDecimals(pool.one.amount!, pool.one.token!.decimals).precision(TOKEN_PRECISION).toFixed()}
                                                <img src={pool.one.token!.logoURI} alt={pool.one.token!.name}/>
                                            </div>
                                        </div>
                                        <div>
                                            <div>Pooled {pool.two.token!.symbol}</div>
                                            <div>
                                                {toDecimals(pool.two.amount!, pool.two.token!.decimals)!.precision(TOKEN_PRECISION).toFixed()}
                                                <img src={pool.two.token!.logoURI} alt={pool.two.token!.name}/>
                                            </div>
                                        </div>
                                        <div>
                                            <div>Your pool tokens</div>
                                            <div>{pool.details.poolAmount!.precision(TOKEN_PRECISION).toFixed()}</div>
                                        </div>
                                        <div>
                                            <div>Your pool share</div>
                                            <div>{shareText}</div>
                                        </div>
                                        <div>
                                            <Link className="btn btn-primary" to="add">
                                                Add
                                            </Link>
                                            <Link className="btn btn-primary" to="remove">
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
