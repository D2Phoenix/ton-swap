import { useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';

import CloseIcon from 'components/Icons/CloseIcon';

import './Modal.scss';

interface ModalProps {
  header?: string;
  children: React.ReactNode;
  className: string;
  close?: boolean;
  onClose: () => void;
}

export function Modal({ header, children, className, close, onClose }: ModalProps) {
  const el = useMemo(() => document.createElement('div'), []);

  useEffect(() => {
    const target = document.body;
    const classList = ['modal-container'];
    target.classList.remove('modal-inactive');
    target.classList.add('modal-active');
    if (className) {
      className.split(' ').forEach((item: string) => classList.push(item));
    }
    classList.forEach((item) => el.classList.add(item));
    target.appendChild(el);
    return () => {
      target.removeChild(el);
    };
  }, [el, className]);

  const onCloseHandler = useCallback(() => {
    document.body.classList.remove('modal-active');
    document.body.classList.add('modal-inactive');
    el.classList.add('out');
    setTimeout(() => {
      onClose();
    }, 400);
  }, [el, onClose]);

  useEffect(() => {
    if (close) {
      onCloseHandler();
    }
  }, [onCloseHandler, close]);

  return ReactDOM.createPortal(
    <div className="modal-background">
      <div className="modal">
        <div className="modal-header">
          <h5>{header}</h5>
          <div className="modal-close" onClick={onCloseHandler}>
            <CloseIcon />
          </div>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>,
    el,
  );
}

export default Modal;
