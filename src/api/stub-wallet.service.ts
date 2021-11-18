import { WalletAdapterInterface } from 'interfaces/walletAdapterInterface';
import TokenInterface from '../interfaces/token.interface';

class StubWalletService implements WalletAdapterInterface {
    getBalance(token: TokenInterface): Promise<number> {
        if (token.symbol === 'TON') {
            return Promise.resolve(10000);
        }
        return Promise.resolve(0);
    }

}

export default StubWalletService;
