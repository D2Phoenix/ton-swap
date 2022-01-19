import './Spinner.scss';

interface SpinnerProps {
  className?: string;
}

function Spinner({ className }: SpinnerProps) {
  return (
    <div className={`lds-ripple ${className || ''}`}>
      <div />
      <div />
    </div>
  );
}

export default Spinner;
