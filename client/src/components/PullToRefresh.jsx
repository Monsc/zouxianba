import React, { useState, useEffect, useRef } from 'react';

function PullToRefresh({ onRefresh, children }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef(null);
  const maxPullDistance = 100;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling) return;
      
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY.current);
      
      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, maxPullDistance));
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      
      if (pullDistance >= maxPullDistance * 0.7) {
        await onRefresh();
      }
      
      setIsPulling(false);
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, onRefresh]);

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-auto"
      style={{
        touchAction: 'pan-y',
      }}
    >
      {/* 下拉刷新指示器 */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`,
          opacity: pullDistance / maxPullDistance,
        }}
      >
        <div className="flex items-center space-x-2 p-4">
          <div
            className={`w-6 h-6 border-2 border-twitter-blue border-t-transparent rounded-full animate-spin ${
              pullDistance >= maxPullDistance ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <span className="text-twitter-blue">
            {pullDistance >= maxPullDistance ? '释放刷新' : '下拉刷新'}
          </span>
        </div>
      </div>

      {/* 内容区域 */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default PullToRefresh; 