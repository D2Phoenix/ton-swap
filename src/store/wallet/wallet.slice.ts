import { createSlice } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js';

import type { RootState } from 'store/store'
import {
    connectWallet,
    getWalletAddress,
    getWalletBalance,
    getWalletUseTokenPermission,
    setWalletUseTokenPermission
} from './wallet.thunks';
import { WalletAdapterInterface } from 'interfaces/wallet-adapter.interface';

interface WalletState {
    adapter: WalletAdapterInterface | null,
    address: string;
    balances: Record<string, BigNumber>,
    permissions: Record<string, boolean>,
}

const initialState: WalletState = {
    adapter: null,
    address: '',
    balances: {},
    permissions: {},
}

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
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
    },
})

export const {  } = walletSlice.actions

export const selectWalletBalances = (state: RootState) => state.wallet.balances;

export const selectWalletAdapter = (state: RootState) => state.wallet.adapter;

export const selectWalletAddress = (state: RootState) => state.wallet.address;

export const selectWalletPermissions = (state: RootState) => state.wallet.permissions;

export default walletSlice.reducer;
