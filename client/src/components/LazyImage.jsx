import React, { useState, useEffect, useRef } from 'react';

function LazyImage({ src, alt, className, placeholder = null }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // 创建 Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 当图片进入视口时加载
            const img = new Image();
            img.src = src;
            img.onload = () => {
              setIsLoaded(true);
              observerRef.current.unobserve(imgRef.current);
            };
            img.onerror = () => {
              setError(true);
              observerRef.current.unobserve(imgRef.current);
            };
          }
        });
      },
      {
        rootMargin: '50px 0px', // 提前 50px 开始加载
        threshold: 0.1,
      }
    );

    // 开始观察
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    // 清理函数
    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-twitter-gray-100 dark:bg-twitter-gray-800">
          {placeholder || (
            <div className="animate-pulse w-full h-full bg-twitter-gray-200 dark:bg-twitter-gray-700" />
          )}
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-twitter-gray-100 dark:bg-twitter-gray-800">
          <svg
            className="w-8 h-8 text-twitter-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      )}
      {isLoaded && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}

export default LazyImage; 