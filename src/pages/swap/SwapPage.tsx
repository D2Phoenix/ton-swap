import { useEffect, useState } from 'react';

import './SwapPage.scss';
import ChevronDownIcon from '../../components/icons/ChevronDownIcon';
import SettingsIcon from '../../components/icons/SettingsIcon';
import InfoIcon from '../../components/icons/InfoIcon';
import CoinInput from '../../components/CoinInput';
import SwapSettings from './SwapSettings';
import SwapInfo from './SwapInfo';
import TokenSelect from '../../components/TokenSelect';
import { useAppSelector } from '../../store/hooks';
import { selectTokens } from '../../store/app/appSlice';
import { useDispatch } from 'react-redux';
import { fetchTokens } from '../../store/app/appThunks';

function SwapPage() {
    const dispatch = useDispatch();
    const [showSettings, setShowSettings] = useState(false);
    const [showSwapInfo, setShowSwapInfo] = useState(false);
    const [showCoinSelect, setShowCoinSelect] = useState(false);
    const tokens = useAppSelector(selectTokens);

    useEffect(() => {
        dispatch(fetchTokens());
    }, [])

    return (
        <div className="swap-wrapper">
            <div className="swap-header">
                <span className="text-semibold">Swap</span>
                <div className="btn-icon" onClick={() => setShowSettings(!showSettings)}>
                    <SettingsIcon/>
                </div>
            </div>
            <CoinInput onSelect={() => setShowCoinSelect(true)}/>
            <div className="switch__btn btn-icon">
                <ChevronDownIcon />
            </div>
            <CoinInput onSelect={() => setShowCoinSelect(true)}/>
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
                showSettings && <SwapSettings onClose={() => setShowSettings(false)}/>
            }
            {
                showCoinSelect && <TokenSelect tokens={tokens}
                                               onClose={() => setShowCoinSelect(false)}
                                               onSelect={() => setShowCoinSelect(false)}/>
            }
        </div>
    )
}

export default SwapPage;
