import { useState, useEffect, useCallback } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { api } from '../utils/api';

interface UseVideoCallProps {
  roomName: string;
}

interface UseVideoCallReturn {
  callFrame: DailyCall | null;
  isAudioOn: boolean;
  isVideoOn: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  leaveCall: () => void;
  error: string | null;
}

export const useVideoCall = ({ roomName }: UseVideoCallProps): UseVideoCallReturn => {
  const [callFrame, setCallFrame] = useState<DailyCall | null>(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeDaily = useCallback(async () => {
    try {
      const response = await api.getRoom(roomName);
      const frame = DailyIframe.createFrame({
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
          background: '#1a1a1a',
        },
        showLeaveButton: true,
        showFullscreenButton: true,
      });

      frame.join({ url: response.url });

      setCallFrame(frame);

      frame.on('left-meeting', () => {
        frame.destroy();
        window.location.href = '/';
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    }
  }, [roomName]);

  useEffect(() => {
    initializeDaily();

    return () => {
      if (callFrame) {
        callFrame.destroy();
      }
    };
  }, [initializeDaily, callFrame]);

  const toggleAudio = useCallback(() => {
    if (callFrame) {
      callFrame.setLocalAudio(!isAudioOn);
      setIsAudioOn(!isAudioOn);
    }
  }, [callFrame, isAudioOn]);

  const toggleVideo = useCallback(() => {
    if (callFrame) {
      callFrame.setLocalVideo(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  }, [callFrame, isVideoOn]);

  const leaveCall = useCallback(() => {
    if (callFrame) {
      callFrame.leave();
    }
  }, [callFrame]);

  return {
    callFrame,
    isAudioOn,
    isVideoOn,
    toggleAudio,
    toggleVideo,
    leaveCall,
    error,
  };
}; 