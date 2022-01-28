import React, { useRef } from 'react';
import { JSXElementConstructor, useCallback, useMemo } from 'react';
import ReactDOM, { unmountComponentAtNode } from 'react-dom';
import { Provider } from 'react-redux';

import Modal from 'components/Modal';

import { store } from 'store/store';

interface ModalOptions {
  header: string;
  className: string;
}

export const useModal = (ModalElement: JSXElementConstructor<any>, options: ModalOptions) => {
  const container = useMemo(() => document.createElement('div'), []);
  const onClose = useRef<(params?: unknown) => void>();

  const setOnCloseHandler = useCallback((handler?: any) => {
    onClose.current = handler;
  }, []);

  const closeCompleteHandler = useCallback(() => {
    unmountComponentAtNode(container);
    document.body.removeChild(container);
  }, [container]);

  const closeFromModalHandler = useCallback(() => {
    if (onClose.current) {
      onClose.current();
    }
  }, []);

  const closeFromChildHandler = useCallback((params) => {
    render(false, null, () => {
      if (onClose.current) {
        onClose.current(params);
      }
    });
  }, []);

  const render = (isOpen: boolean, args?: any, callback?: () => void) => {
    if (isOpen && container.parentNode !== document.body) {
      const target = document.body;
      target.append(container);
    }
    ReactDOM.render(
      <React.StrictMode>
        <Provider store={store}>
          <Modal
            container={container}
            header={options.header}
            className={options.className}
            open={isOpen}
            onClose={closeFromModalHandler}
            onCloseComplete={closeCompleteHandler}
          >
            <ModalElement onClose={closeFromChildHandler} {...args} />
          </Modal>
        </Provider>
      </React.StrictMode>,
      container,
      callback,
    );
  };

  const openHandler = useCallback((args?: any) => {
    render(true, args);
  }, []);

  const closeHandler = useCallback(() => {
    render(false);
  }, []);

  return {
    open: openHandler,
    close: closeHandler,
    onClose: setOnCloseHandler,
  };
};
