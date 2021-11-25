import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js';

import type { RootState } from 'store/store'
import {
    connectWallet,
    getWalletAddress,
    getWalletBalance,
    getWalletUseTokenPermission,
    setWalletUseTokenPermission, walletSwap
} from './wallet.thunks';
import { WalletAdapterInterface } from 'interfaces/walletAdapterInterface';
import { WalletTransactionStatus } from '../../interfaces/transactionInterfaces';

interface WalletState {
    adapter: WalletAdapterInterface | null,
    address: string;
    balances: Record<string, BigNumber>,
    permissions: Record<string, boolean>,
    transaction: {
        status: WalletTransactionStatus;
    },
}

const initialState: WalletState = {
    adapter: null,
    address: '',
    balances: {},
    permissions: {},
    transaction: {
        status: WalletTransactionStatus.INITIAL,
    }
}

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        resetTransaction: (state, action: PayloadAction<void>) => {
            state.transaction.status = WalletTransactionStatus.INITIAL;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(connectWallet.fulfilled,  (state, action) => {
            state.adapter = action.payload.adapter;
            state.address = action.payload.address;
            state.balances = action.payload.balances
            state.permissions = action.payload.permissions;
        })
        builder.addCase(getWalletBalance.fulfilled, (state, action) => {
            state.balances[action.payload.token.symbol] = action.payload.value;
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
            state.transaction.status = WalletTransactionStatus.PENDING;
        });
        builder.addCase(walletSwap.fulfilled, (state, action) => {
            state.transaction.status = action.payload;
        });
    },
})

export const { resetTransaction } = walletSlice.actions

export const selectWalletBalances = (state: RootState) => state.wallet.balances;

export const selectWalletAdapter = (state: RootState) => state.wallet.adapter;

export const selectWalletAddress = (state: RootState) => state.wallet.address;

export const selectWalletPermissions = (state: RootState) => state.wallet.permissions;

export const selectWalletTransaction = (state: RootState) => state.wallet.transaction;

export default walletSlice.reducer;
