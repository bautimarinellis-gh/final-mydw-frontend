interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const SparkleIcon = ({ size = 24, color = "currentColor", className = "" }: IconProps) => {
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
        d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z"
        fill={color}
      />
      <path
        d="M19 3L19.5 5.5L22 6L19.5 6.5L19 9L18.5 6.5L16 6L18.5 5.5L19 3Z"
        fill={color}
      />
      <path
        d="M5 15L5.3 16.3L6.6 16.6L5.3 16.9L5 18.2L4.7 16.9L3.4 16.6L4.7 16.3L5 15Z"
        fill={color}
      />
    </svg>
  );
};

export default SparkleIcon;

