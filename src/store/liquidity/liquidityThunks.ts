import { createAsyncThunk } from '@reduxjs/toolkit';

import SmartContractsService from 'api/smartContractsService';
import { EstimateTxType } from 'types/transactionInterfaces';
import { LiquidityTxRequestInterface } from 'types/liquidityTxRequestInterface';
import { RootState } from 'store/store';
import TokenInterface from 'types/tokenInterface';
import { getTokens } from 'api/tokens';
import { InputPoolInterface } from 'types/inputPoolInterface';

const swapService = new SmartContractsService();

export const estimateLiquidityTransaction = createAsyncThunk(
    'liquidity/estimate',
    async (data: LiquidityTxRequestInterface) => {
        const transaction = await swapService.getLiquidityTxEstimation(data);
        return {
            oneAmount: transaction.txType === EstimateTxType.EXACT_IN ? transaction.amount : transaction.quote,
            twoAmount: transaction.txType === EstimateTxType.EXACT_IN ? transaction.quote : transaction.amount,
            txType: data.txType,
            poolTokens: transaction.poolTokens,
            poolAmount: transaction.poolAmount
        }
    }
);

export const getLiquidityToken = createAsyncThunk(
    'liquidity/token',
    async ({address, position}: { address: string, position: string }, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const tokens: TokenInterface[] = state.app.tokens.length ? state.app.tokens : (await getTokens()).tokens;
        return {
            token: tokens.find((token) => token.address === address || token.symbol === address) as TokenInterface,
            position
        }
    },
)

export const getLiquidityPoolToken = createAsyncThunk(
    'liquidity/pool/token',
    async ({token0, token1}: {token0: TokenInterface, token1: TokenInterface}, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const walletAdapterService = state.wallet.adapter;
        return walletAdapterService!.getPoolToken(token0, token1);
    },
)

export const getLiquidityPool = createAsyncThunk(
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

export const approveRemove = createAsyncThunk(
    'liquidity/remove/approve',
    async (pool: InputPoolInterface, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const walletAdapterService = state.wallet.adapter;
        return walletAdapterService!.approveRemovePool(pool);
    },
)
