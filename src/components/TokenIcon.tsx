import './TokenIcon.scss';
import { useAppSelector } from 'store/hooks';
import { selectTokens } from 'store/app/appSlice';
import { useMemo } from 'react';

interface TokenIconProps {
    address: string;
    name: string;
    size?: 'small';
}

function TokenIcon({address, name, size}: TokenIconProps) {
    const tokens = useAppSelector(selectTokens);

    const iconUrl = useMemo(() => {
        const token = tokens.find((token) => token.address.toLowerCase() === address.toLowerCase());
        if (token) {
            return token.logoURI;
        }
        return '/images/icons/empty-token.svg';
    }, [tokens, address])

    return (
        <div className={`token-icon-wrapper ${size || ''}`}>
            <img src={iconUrl} alt={name}/>
        </div>
    )
}

export default TokenIcon;
