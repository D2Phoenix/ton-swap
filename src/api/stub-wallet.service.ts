import BigNumber from 'bignumber.js';

import { WalletAdapterInterface } from 'interfaces/wallet-adapter.interface';
import TokenInterface from '../interfaces/token.interface';

class StubWalletService implements WalletAdapterInterface {
    getBalance(token: TokenInterface): Promise<BigNumber> {
        if (token.symbol === 'TON') {
            return Promise.resolve(new BigNumber('10000'));
        }
        if (token.symbol === 'SHIB') {
            return Promise.resolve(new BigNumber('5000'));
        }
        return Promise.resolve(new BigNumber('0'));
    }

    getWalletAddress(): Promise<string> {
        return Promise.resolve('EQAaoKr296r6YnAQsPZaJ0hbgqFK_B_GotedqpGK9FeONlSi');
    }

}

export default StubWalletService;
