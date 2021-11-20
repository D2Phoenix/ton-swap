import { useCallback, useEffect, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';

import './TokenInput.scss';
import ChevronRightIcon from './icons/ChevronRightIcon';
import TokenInterface from '../interfaces/token.interface';
import { fromDecimals, toDecimals } from '../utils/decimals';

interface TokenInputParams {
    balance: BigNumber;
    token: TokenInterface | null,
    value: BigNumber | null;
    onChange: Function;
    onSelect: Function;
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`)


function TokenInput({balance, token, value, onChange, onSelect}: TokenInputParams) {
    const [internalValue, setInternalValue] = useState('')

    const handleClick = useCallback(() => {
        onSelect();
    }, [onSelect]);

    const handleChange = useCallback((event) => {
        const value = event.target.value.replace(/,/g, '.');
        if (value === '') {
            setInternalValue(value)
            return onChange(null);
        }
        if (inputRegex.test(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
            setInternalValue(value);
            onChange(fromDecimals(new BigNumber(value), token ? token.decimals : 0));
        }
    }, [onChange, token]);

    useEffect(() => {
        if (!value && internalValue) {
            setInternalValue('');
        }
        if (value) {
            const compare = fromDecimals(new BigNumber(internalValue), token ? token.decimals : 0);
            if (!value.eq(compare)) {
                setInternalValue(toDecimals(value, token ? token.decimals : 0).toFixed());
            }
        }
    }, [value, internalValue, token])

    return (
        <div className="input-wrapper">
            <div className="token-input">
                <div className="btn btn-outline small text-medium" onClick={handleClick}>
                    {
                        token?.logoURI && <img src={token.logoURI} alt={token.name}/>
                    }
                    <span>{token ? token.symbol : 'Select'}</span>
                    <ChevronRightIcon/>
                </div>
                <input type="text"
                       inputMode="decimal"
                       autoComplete="off"
                       autoCorrect="off"
                       minLength={1}
                       maxLength={79}
                       pattern="^[0-9]*[.,]?[0-9]*$"
                       placeholder="0.0"
                       value={internalValue}
                       onChange={handleChange}/>
            </div>
            {
                token && balance !== undefined && <div className="balance text-small">
                  Balance: {toDecimals(balance, token.decimals).toFixed()} {token.symbol}
                </div>
            }
        </div>
    )
}

export default TokenInput;
