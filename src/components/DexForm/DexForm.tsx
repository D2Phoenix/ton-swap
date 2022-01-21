import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import ChevronRightIcon from 'components/Icons/ChevronRightIcon';
import QuestionIcon from 'components/Icons/QuestionIcon';
import SettingsIcon from 'components/Icons/SettingsIcon';
import SettingsModal from 'components/Modals/SettingsModal';
import Tooltip from 'components/Tooltip';

import './DexForm.scss';

interface DexFormProps {
  header: JSX.Element;
  headerTooltip?: JSX.Element;
  subheader?: JSX.Element;
  backLink?: string;
  content: JSX.Element;
  actions: JSX.Element;
}

export function DexForm({ header, headerTooltip, backLink, content, actions }: DexFormProps) {
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
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </form>
  );
}
