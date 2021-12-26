import React, { MouseEventHandler } from 'react';

import './Button.scss';
import Spinner from './Spinner';

interface ButtonProps {
    className?: string;
    type: 'primary' | 'outline' | 'icon';
    loading?: boolean;
    disabled?: boolean;
    onClick: MouseEventHandler;
    children: JSX.Element | string;
}

function Button({className, type, loading, disabled, onClick, children}: ButtonProps) {
    return (
        <button className={`btn btn-${type} ${className || ''}`}
                disabled={disabled}
                onClick={onClick}>
            {
                loading && <Spinner className={`btn ${type}`}/>
            }
            {
                !loading && children
            }
        </button>
    )
}

export default Button;
