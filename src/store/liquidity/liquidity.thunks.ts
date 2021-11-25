import { createAsyncThunk } from '@reduxjs/toolkit';

import SmartContractsService from '../../api/smartContractsService';
import { TxType } from '../../interfaces/transactionInterfaces';
import { LiquidityTxRequestInterface } from '../../interfaces/liquidityTxRequestInterface';

const swapService = new SmartContractsService();

export const estimateLiquidityTransaction = createAsyncThunk(
    'liquidity/estimate',
    async (data: LiquidityTxRequestInterface) => {
        const transaction = await swapService.getLiquidityTransactionEstimation(data);
        return {
            oneAmount: transaction.txType === TxType.EXACT_IN ? transaction.amount : transaction.quote,
            twoAmount: transaction.txType === TxType.EXACT_IN ? transaction.quote : transaction.amount,
            txType: data.txType,
            poolTokens: transaction.poolTokens,
            poolAmount: transaction.poolAmount
        }
    }
);
