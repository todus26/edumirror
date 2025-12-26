import React from 'react';

interface LoginButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ 
  variant = 'primary', 
  onClick, 
  children, 
  className = '' 
}) => {
  return (
    <button 
      className={`login-button ${variant} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default LoginButton;