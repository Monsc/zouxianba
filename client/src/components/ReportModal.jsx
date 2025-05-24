import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

function ReportModal({ type, targetId, onClose }) {
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = {
    user: [
      { value: 'spam', label: '垃圾信息' },
      { value: 'harassment', label: '骚扰' },
      { value: 'hate_speech', label: '仇恨言论' },
      { value: 'fake_account', label: '虚假账号' },
      { value: 'other', label: '其他' },
    ],
    content: [
      { value: 'spam', label: '垃圾信息' },
      { value: 'harassment', label: '骚扰' },
      { value: 'hate_speech', label: '仇恨言论' },
      { value: 'violence', label: '暴力内容' },
      { value: 'pornography', label: '色情内容' },
      { value: 'copyright', label: '版权问题' },
      { value: 'other', label: '其他' },
    ],
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!category || !reason.trim()) {
      toast.error('请选择举报类型并填写原因');
      return;
    }

    try {
      setLoading(true);
      await apiService.post('/reports', {
        type,
        targetId,
        category,
        reason: reason.trim(),
      });

      toast.success('举报已提交，我们会尽快处理');
      onClose();
    } catch (err) {
      console.error('Failed to submit report:', err);
      toast.error('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-twitter-gray-900 rounded-2xl w-full max-w-md mx-4 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="p-4 border-b border-twitter-gray-200 dark:border-twitter-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">举报{type === 'user' ? '用户' : '内容'}</h2>
              <button onClick={onClose} className="text-twitter-blue hover:underline">
                取消
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            {/* 举报类型 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-twitter-gray-700 dark:text-twitter-gray-300 mb-1">
                举报类型
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-twitter-gray-300 dark:border-twitter-gray-700 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent dark:bg-twitter-gray-800"
                required
              >
                <option value="">请选择举报类型</option>
                {(Array.isArray(categories[type]) ? categories[type] : []).map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 举报原因 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-twitter-gray-700 dark:text-twitter-gray-300 mb-1">
                举报原因
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows="4"
                placeholder="请详细描述举报原因..."
                className="w-full px-3 py-2 border border-twitter-gray-300 dark:border-twitter-gray-700 rounded-lg focus:ring-2 focus:ring-twitter-blue focus:border-transparent dark:bg-twitter-gray-800"
                required
              />
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading || !category || !reason.trim()}
              className="w-full py-2 bg-twitter-blue text-white font-bold rounded-full hover:bg-twitter-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '提交中...' : '提交举报'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ReportModal;
