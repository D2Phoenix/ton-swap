import React, { useState } from 'react';
import './DexForm.scss';
import Settings from './Modals/Settings';
import SettingsIcon from './icons/SettingsIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import { Link } from 'react-router-dom';
import QuestionIcon from './icons/QuestionIcon';
import Tooltip from './Tooltip';

interface DexFormProps {
    header: JSX.Element;
    headerTooltip?: JSX.Element;
    subheader: JSX.Element;
    backLink?: string;
    content: JSX.Element;
    actions: JSX.Element;
}

function DexForm({header, headerTooltip, subheader, backLink, content, actions}: DexFormProps) {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <form className="box-wrapper" onSubmit={e => {
            e.preventDefault();
        }}>
            <div className="box-header-wrapper">
                {
                    backLink && <Link className="btn-icon chevron" to={backLink}>
                    <ChevronRightIcon revert={true}/>
                  </Link>
                }
                <div className="box-header">
                    <div className="title-1">
                        {header}
                        {
                            headerTooltip && <Tooltip content={<span className="text-small">{headerTooltip}</span>} direction="bottom">
                            <div className="btn-icon">
                              <QuestionIcon/>
                            </div>
                          </Tooltip>
                        }
                    </div>
                    <span className="sub-title-1">{subheader}</span>
                </div>
                <div className="btn-icon" onClick={() => setShowSettings(!showSettings)}>
                    <SettingsIcon/>
                </div>
            </div>
            {content}
            {actions}
            {
                showSettings && <Settings onClose={() => setShowSettings(false)}/>
            }
        </form>
    )
}

export default DexForm;
