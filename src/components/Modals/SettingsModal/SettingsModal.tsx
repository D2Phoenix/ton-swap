import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_DEADLINE, DEFAULT_SLIPPAGE } from 'constants/swap';

import QuestionIcon from 'components/Icons/QuestionIcon';
import Modal from 'components/Modal';
import Tooltip from 'components/Tooltip';

import { selectSettings, setSettingsDeadline, setSettingsSlippage } from 'store/app/appSlice';
import { useAppDispatch, useAppSelector } from 'store/hooks';

import './SettingsModal.scss';

const SLIPPAGE_INPUT_REGEXP = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);
const DEADLINE_INPUT_REGEXP = RegExp(`^\\d*(?:\\\\[])?\\d*$`);

export const SettingsModalOptions = {
  header: 'Settings',
  className: 'swap-settings-modal',
};

export function SettingsModal() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const settings = useAppSelector(selectSettings);

  const handleSlippageChange = useCallback(
    (event) => {
      const value = event.target.value.replace(/,/g, '.');
      if (SLIPPAGE_INPUT_REGEXP.test(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
        dispatch(setSettingsSlippage(value));
      }
    },
    [dispatch],
  );

  const handleDeadlineChange = useCallback(
    (event) => {
      const value = event.target.value.replace(/,/g, '.');
      if (DEADLINE_INPUT_REGEXP.test(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
        dispatch(setSettingsDeadline(value));
      }
    },
    [dispatch],
  );

  const handleSlippageBlur = useCallback(
    (event) => {
      const value = parseFloat(event.target.value);
      if (!value || value > 50) {
        dispatch(setSettingsSlippage(''));
      }
    },
    [dispatch],
  );

  const handleDeadlineBlur = useCallback(
    (event) => {
      const value = parseFloat(event.target.value);
      if (!value || value > 180) {
        dispatch(setSettingsDeadline(''));
      }
    },
    [dispatch],
  );

  const slippageNumber = parseFloat(settings.slippage);
  const deadlineNumber = parseFloat(settings.deadline);

  return (
    <div className="settings-wrapper">
      <h6>{t('Transaction Settings')}</h6>
      <div className="setting-section">
        <p>
          {t('Slippage tolerance')}
          <Tooltip
            content={
              <span>
                {t('Your transaction will revert if the price changes unfavorably by more than this percentage.')}
              </span>
            }
            direction="bottom"
          >
            <QuestionIcon />
          </Tooltip>
        </p>
        <div>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            pattern="^[0-9]*[.,]?[0-9]*$"
            className="number__input small"
            placeholder={DEFAULT_SLIPPAGE}
            value={settings.slippage}
            onChange={handleSlippageChange}
            onBlur={handleSlippageBlur}
          />
          <p>&nbsp;%</p>
        </div>
        {slippageNumber < 0.05 && <span className="text-warning">{t('Your transaction may fail')}</span>}
        {slippageNumber > 1 && slippageNumber <= 50 && (
          <span className="text-warning">{t('Your transaction may be frontrun')}</span>
        )}
        {slippageNumber > 50 && <span className="text-error">{t('Enter a valid slippage percentage')}</span>}
      </div>
      <div className="setting-section">
        <p>
          {t('Transaction deadline')}
          <Tooltip
            content={<span>{t('Your transaction will revert if it is pending for more than this long.')}</span>}
            direction="bottom"
          >
            <QuestionIcon />
          </Tooltip>
        </p>
        <div>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            pattern="^[0-9]*[.,]?[0-9]*$"
            className="number__input small"
            placeholder={DEFAULT_DEADLINE}
            value={settings.deadline}
            onChange={handleDeadlineChange}
            onBlur={handleDeadlineBlur}
          />
          <p>&nbsp;{t('minutes')}</p>
        </div>
        {(deadlineNumber === 0 || deadlineNumber > 180) && (
          <span className="text-error">{t('Enter a valid deadline')}</span>
        )}
      </div>
    </div>
  );
}
