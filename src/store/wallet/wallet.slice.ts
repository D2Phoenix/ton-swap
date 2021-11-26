import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js';

import type { RootState } from 'store/store'
import {
    connectWallet,
    getWalletAddress,
    getWalletBalance, getWalletBalances,
    getWalletUseTokenPermission,
    setWalletUseTokenPermission, walletAddLiquidity, walletRemoveLiquidity, walletSwap
} from './wallet.thunks';
import { WalletAdapterInterface } from 'interfaces/walletAdapterInterface';
import { WalletTxStatus } from '../../interfaces/transactionInterfaces';

interface WalletState {
    adapter: WalletAdapterInterface | null,
    address: string;
    balances: Record<string, BigNumber>,
    permissions: Record<string, boolean>,
    tx: {
        status: WalletTxStatus;
    },
}

const initialState: WalletState = {
    adapter: null,
    address: '',
    balances: {},
    permissions: {},
    tx: {
        status: WalletTxStatus.INITIAL,
    }
}

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        resetTransaction: (state, action: PayloadAction<void>) => {
            state.tx.status = WalletTxStatus.INITIAL;
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
        builder.addCase(getWalletBalances.fulfilled, (state, action) => {
            action.payload.forEach((data) => {
                state.balances[data.token.symbol] = data.value;
            })
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
            state.tx.status = WalletTxStatus.PENDING;
        });
        builder.addCase(walletSwap.fulfilled, (state, action) => {
            state.tx.status = action.payload;
        });
        builder.addCase(walletAddLiquidity.pending, (state, action) => {
            state.tx.status = WalletTxStatus.PENDING;
        });
        builder.addCase(walletAddLiquidity.fulfilled, (state, action) => {
            state.tx.status = action.payload;
        });
        builder.addCase(walletRemoveLiquidity.pending, (state, action) => {
            state.tx.status = WalletTxStatus.PENDING;
        });
        builder.addCase(walletRemoveLiquidity.fulfilled, (state, action) => {
            state.tx.status = action.payload;
        });
    },
})

export const { resetTransaction } = walletSlice.actions

export const selectWalletBalances = (state: RootState) => state.wallet.balances;

export const selectWalletAdapter = (state: RootState) => state.wallet.adapter;

export const selectWalletAddress = (state: RootState) => state.wallet.address;

export const selectWalletPermissions = (state: RootState) => state.wallet.permissions;

export const selectWalletTransaction = (state: RootState) => state.wallet.tx;

export default walletSlice.reducer;
