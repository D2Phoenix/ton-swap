import { InputTokenInterface } from '../types/inputTokenInterface';
import BigNumber from 'bignumber.js';
import { FEE_PRECISION, TOKEN_PRECISION } from '../constants/swap';
import TokenInterface from '../types/tokenInterface';
import { toDecimals } from './decimals';
import { InputPoolInterface } from '../types/inputPoolInterface';

class TokenUtils {
    static isFilled(input: InputTokenInterface | InputPoolInterface) {
        return input.token && TokenUtils.hasAmount(input);
    }
    static isRemoveFilled(input: InputTokenInterface | InputPoolInterface) {
        return input.token && TokenUtils.hasRemoveAmount(input);
    }
    static hasAmount(input: InputTokenInterface | InputPoolInterface) {
        return input.amount && !input.amount.eq('0')
    }
    static hasRemoveAmount(input: InputTokenInterface | InputPoolInterface) {
        return input.removeAmount && !input.removeAmount.eq('0')
    }
    static compareAmount(input: InputTokenInterface, value: BigNumber) {
        value = value || new BigNumber('0');
        return input.amount.comparedTo(value);
    }
    static compareRemoveAmount(input: InputTokenInterface | InputPoolInterface, value: BigNumber) {
        value = value || new BigNumber('0');
        return input.removeAmount!.comparedTo(value);
    }
    static compareToken(inputToken: InputTokenInterface, token: TokenInterface) {
        if (!inputToken.token) {
            return false;
        }
        return inputToken.token.address === token.address;
    }
    static getDisplay(input: InputTokenInterface | InputPoolInterface, precision?: number) {
        return toDecimals(input.amount!, input.token!.decimals)
            .precision(precision || TOKEN_PRECISION).toFixed();
    }
    static getRemoveDisplay(input: InputTokenInterface | InputPoolInterface) {
        return toDecimals(input.removeAmount!, input.token!.decimals)
            .precision(TOKEN_PRECISION).toFixed();
    }
    static getDisplayRate(inputOne: InputTokenInterface, inputTwo: InputTokenInterface) {
        return inputOne.amount.div(inputTwo.amount.shiftedBy(inputOne.token.decimals - inputTwo.token.decimals)).precision(TOKEN_PRECISION).toFixed();
    }
    static getMinimumDisplayWithSlippage(input: InputTokenInterface, slippage: string) {
        return toDecimals(input.amount, input.token.decimals).multipliedBy(new BigNumber('100').minus(new BigNumber(slippage)).div('100'))
            .precision(TOKEN_PRECISION).toFixed();
    }
    static getMaximumDisplayWithSlippage(input: InputTokenInterface, slippage: string) {
        return toDecimals(input.amount, input.token.decimals).multipliedBy(new BigNumber('100').plus(new BigNumber(slippage)).div('100'))
            .precision(TOKEN_PRECISION).toFixed();
    }
    static getFeeDisplay(input: InputTokenInterface, fee: BigNumber) {
        return toDecimals(input.amount!.multipliedBy(fee), input.token.decimals).precision(FEE_PRECISION).toFixed();
    }
}

export default TokenUtils;
