import TokenInterface from './tokenInterface';

export enum EstimateTxType {
    EXACT_IN = 'EXACT_IN',
    EXACT_OUT = 'EXACT_OUT',
}

export enum TxStatus {
    INITIAL = 'INITIAL',
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    REJECTED = 'REJECTED',
}

export enum TxType {
    BURN = 'Burn',
    MINT = 'Mint',
    SWAP = 'Swap'
}

export interface TransactionInterface {
    id: string;
    type: TxType;
    status: TxStatus;
    token0: TokenInterface;
    token1: TokenInterface;
    amount0: string;
    amount1: string;
}
