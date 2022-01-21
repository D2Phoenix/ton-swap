import { useCallback, useMemo, useState } from 'react';

import './SelectWalletModal.scss';
import Modal from 'components/Modal';
import { useAppDispatch } from 'store/hooks';
import { connectWallet } from 'store/wallet/walletThunks';
import { WalletType } from 'types/walletAdapterInterface';
import { Trans, useTranslation } from 'react-i18next';

interface ConnectWalletProps {
  onClose: () => void;
}

export function SelectWalletModal({ onClose }: ConnectWalletProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [isClose, setIsClose] = useState(false);

  const wallets = useMemo(() => {
    return {
      [WalletType.stubWallet]: true,
      [WalletType.tonWallet]: !!(window as any).ton,
    };
  }, []);

  const closeHandler = useCallback(() => {
    onClose();
  }, [onClose]);

  const connectHandler = useCallback(
    (type: WalletType) => {
      if (wallets[type]) {
        dispatch(connectWallet(type));
        setIsClose(true);
      }
    },
    [dispatch, wallets],
  );

  return (
    <Modal header={t('Connect Wallet')} className={'connect-wallet-modal'} close={isClose} onClose={closeHandler}>
      <div className="connect-wallet-wrapper">
        <div className="wallet-item title-2" onClick={connectHandler.bind(null, WalletType.stubWallet)}>
          <p className="title-2">Stub Wallet</p>
        </div>
        <div className="wallet-item" onClick={connectHandler.bind(null, WalletType.tonWallet)}>
          <p className="title-2">
            TON Wallet
            <label className="medium">
              {!wallets[WalletType.tonWallet] && (
                <Trans>
                  Is not installed.{' '}
                  <a
                    href="https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd"
                    target="_blank"
                    rel="noreferrer"
                    className="medium"
                  >
                    Install?
                  </a>
                </Trans>
              )}
            </label>
          </p>
          <img src="/images/ton_wallet.png" />
        </div>
      </div>
    </Modal>
  );
}
