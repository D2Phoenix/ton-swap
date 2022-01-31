import React, { RefObject, useCallback, useEffect, useRef } from 'react';

import './Notifications.scss';

interface NotificationsProps {
  children: React.ReactNode[];
}

interface NotificationProps {
  children: React.ReactNode;
  type: 'success' | 'warning' | 'info' | 'error';
  onClose?: () => void;
}

export function Notification({ children, type, onClose }: NotificationProps) {
  const ref: RefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      if (ref.current) {
        ref.current.classList.add('active');
      }
    }, 100);
  }, []);

  const clickHandler = useCallback(() => {
    if (ref.current) {
      ref.current.classList.remove('enter');
      ref.current.classList.add('leave');
      setTimeout(() => {
        onClose && onClose();
      }, 500);
    }
  }, [onClose]);

  useEffect(() => {
    setTimeout(() => {
      clickHandler();
    }, 500000);
  }, [clickHandler]);

  return (
    <div ref={ref} className={`notification enter notification-${type}`} onClick={clickHandler}>
      {children}
    </div>
  );
}

export function Notifications({ children }: NotificationsProps) {
  return <div className={`notifications-wrapper`}>{children}</div>;
}
