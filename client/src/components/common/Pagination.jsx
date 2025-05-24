import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPageNumbers = true,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisiblePages = 5;

  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return pages;
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - halfVisible, 1);
    let end = Math.min(start + maxVisiblePages - 1, totalPages);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }

    return pages.slice(start - 1, end);
  };

  const renderPageNumbers = () => {
    const visiblePages = getVisiblePages();

    return (
      Array.isArray(visiblePages) &&
      visiblePages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150
            ${currentPage === page
              ? 'z-10 bg-[#1da1f2] text-white shadow-lg'
              : 'bg-white dark:bg-gray-900/80 text-[#1da1f2] border border-[#1da1f2]/30 hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] dark:hover:bg-[#1a8cd8]/10 dark:hover:text-[#1a8cd8]'}
          `}
        >
          {page}
        </button>
      ))
    );
  };

  return (
    <nav className="flex items-center justify-center space-x-1">
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-[#1da1f2] bg-white dark:bg-gray-900/80 border border-[#1da1f2]/30 rounded-full hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] dark:hover:bg-[#1a8cd8]/10 dark:hover:text-[#1a8cd8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="sr-only">首页</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-[#1da1f2] bg-white dark:bg-gray-900/80 border border-[#1da1f2]/30 rounded-full hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] dark:hover:bg-[#1a8cd8]/10 dark:hover:text-[#1a8cd8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="sr-only">上一页</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {showPageNumbers && renderPageNumbers()}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-[#1da1f2] bg-white dark:bg-gray-900/80 border border-[#1da1f2]/30 rounded-full hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] dark:hover:bg-[#1a8cd8]/10 dark:hover:text-[#1a8cd8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="sr-only">下一页</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-[#1da1f2] bg-white dark:bg-gray-900/80 border border-[#1da1f2]/30 rounded-full hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] dark:hover:bg-[#1a8cd8]/10 dark:hover:text-[#1a8cd8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="sr-only">末页</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </nav>
  );
};

export default Pagination;
