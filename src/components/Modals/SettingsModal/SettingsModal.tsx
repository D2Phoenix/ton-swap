import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_DEADLINE, DEFAULT_SLIPPAGE } from 'constants/swap';

import QuestionIcon from 'components/Icons/QuestionIcon';
import Modal from 'components/Modal';
import Tooltip from 'components/Tooltip';

import { selectSettings, setSettingsDeadline, setSettingsSlippage } from 'store/app/appSlice';
import { useAppDispatch, useAppSelector } from 'store/hooks';

import Input from '../../Input';
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

  const slippageInput = useMemo((): { inputState: 'default' | 'success' | 'warning' | 'error'; helpText: string } => {
    const slippageNumber = parseFloat(settings.slippage);
    if (slippageNumber < 0.05) {
      return {
        inputState: 'warning',
        helpText: t('Your transaction may fail'),
      };
    }
    if (slippageNumber > 1 && slippageNumber <= 50) {
      return {
        inputState: 'warning',
        helpText: t('Your transaction may be frontrun'),
      };
    }
    if (slippageNumber > 50) {
      return {
        inputState: 'error',
        helpText: t('Enter a valid slippage'),
      };
    }
    return {
      inputState: 'default',
      helpText: '',
    };
  }, [settings.slippage]);

  const deadlineInput = useMemo((): { inputState: 'default' | 'success' | 'warning' | 'error'; helpText: string } => {
    const deadlineNumber = parseFloat(settings.deadline);
    if (deadlineNumber === 0 || deadlineNumber > 180) {
      return {
        inputState: 'error',
        helpText: t('Enter a valid deadline'),
      };
    }
    return {
      inputState: 'default',
      helpText: '',
    };
  }, [settings.deadline]);

  const slippageChangeHandler = useCallback(
    (event) => {
      const value = event.target.value.replace(/,/g, '.');
      if (SLIPPAGE_INPUT_REGEXP.test(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
        dispatch(setSettingsSlippage(value));
      }
    },
    [dispatch],
  );

  const deadlineChangeHandler = useCallback(
    (event) => {
      const value = event.target.value.replace(/,/g, '.');
      if (DEADLINE_INPUT_REGEXP.test(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
        dispatch(setSettingsDeadline(value));
      }
    },
    [dispatch],
  );

  const slippageBlurHandler = useCallback(
    (event) => {
      const value = parseFloat(event.target.value);
      if (!value || value > 50) {
        dispatch(setSettingsSlippage(''));
      }
    },
    [dispatch],
  );

  const deadlineBlurHandler = useCallback(
    (event) => {
      const value = parseFloat(event.target.value);
      if (!value || value > 180) {
        dispatch(setSettingsDeadline(''));
      }
    },
    [dispatch],
  );

  return (
    <div className="settings">
      <h6>{t('Transaction Settings')}</h6>
      <div className="setting__section">
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
          <Input
            inputSize={'small'}
            inputType={'number'}
            inputState={slippageInput.inputState}
            helpText={slippageInput.helpText}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder={DEFAULT_SLIPPAGE}
            value={settings.slippage}
            onChange={slippageChangeHandler}
            onBlur={slippageBlurHandler}
          />
          <p>%</p>
        </div>
      </div>
      <div className="setting__section">
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
          <Input
            inputSize={'small'}
            inputType={'number'}
            inputState={deadlineInput.inputState}
            helpText={deadlineInput.helpText}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder={DEFAULT_DEADLINE}
            value={settings.deadline}
            onChange={deadlineChangeHandler}
            onBlur={deadlineBlurHandler}
          />
          <p>{t('minutes')}</p>
        </div>
      </div>
    </div>
  );
}
