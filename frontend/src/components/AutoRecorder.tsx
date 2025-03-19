import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const RecordingIndicator = styled.div<{ isRecording: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: ${props => props.isRecording ? '#ff4444' : '#666'};
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Dot = styled.div<{ isRecording: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
  animation: ${props => props.isRecording ? 'pulse 1s infinite' : 'none'};

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

interface AutoRecorderProps {
  meetingId: string;
  onRecordingComplete: (blob: Blob) => void;
}

const AutoRecorder: React.FC<AutoRecorderProps> = ({ meetingId, onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const startRecording = async () => {
      try {
        // Get the meeting container element
        const meetingContainer = document.querySelector('.daily-container');
        if (!meetingContainer) {
          console.error('Meeting container not found');
          return;
        }

        // Create a stream from the meeting container
        const stream = await (meetingContainer as any).captureStream(30); // 30 FPS
        streamRef.current = stream;

        // Create MediaRecorder instance
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 2500000, // 2.5 Mbps for medium quality
        });

        mediaRecorderRef.current = mediaRecorder;

        // Handle data available event
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        // Handle recording stop
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          onRecordingComplete(blob);
          chunksRef.current = [];
          setIsRecording(false);
        };

        // Start recording
        mediaRecorder.start(1000); // Collect data every second
        setIsRecording(true);

      } catch (error) {
        console.error('Error starting recording:', error);
      }
    };

    // Start recording when component mounts
    startRecording();

    // Cleanup function
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [meetingId, onRecordingComplete]);

  return (
    <RecordingIndicator isRecording={isRecording}>
      <Dot isRecording={isRecording} />
      {isRecording ? 'Recording' : 'Recording Stopped'}
    </RecordingIndicator>
  );
};

export default AutoRecorder; 