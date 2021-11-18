import './TokenSelect.scss';
import Modal from './Modal';

function TokenSelect({onClose, onSelect}: any) {
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
                                <div key={index} className="token-select-item" onClick={onSelect}>
                                    <img className="token__img" src="https://cloudflare-ipfs.com/ipfs/QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg"/>
                                    <div className="token-name">
                                        <span className="text-semibold">ETH</span>
                                        <span className="text-small">Ether</span>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                {/*<span className="text-center link__btn">
                    Manage Token Lists
                </span>*/}
            </div>
        </Modal>
    )
}

export default TokenSelect;
