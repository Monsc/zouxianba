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
      {/* 桌面端右下角悬浮发帖按钮，移动端隐藏 */}
      <button
        className="hidden md:fixed md:bottom-8 md:right-8 md:z-50 md:w-16 md:h-16 md:rounded-full md:bg-primary md:text-white md:flex md:items-center md:justify-center md:shadow-lg md:hover:bg-primary/90 transition-all duration-200"
        onClick={handleOpen}
        aria-label="发帖"
      >
        <Plus className="w-7 h-7" />
        <span className="hidden xl:inline ml-2 text-lg font-bold">发帖</span>
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
