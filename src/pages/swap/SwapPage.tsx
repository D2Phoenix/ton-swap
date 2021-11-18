import { useCallback, useEffect, useState } from 'react';

import './SwapPage.scss';
import ChevronDownIcon from 'components/icons/ChevronDownIcon';
import SettingsIcon from 'components/icons/SettingsIcon';
import InfoIcon from 'components/icons/InfoIcon';
import TokenInput from 'components/TokenInput';
import SwapSettings from './SwapSettings';
import SwapInfo from './SwapInfo';
import TokenSelect from 'components/TokenSelect';
import { useAppSelector } from 'store/hooks';
import { selectTokens } from 'store/app/app.slice';
import { useDispatch } from 'react-redux';
import { fetchTokens } from 'store/app/app.thunks';
import { selectSwapFrom, selectSwapTo, setSwapFromToken, setSwapToToken } from 'store/swap/swap.slice';

function SwapPage() {
    const dispatch = useDispatch();
    const [showSettings, setShowSettings] = useState(false);
    const [showSwapInfo, setShowSwapInfo] = useState(false);
    const [showTokenSelect, setShowTokenSelect] = useState(false);
    const [tokenSelectType, setTokenSelectType] = useState('from');
    const tokens = useAppSelector(selectTokens);
    const fromToken = useAppSelector(selectSwapFrom);
    const toToken = useAppSelector(selectSwapTo);

    useEffect(() => {
        dispatch(fetchTokens());
    }, [dispatch]);

    const openTokenFromSelect = useCallback(() => {
        setShowTokenSelect(!showTokenSelect);
        setTokenSelectType('from');
    }, [showTokenSelect, setShowTokenSelect]);

    const openTokenToSelect = useCallback(() => {
        setShowTokenSelect(!showTokenSelect);
        setTokenSelectType('to');
    }, [showTokenSelect, setShowTokenSelect]);

    const handleSelectToken = useCallback((token) => {
        setShowTokenSelect(false);
        if (!token) {
            return;
        }
        if (tokenSelectType === 'from') {
            return dispatch(setSwapFromToken(token));
        }
        dispatch(setSwapToToken(token));
    }, [dispatch, tokenSelectType]);

    return (
        <div className="swap-wrapper">
            <div className="swap-header">
                <span className="text-semibold">Swap</span>
                <div className="btn-icon" onClick={() => setShowSettings(!showSettings)}>
                    <SettingsIcon/>
                </div>
            </div>
            <TokenInput token={fromToken} onSelect={openTokenFromSelect}/>
            <div className="switch__btn btn-icon">
                <ChevronDownIcon />
            </div>
            <TokenInput token={toToken} onSelect={openTokenToSelect}/>
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
                showTokenSelect && <TokenSelect tokens={tokens}
                                               onClose={handleSelectToken}
                                               onSelect={handleSelectToken}/>
            }
        </div>
    )
}

export default SwapPage;
