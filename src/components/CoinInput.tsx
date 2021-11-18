import ChevronRightIcon from './icons/ChevronRightIcon';

function CoinInput({onSelect}: any) {
    return (
        <div className="input-wrapper">
            <div className="coin-input">
                <div className="btn btn-outline small text-medium text-semibold" onClick={onSelect}>
                    <img src="https://cloudflare-ipfs.com/ipfs/QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg"/>
                    <span>ETH</span>
                    <ChevronRightIcon/>
                </div>
                <input type="number" placeholder="0.0"/>
            </div>
            <div className="balance text-small">
                Balance: 0 ETH
            </div>
        </div>
    )
}

export default CoinInput;
