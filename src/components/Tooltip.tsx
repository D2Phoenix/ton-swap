import React, { useCallback, useState } from 'react';
import './Tooltip.scss';

interface TooltipProps {
  delay?: number;
  children: any;
  direction: 'top' | 'bottom' | 'left' | 'right';
  content: any;
}

const Tooltip = ({ delay, children, direction, content }: TooltipProps) => {
  const [intervalId, setIntervalId] = useState();
  const [active, setActive] = useState(false);

  const showTip = useCallback(() => {
    const intervalId = setTimeout(() => {
      setActive(true);
    }, delay || 400);
    setIntervalId(intervalId as any);
  }, [delay]);

  const hideTip = useCallback(() => {
    clearInterval(intervalId);
    setActive(false);
  }, [intervalId]);

  return (
    <div
      className="tooltip-wrapper"
      // When to show the tooltip
      onClick={active ? hideTip : showTip}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      {/* Wrapping */}
      {children}
      {active && (
        <div className={`tooltip-tip ${direction || 'top'}`}>
          {/* Content */}
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
