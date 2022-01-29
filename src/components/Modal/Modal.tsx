import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import CloseIcon from 'components/Icons/CloseIcon';

import './Modal.scss';

interface ModalProps {
  container?: HTMLDivElement;
  header?: string;
  children: React.ReactNode;
  className: string;
  open?: boolean;
  close?: boolean;
  onClose: (result?: any) => void;
  onCloseComplete?: () => void;
}

export function Modal({
  container = document.createElement('div'),
  header,
  children,
  className,
  open,
  onClose,
  onCloseComplete,
}: ModalProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const target = document.body;
    const classList = ['modal-container'];
    target.classList.remove('modal-inactive');
    target.classList.add('modal-active');
    if (className) {
      className.split(' ').forEach((item: string) => classList.push(item));
    }
    classList.forEach((item) => container.classList.add(item));
  }, [container, className]);

  const onCloseHandler = useCallback(() => {
    document.body.classList.remove('modal-active');
    document.body.classList.add('modal-inactive');
    container.classList.add('out');
    onClose && onClose();
    setTimeout(() => {
      onCloseComplete && onCloseComplete();
      container.classList.remove('out');
    }, 400);
  }, [container, onClose, onCloseComplete]);

  useEffect(() => {
    if (!open) {
      onCloseHandler();
    }
  }, [onCloseHandler, open]);

  const onBackgroundClickHandler = useCallback(
    (event) => {
      if (event.target === backgroundRef.current) {
        onCloseHandler();
      }
    },
    [onCloseHandler],
  );

  return (
    <div ref={backgroundRef} className="modal-background" onClick={onBackgroundClickHandler}>
      <div className="modal">
        <div className="modal-header">
          <h5>{header}</h5>
          <div className="modal-close" onClick={onCloseHandler}>
            <CloseIcon />
          </div>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
