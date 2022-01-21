import './TokenIcon.scss';
import { useAppSelector } from 'store/hooks';
import { selectTokens } from 'store/app/appSlice';
import { useMemo } from 'react';

interface TokenIconProps {
  address: string;
  name: string;
  size?: 'small';
  url?: string;
}

export function TokenIcon({ address, name, size, url }: TokenIconProps) {
  const tokens = useAppSelector(selectTokens);

  const iconUrl = useMemo(() => {
    if (url) {
      return url;
    }
    const token = tokens.find((token) => token.address.toLowerCase() === address.toLowerCase());
    if (token) {
      return token.logoURI;
    }
    return '/images/icons/empty-token.svg';
  }, [tokens, address, url]);

  return (
    <div className={`token-icon-wrapper ${size || ''}`}>
      <img src={iconUrl} alt={name} />
    </div>
  );
}
