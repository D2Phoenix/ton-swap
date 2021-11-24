import { useCallback } from 'react';

import './Settings.scss';
import Modal from 'components/Modal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { DEFAULT_DEADLINE, DEFAULT_SLIPPAGE } from 'constants/swap';
import { selectSettings, setSettingsDeadline, setSettingsSlippage } from 'store/app/app.slice';

const SLIPPAGE_INPUT_REGEXP = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);
const DEADLINE_INPUT_REGEXP = RegExp(`^\\d*(?:\\\\[])?\\d*$`);

function Settings({onClose}: any) {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(selectSettings);


    const handleSlippageChange = useCallback((event) => {
        const value = event.target.value.replace(/,/g, '.');
        if (SLIPPAGE_INPUT_REGEXP.test(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
            dispatch(setSettingsSlippage(value));
        }
    }, [dispatch]);

    const handleDeadlineChange = useCallback((event) => {
        const value = event.target.value.replace(/,/g, '.');
        if (DEADLINE_INPUT_REGEXP.test(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
            dispatch(setSettingsDeadline(value));
        }
    }, [dispatch]);

    return (
        <Modal className={'swap-settings-modal'} onClose={onClose}>
            <div className="settings-wrapper">
                <h4>Transaction Settings</h4>
                <span className="text-small">Slippage tolerance</span>
                <div>
                    <input type="text"
                           className="number__input"
                           placeholder={DEFAULT_SLIPPAGE}
                           value={settings.slippage}
                           onChange={handleSlippageChange}/>
                    <span>&nbsp;%</span>
                </div>
                <span className="text-small">Transaction deadline</span>
                <div>
                    <input type="text"
                           className="number__input"
                           placeholder={DEFAULT_DEADLINE}
                           value={settings.deadline}
                           onChange={handleDeadlineChange}/>
                    <span>&nbsp;minutes</span>
                </div>
            </div>
        </Modal>
    )
}

export default Settings;
