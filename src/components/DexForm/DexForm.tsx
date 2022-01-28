import { Link } from 'react-router-dom';

import ChevronRightIcon from 'components/Icons/ChevronRightIcon';
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
  const settingsModal = useModal(SettingsModal, SettingsModalOptions);

  return (
    <form
      className={`box-wrapper ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <div className="box-header-wrapper">
        {backLink && (
          <Link className="btn-icon chevron" to={backLink}>
            <ChevronRightIcon revert={true} />
          </Link>
        )}
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
