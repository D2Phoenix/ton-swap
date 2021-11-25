import { useCallback, useEffect, useState } from 'react';

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
                    walletAdapter && pools.length > 0 && pools.map((pool, index) => {
                        return (
                            <div key={index} className="pool-item-wrapper">
                                <div>
                                    <img src={pool.one.token!.logoURI} alt={pool.one.token!.name}/>
                                    <img src={pool.two.token!.logoURI} alt={pool.two.token!.name}/>
                                </div>
                                <span>{pool.one.token!.symbol}/{pool.two.token!.symbol}</span>
                                <ChevronRightIcon />
                            </div>
                        )
                    })
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
