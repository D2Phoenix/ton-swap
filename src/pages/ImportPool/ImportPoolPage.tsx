import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import './ImportPoolPage.scss';
import TokenInput from 'components/TokenInput';
import SettingsIcon from 'components/icons/SettingsIcon';
import { selectWalletConnectionStatus } from 'store/wallet/walletSlice';
import {
    selectLiquidityInput0,
    selectLiquidityInput1,
    resetLiquidity,
    selectLiquidityPool,
    switchLiquidityTokens,
    setLiquidityInput0Token,
    setLiquidityInput1Token,
} from 'store/liquidity/liquiditySlice';
import {
    connectWallet,
    walletImportLiquidity,
} from 'store/wallet/walletThunks';
import Settings from 'components/Settings';
import ChevronRightIcon from 'components/icons/ChevronRightIcon';
import ChevronDownIcon from 'components/icons/ChevronDownIcon';
import { getLiquidityPool } from 'store/liquidity/liquidityThunks';
import TokenUtils from 'utils/tokenUtils';
import Spinner from 'components/Spinner';
import QuestionIcon from 'components/icons/QuestionIcon';
import Tooltip from 'components/Tooltip';
import { WalletStatus } from 'types/walletAdapterInterface';
import TokenSelect from 'components/TokenSelect';

export function ImportPoolPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [showSettings, setShowSettings] = useState(false);
    const [showTokenSelect, setShowTokenSelect] = useState(false);
    const [activeInput, setActiveInput] = useState('input0');
    const walletConnectionStatus = useAppSelector(selectWalletConnectionStatus);
    const input0 = useAppSelector(selectLiquidityInput0);
    const input1 = useAppSelector(selectLiquidityInput1);
    const pool = useAppSelector(selectLiquidityPool);

    const isFilled = useMemo(() => {
        return TokenUtils.isFilled(input0) && TokenUtils.isFilled(input1) && TokenUtils.isFilled(pool);
    }, [input0, input1, pool]);

    const importButtonText = useMemo(() => {
        if (!input0.token || !input1.token) {
            return t('Select a pair');
        }
        if (!TokenUtils.isFilled(input0) || !TokenUtils.isFilled(input1) || !TokenUtils.isFilled(pool)) {
            return t('You don’t have liquidity in this pool yet.');
        }
        return t('Import');
    }, [t, input0, input1, pool]);

    useEffect(() => {
        return () => {
            dispatch(resetLiquidity());
        };
    }, [dispatch]);

    useEffect(() => {
        if (input0.token && input1.token) {
            dispatch(getLiquidityPool({
                token0: input0.token.address,
                token1: input1.token.address,
            }));
        }
    }, [dispatch, input0.token, input1.token]);

    const handleSwitchTokens = useCallback(() => {
        dispatch(switchLiquidityTokens());
    }, [dispatch]);

    const openTokenSelect = useCallback((activeInput) => {
        setShowTokenSelect(!showTokenSelect);
        setActiveInput(activeInput);
    }, [showTokenSelect]);

    const handleSelectToken = useCallback((token) => {
        setShowTokenSelect(false);
        if (!token) {
            return;
        }
        if (input1.token && activeInput === 'input0' && input1.token.symbol === token.symbol) {
            return handleSwitchTokens();
        }
        if (input0.token && activeInput === 'input1' && input0.token.symbol === token.symbol) {
            return handleSwitchTokens();
        }
        if (activeInput === 'input0') {
            return dispatch(setLiquidityInput0Token(token));
        }
        dispatch(setLiquidityInput1Token(token));
    }, [dispatch, input0, input1, activeInput, handleSwitchTokens]);

    const handleConnectWallet = useCallback(() => {
        dispatch(connectWallet());
    }, [dispatch]);

    const handleImport = useCallback(() => {
        dispatch(walletImportLiquidity())
        navigate('/pool')
    }, [dispatch, navigate]);

    return (
        <form className="import-pool-wrapper" onSubmit={e => { e.preventDefault(); }}>
            <div className="import-pool-header-wrapper">
                <Link className="btn-icon chevron" to="/pool">
                    <ChevronRightIcon revert={true}/>
                </Link>
                <div className="import-pool-header">
                    <div className="text-semibold">
                        {t('Import Pool')}
                        <Tooltip content={<span className="text-small">{t("Use this tool to find pools that don't automatically appear in the interface.")}</span>}
                                 direction="bottom">
                            <div className="btn-icon">
                                <QuestionIcon />
                            </div>
                        </Tooltip>
                    </div>
                    <div className="text-small">
                        {t('Import an existing pool')}
                    </div>
                </div>
                <div className="btn-icon" onClick={() => setShowSettings(!showSettings)}>
                    <SettingsIcon/>
                </div>
            </div>
            <TokenInput token={input0.token}
                        value={input0.amount}
                        showMax={false}
                        onSelect={openTokenSelect.bind(null, 'input0')}
                        selectable={true}
                        editable={false}/>
            <div className="btn-icon">
                +
            </div>
            <TokenInput token={input1.token}
                        value={input1.amount}
                        showMax={false}
                        onSelect={openTokenSelect.bind(null, 'input1')}
                        selectable={true}
                        editable={false}/>
            {
                pool.token && <>
                  <div className="btn-icon">
                    <ChevronDownIcon/>
                  </div>
                  <TokenInput token={pool.token}
                              value={pool.amount}
                              selectable={false}
                              editable={false}/>
                </>
            }
            {
                walletConnectionStatus === WalletStatus.CONNECTED &&
                <button className="btn btn-primary import__btn"
                        disabled={!isFilled}
                        onClick={handleImport}>
                    {importButtonText}
                </button>
            }
            {
                walletConnectionStatus === WalletStatus.CONNECTED &&
                !isFilled &&
                input0.token &&
                input1.token &&
                <Link to={`/pool/add/${input0.token.address}/${input1.token.address}`} className="btn btn-primary import__btn">
                    {t('Add Liquidity')}
                </Link>
            }
            {
                walletConnectionStatus !== WalletStatus.CONNECTED &&
                <button className="btn btn-outline import__btn"
                        onClick={handleConnectWallet}>
                    {
                        walletConnectionStatus === WalletStatus.DISCONNECTED && t('Connect Wallet')
                    }
                    {
                        walletConnectionStatus === WalletStatus.CONNECTING &&
                        <Spinner className="btn outline"/>
                    }
                </button>
            }
            {
                showTokenSelect && <TokenSelect balancesFirst={true}
                                                onClose={handleSelectToken}
                                                onSelect={handleSelectToken}/>
            }
            {
                showSettings && <Settings onClose={() => setShowSettings(false)}/>
            }
        </form>
    )
}

export default ImportPoolPage;
