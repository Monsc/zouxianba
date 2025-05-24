import React, { useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Smile } from 'lucide-react';

const EmojiPicker = ({ onSelect }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiSelect = (emoji) => {
    onSelect(emoji.native);
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <Smile className="w-5 h-5" />
      </button>

      {showPicker && (
        <div className="absolute bottom-full right-0 mb-2 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border">
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              set="twitter"
              showPreview={false}
              showSkinTones={false}
              locale="zh"
              searchPosition="none"
              categories={[
                'frequent',
                'smileys',
                'people',
                'nature',
                'foods',
                'activity',
                'objects',
                'symbols',
                'flags'
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker; 