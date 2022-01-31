import { useNavigate } from 'react-router-dom';

import ArrowLeftIcon from 'components/Icons/ArrowLeftIcon';
import QuestionIcon from 'components/Icons/QuestionIcon';
import SettingsIcon from 'components/Icons/SettingsIcon';
import { useModal } from 'components/Modal';
import SettingsModal, { SettingsModalOptions } from 'components/Modals/SettingsModal';
import Tooltip from 'components/Tooltip';

import './DexForm.scss';

interface DexFormProps {
  header: JSX.Element;
  headerTooltip?: JSX.Element;
  subheader?: JSX.Element;
  backLink?: string;
  content: JSX.Element;
  actions: JSX.Element;
  className?: string;
}

export function DexForm({ header, headerTooltip, backLink, content, actions, className }: DexFormProps) {
  const navigate = useNavigate();
  const settingsModal = useModal(SettingsModal, SettingsModalOptions);

  return (
    <form
      className={`dex-form ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <div className="dex-form__header">
        {backLink && <ArrowLeftIcon onClick={navigate.bind(null, backLink)} />}
        <div className="dex-form__header-content">
          <div>
            <h5>{header}</h5>
            {headerTooltip && (
              <Tooltip content={<span className="text-small">{headerTooltip}</span>} direction="bottom">
                <QuestionIcon />
              </Tooltip>
            )}
          </div>
        </div>
        <div className="btn-icon" onClick={settingsModal.open}>
          <SettingsIcon />
        </div>
      </div>
      {content}
      <div className="dex-form__actions">{actions}</div>
    </form>
  );
}
