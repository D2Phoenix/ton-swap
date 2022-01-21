import React, { useCallback, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';

import './TokenInput.scss';
import Button from 'components/Button';
import ArrowDownIcon from 'components/Icons/ArrowDownIcon';
import TokenInterface from 'types/tokenInterface';
import { BALANCE_PRECISION } from 'constants/swap';
import PoolInterface from 'types/poolInterface';
import TokenIcon from 'components/TokenIcon';
import TokenUtils from 'utils/tokenUtils';
import { useTranslation } from 'react-i18next';
import SelectTokenModal from 'components/Modals/SelectTokenModal';

interface TokenInputProps {
  balance?: string;
  token: TokenInterface | PoolInterface | undefined;
  value: string | undefined;
  editable: boolean;
  selectable: boolean;
  showMax?: boolean;
  onChange?: (value: string | null) => void;
  onSelect?: (value: TokenInterface | PoolInterface | undefined) => void;
  loading?: boolean;
  primary?: boolean;
  balancesFirst?: boolean;
  label?: string;
}

const INPUT_REGEXP = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);

export function TokenInput({
  balance,
  token,
  value,
  showMax,
  editable,
  selectable,
  loading,
  primary,
  onChange,
  onSelect,
  balancesFirst,
  label,
}: TokenInputProps) {
  const { t } = useTranslation();
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const valueDisplay = useMemo(() => {
    if (!value) {
      return '';
    }
    if (primary) {
      return value;
    }
    return TokenUtils.toNumberDisplay(value);
  }, [value, primary]);

  const tokenSelectToggle = useCallback(() => {
    setShowTokenSelect((prev) => !prev);
  }, []);

  const tokenSelectHandler = useCallback(
    (token) => {
      onSelect && onSelect(token);
    },
    [onSelect],
  );

  const changeHandler = useCallback(
    (event) => {
      const value = event.target.value.replace(/,/g, '.');
      if (value === '') {
        return onChange && onChange(null);
      }
      if (INPUT_REGEXP.test(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
        onChange && onChange(value);
      }
    },
    [onChange],
  );

  const maxHandler = useCallback(() => {
    if (balance) {
      changeHandler({
        target: {
          value: balance,
        },
      });
    }
  }, [changeHandler, balance]);

  const focusHandler = useCallback(() => {
    setIsFocused((value) => !value);
  }, []);

  const balanceVisible = useMemo(() => {
    if (balance) {
      return new BigNumber(balance).precision(BALANCE_PRECISION).toFixed();
    }
    return '-';
  }, [balance]);

  const simpleToken = token as TokenInterface;
  const poolToken = token as PoolInterface;

  return (
    <div className={`input-wrapper ${isFocused ? 'focused' : ''}`}>
      <div className={'token-input' + (loading ? ' loading' : '')}>
        {label && <p>{label}</p>}
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          minLength={1}
          maxLength={79}
          pattern="^[0-9]*[.,]?[0-9]*$"
          placeholder="0.0"
          readOnly={!editable}
          value={valueDisplay}
          onChange={changeHandler}
          onFocus={focusHandler}
          onBlur={focusHandler}
        />
        <label className="balance small">
          {t('Balance')}: {balanceVisible} {!!token && token.symbol}
        </label>
      </div>
      <div className="token-select">
        {showMax &&
          balance != null &&
          !new BigNumber(balance).eq('0') &&
          (!value || !new BigNumber(balance).eq(value)) && (
            <Button className="medium max__btn" type={'default'} onClick={maxHandler}>
              MAX
            </Button>
          )}
        {token && (
          <div className="dropdown" onClick={tokenSelectToggle}>
            {simpleToken?.logoURI && (
              <TokenIcon address={simpleToken.address} name={simpleToken.name} url={simpleToken.logoURI} />
            )}
            {poolToken?.address0 && <TokenIcon address={poolToken.address0} name={poolToken.name} />}
            {poolToken?.address1 && <TokenIcon address={poolToken.address1} name={poolToken.name} />}
            <p>{token.symbol}</p>
            <ArrowDownIcon />
          </div>
        )}
        {!token && (
          <Button type={'primary'} className="medium select__btn" onClick={tokenSelectToggle}>
            {t('Select a Token')}
          </Button>
        )}
      </div>
      {showTokenSelect && (
        <SelectTokenModal balancesFirst={balancesFirst} onClose={tokenSelectToggle} onSelect={tokenSelectHandler} />
      )}
    </div>
  );
}
