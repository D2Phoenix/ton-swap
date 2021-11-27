import { createAsyncThunk } from '@reduxjs/toolkit';

import { SwapTxRequestInterface } from 'types/swapTxRequestInterface';
import SmartContractsService from 'api/smartContractsService';
import { EstimateTxType } from 'types/transactionInterfaces';

const swapService = new SmartContractsService();

export const estimateTransaction = createAsyncThunk(
    'swap/estimate',
    async (data: SwapTxRequestInterface) => {
        const transaction = await swapService.getTxEstimation(data);
        const priceImpact = await swapService.getPriceImpact(data, transaction);
        const insufficientLiquidity = !await swapService.checkLiquidity(data, transaction);
        return {
            fromAmount: transaction.txType === EstimateTxType.EXACT_IN ? transaction.amount : transaction.quote,
            toAmount: transaction.txType === EstimateTxType.EXACT_IN ? transaction.quote : transaction.amount,
            fee: transaction.fee,
            type: data.txType,
            priceImpact,
            insufficientLiquidity,
        }
    }
);
