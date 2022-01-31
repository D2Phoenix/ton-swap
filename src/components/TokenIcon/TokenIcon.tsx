import { useMemo } from 'react';

import { selectTokens } from 'store/app/appSlice';
import { useAppSelector } from 'store/hooks';

import './TokenIcon.scss';

interface TokenIconProps {
  address?: string;
  name: string;
  size?: 'small' | 'default' | '32';
  url?: string;
}

export function TokenIcon({ address = '', name, size = 'default', url }: TokenIconProps) {
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
    <div className={`token-icon token-icon--size-${size || ''}`}>
      <img src={iconUrl} alt={name} />
    </div>
  );
}
