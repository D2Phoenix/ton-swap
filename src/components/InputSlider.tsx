import './InputSlider.scss';
import { RefObject, useCallback, useEffect, useRef } from 'react';

interface InputSliderProps {
  value: string;
  pnChange: (value: string) => void;
}

function InputSlider({ value, pnChange }: InputSliderProps) {
  const ref: RefObject<HTMLInputElement> = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.background = `linear-gradient(90deg, #0088CC ${value}%, #fff ${value}%)`;
    }
  }, [value]);

  const handleOnChange = useCallback(
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
        onChange={handleOnChange}
        min="0"
        max="100"
      />
      <span className="input-slider__value">{value}%</span>
    </div>
  );
}

export default InputSlider;
