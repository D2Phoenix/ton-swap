import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EstimateTxType } from 'types/transactionInterfaces';
import { WalletStatus } from 'types/walletAdapterInterface';

import { render, tick } from 'utils/testUtils';

import StubWalletService from 'api/stubWalletService';

import { initialState as swapInitialState } from 'store/swap/swapSlice';
import { swapService } from 'store/swap/swapThunks';
import { initialState as walletInitialState } from 'store/wallet/walletSlice';
import * as walletThunks from 'store/wallet/walletThunks';

import SwapPage from './SwapPage';

test('[Swap Page] Render', () => {
  render(<SwapPage />);

  expect(screen.getByText(/Swap/i)).toBeInTheDocument();
  expect(screen.getByText(/Trade tokens in an instant/i)).toBeInTheDocument();
  expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
});

test('[Swap Page] Connect wallet should work', async () => {
  const connectWallet = jest.spyOn(walletThunks, 'connectWallet');

  render(<SwapPage />);

  screen.getByText(/Connect Wallet/i).click();

  expect(connectWallet).toHaveBeenCalled();
});

test('[Swap Page] `Enter an amount` button text should be shown after connect', async () => {
  render(<SwapPage />, {
    preloadedState: {
      wallet: {
        ...walletInitialState,
        adapter: new StubWalletService(),
        connectionStatus: WalletStatus.CONNECTED,
      },
    },
  });

  const button = screen.getByText(/Enter an amount/i);
  expect(button).toBeInTheDocument();
  expect(button).toBeDisabled();
});

test('[Swap Page] `Select a token` button text should be shown on enter first input amount', async () => {
  render(<SwapPage />, {
    preloadedState: {
      wallet: {
        ...walletInitialState,
        adapter: new StubWalletService(),
        connectionStatus: WalletStatus.CONNECTED,
      },
    },
  });

  userEvent.type(screen.getAllByPlaceholderText('0.0')[0], '1');

  const button = screen.getByText(/Select a token/i);
  expect(button).toBeInTheDocument();
  expect(button).toBeDisabled();
});

test('[Swap Page] `Swap` button text should be shown', async () => {
  jest.spyOn(swapService, 'getTrade').mockReturnValue(
    Promise.resolve({
      amount: '1',
      quote: '10',
      txType: EstimateTxType.EXACT_IN,
      trade: {
        fee: '0',
        liquidityProviderFee: '0',
        maximumSent: '',
        minimumReceived: '',
        priceImpact: '0',
        priceImpactSeverity: 0,
        insufficientLiquidity: false,
        rate: '0',
      },
    }),
  );

  render(<SwapPage />, {
    preloadedState: {
      wallet: {
        ...walletInitialState,
        adapter: new StubWalletService(),
        connectionStatus: WalletStatus.CONNECTED,
        balances: {
          TON: '10',
        },
        permissions: {
          TON: true,
        },
      },
      swap: {
        ...swapInitialState,
        input1: {
          token: {
            address: '1',
            chainId: 1,
            decimals: 9,
            logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
            name: 'Ton2',
            symbol: 'TON2',
          },
          amount: '',
        },
      },
    },
  });

  await userEvent.type(screen.getAllByPlaceholderText('0.0')[0], '1');
  await tick();

  const button = screen.getAllByText(/Swap/i)[1];
  expect(swapService.getTrade).toHaveBeenCalled();
  expect(button).toBeInTheDocument();
  expect(button).toBeEnabled();
  expect(screen.getByDisplayValue('10')).toBeInTheDocument();
});

test('[Swap Page] `Insufficient liquidity for this trade` button text should be shown', async () => {
  jest.spyOn(swapService, 'getTrade').mockReturnValue(
    Promise.resolve({
      amount: '1',
      quote: '',
      txType: EstimateTxType.EXACT_IN,
      trade: {
        fee: '0',
        liquidityProviderFee: '0',
        maximumSent: '',
        minimumReceived: '',
        priceImpact: '0',
        priceImpactSeverity: 0,
        insufficientLiquidity: true,
        rate: '0',
      },
    }),
  );

  render(<SwapPage />, {
    preloadedState: {
      wallet: {
        ...walletInitialState,
        adapter: new StubWalletService(),
        connectionStatus: WalletStatus.CONNECTED,
        balances: {
          TON: '10',
        },
        permissions: {
          TON: true,
        },
      },
      swap: {
        ...swapInitialState,
        input1: {
          token: {
            address: '1',
            chainId: 1,
            decimals: 9,
            logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
            name: 'Other',
            symbol: 'Other',
          },
          amount: '',
        },
      },
    },
  });

  await userEvent.type(screen.getAllByPlaceholderText('0.0')[0], '1');
  await tick();

  const button = screen.getByText(/Insufficient liquidity for this trade./i);
  expect(swapService.getTrade).toHaveBeenCalled();
  expect(button).toBeInTheDocument();
  expect(button).toBeDisabled();
});

test('[Swap Page] `Allow the TONSwap Protocol to use your TOKEN` button should be shown', async () => {
  jest.spyOn(swapService, 'getTrade').mockReturnValue(
    Promise.resolve({
      amount: '1',
      quote: '1',
      txType: EstimateTxType.EXACT_IN,
      trade: {
        fee: '0',
        liquidityProviderFee: '0',
        maximumSent: '',
        minimumReceived: '',
        priceImpact: '0',
        priceImpactSeverity: 0,
        insufficientLiquidity: false,
        rate: '0',
      },
    }),
  );

  render(<SwapPage />, {
    preloadedState: {
      wallet: {
        ...walletInitialState,
        adapter: new StubWalletService(),
        connectionStatus: WalletStatus.CONNECTED,
        balances: {
          TON: '10',
        },
        permissions: {
          TON: false,
        },
      },
      swap: {
        ...swapInitialState,
        input1: {
          token: {
            address: '1',
            chainId: 1,
            decimals: 9,
            logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
            name: 'Other',
            symbol: 'Other',
          },
          amount: '',
        },
      },
    },
  });

  await userEvent.type(screen.getAllByPlaceholderText('0.0')[0], '1');
  await tick();

  const button = screen.getByText(/Allow the TONSwap Protocol to use your TON/i);
  const swapButton = screen.getAllByText(/Swap/i)[2];
  expect(swapService.getTrade).toHaveBeenCalled();
  expect(button).toBeInTheDocument();
  expect(button).toBeEnabled();
  expect(swapButton).toBeInTheDocument();
  expect(swapButton).toBeDisabled();
});
