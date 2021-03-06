import React, { MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import './Accordion.scss';

interface PanelProps {
  label: React.ReactNode;
  content: React.ReactNode;
  activeTab: number;
  index: number;
  onActivateTab: MouseEventHandler<HTMLDivElement>;
}

function Panel({ label, content, activeTab, index, onActivateTab }: PanelProps) {
  const [height, setHeight] = useState(0);
  const element = useRef(null);
  const isActive = activeTab === index;
  const innerStyle = {
    height: `${isActive ? height : 0}px`,
  };

  useEffect(() => {
    window.setTimeout(() => {
      // eslint-disable-next-line react/no-find-dom-node
      const el = ReactDOM.findDOMNode(element.current) as Element;
      if (el) {
        const height = el.querySelector('.panel__inner')?.scrollHeight;
        setHeight(height || 0);
      }
    }, 300);
  }, []);

  return (
    <div ref={element} className="panel" role="tabpanel" aria-expanded={isActive}>
      <div className="panel__label" role="tab" onClick={onActivateTab}>
        {label}
      </div>
      <div className="panel__inner" style={innerStyle} aria-hidden={!isActive}>
        <div className="panel__content">{content}</div>
      </div>
    </div>
  );
}

interface AccordionProps {
  panels: {
    label: React.ReactNode;
    content: React.ReactNode;
  }[];
}

export function Accordion({ panels }: AccordionProps) {
  const [activeTab, setActiveTab] = useState(-1);

  const activateTabHandler = useCallback((index) => {
    setActiveTab((prev) => (prev === index ? -1 : index));
  }, []);

  return (
    <div className="accordion" role="tablist">
      {panels.map((panel: any, index: number) => (
        <Panel
          key={index}
          activeTab={activeTab}
          index={index}
          {...panel}
          onActivateTab={activateTabHandler.bind(null, index)}
        />
      ))}
    </div>
  );
}
