import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Icon } from './Icon';
import { Button } from '@/components/ui/button';
import { ShareService } from '@/services/ShareService';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

const SHARE_PLATFORMS = [
  {
    id: 'wechat',
    name: '微信',
    icon: 'wechat',
    color: 'text-green-500',
  },
  {
    id: 'weibo',
    name: '微博',
    icon: 'weibo',
    color: 'text-red-500',
  },
  {
    id: 'qq',
    name: 'QQ',
    icon: 'qq',
    color: 'text-blue-500',
  },
  {
    id: 'link',
    name: '复制链接',
    icon: 'link',
    color: 'text-gray-500',
  },
];

export const ShareDialog = ({ open, onClose, postId, title, description, image }) => {
  const { showToast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async platform => {
    try {
      setIsLoading(true);
      setSelectedPlatform(platform);

      const response = await ShareService.sharePost({
        postId,
        platform,
        title,
        description,
        image,
      });

      if (platform === 'link') {
        await ShareService.copyToClipboard(response.url);
        showToast('链接已复制到剪贴板', 'success');
        onClose();
      } else if (platform === 'wechat') {
        setQrCode(response.qrCode || null);
      } else {
        // 打开新窗口分享
        window.open(response.url, '_blank');
        onClose();
      }
    } catch (error) {
      showToast('分享失败，请重试', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>分享至</DialogTitle>
        </DialogHeader>
        {qrCode ? (
          <div className="mt-4 text-center">
            <img src={qrCode} alt="微信分享二维码" className="mx-auto h-48 w-48" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              请使用微信扫描二维码分享
            </p>
            <Button variant="ghost" onClick={() => setQrCode(null)} className="mt-4">
              返回
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {SHARE_PLATFORMS.map(platform => (
              <button
                key={platform.id}
                onClick={() => handleShare(platform.id)}
                disabled={isLoading}
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg p-4 transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Icon name={platform.icon} className={cn('w-8 h-8', platform.color)} />
                <span className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {platform.name}
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
