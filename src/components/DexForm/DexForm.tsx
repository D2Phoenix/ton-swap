import { useNavigate } from 'react-router-dom';

import QuestionIcon from 'components/Icons/QuestionIcon';
import SettingsIcon from 'components/Icons/SettingsIcon';
import { useModal } from 'components/Modal';
import SettingsModal, { SettingsModalOptions } from 'components/Modals/SettingsModal';
import Tooltip from 'components/Tooltip';

import Button from '../Button';
import ArrowLeftIcon from '../Icons/ArrowLeftIcon';
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
      className={`box-wrapper ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <div className="box-header-wrapper">
        {backLink && <ArrowLeftIcon onClick={navigate.bind(null, backLink)} />}
        <div className="box-header">
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
      <div className="box-actions">{actions}</div>
    </form>
  );
}
