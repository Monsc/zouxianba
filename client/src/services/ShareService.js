import { api } from '@/lib/api';

export class ShareService {
  static async sharePost(options) {
    const response = await api.post('/share', options);
    return response.data;
  }

  static async getShareCount(postId) {
    const response = await api.get(`/posts/${postId}/share-count`);
    return response.data.count;
  }

  static async copyToClipboard(text) {
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
