import React, { useState } from 'react';
import './DexForm.scss';
import Settings from './Modals/Settings';
import SettingsIcon from './Icons/SettingsIcon';
import ChevronRightIcon from './Icons/ChevronRightIcon';
import { Link } from 'react-router-dom';
import QuestionIcon from './Icons/QuestionIcon';
import Tooltip from './Tooltip';

interface DexFormProps {
  header: JSX.Element;
  headerTooltip?: JSX.Element;
  subheader?: JSX.Element;
  backLink?: string;
  content: JSX.Element;
  actions: JSX.Element;
}

function DexForm({ header, headerTooltip, backLink, content, actions }: DexFormProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <form
      className="box-wrapper"
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
                <div className="btn-icon">
                  <QuestionIcon />
                </div>
              </Tooltip>
            )}
          </div>
        </div>
        <div className="btn-icon" onClick={() => setShowSettings(!showSettings)}>
          <SettingsIcon />
        </div>
      </div>
      {content}
      <div className="box-actions">{actions}</div>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </form>
  );
}

export default DexForm;
