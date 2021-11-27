import { useCallback, useEffect, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';

import './TokenInput.scss';
import ChevronRightIcon from './icons/ChevronRightIcon';
import TokenInterface from '../types/tokenInterface';
import { fromDecimals, toDecimals } from '../utils/decimals';
import { BALANCE_PRECISION, TOKEN_PRECISION } from '../constants/swap';
import PoolInterface from '../types/poolInterface';
import TokenIcon from './TokenIcon';

interface TokenInputParams {
    balance?: BigNumber;
    token: TokenInterface | PoolInterface | undefined,
    value: BigNumber | undefined;
    editable: boolean;
    selectable: boolean;
    showMax: boolean;
    onChange?: Function;
    onSelect?: Function;
}

const INPUT_REGEXP = RegExp(`^\\d*(?:\\\\[.])?\\d*$`)

function TokenInput({balance, token, value, showMax, editable, selectable, onChange, onSelect}: TokenInputParams) {
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
        if (balance) {
            handleChange({
                target: {
                    value: toDecimals(balance, token ? token.decimals : 0).toFixed()
                }
            });
        }
    }, [handleChange, balance, token]);

    const balanceVisible = useMemo(() => {
        if (balance) {
            return toDecimals(balance, token ? token.decimals : 0).precision(BALANCE_PRECISION).toFixed();
        }
        return '0';
    }, [balance, token]);

    const simpleToken = (token as TokenInterface);
    const poolToken = (token as PoolInterface);

    return (
        <div className={"input-wrapper" + (!selectable ? ' view-only' : '')}>
            <div className="token-input">
                <div className="btn btn-outline small text-medium" onClick={handleClick}>
                    {
                        simpleToken?.logoURI && <TokenIcon address={simpleToken.address} name={simpleToken.name} />
                    }
                    {
                        poolToken?.address0 && <TokenIcon address={poolToken.address0} name={poolToken.name} />
                    }
                    {
                        poolToken?.address1 && <TokenIcon address={poolToken.address1} name={poolToken.name}/>
                    }
                    <span>{token ? token.symbol : 'Select'}</span>
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
                       value={internalValue}
                       onChange={handleChange}/>
            </div>
            {
                token && balance != null && <div className="balance text-small">
                  Balance: {balanceVisible} {token.symbol}
                    {
                        showMax && !balance.eq('0') && (!value || !balance.eq(value)) && (
                            <>&nbsp;(<span className="text-primary text-small link__btn" onClick={handleMax}>MAX</span>)</>
                        )
                    }
                </div>
            }
        </div>
    )
}

export default TokenInput;
