import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { useSocket } from '@/hooks/useSocket';
import Button from '@/components/common/Button';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ErrorState from '@/components/common/ErrorState';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import SpeechToText from './SpeechToText';
import Reactions from './Reactions';
import BackgroundMusic from './BackgroundMusic';

const VoiceChatRoom = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { socket } = useSocket();
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [showRecordings, setShowRecordings] = useState(false);
  const [currentRecording, setCurrentRecording] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isSpeechToTextEnabled, setIsSpeechToTextEnabled] = useState(false);
  const [transcripts, setTranscripts] = useState([]);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // 获取房间信息
  const fetchRoom = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/voice-chat/rooms/${id}`);
      setRoom(response.data.room);
      setParticipants(response.data.participants);
      setIsHost(response.data.room.host._id === user._id);
      setIsModerator(response.data.room.moderators.includes(user._id));
    } catch (err) {
      setError(err.message || '获取房间信息失败');
      toast.error('获取房间信息失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && user) {
      fetchRoom();
    }
  }, [id, user]);

  // 初始化音频
  useEffect(() => {
    if (user) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          audioRef.current = stream;
        })
        .catch(err => {
          toast.error('无法访问麦克风');
        });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [user]);

  // 监听房间事件
  useEffect(() => {
    if (socket && id) {
      // 用户加入
      socket.on('user_joined', data => {
        setParticipants(prev => [...prev, data.user]);
        toast.success(`${data.user.username} 加入了房间`);
      });

      // 用户离开
      socket.on('user_left', data => {
        setParticipants(prev => prev.filter(p => p._id !== data.userId));
        toast.info(`${data.username} 离开了房间`);
      });

      // 用户静音状态改变
      socket.on('user_muted', data => {
        setParticipants(prev =>
          prev.map(p => (p._id === data.userId ? { ...p, isMuted: data.isMuted } : p))
        );
      });

      // 用户举手状态改变
      socket.on('user_hand_raised', data => {
        setParticipants(prev =>
          prev.map(p => (p._id === data.userId ? { ...p, isHandRaised: data.isHandRaised } : p))
        );
      });

      // 用户发言状态改变
      socket.on('user_speaking', data => {
        setParticipants(prev =>
          prev.map(p => (p._id === data.userId ? { ...p, isSpeaking: data.isSpeaking } : p))
        );
      });

      // 用户被踢出
      socket.on('user_kicked', data => {
        if (data.userId === user._id) {
          toast.error('你已被踢出房间');
          router.push('/voice-chat');
        } else {
          setParticipants(prev => prev.filter(p => p._id !== data.userId));
          toast.info(`${data.username} 已被踢出房间`);
        }
      });

      // 房间关闭
      socket.on('room_closed', () => {
        toast.error('房间已关闭');
        router.push('/voice-chat');
      });

      // 加入房间
      socket.emit('join_room', { roomId: id });

      return () => {
        socket.emit('leave_room', { roomId: id });
        socket.off('user_joined');
        socket.off('user_left');
        socket.off('user_muted');
        socket.off('user_hand_raised');
        socket.off('user_speaking');
        socket.off('user_kicked');
        socket.off('room_closed');
      };
    }
  }, [socket, id, user]);

  // 切换静音状态
  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      audioRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState;
      });
      setIsMuted(newMutedState);
      socket.emit('toggle_mute', { roomId: id, isMuted: newMutedState });
    }
  };

  // 切换举手状态
  const toggleHandRaise = () => {
    const newHandRaisedState = !isHandRaised;
    setIsHandRaised(newHandRaisedState);
    socket.emit('toggle_hand_raise', { roomId: id, isHandRaised: newHandRaisedState });
  };

  // 开始/停止录音
  const toggleRecording = () => {
    if (!isRecording) {
      // 开始录音
      const stream = audioRef.current;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');
        formData.append('roomId', id);

        try {
          await api.post('/voice-chat/recordings', formData);
          toast.success('录音已保存');
        } catch (err) {
          toast.error('保存录音失败');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      // 停止录音
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  // 踢出用户
  const kickUser = userId => {
    if (isHost || isModerator) {
      socket.emit('kick_user', { roomId: id, userId });
    }
  };

  // 关闭房间
  const closeRoom = async () => {
    if (isHost) {
      try {
        await api.delete(`/voice-chat/rooms/${id}`);
        socket.emit('close_room', { roomId: id });
        router.push('/voice-chat');
      } catch (err) {
        toast.error('关闭房间失败');
      }
    }
  };

  // 生成邀请链接
  const generateInviteLink = () => {
    const link = `${window.location.origin}/voice-chat/join/${id}`;
    setInviteLink(link);
    setShowInviteModal(true);
  };

  // 搜索用户
  const searchUsers = async query => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await api.get('/users/search', {
        params: { query, limit: 5 },
      });
      setSearchResults(response.data.users);
    } catch (err) {
      toast.error('搜索用户失败');
    } finally {
      setIsSearching(false);
    }
  };

  // 邀请用户
  const inviteUser = userId => {
    socket.emit('invite_user', { roomId: id, userId });
    toast.success('邀请已发送');
    setShowInviteModal(false);
  };

  // 获取录音列表
  const fetchRecordings = async () => {
    try {
      const response = await api.get(`/voice-chat/rooms/${id}/recordings`);
      setRecordings(response.data.recordings);
    } catch (err) {
      toast.error('获取录音列表失败');
    }
  };

  useEffect(() => {
    if (id) {
      fetchRecordings();
    }
  }, [id]);

  // 播放录音
  const playRecording = recording => {
    if (currentRecording && currentRecording._id === recording._id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(recording.url);
      audioRef.current = audio;
      audio.play();
      setCurrentRecording(recording);
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  // 分享录音
  const shareRecording = recording => {
    const url = `${window.location.origin}/voice-chat/recording/${recording._id}`;
    setShareUrl(url);
    setShowShareModal(true);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">请先登录</h2>
          <p className="text-gray-600 mb-4">登录后可以加入语音聊天</p>
          <Button onClick={() => router.push('/login')}>去登录</Button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-4xl mx-auto">
        <LoadingOverlay isLoading={true} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        {/* 房间头部 */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{room.title}</h1>
              <p className="text-sm text-gray-500">
                创建于{' '}
                {formatDistanceToNow(new Date(room.createdAt), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="secondary" onClick={() => setShowParticipants(!showParticipants)}>
                参与者 ({participants.length})
              </Button>
              <Button variant="secondary" onClick={generateInviteLink}>
                邀请
              </Button>
              {isHost && (
                <Button variant="danger" onClick={closeRoom}>
                  结束房间
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 参与者列表 */}
        {showParticipants && (
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.isArray(participants) &&
                participants.map(participant => (
                  <div
                    key={participant._id}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <img
                      src={participant.avatar}
                      alt={participant.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {participant.username}
                      </p>
                      <div className="flex items-center space-x-1">
                        {participant.isMuted && (
                          <span className="text-xs text-gray-500">已静音</span>
                        )}
                        {participant.isHandRaised && (
                          <span className="text-xs text-blue-500">已举手</span>
                        )}
                        {participant.isSpeaking && (
                          <span className="text-xs text-green-500">正在发言</span>
                        )}
                      </div>
                    </div>
                    {(isHost || isModerator) && participant._id !== user._id && (
                      <button
                        onClick={() => kickUser(participant._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        踢出
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 控制栏 */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-center space-x-4">
            <Button variant={isMuted ? 'danger' : 'primary'} onClick={toggleMute}>
              {isMuted ? '取消静音' : '静音'}
            </Button>
            <Button variant={isHandRaised ? 'primary' : 'secondary'} onClick={toggleHandRaise}>
              {isHandRaised ? '放下手' : '举手'}
            </Button>
            <Button variant={isRecording ? 'danger' : 'secondary'} onClick={toggleRecording}>
              {isRecording ? `停止录音 (${recordingTime}s)` : '开始录音'}
            </Button>
            <Button
              variant={isSpeechToTextEnabled ? 'primary' : 'secondary'}
              onClick={() => setIsSpeechToTextEnabled(!isSpeechToTextEnabled)}
            >
              {isSpeechToTextEnabled ? '关闭字幕' : '开启字幕'}
            </Button>
            <Button variant="secondary" onClick={() => setShowRecordings(!showRecordings)}>
              录音记录
            </Button>
            <Reactions roomId={id} />
            <BackgroundMusic roomId={id} />
          </div>
        </div>

        {/* 录音列表 */}
        {showRecordings && (
          <div className="p-4 border-t">
            <h3 className="text-lg font-medium text-gray-900 mb-4">录音记录</h3>
            <div className="space-y-4">
              {recordings.map(recording => (
                <div
                  key={recording._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => playRecording(recording)}
                      className="p-2 rounded-full hover:bg-gray-200"
                    >
                      {currentRecording?._id === recording._id && isPlaying ? (
                        <svg
                          className="w-6 h-6 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
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
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {recording.title || '未命名录音'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(recording.createdAt), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => shareRecording(recording)}>
                      分享
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 邀请模态框 */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">邀请用户</h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  placeholder="搜索用户..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {isSearching && <div className="mt-2 text-sm text-gray-500">搜索中...</div>}
                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {searchResults.map(user => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm">{user.username}</span>
                        </div>
                        <Button size="sm" onClick={() => inviteUser(user._id)}>
                          邀请
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">或者分享邀请链接：</p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteLink);
                      toast.success('链接已复制');
                    }}
                  >
                    复制
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      toast.success('链接已复制');
                    }}
                  >
                    复制
                  </Button>
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
  );
};

export default VoiceChatRoom;
