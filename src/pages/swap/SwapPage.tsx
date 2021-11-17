import ChevronDownIcon from '../../components/icons/ChevronDownIcon';
import SettingsIcon from '../../components/icons/SettingsIcon';
import InfoIcon from '../../components/icons/InfoIcon';
import { useState } from 'react';
import CoinInput from '../../components/CoinInput';
import SwapSettings from './SwapSettings';
import SwapInfo from './SwapInfo';

function SwapPage() {
    const [showSettings, setShowSettings] = useState(false);
    const [showSwapInfo, setShowSwapInfo] = useState(false);

    return (
        <div className="swap-wrapper">
            <div className="swap-header">
                <span className="text-semibold">Swap</span>
                <div className="btn-icon" onClick={() => setShowSettings(!showSettings)}>
                    <SettingsIcon/>
                </div>
            </div>
            <CoinInput/>
            <div className="switch__btn btn-icon">
                <ChevronDownIcon />
            </div>
            <CoinInput/>
            <div className="swap-info text-small">
                <span>1 ETH = 487.7 DAI</span>
                <div className="btn-icon" onMouseOver={() => setShowSwapInfo(true)} onMouseLeave={() => setShowSwapInfo(false)}>
                    <InfoIcon/>
                    {
                        showSwapInfo && <SwapInfo />
                    }
                </div>

            </div>
            <button className="btn btn-primary swap__btn">Swap</button>
            {
                showSettings && <SwapSettings />
            }
        </div>
    )
}

export default SwapPage;
