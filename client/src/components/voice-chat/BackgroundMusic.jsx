import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'react-hot-toast';

const BACKGROUND_MUSIC = [
  {
    id: 'ambient',
    name: '环境音乐',
    url: '/music/ambient.mp3',
  },
  {
    id: 'lofi',
    name: 'Lo-Fi',
    url: '/music/lofi.mp3',
  },
  {
    id: 'nature',
    name: '自然声音',
    url: '/music/nature.mp3',
  },
  {
    id: 'rain',
    name: '雨声',
    url: '/music/rain.mp3',
  },
];

const BackgroundMusic = ({ roomId }) => {
  const { socket } = useSocket();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [showMusicList, setShowMusicList] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.on('background_music', data => {
        if (data.roomId === roomId) {
          if (data.action === 'play') {
            setCurrentTrack(data.track);
            setIsPlaying(true);
          } else if (data.action === 'stop') {
            setIsPlaying(false);
          } else if (data.action === 'volume') {
            setVolume(data.volume);
          }
        }
      });

      return () => {
        socket.off('background_music');
      };
    }
  }, [socket, roomId]);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [currentTrack, volume]);

  const playMusic = track => {
    if (socket) {
      socket.emit('background_music', {
        roomId,
        action: 'play',
        track,
      });
      setCurrentTrack(track);
      setIsPlaying(true);
      setShowMusicList(false);
    }
  };

  const stopMusic = () => {
    if (socket) {
      socket.emit('background_music', {
        roomId,
        action: 'stop',
      });
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = e => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (socket) {
      socket.emit('background_music', {
        roomId,
        action: 'volume',
        volume: newVolume,
      });
    }
  };

  return (
    <div className="relative">
      {/* 控制按钮 */}
      <button
        onClick={() => setShowMusicList(!showMusicList)}
        className={`p-2 rounded-full ${
          isPlaying ? 'bg-primary text-white' : 'hover:bg-gray-100'
        } transition-colors`}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </button>

      {/* 音乐列表 */}
      {showMusicList && (
        <div className="absolute bottom-full left-0 mb-2 p-4 bg-white rounded-lg shadow-lg border w-64">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">背景音乐</h3>
            <div className="space-y-2">
              {Array.isArray(BACKGROUND_MUSIC) &&
                BACKGROUND_MUSIC.map(track => (
                  <button
                    key={track.id}
                    onClick={() => playMusic(track)}
                    className={`w-full p-2 text-left rounded-lg transition-colors ${
                      currentTrack?.id === track.id ? 'bg-primary text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {track.name}
                  </button>
                ))}
            </div>
            {isPlaying && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">音量</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="flex-1"
                  />
                </div>
                <button
                  onClick={stopMusic}
                  className="w-full p-2 text-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  停止播放
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 音频元素 */}
      {currentTrack && (
        <audio ref={audioRef} src={currentTrack.url} loop autoPlay={isPlaying} className="hidden" />
      )}
    </div>
  );
};

export default BackgroundMusic;
