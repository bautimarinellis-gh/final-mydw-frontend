interface IconProps {
  size?: number;
  className?: string;
}

const InterestsIcon = ({ size = 24, className = "" }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7.01V17C3 18.1 3.9 19 5 19L16 19C16.67 19 17.27 18.66 17.63 18.15L22 12L17.63 5.84ZM16 17H5V7H16L19.55 12L16 17Z"
        fill="currentColor"
      />
      <path
        d="M7.5 9.5C8.33 9.5 9 10.17 9 11C9 11.83 8.33 12.5 7.5 12.5C6.67 12.5 6 11.83 6 11C6 10.17 6.67 9.5 7.5 9.5ZM16.5 9.5C17.33 9.5 18 10.17 18 11C18 11.83 17.33 12.5 16.5 12.5C15.67 12.5 15 11.83 15 11C15 10.17 15.67 9.5 16.5 9.5Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default InterestsIcon;

