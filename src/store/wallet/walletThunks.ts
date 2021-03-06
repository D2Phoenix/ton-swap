import { createAsyncThunk } from '@reduxjs/toolkit';

import { InputPoolInterface } from 'types/inputPoolInterface';
import { InputTokenInterface } from 'types/inputTokenInterface';
import TokenInterface from 'types/tokenInterface';
import { TransactionInterface, TxStatus } from 'types/transactionInterfaces';
import { WalletType } from 'types/walletAdapterInterface';

import StubWalletService from 'api/stubWalletService';
import TonWalletService from 'api/tonWalletService';

import { RootState } from 'store/store';

export const connectWallet = createAsyncThunk('wallet/connect', async (type: WalletType, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  let adapter = state.wallet.adapter;
  if (adapter === null) {
    if (type === WalletType.stubWallet) {
      adapter = new StubWalletService();
    } else {
      adapter = new TonWalletService();
    }
  }
  const balances: Record<string, string> = {};
  const permissions: Record<string, boolean> = {};
  if (state.swap.input0.token) {
    balances[state.swap.input0.token.symbol] = await adapter.getBalance(state.swap.input0.token);
    permissions[state.swap.input0.token.symbol] = await adapter.getTokenUsePermission(state.swap.input0.token);
  }
  if (state.swap.input1.token) {
    balances[state.swap.input1.token.symbol] = await adapter.getBalance(state.swap.input1.token);
    permissions[state.swap.input1.token.symbol] = await adapter.getTokenUsePermission(state.swap.input1.token);
  }
  if (state.liquidity.input0.token) {
    balances[state.liquidity.input0.token.symbol] = await adapter.getBalance(state.liquidity.input0.token);
    permissions[state.liquidity.input0.token.symbol] = await adapter.getTokenUsePermission(
      state.liquidity.input0.token,
    );
  }
  if (state.liquidity.input1.token) {
    balances[state.liquidity.input1.token.symbol] = await adapter.getBalance(state.liquidity.input1.token);
    permissions[state.liquidity.input1.token.symbol] = await adapter.getTokenUsePermission(
      state.liquidity.input1.token,
    );
  }
  return {
    adapter,
    address: await adapter.getWalletAddress(),
    balances,
    permissions,
  };
});

export const disconnectWallet = createAsyncThunk('wallet/disconnect', async () => {
  return true;
});

export const getWalletBalance = createAsyncThunk('wallet/balance', async (token: TokenInterface, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  const walletAdapterService = state.wallet.adapter;
  return {
    token,
    value: walletAdapterService ? await walletAdapterService.getBalance(token) : '0',
  };
});

export const getWalletBalances = createAsyncThunk('wallet/balances', async (tokens: TokenInterface[], thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  const walletAdapterService = state.wallet.adapter;
  return walletAdapterService ? await walletAdapterService.getBalances(tokens) : [];
});

export const getWalletUseTokenPermission = createAsyncThunk(
  'wallet/token/usePermission',
  async (token: TokenInterface, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const walletAdapterService = state.wallet.adapter;
    return {
      token,
      value: walletAdapterService ? await walletAdapterService.getTokenUsePermission(token) : true,
    };
  },
);

export const setWalletUseTokenPermission = createAsyncThunk(
  'wallet/token/setPermission',
  async (token: TokenInterface, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const walletAdapterService = state.wallet.adapter;
    return {
      token,
      value: walletAdapterService ? await walletAdapterService.setTokenUsePermission(token) : true,
    };
  },
);

export const getWalletAddress = createAsyncThunk('wallet/address', async (request, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  const walletAdapterService = state.wallet.adapter;
  if (walletAdapterService) {
    return await walletAdapterService.getWalletAddress();
  }
  return '';
});

export const walletSwap = createAsyncThunk(
  'wallet/swap',
  async (request: { input0: InputTokenInterface; input1: InputTokenInterface }, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const walletAdapterService = state.wallet.adapter;
    if (walletAdapterService) {
      return {
        status: await walletAdapterService.swap(state.swap),
        state: state.swap,
      };
    }
    return {
      status: TxStatus.INITIAL,
    };
  },
);

export const walletImportLiquidity = createAsyncThunk('wallet/liquidity/import', async (request, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  const walletAdapterService = state.wallet.adapter;
  if (walletAdapterService) {
    return {
      status: await walletAdapterService.addLiquidity(state.liquidity),
      state: state.liquidity,
    };
  }
  return {
    status: TxStatus.INITIAL,
  };
});

export const walletAddLiquidity = createAsyncThunk(
  'wallet/liquidity/add',
  async (request: { input0: InputTokenInterface; input1: InputTokenInterface }, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const walletAdapterService = state.wallet.adapter;
    if (walletAdapterService) {
      return {
        status: await walletAdapterService.addLiquidity(state.liquidity),
        state: state.liquidity,
      };
    }
    return {
      status: TxStatus.INITIAL,
    };
  },
);

export const walletRemoveLiquidity = createAsyncThunk(
  'wallet/liquidity/remove',
  async (request: { input0: InputTokenInterface; input1: InputTokenInterface; pool: InputPoolInterface }, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const walletAdapterService = state.wallet.adapter;
    if (walletAdapterService) {
      return {
        status: await walletAdapterService.removeLiquidity(state.liquidity),
        state: state.liquidity,
      };
    }
    return {
      status: TxStatus.INITIAL,
    };
  },
);

export const walletCheckTransactions = createAsyncThunk(
  'wallet/transactions/check',
  async (transactions: TransactionInterface[], thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const walletAdapterService = state.wallet.adapter;
    if (walletAdapterService) {
      return await walletAdapterService.checkTransactions(transactions);
    }
    return {};
  },
);
