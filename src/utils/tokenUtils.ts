import { InputTokenInterface } from '../interfaces/inputTokenInterface';
import BigNumber from 'bignumber.js';
import { FEE_PRECISION, TOKEN_PRECISION } from '../constants/swap';
import TokenInterface from '../interfaces/tokenInterface';
import { toDecimals } from './decimals';
import { InputPoolInterface } from '../interfaces/inputPoolInterface';

class TokenUtils {
    static isFilled(inputToken: InputTokenInterface | InputPoolInterface) {
        return inputToken.token && TokenUtils.hasAmount(inputToken);
    }
    static isBurnFilled(inputToken: InputTokenInterface | InputPoolInterface) {
        return inputToken.token && TokenUtils.hasBurnAmount(inputToken);
    }
    static hasAmount(inputToken: InputTokenInterface | InputPoolInterface) {
        return inputToken.amount && !inputToken.amount.eq('0')
    }
    static hasBurnAmount(inputToken: InputTokenInterface | InputPoolInterface) {
        return inputToken.burnAmount && !inputToken.burnAmount.eq('0')
    }
    static compareAmount(inputToken: InputTokenInterface, value: BigNumber) {
        value = value || new BigNumber('0');
        return inputToken.amount.comparedTo(value);
    }
    static compareBurnAmount(inputToken: InputTokenInterface | InputPoolInterface, value: BigNumber) {
        value = value || new BigNumber('0');
        return inputToken.burnAmount!.comparedTo(value);
    }
    static compareToken(inputToken: InputTokenInterface, token: TokenInterface) {
        if (!inputToken.token) {
            return false;
        }
        return inputToken.token.address === token.address;
    }
    static getDisplay(token: InputTokenInterface) {
        return toDecimals(token.amount!, token.token!.decimals)
            .precision(TOKEN_PRECISION).toFixed();
    }
    static getDisplayRate(one: InputTokenInterface, two: InputTokenInterface) {
        return one.amount.div(two.amount.shiftedBy(one.token.decimals - two.token.decimals)).precision(TOKEN_PRECISION).toFixed();
    }
    static getMinimumDisplayWithSlippage(token: InputTokenInterface, slippage: string) {
        return toDecimals(token.amount, token.token.decimals).multipliedBy(new BigNumber('100').minus(new BigNumber(slippage)).div('100'))
            .precision(TOKEN_PRECISION).toFixed();
    }
    static getMaximumDisplayWithSlippage(token: InputTokenInterface, slippage: string) {
        return toDecimals(token.amount, token.token.decimals).multipliedBy(new BigNumber('100').plus(new BigNumber(slippage)).div('100'))
            .precision(TOKEN_PRECISION).toFixed();
    }
    static getFeeDisplay(token: InputTokenInterface, fee: BigNumber) {
        return toDecimals(token.amount!.multipliedBy(fee), token.token.decimals).precision(FEE_PRECISION).toFixed();
    }
}

export default TokenUtils;
