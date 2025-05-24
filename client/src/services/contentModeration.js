import apiService from './api';

class ContentModerationService {
  constructor() {
    this.sensitiveWords = new Set();
    this.loadSensitiveWords();
  }

  async loadSensitiveWords() {
    try {
      const response = await apiService.get('/moderation/sensitive-words');
      this.sensitiveWords = new Set(response.data);
    } catch (error) {
      console.error('Failed to load sensitive words:', error);
    }
  }

  async checkContent(content) {
    try {
      // 本地敏感词检查
      const hasSensitiveWords = this.checkSensitiveWords(content);
      if (hasSensitiveWords) {
        return {
          isSafe: false,
          reason: 'Content contains sensitive words'
        };
      }

      // 调用内容审核API
      const response = await apiService.post('/moderation/check', { content });
      return response.data;
    } catch (error) {
      console.error('Content moderation error:', error);
      return {
        isSafe: false,
        reason: 'Content moderation service error'
      };
    }
  }

  checkSensitiveWords(content) {
    const words = content.toLowerCase().split(/\s+/);
    return words.some(word => this.sensitiveWords.has(word));
  }

  async moderateImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await apiService.post('/moderation/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Image moderation error:', error);
      return {
        isSafe: false,
        reason: 'Image moderation service error'
      };
    }
  }

  async reportContent(contentId, reason) {
    try {
      const response = await apiService.post(`/moderation/report/${contentId}`, { reason });
      return response.data;
    } catch (error) {
      console.error('Content report error:', error);
      throw error;
    }
  }
}

const contentModerationService = new ContentModerationService();
export default contentModerationService; 