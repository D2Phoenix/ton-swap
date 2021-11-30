import React, { MouseEventHandler } from 'react';
import ReactDOM from 'react-dom';

import './Modal.scss';

interface ModalProps {
    children: React.ReactNode;
    className: string;
    onClose: MouseEventHandler;
}

function Modal({ children, className, onClose }: ModalProps) {
    const el = React.useMemo(() => document.createElement("div"), []);

    React.useEffect(() => {
        const target = document.body;
        const classList = ['modal-container'];
        setTimeout(() => {
            el.classList.add('active');
        }, 100);
        if (className) {
            className.split(" ").forEach((item: string) => classList.push(item));
        }
        classList.forEach((item) => el.classList.add(item));
        target.appendChild(el);
        return () => {
            target.removeChild(el);
        };
    }, [el, className]);

    return ReactDOM.createPortal((
        <>
            <div className="modal-backdrop" onClick={onClose}/>
            <div className="modal-content">
                <div className="modal-close" onClick={onClose}/>
                {children}
            </div>
        </>
    ), el);
}

export default Modal;
