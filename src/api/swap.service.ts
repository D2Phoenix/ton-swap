import BigNumber from 'bignumber.js';
import { SwapTransactionRequestInterface } from 'interfaces/swap-transaction-request.interface';
import { SwapTransactionInterface } from 'interfaces/swap-transaction.interface';
import { SwapType } from 'interfaces/swap.type';

class SwapService {
    getTransactionEstimation(data: SwapTransactionRequestInterface): Promise<SwapTransactionInterface> {
        // TODO: Implement real api for transaction estimation
        const fromAmount = data.fromAmount ? data.fromAmount : null;
        const toAmount = data.toAmount ? data.toAmount : null;
        return Promise.resolve({
            amount: data.type === SwapType.EXACT_IN ? fromAmount : toAmount,
            quote: data.type === SwapType.EXACT_IN ? fromAmount : toAmount,
            type: data.type
        });
    }
}

export default SwapService
