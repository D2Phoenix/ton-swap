import './TokenSelect.scss';
import Modal from './Modal';

function TokenSelect({onClose}: any) {
    const tokens = [{}, {}, {}]
    return (
        <Modal className={'token-select-modal'} onClose={onClose}>
            <div className="token-select-wrapper">
                <span className="text-semibold">Select a token</span>
                <input placeholder="Search name or paste address"/>
                <div className="token-select-list">
                    {
                        tokens.map((token, index) => {
                            return (
                                <div key={index} className="token-select-item">
                                </div>
                            )
                        })
                    }
                </div>
                <span className="text-center link__btn">
                    Manage Token Lists
                </span>
            </div>
        </Modal>
    )
}

export default TokenSelect;
