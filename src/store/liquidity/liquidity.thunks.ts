import { createAsyncThunk } from '@reduxjs/toolkit';

import { SwapTransactionRequestInterface } from '../../interfaces/swapTransactionRequestInterface';
import SmartContractsService from '../../api/smartContractsService';
import { TransactionType } from '../../interfaces/transactionInterfaces';

const swapService = new SmartContractsService();

export const estimateLiquidityTransaction = createAsyncThunk(
    'liquidity/estimate',
    async (data: SwapTransactionRequestInterface) => {
        const transaction = await swapService.getTransactionEstimation(data);
        const priceImpact = await swapService.getPriceImpact(data, transaction);
        const insufficientLiquidity = !await swapService.checkLiquidity(data, transaction);
        return {
            fromAmount: transaction.txType === TransactionType.EXACT_IN ? transaction.amount : transaction.quote,
            toAmount: transaction.txType === TransactionType.EXACT_IN ? transaction.quote : transaction.amount,
            fee: transaction.fee,
            txType: data.txType,
            priceImpact,
            insufficientLiquidity,
        }
    }
);
