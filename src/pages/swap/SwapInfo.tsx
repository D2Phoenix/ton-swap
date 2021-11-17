function SwapInfo() {
    return (
        <div className="swap-info-wrapper">
            <h4>Transaction Details</h4>
            <div>
                <span className="text-small">Liquidity Provider Fee</span>
                <span className="text-small text-semibold">0.05 ETH</span>
            </div>
            <div>
                <span className="text-small">Price Impact</span>
                <span className="text-small text-semibold">0.01 %</span>
            </div>
            <div>
                <span className="text-small">Allowed slippage</span>
                <span className="text-small text-semibold">0.01 %</span>
            </div>
            <div>
                <span className="text-small">Minimum received</span>
                <span className="text-small text-semibold">5 ETH</span>
            </div>
        </div>
    )
}

export default SwapInfo;
