interface ChevronDownIconParams {
  revert?: boolean;
}

function ChevronDownIcon({ revert }: ChevronDownIconParams) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      transform={revert ? 'rotate(180)' : ''}
      style={{ transform: revert ? 'rotate(180deg)' : '' }}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

export default ChevronDownIcon;
