import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', isLoading = false, disabled = false }) => {
  const baseStyle = "px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 flex justify-center items-center gap-2 relative overflow-hidden";
  
  const variants = {
    primary: "bg-primary hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]",
    secondary: "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700",
    danger: "bg-alert hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]",
    outline: "bg-transparent border border-primary text-primary hover:bg-primary/10"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`${baseStyle} ${variants[variant]} ${className} ${isLoading || disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
};

export default Button;
