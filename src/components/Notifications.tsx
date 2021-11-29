import React, { RefObject, useCallback, useEffect, useRef } from 'react';

import './Notifications.scss';

interface NotificationsProps {
    children: React.ReactNode[],
}

interface NotificationProps {
    children: React.ReactNode,
    type: 'success' | 'warning' | 'info' | 'error',
    onClose?: Function
}

export function Notification({children, type, onClose}: NotificationProps) {
    const ref: RefObject<HTMLDivElement> = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            if (ref.current) {
                ref.current.classList.add('active');
            }
        }, 100)
    }, [])

    const handleClick = useCallback(()=> {
        if (ref.current) {
            ref.current.classList.remove('enter');
            ref.current.classList.add('leave');
            setTimeout(() => {
                onClose && onClose();
            }, 500);
        }
    }, [onClose]);

    return (
        <div ref={ref} className={`notification enter notification-${type}`} onClick={handleClick}>
            {children}
        </div>
    )
}

export function Notifications({children}: NotificationsProps) {
    return (
        <div className={`notifications-wrapper`}>
            {
                children
            }
        </div>
    )
}
