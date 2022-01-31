import BigNumber from 'bignumber.js';

import { TOKEN_PRECISION } from 'constants/swap';

import { InputPoolInterface } from 'types/inputPoolInterface';
import { InputTokenInterface } from 'types/inputTokenInterface';
import TokenInterface from 'types/tokenInterface';

class TokenUtils {
  static isFilled(input: InputTokenInterface | InputPoolInterface) {
    return input.token && TokenUtils.hasAmount(input);
  }
  static isRemoveFilled(input: InputTokenInterface | InputPoolInterface) {
    return input.token && TokenUtils.hasRemoveAmount(input);
  }
  static hasAmount(input: InputTokenInterface | InputPoolInterface) {
    return input.amount && !new BigNumber(input.amount).eq('0');
  }
  static hasRemoveAmount(input: InputTokenInterface | InputPoolInterface) {
    return input.removeAmount && !new BigNumber(input.removeAmount).eq('0');
  }
  static compareAmount(input: InputTokenInterface, value: string) {
    value = value || '0';
    return new BigNumber(input.amount).comparedTo(value);
  }
  static compareToken(inputToken: InputTokenInterface, token: TokenInterface) {
    if (!inputToken.token) {
      return false;
    }
    return inputToken.token.address === token.address;
  }
  static toDisplay(input: InputTokenInterface | InputPoolInterface, precision?: number) {
    const result = new BigNumber(input.amount);
    return result.isNaN() ? input.amount : result.precision(precision || TOKEN_PRECISION).toFixed();
  }
  static toNumberDisplay(value: string | undefined, precision?: number) {
    const result = new BigNumber(value || '0');
    return result.isNaN() ? value : result.precision(precision || TOKEN_PRECISION).toFixed();
  }
}

export default TokenUtils;
