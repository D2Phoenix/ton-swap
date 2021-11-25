import { useCallback, useEffect, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';

import './TokenInput.scss';
import ChevronRightIcon from './icons/ChevronRightIcon';
import TokenInterface from '../interfaces/tokenInterface';
import { fromDecimals, toDecimals } from '../utils/decimals';
import { BALANCE_PRECISION, TOKEN_PRECISION } from '../constants/swap';

interface TokenInputParams {
    balance: BigNumber;
    token: TokenInterface | undefined,
    value: BigNumber | undefined;
    editable: boolean;
    showMax: boolean;
    onChange?: Function;
    onSelect?: Function;
}

const INPUT_REGEXP = RegExp(`^\\d*(?:\\\\[.])?\\d*$`)

function TokenInput({balance, token, value, showMax, editable, onChange, onSelect}: TokenInputParams) {
    const [internalValue, setInternalValue] = useState('');

    useEffect(() => {
        if (!value && internalValue) {
            setInternalValue('');
        }
        if (value) {
            const compare = fromDecimals(new BigNumber(internalValue), token ? token.decimals : 0);
            if (!value.eq(compare)) {
                const newValue = toDecimals(value, token ? token.decimals : 0);
                setInternalValue(newValue.precision(TOKEN_PRECISION).toFixed());
            }
        }
    }, [value, internalValue, token])

    const handleClick = useCallback(() => {
        onSelect && onSelect();
    }, [onSelect]);

    const handleChange = useCallback((event) => {
        const value = event.target.value.replace(/,/g, '.');
        if (value === '') {
            setInternalValue(value)
            return onChange && onChange(null);
        }
        if (INPUT_REGEXP.test(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
            setInternalValue(value);
            onChange && onChange(fromDecimals(new BigNumber(value), token ? token.decimals : 0));
        }
    }, [onChange, token]);

    const handleMax = useCallback((event) => {
        handleChange({
            target: {
                value: toDecimals(balance, token ? token.decimals : 0).toFixed()
            }
        });
    }, [handleChange, balance, token]);

    const balanceVisible = useMemo(() => {
        if (balance) {
            return toDecimals(balance, token ? token.decimals : 0).precision(BALANCE_PRECISION).toFixed();
        }
        return '0';
    }, [balance, token])

    return (
        <div className={"input-wrapper" + (!editable ? ' view-only' : '')}>
            <div className="token-input">
                <div className="btn btn-outline small text-medium" onClick={handleClick}>
                    {
                        token?.logoURI && <img src={token.logoURI} alt={token.name}/>
                    }
                    <span>{token ? token.symbol : 'Select'}</span>
                    {
                        editable && <ChevronRightIcon/>
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
                       value={internalValue}
                       onChange={handleChange}/>
            </div>
            {
                editable && token && balance !== undefined && <div className="balance text-small">
                  Balance: {balanceVisible} {token.symbol}
                    {
                        showMax && !balance.eq('0') && (
                            <>&nbsp;(<span className="text-primary text-small link__btn" onClick={handleMax}>MAX</span>)</>
                        )
                    }
                </div>
            }
        </div>
    )
}

export default TokenInput;
