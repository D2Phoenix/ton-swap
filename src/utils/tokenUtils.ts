import BigNumber from 'bignumber.js';

import { InputTokenInterface } from 'types/inputTokenInterface';
import { TOKEN_PRECISION } from 'constants/swap';
import TokenInterface from 'types/tokenInterface';
import { InputPoolInterface } from 'types/inputPoolInterface';

class TokenUtils {
    static isFilled(input: InputTokenInterface | InputPoolInterface) {
        return input.token && TokenUtils.hasAmount(input);
    }
    static isRemoveFilled(input: InputTokenInterface | InputPoolInterface) {
        return input.token && TokenUtils.hasRemoveAmount(input);
    }
    static hasAmount(input: InputTokenInterface | InputPoolInterface) {
        return input.amount && !new BigNumber(input.amount).eq('0')
    }
    static hasRemoveAmount(input: InputTokenInterface | InputPoolInterface) {
        return input.removeAmount && !new BigNumber(input.removeAmount).eq('0');
    }
    static compareAmount(input: InputTokenInterface, value: string) {
        value = value || '0';
        return new BigNumber(input.amount).comparedTo(value);
    }
    static compareRemoveAmount(input: InputTokenInterface | InputPoolInterface, value: BigNumber) {
        value = value || '0';
        return new BigNumber(input.removeAmount!).comparedTo(value);
    }
    static compareToken(inputToken: InputTokenInterface, token: TokenInterface) {
        if (!inputToken.token) {
            return false;
        }
        return inputToken.token.address === token.address;
    }
    static getDisplay(input: InputTokenInterface | InputPoolInterface, precision?: number) {
        return new BigNumber(input.amount).precision(precision || TOKEN_PRECISION).toFixed();
    }
    static getNumberDisplay(value: string, precision?: number) {
        return new BigNumber(value).precision(precision || TOKEN_PRECISION).toFixed();
    }
    static getRemoveDisplay(input: InputTokenInterface | InputPoolInterface) {
        return new BigNumber(input.removeAmount!).precision(TOKEN_PRECISION).toFixed();
    }
    static getDisplayRate(inputOne: InputTokenInterface, inputTwo: InputTokenInterface) {
        return new BigNumber(inputOne.amount).div(new BigNumber(inputTwo.amount)).precision(TOKEN_PRECISION).toFixed();
    }
}

export default TokenUtils;
