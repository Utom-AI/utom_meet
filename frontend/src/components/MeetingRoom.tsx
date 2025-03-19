import React, { useState, useEffect } from 'react';
import { DailyProvider, DailyVideo, useDaily, useDailyEvent } from '@daily-co/daily-react';
import styled from 'styled-components';
import AutoRecorder from './AutoRecorder';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

const LeaveButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #c82333;
  }
`;

interface MeetingRoomProps {
  meetingId: string;
  onLeave: () => void;
  meetingUrl: string;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ meetingId, onLeave, meetingUrl }) => {
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  
  const handleRecordingComplete = async (blob: Blob) => {
    setRecordingBlob(blob);
    try {
      const formData = new FormData();
      formData.append('recording', blob);
      formData.append('meeting_id', meetingId);

      const response = await fetch('http://localhost:5000/api/upload-recording', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload recording');
      }

      console.log('Recording uploaded successfully');
    } catch (error) {
      console.error('Error uploading recording:', error);
    }
  };

  return (
    <DailyProvider url={meetingUrl}>
      <Container>
        <Header>
          <Title>Meeting Room</Title>
          <LeaveButton onClick={onLeave}>Leave Meeting</LeaveButton>
        </Header>
        
        <AutoRecorder 
          meetingId={meetingId} 
          onRecordingComplete={handleRecordingComplete}
        />
        
        <DailyVideo 
          sessionId={meetingId}
          type="video"
        />
      </Container>
    </DailyProvider>
  );
};

export default MeetingRoom; 