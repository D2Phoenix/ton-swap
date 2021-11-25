import { TransactionType } from './transactionInterfaces';
import { InputTokenInterface } from './inputTokenInterface';

export interface SwapTransactionRequestInterface {
    from?: InputTokenInterface;
    to?: InputTokenInterface;
    txType: TransactionType;
}
