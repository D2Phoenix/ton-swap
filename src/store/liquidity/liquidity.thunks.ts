import { createAsyncThunk } from '@reduxjs/toolkit';

import SmartContractsService from '../../api/smartContractsService';
import { TxType } from '../../interfaces/transactionInterfaces';
import { LiquidityTxRequestInterface } from '../../interfaces/liquidityTxRequestInterface';
import { RootState } from '../store';
import TokenInterface from '../../interfaces/tokenInterface';
import { getTokens } from '../../api/tokens';

const swapService = new SmartContractsService();

export const estimateLiquidityTransaction = createAsyncThunk(
    'liquidity/estimate',
    async (data: LiquidityTxRequestInterface) => {
        const transaction = await swapService.getLiquidityTxEstimation(data);
        return {
            oneAmount: transaction.txType === TxType.EXACT_IN ? transaction.amount : transaction.quote,
            twoAmount: transaction.txType === TxType.EXACT_IN ? transaction.quote : transaction.amount,
            txType: data.txType,
            poolTokens: transaction.poolTokens,
            poolAmount: transaction.poolAmount
        }
    }
);

export const fetchOneToken = createAsyncThunk(
    'liquidity/tokenOne',
    async (tokenSymbol:string, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const tokens: TokenInterface[] = state.app.tokens.length ? state.app.tokens : (await getTokens()).tokens;
        return tokens.find((token) => token.symbol === tokenSymbol);
    },
)

export const fetchTwoToken = createAsyncThunk(
    'liquidity/tokenTwo',
    async (tokenSymbol:string, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const tokens: TokenInterface[] = state.app.tokens.length ? state.app.tokens : (await getTokens()).tokens;
        return tokens.find((token) => token.symbol === tokenSymbol)
    },
)

export const fetchPoolToken = createAsyncThunk(
    'liquidity/pool',
    async (pool: string, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const walletAdapterService = state.wallet.adapter;
        const tokens: TokenInterface[] = state.app.tokens.length ? state.app.tokens : (await getTokens()).tokens;
        const oneToken = tokens.find((token) => token.symbol === pool.split(':')[0]);
        const twoToken = tokens.find((token) => token.symbol === pool.split(':')[1]);
        return walletAdapterService!.getPool(oneToken!, twoToken!);
    },
)
