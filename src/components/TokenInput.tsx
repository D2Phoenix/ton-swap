import { useCallback } from 'react';

import './TokenInput.scss';
import ChevronRightIcon from './icons/ChevronRightIcon';
import TokenInterface from '../interfaces/token.interface';

interface TokenInputParams {
    token: TokenInterface | null,
    onSelect: Function;
    balance: number;
}


function TokenInput({token, balance, onSelect}: TokenInputParams) {

    const handleClick = useCallback(() => {
        onSelect();
    }, [onSelect]);

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
                <input type="number" placeholder="0.0"/>
            </div>
            {
                token && <div className="balance text-small">
                  Balance: {balance || 0} {token.symbol}
                </div>
            }
        </div>
    )
}

export default TokenInput;
