import ChevronDownIcon from '../../components/icons/ChevronDownIcon';
import SettingsIcon from '../../components/icons/SettingsIcon';
import InfoIcon from '../../components/icons/InfoIcon';
import ChevronRightIcon from '../../components/icons/ChevronRightIcon';

function SwapPage() {
    return (
        <div className="swap-wrapper">
            <div className="swap-header">
                <span className="text-semibold">Swap</span>
                <div className="btn-icon">
                    <SettingsIcon/>
                </div>
            </div>
            <div className="input-wrapper">
                <div className="coin-input">
                    <div className="btn btn-outline small text-medium text-semibold">
                        <span>ETH</span>
                        <ChevronRightIcon/>
                    </div>
                    <input type="number" placeholder="0.0"/>
                </div>
                <div className="balance text-small">
                    Balance: 0 ETH
                </div>
            </div>
            <div className="switch__btn btn-icon">
                <ChevronDownIcon />
            </div>
            <div className="input-wrapper">
                <div className="coin-input">
                    <div className="btn btn-outline small text-medium text-semibold">
                        <span>ETH</span>
                        <ChevronRightIcon/>
                    </div>
                    <input type="number" placeholder="0.0"/>
                </div>
                <div className="balance text-small">
                    Balance: 0 ETH
                </div>
            </div>
            <div className="swap-info text-small">
                <span>1 ETH = 487.7 DAI</span>
                <div className="btn-icon">
                    <InfoIcon/>
                </div>
            </div>
            <button className="btn btn-primary swap__btn">Swap</button>
        </div>
    )
}

export default SwapPage;
