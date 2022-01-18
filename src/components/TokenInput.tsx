import React, { useCallback, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';

import './TokenInput.scss';
import ChevronRightIcon from './icons/ChevronRightIcon';
import TokenInterface from 'types/tokenInterface';
import { BALANCE_PRECISION } from 'constants/swap';
import PoolInterface from 'types/poolInterface';
import TokenIcon from './TokenIcon';
import TokenUtils from 'utils/tokenUtils';
import { useTranslation } from 'react-i18next';
import TokenSelect from './Modals/TokenSelect';

interface TokenInputProps {
    balance?: string;
    token: TokenInterface | PoolInterface | undefined,
    value: string | undefined;
    editable: boolean;
    selectable: boolean;
    showMax?: boolean;
    onChange?: Function;
    onSelect?: Function;
    loading?: boolean;
    primary?: boolean;
    balancesFirst?: boolean;
}

const INPUT_REGEXP = RegExp(`^\\d*(?:\\\\[.])?\\d*$`)

function TokenInput({balance, token, value, showMax, editable, selectable, loading, primary, onChange, onSelect, balancesFirst}: TokenInputProps) {
    const { t } = useTranslation();
    const [showTokenSelect, setShowTokenSelect] = useState(false);

    const toggleTokenSelect = useCallback(() => {
        setShowTokenSelect((prev) => !prev);
    }, []);

    const handleTokenSelect = useCallback((token) => {
        toggleTokenSelect();
        onSelect && onSelect(token);
    }, [onSelect, toggleTokenSelect]);

    const handleChange = useCallback((event) => {
        const value = event.target.value.replace(/,/g, '.');
        if (value === '') {
            return onChange && onChange(null);
        }
        if (INPUT_REGEXP.test(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
            onChange && onChange(value);
        }
    }, [onChange]);

    const handleMax = useCallback((event) => {
        if (balance) {
            handleChange({
                target: {
                    value: balance
                }
            });
        }
    }, [handleChange, balance]);

    const balanceVisible = useMemo(() => {
        if (balance) {
            return new BigNumber(balance).precision(BALANCE_PRECISION).toFixed();
        }
        return '0';
    }, [balance]);

    const simpleToken = (token as TokenInterface);
    const poolToken = (token as PoolInterface);

    const valueDisplay = useMemo(() => {
        if (!value) {
            return '';
        }
        if (primary) {
            return value;
        }
        return TokenUtils.getNumberDisplay(value);
    }, [value, primary])

    return (
        <div className={"input-wrapper" + (!selectable ? ' view-only' : '')}>
            <div className={"token-input" + (loading ? ' loading' : '')}>
                <div className="btn btn-outline small text-medium" onClick={toggleTokenSelect}>
                    {
                        simpleToken?.logoURI && <TokenIcon address={simpleToken.address} name={simpleToken.name} url={simpleToken.logoURI} />
                    }
                    {
                        poolToken?.address0 && <TokenIcon address={poolToken.address0} name={poolToken.name} />
                    }
                    {
                        poolToken?.address1 && <TokenIcon address={poolToken.address1} name={poolToken.name}/>
                    }
                    <span>{token ? token.symbol : t('Select')}</span>
                    {
                        selectable && <ChevronRightIcon/>
                    }
                </div>
                <input type="text"
                       inputMode="decimal"
                       autoComplete="off"
                       autoCorrect="off"
                       minLength={1}
                       maxLength={79}
                       pattern="^[0-9]*[.,]?[0-9]*$"
                       placeholder="0.0"
                       readOnly={!editable}
                       value={valueDisplay}
                       onChange={handleChange}/>
            </div>
            {
                token && balance != null && <div className="balance text-small">
                    {t('Balance')}: {balanceVisible} {token.symbol}
                    {
                        showMax &&
                        !new BigNumber(balance).eq('0') &&
                        (!value || !new BigNumber(balance).eq(value)) &&
                        (
                            <>&nbsp;(<span className="text-primary text-small link__btn" onClick={handleMax}>MAX</span>)</>
                        )
                    }
                </div>
            }
            {
                showTokenSelect && <TokenSelect balancesFirst={balancesFirst}
                                                onClose={toggleTokenSelect}
                                                onSelect={handleTokenSelect}/>
            }
        </div>
    )
}

export default TokenInput;
