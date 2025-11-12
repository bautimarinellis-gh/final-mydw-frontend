interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const ChatIcon = ({ size = 24, color = "currentColor", className = "" }: IconProps) => {
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
        d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM7 9H17V11H7V9ZM13 14H7V12H13V14ZM17 8H7V6H17V8Z"
        fill={color}
      />
    </svg>
  );
};

export default ChatIcon;

