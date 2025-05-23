import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InfiniteScroll = ({
  data,
  fetchMore,
  hasMore,
  loading,
  renderItem,
  className = '',
  threshold = 0.5,
}) => {
  const [page, setPage] = useState(1);
  const observer = useRef();
  const loadingRef = useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold,
    };

    observer.current = new IntersectionObserver(entries => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        setPage(prev => prev + 1);
        fetchMore(page + 1);
      }
    }, options);

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [fetchMore, hasMore, loading, page, threshold]);

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence>
        {data.map((item, index) => (
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderItem(item)}
          </motion.div>
        ))}
      </AnimatePresence>

      {hasMore && (
        <div ref={loadingRef} className="flex justify-center py-4">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-twitter-blue border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-500">加载中...</span>
            </div>
          ) : (
            <div className="h-4" />
          )}
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
