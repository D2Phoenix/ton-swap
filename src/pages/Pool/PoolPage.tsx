import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import './PoolPage.scss';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectWalletAdapter } from 'store/wallet/walletSlice';
import { getPoolPools } from 'store/pool/poolThunks';
import { selectPoolPools } from 'store/pool/poolSlice';
import Accordion from 'components/Accordion';
import TokenUtils from 'utils/tokenUtils';
import TokenIcon from 'components/TokenIcon';
import BigNumber from 'bignumber.js';
import DexForm from '../../components/DexForm';

function PoolPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const walletAdapter = useAppSelector(selectWalletAdapter);
  const pools = useAppSelector(selectPoolPools);

  useEffect(() => {
    dispatch(getPoolPools());
  }, [dispatch]);

  return (
    <>
      <DexForm
        header={t('Your Liquidity')}
        headerTooltip={t(
          'When you add liquidity, you are given pool tokens that represent your share. If you don’t see a pool you joined in this list, try importing a pool below.',
        )}
        subheader={t('Remove liquidity to receive tokens back')}
        content={
          <div className="pool-list-wrapper">
            {!walletAdapter && <span>{t('Connect to a wallet to view your liquidity.')}</span>}
            {walletAdapter && pools.length === 0 && <span>{t('No liquidity found.')}</span>}
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
                        <div>
                          <TokenIcon address={pool.input0.token.address} name={pool.input0.token.name} />
                          <TokenIcon address={pool.input1.token.address} name={pool.input1.token.name} />
                        </div>
                        <span>
                          {pool.input0.token.symbol}/{pool.input1.token.symbol}
                        </span>
                      </div>
                    ),
                    content: (
                      <div key={index} className="pool-item-details-wrapper">
                        <div>
                          <div>
                            <Trans>Pooled {{ symbol0: pool.input0.token.symbol }}</Trans>
                          </div>
                          <div>
                            {TokenUtils.toDisplay(pool.input0)}
                            <TokenIcon
                              address={pool.input0.token.address}
                              name={pool.input0.token.name}
                              size={'small'}
                            />
                          </div>
                        </div>
                        <div>
                          <div>
                            <Trans>Pooled {{ symbol0: pool.input1.token.symbol }}</Trans>
                          </div>
                          <div>
                            {TokenUtils.toDisplay(pool.input1)}
                            <TokenIcon
                              address={pool.input1.token.address}
                              name={pool.input1.token.name}
                              size={'small'}
                            />
                          </div>
                        </div>
                        <div>
                          <div>{t('Your pool tokens')}</div>
                          <div>{TokenUtils.toDisplay(pool.pool)}</div>
                        </div>
                        <div>
                          <div>{t('Your pool share')}</div>
                          <div>{shareText}</div>
                        </div>
                        <div>
                          <Link
                            className="btn btn-primary add__btn"
                            to={`add/${pool.input0.token.address}/${pool.input1.token.address}`}
                          >
                            {t('Add')}
                          </Link>
                          <Link
                            className="btn btn-primary add__btn"
                            to={`remove/${pool.input0.token.address}/${pool.input1.token.address}`}
                          >
                            {t('Remove')}
                          </Link>
                        </div>
                      </div>
                    ),
                  };
                })}
              />
            )}
          </div>
        }
        actions={
          <>
            <Link className="btn btn-primary add__btn" to="add">
              {t('Add Liquidity')}
            </Link>
            <div className="import-pool">
              <span>{t("Don't see a pool you joined?")}</span>
              <Link className="btn btn-outline" to="import">
                {t('Import Pool')}
              </Link>
            </div>
          </>
        }
      />
    </>
  );
}

export default PoolPage;
