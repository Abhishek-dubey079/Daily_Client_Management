import appLogo from '../assets/app_logo.png';

const Logo = ({ size = 'md', className = '' }) => {
  // Size variants: sm (h-8 w-8), md (h-12 w-12), lg (h-24 w-24)
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-24 w-24'
  };

  return (
    <img
      src={appLogo}
      alt="Client Management Logo"
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
    />
  );
};

export default Logo;

