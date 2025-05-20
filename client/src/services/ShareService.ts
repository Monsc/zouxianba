import { api } from '@/lib/api';

export interface ShareOptions {
  postId: string;
  platform: 'wechat' | 'weibo' | 'qq' | 'link';
  title?: string;
  description?: string;
  image?: string;
}

export interface ShareResponse {
  url: string;
  qrCode?: string;
}

export class ShareService {
  static async sharePost(options: ShareOptions): Promise<ShareResponse> {
    const response = await api.post('/share', options);
    return response.data;
  }

  static async getShareCount(postId: string): Promise<number> {
    const response = await api.get(`/posts/${postId}/share-count`);
    return response.data.count;
  }

  static async copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // 降级处理
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
} 