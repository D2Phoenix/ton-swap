import { useCallback } from 'react';

import './TokenInput.scss';
import ChevronRightIcon from './icons/ChevronRightIcon';
import TokenInterface from '../interfaces/token.interface';

interface TokenInputParams {
    balance: number;
    token: TokenInterface | null,
    value: string;
    onChange: Function;
    onSelect: Function;
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`)


function TokenInput({balance, token, value, onChange, onSelect}: TokenInputParams) {

    const handleClick = useCallback(() => {
        onSelect();
    }, [onSelect]);

    const handleChange = useCallback((event) => {
        const value = event.target.value.replace(/,/g, '.');
        if (value === '' || inputRegex.test(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
            onChange(value);
        }
    }, [onChange]);

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
                       value={value || ''}
                       onChange={handleChange}/>
            </div>
            {
                token && balance !== undefined && <div className="balance text-small">
                  Balance: {balance} {token.symbol}
                </div>
            }
        </div>
    )
}

export default TokenInput;
