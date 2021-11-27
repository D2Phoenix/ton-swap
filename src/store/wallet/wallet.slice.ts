import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js';

import type { RootState } from 'store/store'
import {
    connectWallet, disconnectWallet,
    getWalletAddress,
    getWalletBalance, getWalletBalances,
    getWalletUseTokenPermission,
    setWalletUseTokenPermission, walletAddLiquidity, walletRemoveLiquidity, walletSwap
} from './wallet.thunks';
import { WalletAdapterInterface } from 'types/walletAdapterInterface';
import { TransactionInterface, TxStatus, EstimateTxType, TxType } from '../../types/transactionInterfaces';
import TokenInterface from '../../types/tokenInterface';
import TokenUtils from '../../utils/tokenUtils';

interface WalletState {
    adapter: WalletAdapterInterface | null,
    address: string;
    balances: Record<string, BigNumber>,
    permissions: Record<string, boolean>,
    transactions: TransactionInterface[],
    tx: {
        status: TxStatus;
    },
}

const initialState: WalletState = {
    adapter: null,
    address: '',
    balances: {},
    permissions: {},
    transactions: [],
    tx: {
        status: TxStatus.INITIAL,
    }
}

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        resetTransaction: (state, action: PayloadAction<void>) => {
            state.tx.status = TxStatus.INITIAL;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(connectWallet.fulfilled,  (state, action) => {
            state.adapter = action.payload.adapter;
            state.address = action.payload.address;
            state.balances = action.payload.balances
            state.permissions = action.payload.permissions;
        });
        builder.addCase(disconnectWallet.fulfilled,  (state, action) => {
            state.adapter = null;
            state.address = '';
            state.balances = {};
        });
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
            state.tx.status = TxStatus.PENDING;
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
                        amount0: TokenUtils.getDisplay(action.payload.state.input0, 2),
                        amount1: TokenUtils.getDisplay(action.payload.state.input1, 2),
                    }
                    state.transactions = [transaction, ...state.transactions];
                }
            }
        });
        builder.addCase(walletAddLiquidity.pending, (state, action) => {
            state.tx.status = TxStatus.PENDING;
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
                        amount0: TokenUtils.getDisplay(action.payload.state.input0, 2),
                        amount1: TokenUtils.getDisplay(action.payload.state.input1, 2),
                    }
                    state.transactions = [transaction, ...state.transactions];
                }
            }
        });
        builder.addCase(walletRemoveLiquidity.pending, (state, action) => {
            state.tx.status = TxStatus.PENDING;
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
                        amount0: TokenUtils.getDisplay(action.payload.state.input0, 2),
                        amount1: TokenUtils.getDisplay(action.payload.state.input1, 2),
                    }
                    state.transactions = [transaction, ...state.transactions];
                }
            }
        });
    },
})

export const { resetTransaction } = walletSlice.actions

export const selectWalletBalances = (state: RootState) => state.wallet.balances;

export const selectWalletAdapter = (state: RootState) => state.wallet.adapter;

export const selectWalletAddress = (state: RootState) => state.wallet.address;

export const selectWalletPermissions = (state: RootState) => state.wallet.permissions;

export const selectWalletTransaction = (state: RootState) => state.wallet.tx;

export const selectWalletTransactions = (state: RootState) => state.wallet.transactions;

export default walletSlice.reducer;
