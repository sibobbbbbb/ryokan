interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 24, className }: LogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" fill="#0a0a0f" />
      <rect x="1" y="1" width="30" height="30" stroke="#7c6af7" strokeWidth="1.5" />
      <path d="M1 8 L1 1 L8 1" stroke="#7c6af7" strokeWidth="2" strokeLinecap="butt" />
      <path d="M24 1 L31 1 L31 8" stroke="#7c6af7" strokeWidth="2" strokeLinecap="butt" />
      <path d="M1 24 L1 31 L8 31" stroke="#7c6af7" strokeWidth="2" strokeLinecap="butt" />
      <path d="M24 31 L31 31 L31 24" stroke="#7c6af7" strokeWidth="2" strokeLinecap="butt" />
      <path
        d="M9 8 L9 24 M9 8 L19 8 L19 16 L9 16 M19 16 L23 24"
        stroke="#7c6af7"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
