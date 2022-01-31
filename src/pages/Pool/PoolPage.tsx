import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import TokenUtils from 'utils/tokenUtils';

import Accordion from 'components/Accordion';
import Button from 'components/Button';
import TokenIcon from 'components/TokenIcon';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectPoolPools } from 'store/pool/poolSlice';
import { getPoolPools } from 'store/pool/poolThunks';
import { selectWalletAdapter } from 'store/wallet/walletSlice';

import BoxDeleteIcon from '../../components/Icons/BoxDeleteIcon';
import './PoolPage.scss';

function PoolPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const walletAdapter = useAppSelector(selectWalletAdapter);
  const pools = useAppSelector(selectPoolPools);

  useEffect(() => {
    dispatch(getPoolPools());
  }, [dispatch]);

  return (
    <div className="pool-wrapper">
      <div className="pool-header-wrapper">
        <div className="pool-header">
          <h5>{t('Your Liquidity')}</h5>
        </div>
        <Button onClick={navigate.bind(null, 'add')}>{t('Add Liquidity')}</Button>
      </div>
      <div className="pool-list-wrapper">
        {!walletAdapter && <p>{t('Connect to a wallet to view your liquidity.')}</p>}
        {walletAdapter && pools.length === 0 && (
          <div className="pool-list--empty">
            <BoxDeleteIcon />
            <p>{t('No liquidity found.')}</p>
          </div>
        )}
        {walletAdapter && pools.length > 0 && (
          <Accordion
            panels={pools.map((pool, index) => {
              const share = new BigNumber(pool.pool.amount)
                .multipliedBy('100')
                .div(pool.pool.overallAmount)
                .precision(2);
              const shareText = share.lt('0.01') ? '<0.01%' : `${share.toFixed()}%`;

              return {
                label: (
                  <div key={index} className="pool-item-wrapper">
                    <div className="pool-item-tokens">
                      <TokenIcon address={pool.input0.token.address} name={pool.input0.token.name} />
                      <TokenIcon address={pool.input1.token.address} name={pool.input1.token.name} />
                    </div>
                    <span className="title-2">
                      {pool.input0.token.symbol}/{pool.input1.token.symbol}
                    </span>
                  </div>
                ),
                content: (
                  <div key={index} className="pool-item-details-wrapper">
                    <div>
                      <p>{t('Your pool tokens')}</p>
                      <p>{TokenUtils.toDisplay(pool.pool)}</p>
                    </div>
                    <div>
                      <p>
                        <Trans>Pooled {{ symbol0: pool.input0.token.symbol }}</Trans>
                      </p>
                      <p>
                        {TokenUtils.toDisplay(pool.input0)}
                        <TokenIcon address={pool.input0.token.address} name={pool.input0.token.name} size={'small'} />
                      </p>
                    </div>
                    <div>
                      <p>
                        <Trans>Pooled {{ symbol0: pool.input1.token.symbol }}</Trans>
                      </p>
                      <p>
                        {TokenUtils.toDisplay(pool.input1)}
                        <TokenIcon address={pool.input1.token.address} name={pool.input1.token.name} size={'small'} />
                      </p>
                    </div>
                    <div>
                      <p>{t('Your pool share')}</p>
                      <p>{shareText}</p>
                    </div>
                    <div className="pool-item-details-actions">
                      <Button
                        variant={'secondary'}
                        size={'medium'}
                        onClick={navigate.bind(null, `add/${pool.input0.token.address}/${pool.input1.token.address}`)}
                      >
                        {t('Add')}
                      </Button>
                      <Button
                        variant={'secondary'}
                        size={'medium'}
                        onClick={navigate.bind(
                          null,
                          `remove/${pool.input0.token.address}/${pool.input1.token.address}`,
                        )}
                      >
                        {t('Remove')}
                      </Button>
                    </div>
                  </div>
                ),
              };
            })}
          />
        )}
      </div>
      <p>
        {t("Don't see a pool you joined?")} <Link to="import">{t('Import it.')}</Link>
      </p>
    </div>
  );
}

export default PoolPage;
