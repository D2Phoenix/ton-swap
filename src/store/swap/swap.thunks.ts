import { createAsyncThunk } from '@reduxjs/toolkit';

import { SwapTransactionRequestInterface } from '../../interfaces/swap-transaction-request.interface';
import SwapService from '../../api/swap.service';
import { SwapType } from '../../interfaces/swap.type';

const swapService = new SwapService();

export const estimateTransaction = createAsyncThunk(
    'swap/estimate',
    async (data: SwapTransactionRequestInterface) => {
        const transaction = await swapService.getTransactionEstimation(data);
        const priceImpact = await swapService.getPriceImpact(data, transaction);
        const insufficientLiquidity = !await swapService.checkLiquidity(data, transaction);
        return {
            fromAmount: transaction.type === SwapType.EXACT_IN ? transaction.amount : transaction.quote,
            toAmount: transaction.type === SwapType.EXACT_IN ? transaction.quote : transaction.amount,
            fee: transaction.fee,
            type: data.type,
            priceImpact,
            insufficientLiquidity,
        }
    }
)
