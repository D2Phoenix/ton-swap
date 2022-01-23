import { useCallback, useMemo } from 'react';
import { Trans } from 'react-i18next';

import { WalletType } from 'types/walletAdapterInterface';

import { useAppDispatch } from 'store/hooks';
import { connectWallet } from 'store/wallet/walletThunks';

import './SelectWalletModal.scss';

interface ConnectWalletProps {
  onClose: () => void;
}

export const SelectWalletModalOptions = {
  header: 'Connect Wallet',
  className: 'connect-wallet-modal',
};

export function SelectWalletModal({ onClose }: ConnectWalletProps) {
  const dispatch = useAppDispatch();

  const wallets = useMemo(() => {
    return {
      [WalletType.stubWallet]: true,
      [WalletType.tonWallet]: !!(window as any).ton,
    };
  }, []);

  const connectHandler = useCallback(
    (type: WalletType) => {
      if (wallets[type]) {
        dispatch(connectWallet(type));
        onClose();
      }
    },
    [dispatch, wallets],
  );

  return (
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
  );
}
