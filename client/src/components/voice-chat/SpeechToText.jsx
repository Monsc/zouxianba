import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'react-hot-toast';

const SpeechToText = ({ roomId, isEnabled, onTranscript }) => {
  const { socket } = useSocket();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speaker, setSpeaker] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (isEnabled && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = event => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          onTranscript?.(finalTranscript);
          socket?.emit('transcript', {
            roomId,
            text: finalTranscript,
            timestamp: Date.now(),
          });
        }
      };

      recognitionRef.current.onerror = event => {
        console.error('Speech recognition error:', event.error);
        toast.error('语音识别出错，请重试');
        stopListening();
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isEnabled, roomId, socket, onTranscript]);

  useEffect(() => {
    if (socket) {
      socket.on('transcript', data => {
        if (data.roomId === roomId) {
          setTranscript(data.text);
          setSpeaker(data.speaker);
        }
      });

      return () => {
        socket.off('transcript');
      };
    }
  }, [socket, roomId]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 控制按钮 */}
      <div className="flex items-center justify-center">
        <button
          onClick={toggleListening}
          className={`p-3 rounded-full ${
            isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-dark'
          } text-white transition-colors`}
        >
          {isListening ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* 字幕显示 */}
      {transcript && (
        <div className="bg-black bg-opacity-75 text-white p-4 rounded-lg">
          {speaker && <div className="text-sm text-gray-300 mb-1">{speaker.username}:</div>}
          <div className="text-lg">{transcript}</div>
        </div>
      )}
    </div>
  );
};

export default SpeechToText;
