import BigNumber from 'bignumber.js';

import TokenInterface from 'types/tokenInterface';

import StubWalletService from './stubWalletService';

class TonWalletService extends StubWalletService {
  provider = (window as any).ton;
  async getBalance(token: TokenInterface): Promise<string> {
    // TODO: Implement real api for wallet operation
    return new Promise<string>(async (resolve) => {
      if (token.symbol === 'TON') {
        const balance = await this.provider.send('ton_getBalance');
        const normalizedBalance = new BigNumber(balance)
          .div(new BigNumber(10).exponentiatedBy(token.decimals))
          .toFixed();
        this.balances[token.symbol] = normalizedBalance;
        resolve(normalizedBalance);
        return;
      }
      resolve(this.balances[token.symbol] || '0');
    });
  }

  async getWalletAddress(): Promise<string> {
    // TODO: Implement real api for wallet operation
    const accounts = await this.provider.send('ton_requestAccounts');
    return accounts[0];
  }
}

export default TonWalletService;
