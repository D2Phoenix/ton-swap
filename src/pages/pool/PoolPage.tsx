import { useCallback, useState } from 'react';

import './PoolPage.scss';
import SettingsIcon from 'components/icons/SettingsIcon';
import Settings from '../../components/Settings';
import { useAppSelector } from '../../store/hooks';
import { selectWalletAdapter } from '../../store/wallet/wallet.slice';
import { Link } from 'react-router-dom';


function PoolPage() {
    const [showSettings, setShowSettings] = useState(false);
    const walletAdapter = useAppSelector(selectWalletAdapter);

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
            <div className="pool-table-wrapper">
                {
                    !walletAdapter && <span>
                      Connect to a wallet to view your liquidity.
                    </span>
                }
                {
                    walletAdapter && <span>
                      No liquidity found.
                    </span>
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
