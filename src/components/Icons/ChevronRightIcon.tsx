interface ChevronRightIconProps {
  revert?: boolean;
}

function ChevronRightIcon({ revert }: ChevronRightIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="icon"
      aria-hidden="true"
      role="img"
      transform={revert ? 'rotate(180)' : ''}
      style={{ transform: revert ? 'rotate(180deg)' : '' }}
      width="24px"
      height="24px"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 24 24"
    >
      <path
        fillRule="evenodd"
        d="M8.72 18.78a.75.75 0 0 0 1.06 0l6.25-6.25a.75.75 0 0 0 0-1.06L9.78 5.22a.75.75 0 0 0-1.06 1.06L14.44 12l-5.72 5.72a.75.75 0 0 0 0 1.06z"
        fill="currentColor"
      />
    </svg>
  );
}

export default ChevronRightIcon;
