import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({ content, children, position = 'top', delay = 200, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const tooltipRef = useRef(null);

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45',
    bottom: 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45',
    left: 'right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 rotate-45',
    right: 'left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 rotate-45',
  };

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      ref={tooltipRef}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-1.5 text-sm text-white bg-[#1da1f2] dark:bg-[#1a8cd8] rounded-2xl shadow-xl border border-[#1da1f2]/30 ${positions[position]} ${className}`}
          role="tooltip"
        >
          {content}
          <div className={`absolute w-2 h-2 bg-[#1da1f2] dark:bg-[#1a8cd8] ${arrows[position]}`} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
