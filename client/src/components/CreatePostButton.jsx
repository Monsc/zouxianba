import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CreatePostBox from './CreatePostBox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import LoginForm from './LoginForm';
import { Plus } from 'lucide-react';

function CreatePostButton() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user } = useAuth();

  const handleOpen = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsPostModalOpen(true);
  };

  return (
    <>
      {/* 发帖按钮 - 固定在右下角 */}
      <button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-200 md:static md:w-full md:h-12 md:rounded-full md:mb-4"
        onClick={handleOpen}
        aria-label="发帖"
      >
        <Plus className="w-6 h-6 md:w-5 md:h-5" />
        <span className="hidden md:inline ml-2">发帖</span>
      </button>

      {/* 发帖弹窗 */}
      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>发帖</DialogTitle>
          </DialogHeader>
          <CreatePostBox onSuccess={() => setIsPostModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* 登录弹窗 */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>登录</DialogTitle>
          </DialogHeader>
          <LoginForm onSuccess={() => setIsLoginModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CreatePostButton;
