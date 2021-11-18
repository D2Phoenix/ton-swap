import './SwapSettings.scss';

function SwapSettings() {
    return (
        <div className="settings-wrapper">
            <h4>Transaction Settings</h4>
            <span className="text-small">Slippage tolerance</span>
            <input className="number__input" placeholder="0.10"/>
            <span className="text-small">Transaction deadline</span>
            <input className="number__input"/>
        </div>
    )
}

export default SwapSettings;
