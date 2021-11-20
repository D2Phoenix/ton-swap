import BigNumber from 'bignumber.js';

export function toDecimals(value: BigNumber, decimals: number): BigNumber {
    return value.shiftedBy(-decimals)
}

export function fromDecimals(value: BigNumber, decimals: number): BigNumber {
    return value.shiftedBy(decimals);
}

export function shiftDecimals(value: BigNumber, delta: number): BigNumber {
    if (delta === 0) {
        return value;
    }
    return value.shiftedBy(delta);
}
