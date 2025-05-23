import React, { useState } from 'react';
import Modal from './Modal';

const ImagePreview = ({ src, alt, width, height, className = '', preview = true }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleClick = () => {
    if (preview) {
      setIsPreviewOpen(true);
    }
  };

  return (
    <>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover ${preview ? 'cursor-zoom-in' : ''} ${className}`}
        onClick={handleClick}
      />
      {preview && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          size="xl"
          showClose={true}
        >
          <div className="relative w-full h-full">
            <img src={src} alt={alt} className="w-full h-full object-contain" />
          </div>
        </Modal>
      )}
    </>
  );
};

export default ImagePreview;
