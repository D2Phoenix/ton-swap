import BigNumber from 'bignumber.js';

import { WalletAdapterInterface } from 'interfaces/wallet-adapter.interface';
import TokenInterface from '../interfaces/token.interface';
import { WalletTransactionStatus } from '../interfaces/swap.types';
import { SwapState } from '../store/swap/swap.slice';

const permissions: any = {
    'TON': true,
};

const balances: Record<string, BigNumber> = {
    'TON': new BigNumber('10000000000000'),
    'SHIB': new BigNumber('5000000000000000000')
}

class StubWalletService implements WalletAdapterInterface {
    getBalance(token: TokenInterface): Promise<BigNumber> {
        // TODO: Implement real api for wallet operation
        return Promise.resolve(balances[token.symbol] || new BigNumber('0'));
    }

    getWalletAddress(): Promise<string> {
        // TODO: Implement real api for wallet operation
        return Promise.resolve('EQAaoKr296r6YnAQsPZaJ0hbgqFK_B_GotedqpGK9FeONlSi');
    }

    getTokenUsePermission(token: TokenInterface): Promise<boolean> {
        // TODO: Implement real api for wallet operation
        return Promise.resolve(permissions[token.symbol] || false);
    };

    setTokenUsePermission(token: TokenInterface): Promise<boolean> {
        // TODO: Implement real api for wallet operation
        permissions[token.symbol] = true;
        return Promise.resolve(permissions[token.symbol])
    };

    swap(state: SwapState): Promise<WalletTransactionStatus> {
        // TODO: Implement real api for wallet operation
        return new Promise<WalletTransactionStatus>((resolve) => {
            setTimeout(() => {
                balances[state.from.token!.symbol] = balances[state.from.token!.symbol].minus(state.from.amount!);
                balances[state.to.token!.symbol] = (balances[state.to.token!.symbol] || new BigNumber('0')).plus(state.to.amount!)
                resolve(WalletTransactionStatus.CONFIRMED);
            }, 3000)
        });
    }

}

export default StubWalletService;
