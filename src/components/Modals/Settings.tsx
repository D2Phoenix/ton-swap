import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import './Settings.scss';
import Modal from 'components/Modal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { DEFAULT_DEADLINE, DEFAULT_SLIPPAGE } from 'constants/swap';
import { selectSettings, setSettingsDeadline, setSettingsSlippage } from 'store/app/appSlice';
import QuestionIcon from 'components/icons/QuestionIcon';
import Tooltip from 'components/Tooltip';

const SLIPPAGE_INPUT_REGEXP = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);
const DEADLINE_INPUT_REGEXP = RegExp(`^\\d*(?:\\\\[])?\\d*$`);

interface SettingsProps {
    onClose: () => void;
}

function Settings({onClose}: SettingsProps) {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
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

    const handleSlippageBlur = useCallback((event) => {
        const value = parseFloat(event.target.value);
        if (!value || value > 50 ) {
            dispatch(setSettingsSlippage(''))
        }
    }, [dispatch]);

    const handleDeadlineBlur = useCallback((event) => {
        const value = parseFloat(event.target.value);
        if (!value || value > 180 ) {
            dispatch(setSettingsDeadline(''))
        }
    }, [dispatch]);

    const slippageNumber = parseFloat(settings.slippage);
    const deadlineNumber = parseFloat(settings.deadline);

    return (
        <Modal className={'swap-settings-modal'} onClose={onClose}>
            <div className="settings-wrapper">
                <h4>{t('Transaction Settings')}</h4>
                <div className="text-small">
                    {t('Slippage tolerance')}
                    <Tooltip content={<span className="text-small">{t('Your transaction will revert if the price changes unfavorably by more than this percentage.')}</span>}
                             direction="bottom">
                        <div className="btn-icon">
                            <QuestionIcon />
                        </div>
                    </Tooltip>
                </div>
                <div>
                    <input type="text"
                           inputMode="decimal"
                           autoComplete="off"
                           autoCorrect="off"
                           pattern="^[0-9]*[.,]?[0-9]*$"
                           className="number__input"
                           placeholder={DEFAULT_SLIPPAGE}
                           value={settings.slippage}
                           onChange={handleSlippageChange}
                           onBlur={handleSlippageBlur}
                    />
                    <span>&nbsp;%</span>
                </div>
                {
                    slippageNumber < 0.05 && <span className="text-warning text-small">
                        {t('Your transaction may fail')}
                    </span>
                }
                {
                    slippageNumber > 1 && slippageNumber <= 50 && <span className="text-warning text-small">
                        {t('Your transaction may be frontrun')}
                    </span>
                }
                {
                    slippageNumber > 50 && <span className="text-error text-small">
                        {t('Enter a valid slippage percentage')}
                    </span>
                }
                <div className="text-small">
                    {t('Transaction deadline')}
                    <Tooltip content={<span className="text-small">{t('Your transaction will revert if it is pending for more than this long.')}</span>}
                             direction="bottom">
                        <div className="btn-icon">
                            <QuestionIcon />
                        </div>
                    </Tooltip>
                </div>
                <div>
                    <input type="text"
                           inputMode="decimal"
                           autoComplete="off"
                           autoCorrect="off"
                           pattern="^[0-9]*[.,]?[0-9]*$"
                           className="number__input"
                           placeholder={DEFAULT_DEADLINE}
                           value={settings.deadline}
                           onChange={handleDeadlineChange}
                           onBlur={handleDeadlineBlur}
                    />
                    <span>&nbsp;{t('minutes')}</span>
                </div>
                {
                    (deadlineNumber === 0 || deadlineNumber > 180) && <span className="text-error text-small">
                        {t('Enter a valid deadline')}
                    </span>
                }
            </div>
        </Modal>
    )
}

export default Settings;
