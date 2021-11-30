import BigNumber from 'bignumber.js';

class CurrencyUtils {
    static toUSDDisplay(value: string) {
        return '$' + CurrencyUtils.format(new BigNumber(value), 2);
    }

    static toDisplay(value: string) {
        return CurrencyUtils.format(new BigNumber(value), 2);
    }

    static format(num: BigNumber, digits: number) {
        const lookup = [
            { value: new BigNumber(1), symbol: "" },
            { value: new BigNumber(1e3), symbol: "k" },
            { value: new BigNumber(1e6), symbol: "m" },
            { value: new BigNumber(1e9), symbol: "b" },
            { value: new BigNumber(1e12), symbol: "t" },
            { value: new BigNumber(1e15), symbol: "p" },
            { value: new BigNumber(1e18), symbol: "e" }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        const item = lookup.slice().reverse().find(function(item) {
            return num.gte(item.value);
        });
        return item ? num.div(item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
    }
}

export default CurrencyUtils
