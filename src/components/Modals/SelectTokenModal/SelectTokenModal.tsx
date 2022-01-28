import BigNumber from 'bignumber.js';
import React, { CSSProperties, MouseEventHandler, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BALANCE_PRECISION } from 'constants/swap';

import TokenInterface from 'types/tokenInterface';

import Button from 'components/Button';
import ChevronRightIcon from 'components/Icons/ChevronRightIcon';
import Input from 'components/Input';
import List, { ListItem } from 'components/List';
import TokenIcon from 'components/TokenIcon';

import { selectTokenLists, selectTokens } from 'store/app/appSlice';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectWalletAdapter, selectWalletBalances } from 'store/wallet/walletSlice';
import { getWalletBalances } from 'store/wallet/walletThunks';

import './SelectTokenModal.scss';

interface TokenManageListParams {
  onBack: MouseEventHandler;
}

function TokenManageList({ onBack }: TokenManageListParams) {
  const { t } = useTranslation();

  const [listUrl, setListUrl] = useState('');
  const tokenLists = useAppSelector(selectTokenLists);

  return (
    <div className="token-select-wrapper">
      <div className="token-select-header">
        <Button variant={'default'} icon={<ChevronRightIcon revert={true} />} onClick={onBack} />
        <span className="text-semibold">{t('Managa tokens')}</span>
      </div>
      <input
        placeholder={t('https:// or ipfs:// or ENS name')}
        value={listUrl}
        onChange={(event) => setListUrl(event.target.value)}
      />
      <div className="token-select-list">
        {tokenLists.map((tokenList, index) => {
          return (
            <div key={index} className="token-select-item">
              <TokenIcon address={''} name={tokenList.name} url={tokenList.logoURI} />
              <div className="token-name">
                <span className="text-semibold">{tokenList.name}</span>
                <span className="text-small">{tokenList.tokens.length} tokens</span>
              </div>
              <div className="token-balance">
                <input type="checkbox" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TokenSelectProps {
  onClose: (value: TokenInterface) => void;
  balancesFirst?: boolean;
}

export const SelectTokenModalOptions = {
  header: 'Select a token',
  className: 'token-select-modal',
};

export function SelectTokenModal({ onClose, balancesFirst }: TokenSelectProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const tokens = useAppSelector(selectTokens);
  const balances = useAppSelector(selectWalletBalances);
  const walletAdapter = useAppSelector(selectWalletAdapter);
  const [query, setQuery] = useState('');
  const [showTokenManage, setShowTokenManage] = useState(false);

  const visibleTokens = useMemo(() => {
    const result = tokens.filter(
      (token) =>
        token.symbol.toLowerCase().startsWith(query.toLowerCase()) ||
        token.address.toLowerCase().startsWith(query.toLowerCase()),
    );
    if (balancesFirst) {
      result.sort((a: TokenInterface, b: TokenInterface) => {
        if (a.symbol === 'TON' || b.symbol === 'TON') {
          return 1;
        }
        const aBalance = new BigNumber(balances[a.symbol]) || new BigNumber('0');
        const bBalance = new BigNumber(balances[b.symbol]) || new BigNumber('0');
        if (a.symbol > b.symbol) {
          return bBalance.minus(aBalance).toNumber() || 1;
        }
        if (b.symbol > a.symbol) {
          return bBalance.minus(aBalance).toNumber() || -1;
        }
        return 0;
      });
    }
    return result;
  }, [tokens, query, balancesFirst, balances]);

  useEffect(() => {
    if (walletAdapter) {
      dispatch(getWalletBalances(tokens));
    }
  }, [dispatch, walletAdapter, balances, tokens]);

  const selectHandler = useCallback(
    (token: TokenInterface) => {
      onClose(token);
    },
    [onClose],
  );

  const changeHandler = useCallback((event) => {
    setQuery(event.target.value);
  }, []);

  const toggleManageTokens = useCallback(() => {
    setShowTokenManage((prev) => !prev);
  }, []);

  return (
    <>
      {!showTokenManage && (
        <div className="token-select-wrapper">
          <Input placeholder={t('Search name or paste address')} value={query} onChange={changeHandler} />
          <List height={436} itemCount={visibleTokens.length} emptyText={t('No Tokens found')}>
            {(index: number, style: CSSProperties) => {
              const token = visibleTokens[index];
              const balance = balances[token.symbol]
                ? new BigNumber(balances[token.symbol]).precision(BALANCE_PRECISION).toFixed()
                : '';
              return (
                <ListItem
                  icon={<TokenIcon address={token.address} name={token.name} size={'32'} />}
                  title={token.symbol}
                  subtitle={token.name}
                  total={balance}
                  style={style}
                  onClick={selectHandler.bind(null, token)}
                />
              );
            }}
          </List>
          <Button variant={'default'} onClick={toggleManageTokens}>
            {t('Manage')}
          </Button>
        </div>
      )}
      {showTokenManage && <TokenManageList onBack={toggleManageTokens} />}
    </>
  );
}
