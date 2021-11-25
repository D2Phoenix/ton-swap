import { createAsyncThunk } from '@reduxjs/toolkit';

import SmartContractsService from '../../api/smartContractsService';
import { TransactionType } from '../../interfaces/transactionInterfaces';
import { LiquidityTransactionRequestInterface } from '../../interfaces/liquidityTransactionRequestInterface';

const swapService = new SmartContractsService();

export const estimateLiquidityTransaction = createAsyncThunk(
    'liquidity/estimate',
    async (data: LiquidityTransactionRequestInterface) => {
        const transaction = await swapService.getLiquidityTransactionEstimation(data);
        return {
            oneAmount: transaction.txType === TransactionType.EXACT_IN ? transaction.amount : transaction.quote,
            twoAmount: transaction.txType === TransactionType.EXACT_IN ? transaction.quote : transaction.amount,
            txType: data.txType,
            poolTokens: transaction.poolTokens,
            poolAmount: transaction.poolAmount
        }
    }
);
