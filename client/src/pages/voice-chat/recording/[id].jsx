import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ErrorState from '@/components/common/ErrorState';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const RecordingPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const audioRef = useRef(null);

  // 获取录音信息
  const fetchRecording = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/voice-chat/recordings/${id}`);
      setRecording(response.data.recording);
    } catch (err) {
      setError(err.message || '获取录音信息失败');
      toast.error('获取录音信息失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRecording();
    }
  }, [id]);

  // 播放/暂停
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 更新进度
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  // 设置进度
  const handleSeek = e => {
    const time = e.target.value;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // 格式化时间
  const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 分享录音
  const shareRecording = () => {
    const url = `${window.location.origin}/voice-chat/recording/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('链接已复制');
    setShowShareModal(false);
  };

  if (!recording) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <LoadingOverlay isLoading={loading}>
            {error && (
              <ErrorState
                title="获取录音信息失败"
                description={error}
                action={<Button onClick={fetchRecording}>重试</Button>}
              />
            )}
          </LoadingOverlay>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* 录音信息 */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {recording.title || '未命名录音'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  录制于{' '}
                  {formatDistanceToNow(new Date(recording.createdAt), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </p>
              </div>
              <Button variant="secondary" onClick={() => setShowShareModal(true)}>
                分享
              </Button>
            </div>
          </div>

          {/* 播放器 */}
          <div className="p-6">
            <div className="space-y-4">
              {/* 进度条 */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-500">{formatTime(duration)}</span>
              </div>

              {/* 控制按钮 */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="p-4 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 音频元素 */}
            <audio
              ref={audioRef}
              src={recording.url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => setDuration(audioRef.current.duration)}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        </div>

        {/* 分享模态框 */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">分享录音</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">复制以下链接分享：</p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/voice-chat/recording/${id}`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                    <Button onClick={shareRecording}>复制</Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="secondary" onClick={() => setShowShareModal(false)}>
                    关闭
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RecordingPage;
