import { RefObject, useCallback, useEffect, useRef } from 'react';

import './InputSlider.scss';

interface InputSliderProps {
  value: string;
  pnChange: (value: string) => void;
}

export function InputSlider({ value, pnChange }: InputSliderProps) {
  const ref: RefObject<HTMLInputElement> = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.background = `linear-gradient(90deg, var(--primary-color) ${value}%, var(--secondary-color) ${value}%)`;
    }
  }, [value]);

  const onChangeHandler = useCallback(
    (event) => {
      pnChange && pnChange(event.target.value);
    },
    [pnChange],
  );

  return (
    <div className="input-slider-wrapper">
      <input
        ref={ref}
        className="input-slider__range"
        type="range"
        value={value || 0}
        onChange={onChangeHandler}
        min="0"
        max="100"
      />
    </div>
  );
}
