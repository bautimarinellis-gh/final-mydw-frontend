interface CelebrationIconProps {
  size?: number;
  color?: string;
}

const CelebrationIcon = ({ size = 24, color = 'currentColor' }: CelebrationIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Confeti */}
      <path
        d="M4 4L6 6M4 20L6 18M20 4L18 6M20 20L18 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="4" cy="12" r="1.5" fill={color} />
      <circle cx="20" cy="12" r="1.5" fill={color} />
      <circle cx="12" cy="4" r="1.5" fill={color} />
      <circle cx="12" cy="20" r="1.5" fill={color} />
      
      {/* Estrella central */}
      <path
        d="M12 8L13.5 11L17 11.5L14.5 14L15 17.5L12 15.5L9 17.5L9.5 14L7 11.5L10.5 11L12 8Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* Pequeñas chispas */}
      <path
        d="M8 6L8.5 7L9 6.5L8.5 6L8 6.5L7.5 6L8 5.5L8.5 6L8 6Z"
        fill={color}
      />
      <path
        d="M16 6L16.5 7L17 6.5L16.5 6L16 6.5L15.5 6L16 5.5L16.5 6L16 6Z"
        fill={color}
      />
      <path
        d="M8 18L8.5 19L9 18.5L8.5 18L8 18.5L7.5 18L8 17.5L8.5 18L8 18Z"
        fill={color}
      />
      <path
        d="M16 18L16.5 19L17 18.5L16.5 18L16 18.5L15.5 18L16 17.5L16.5 18L16 18Z"
        fill={color}
      />
    </svg>
  );
};

export default CelebrationIcon;

