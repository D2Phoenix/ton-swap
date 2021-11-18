import TokenInterface from './token.interface';

export interface WalletAdapterInterface {
    getBalance(token: TokenInterface): Promise<number>;
}
