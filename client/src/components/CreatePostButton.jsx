import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CreatePostBox from './CreatePostBox';

function CreatePostButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  const handleOpen = () => {
    setIsModalOpen(true);
    setIsClosing(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
    }, 220);
  };

  return (
    <>
      <button
        className="create-post-button fixed bottom-20 right-6 z-50 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-xl hover:bg-primary-hover dark:bg-primary dark:hover:bg-blue-400 transition-all duration-200 text-3xl md:w-14 md:h-14 md:text-2xl"
        onClick={handleOpen}
        aria-label="Create Post"
      >
        <i className="icon-plus" />
      </button>

      {isModalOpen && (
        <div
          className="modal-overlay fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn"
          onClick={handleClose}
        >
          <div
            className="modal bg-white dark:bg-[#192734] rounded-2xl shadow-2xl p-6 w-full max-w-lg relative animate-slideUp"
            onClick={e => e.stopPropagation()}
            aria-hidden={isClosing}
          >
            <div className="modal-header flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">发帖</h2>
              <button
                className="close-button text-2xl text-gray-400 hover:text-primary transition-colors"
                onClick={handleClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <CreatePostBox />
          </div>
        </div>
      )}
    </>
  );
}

export default CreatePostButton;
