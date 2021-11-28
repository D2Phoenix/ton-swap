import TokenInterface from './tokenInterface';

export interface InputTokenInterface {
    token: TokenInterface;
    amount: string;
    removeAmount?: string;
}
