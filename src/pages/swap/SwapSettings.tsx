import './SwapSettings.scss';
import Modal from '../../components/Modal';

function SwapSettings({onClose}: any) {
    return (
        <Modal className={'swap-settings-modal'} onClose={onClose}>
            <div className="settings-wrapper">
                <h4>Transaction Settings</h4>
                <span className="text-small">Slippage tolerance</span>
                <input className="number__input" placeholder="0.10"/>
                <span className="text-small">Transaction deadline</span>
                <input className="number__input"/>
            </div>
        </Modal>
    )
}

export default SwapSettings;
