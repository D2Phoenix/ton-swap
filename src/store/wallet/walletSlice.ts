import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';

import { InputPoolInterface } from 'types/inputPoolInterface';
import { InputTokenInterface } from 'types/inputTokenInterface';
import { TransactionInterface, TxStatus, TxType } from 'types/transactionInterfaces';
import { WalletAdapterInterface, WalletStatus, WalletType } from 'types/walletAdapterInterface';

import TokenUtils from 'utils/tokenUtils';

import StubWalletService from 'api/stubWalletService';
import TonWalletService from 'api/tonWalletService';

import type { RootState } from 'store/store';

import {
  connectWallet,
  disconnectWallet,
  getWalletAddress,
  getWalletBalance,
  getWalletBalances,
  getWalletUseTokenPermission,
  setWalletUseTokenPermission,
  walletAddLiquidity,
  walletCheckTransactions,
  walletRemoveLiquidity,
  walletSwap,
} from './walletThunks';

interface WalletState {
  adapter: WalletAdapterInterface | null;
  connectionStatus: WalletStatus;
  address: string;
  balances: Record<string, string>;
  permissions: Record<string, boolean>;
  transactions: TransactionInterface[];
  tx: {
    type: TxType;
    status: TxStatus;
    input0: InputTokenInterface;
    input1: InputTokenInterface;
    pool: InputPoolInterface;
  };
}

export const initialState: WalletState = {
  adapter: null,
  connectionStatus: WalletStatus.DISCONNECTED,
  address: '',
  balances: {},
  permissions: {},
  transactions: [],
  tx: {
    type: null as any,
    status: TxStatus.INITIAL,
    input0: null as any,
    input1: null as any,
    pool: null as any,
  },
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    resetTransaction: (state, action: PayloadAction<void>) => {
      state.tx.status = TxStatus.INITIAL;
    },
    setNotified: (state, action: PayloadAction<TransactionInterface>) => {
      const transaction = state.transactions.find((transaction) => {
        return transaction.id === action.payload.id;
      });
      if (transaction) {
        transaction.notified = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(connectWallet.pending, (state, action) => {
      if (action.meta.arg === WalletType.stubWallet) {
        state.adapter = new StubWalletService();
      }
      if (action.meta.arg === WalletType.tonWallet) {
        state.adapter = new TonWalletService();
      }
      state.connectionStatus = WalletStatus.CONNECTING;
    });
    builder.addCase(connectWallet.fulfilled, (state, action) => {
      state.adapter = action.payload.adapter;
      state.address = action.payload.address;
      state.balances = action.payload.balances;
      state.permissions = action.payload.permissions;
      state.connectionStatus = WalletStatus.CONNECTED;
    });
    builder.addCase(disconnectWallet.fulfilled, (state, action) => {
      state.adapter = null;
      state.address = '';
      state.balances = {};
      state.connectionStatus = WalletStatus.DISCONNECTED;
    });
    builder.addCase(getWalletBalance.fulfilled, (state, action) => {
      state.balances[action.payload.token.symbol] = action.payload.value;
    });
    builder.addCase(getWalletBalances.fulfilled, (state, action) => {
      action.payload.forEach((data: any) => {
        state.balances[data.token.symbol] = data.value;
      });
    });
    builder.addCase(getWalletAddress.fulfilled, (state, action) => {
      state.address = action.payload;
    });
    builder.addCase(getWalletUseTokenPermission.fulfilled, (state, action) => {
      state.permissions[action.payload.token.symbol] = action.payload.value;
    });
    builder.addCase(setWalletUseTokenPermission.fulfilled, (state, action) => {
      state.permissions[action.payload.token.symbol] = action.payload.value;
    });
    builder.addCase(walletSwap.pending, (state, action) => {
      state.tx.status = TxStatus.PENDING;
      state.tx.type = TxType.SWAP;
      if (action.meta.arg) {
        state.tx.input0 = action.meta.arg.input0;
        state.tx.input1 = action.meta.arg.input1;
      }
    });
    builder.addCase(walletSwap.fulfilled, (state, action) => {
      if (state.tx.status === TxStatus.PENDING) {
        state.tx.status = action.payload.status;
        if (action.payload.state) {
          const transaction: TransactionInterface = {
            id: Math.random().toString(),
            type: TxType.SWAP,
            status: action.payload.status,
            token0: action.payload.state.input0.token,
            token1: action.payload.state.input1.token,
            amount0: TokenUtils.toDisplay(action.payload.state.input0, 2),
            amount1: TokenUtils.toDisplay(action.payload.state.input1, 2),
            notified: false,
          };
          state.transactions = [transaction, ...state.transactions];
        }
      }
    });
    builder.addCase(walletAddLiquidity.pending, (state, action) => {
      state.tx.status = TxStatus.PENDING;
      state.tx.type = TxType.MINT;
      if (action.meta.arg) {
        state.tx.input0 = action.meta.arg.input0;
        state.tx.input1 = action.meta.arg.input1;
      }
    });
    builder.addCase(walletAddLiquidity.fulfilled, (state, action) => {
      if (state.tx.status === TxStatus.PENDING) {
        state.tx.status = action.payload.status;
        if (action.payload.state) {
          const transaction: TransactionInterface = {
            id: Math.random().toString(),
            type: TxType.MINT,
            status: action.payload.status,
            token0: action.payload.state.input0.token,
            token1: action.payload.state.input1.token,
            amount0: TokenUtils.toDisplay(action.payload.state.input0, 2),
            amount1: TokenUtils.toDisplay(action.payload.state.input1, 2),
            notified: false,
          };
          state.transactions = [transaction, ...state.transactions];
        }
      }
    });
    builder.addCase(walletRemoveLiquidity.pending, (state, action) => {
      state.tx.status = TxStatus.PENDING;
      state.tx.type = TxType.BURN;
      if (action.meta.arg) {
        state.tx.input0 = action.meta.arg.input0;
        state.tx.input1 = action.meta.arg.input1;
        state.tx.pool = action.meta.arg.pool;
      }
    });
    builder.addCase(walletRemoveLiquidity.fulfilled, (state, action) => {
      if (state.tx.status === TxStatus.PENDING) {
        state.tx.status = action.payload.status;
        if (action.payload.state) {
          const transaction: TransactionInterface = {
            id: Math.random().toString(),
            type: TxType.BURN,
            status: action.payload.status,
            token0: action.payload.state.input0.token,
            token1: action.payload.state.input1.token,
            amount0: TokenUtils.toDisplay(action.payload.state.input0, 2),
            amount1: TokenUtils.toDisplay(action.payload.state.input1, 2),
            notified: false,
          };
          state.transactions = [transaction, ...state.transactions];
        }
      }
    });
    builder.addCase(walletCheckTransactions.fulfilled, (state, action) => {
      state.transactions.forEach((transaction) => {
        if (action.payload[transaction.id]) {
          transaction.status = action.payload[transaction.id];
        }
      });
    });
  },
});

export const { resetTransaction, setNotified } = walletSlice.actions;

export const selectWalletBalances = (state: RootState) => state.wallet.balances;

export const selectWalletAdapter = (state: RootState) => state.wallet.adapter;

export const selectWalletConnectionStatus = (state: RootState) => state.wallet.connectionStatus;

export const selectWalletAddress = (state: RootState) => state.wallet.address;

export const selectWalletPermissions = (state: RootState) => state.wallet.permissions;

export const selectWalletTransaction = (state: RootState) => state.wallet.tx;

export const selectWalletTransactions = (state: RootState) => state.wallet.transactions;

export const selectWalletConfirmedTransactions = createSelector(selectWalletTransactions, (transactions) =>
  transactions.filter((item) => item.status === TxStatus.CONFIRMED),
);

export const selectWalletNotNotifiedTransactions = createSelector(selectWalletTransactions, (transactions) =>
  transactions.filter(
    (item) => !item.notified && (item.status === TxStatus.SUCCEED || item.status === TxStatus.FAILED),
  ),
);

export default walletSlice.reducer;
