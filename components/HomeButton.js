import React from 'react';
import { useRouter } from 'next/router';
import { Home } from 'lucide-react';

/**
 * Reusable Home Button component for all calculator pages
 * Provides consistent styling and navigation functionality
 */
const HomeButton = ({ className = '', style = {} }) => {
  const router = useRouter();

  const defaultStyle = {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 1000,
    padding: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 0,
    width: '48px',
    height: '48px',
    ...style
  };

  const handleClick = () => {
    router.push('/');
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = '#2563eb';
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = '#3b82f6';
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
  };

  return (
    <button
      onClick={handleClick}
      style={defaultStyle}
      className={`home-button ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title="Go to Home"
      aria-label="Navigate to home page"
    >
      <Home 
        size={18}
        className="home-icon"
        style={{ strokeWidth: 2, display: 'block', margin: '0 auto', flexShrink: 0 }}
      />
    </button>
  );
};

export default HomeButton;
