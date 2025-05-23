import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ImagePreview({ images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  const handleTouchStart = e => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const initialDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      const handleTouchMove = e => {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const newScale = (currentDistance / initialDistance) * scale;
        setScale(Math.min(Math.max(newScale, 1), 3));
      };

      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        onClick={onClose}
      >
        {/* 关闭按钮 */}
        <button
          className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10"
          onClick={onClose}
        >
          ✕
        </button>

        {/* 图片容器 */}
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.img
            src={images[currentIndex].url}
            alt=""
            className="max-w-full max-h-full object-contain"
            style={{
              scale,
              x: position.x,
              y: position.y,
            }}
            onTouchStart={handleTouchStart}
            onClick={e => e.stopPropagation()}
            drag={scale > 1}
            dragConstraints={{
              left: -100,
              right: 100,
              top: -100,
              bottom: 100,
            }}
            dragElastic={0.1}
          />

          {/* 缩略图预览 */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`w-16 h-16 rounded-lg overflow-hidden ${
                    index === currentIndex ? 'ring-2 ring-twitter-blue' : ''
                  }`}
                  onClick={e => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                >
                  <img src={image.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* 导航按钮 */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white p-2 rounded-full hover:bg-white/10"
                onClick={e => {
                  e.stopPropagation();
                  setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
                }}
              >
                ←
              </button>
              <button
                className="absolute right-4 text-white p-2 rounded-full hover:bg-white/10"
                onClick={e => {
                  e.stopPropagation();
                  setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
                }}
              >
                →
              </button>
            </>
          )}

          {/* 缩放控制 */}
          <div className="absolute bottom-20 left-0 right-0 flex justify-center space-x-4">
            <button
              className="text-white p-2 rounded-full hover:bg-white/10"
              onClick={e => {
                e.stopPropagation();
                setScale(Math.max(1, scale - 0.5));
              }}
            >
              -
            </button>
            <button
              className="text-white p-2 rounded-full hover:bg-white/10"
              onClick={e => {
                e.stopPropagation();
                setScale(Math.min(3, scale + 0.5));
              }}
            >
              +
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ImagePreview;
