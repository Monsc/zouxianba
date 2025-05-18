import React, { useState } from 'react';
import { reportContent } from '../services/api';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  targetUser?: string;
  targetPost?: string;
  targetComment?: string;
}

const reasons = [
  '垃圾广告',
  '骚扰/辱骂',
  '虚假信息',
  '敏感/违法内容',
  '其他',
];

function ReportModal({ open, onClose, targetUser, targetPost, targetComment }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('请选择举报原因');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await reportContent({ targetUser, targetPost, targetComment, reason, detail });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError('举报失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">举报</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        {success ? (
          <div className="text-green-600 text-center py-8">举报成功，感谢反馈！</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="error-message">{error}</div>}
            <div>
              <div className="mb-2 font-medium">请选择举报原因：</div>
              <div className="flex flex-wrap gap-2">
                {reasons.map(r => (
                  <button
                    type="button"
                    key={r}
                    className={`px-3 py-1 rounded-full border ${reason === r ? 'bg-primary text-white' : 'bg-gray-100'} transition`}
                    onClick={() => setReason(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="border rounded p-2 min-h-[60px]"
              placeholder="补充说明（可选）"
              value={detail}
              onChange={e => setDetail(e.target.value)}
              maxLength={200}
            />
            <button
              type="submit"
              className="btn btn-primary mt-2"
              disabled={isLoading}
            >
              {isLoading ? '提交中...' : '提交举报'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ReportModal; 