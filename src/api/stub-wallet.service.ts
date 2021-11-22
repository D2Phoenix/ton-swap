import BigNumber from 'bignumber.js';

import { WalletAdapterInterface } from 'interfaces/wallet-adapter.interface';
import TokenInterface from '../interfaces/token.interface';
import { WalletTransactionStatus } from '../interfaces/swap.types';
import { SwapState } from '../store/swap/swap.slice';

const permissions: any = {
    'TON': true,
};

class StubWalletService implements WalletAdapterInterface {
    getBalance(token: TokenInterface): Promise<BigNumber> {
        // TODO: Implement real api for wallet operation
        if (token.symbol === 'TON') {
            return Promise.resolve(new BigNumber('1001000111'));
        }
        if (token.symbol === 'SHIB') {
            return Promise.resolve(new BigNumber('5000000000000000000'));
        }
        return Promise.resolve(new BigNumber('0'));
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

    swap(fromToken: SwapState): Promise<WalletTransactionStatus> {
        // TODO: Implement real api for wallet operation
        return new Promise<WalletTransactionStatus>((resolve) => {
            setTimeout(() => {
                resolve(WalletTransactionStatus.CONFIRMED);
            }, 3000)
        });
    }

}

export default StubWalletService;
