import BigNumber from 'bignumber.js';

import { WalletAdapterInterface } from 'interfaces/wallet-adapter.interface';
import TokenInterface from '../interfaces/token.interface';

const permissions: any = {
    'TON': true,
};

class StubWalletService implements WalletAdapterInterface {
    getBalance(token: TokenInterface): Promise<BigNumber> {
        if (token.symbol === 'TON') {
            return Promise.resolve(new BigNumber('1001000111'));
        }
        if (token.symbol === 'SHIB') {
            return Promise.resolve(new BigNumber('5000000000000000000'));
        }
        return Promise.resolve(new BigNumber('0'));
    }

    getWalletAddress(): Promise<string> {
        return Promise.resolve('EQAaoKr296r6YnAQsPZaJ0hbgqFK_B_GotedqpGK9FeONlSi');
    }

    getTokenUsePermission(token: TokenInterface): Promise<boolean> {
        return Promise.resolve(permissions[token.symbol] || false);
    };

    setTokenUsePermission(token: TokenInterface): Promise<boolean> {
        permissions[token.symbol] = true;
        return Promise.resolve(permissions[token.symbol])
    };

}

export default StubWalletService;
