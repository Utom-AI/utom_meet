import React, { useEffect, useRef, useState } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import styled from 'styled-components';

const VideoRoomContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a1a;
  position: relative;
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BottomPanel = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  height: 200px;
  border-top: 1px solid #333;
`;

const TranscriptContainer = styled.div`
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem;
  overflow-y: auto;
`;

const ChatContainer = styled.div`
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #333;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
`;

const ChatInput = styled.div`
  display: flex;
  gap: 0.5rem;
  
  input {
    flex: 1;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #333;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    
    &:focus {
      outline: none;
      border-color: #4a9eff;
    }
  }
  
  button {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    background: #4a9eff;
    color: white;
    cursor: pointer;
    
    &:hover {
      background: #3a8eef;
    }
  }
`;

const TranscriptEntry = styled.div`
  margin-bottom: 0.5rem;
  
  .speaker {
    font-weight: bold;
    color: #4a9eff;
  }
  
  .timestamp {
    color: #666;
    font-size: 0.8rem;
    margin-right: 0.5rem;
  }
`;

const ChatMessage = styled(TranscriptEntry)`
  .message {
    word-break: break-word;
  }
`;

const Notification = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem;
  background: #059669;
  color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
`;

interface RecordingButtonProps {
  $isRecording: boolean;
}

const RecordingButton = styled.button<RecordingButtonProps>`
  background-color: ${props => props.$isRecording ? '#ff4444' : '#4CAF50'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
  &:hover {
    opacity: 0.9;
  }
`;

const NotificationText = styled.div`
  color: white;
  font-weight: bold;
`;

interface VideoRoomProps {
  url: string;
  onRecordingSaved?: (meetingId: string) => void;
}

interface TranscriptItem {
  speaker: string;
  text: string;
  timestamp: string;
}

interface ChatItem extends TranscriptItem {}

const VideoRoom: React.FC<VideoRoomProps> = ({ url, onRecordingSaved }) => {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [notification, setNotification] = useState('');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatItem[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const callRef = useRef<DailyCall | null>(null);

  useEffect(() => {
    if (!videoContainerRef.current) return;

    const dailyConfig = {
      url,
      showLeaveButton: true,
      showFullscreenButton: true,
      customLayout: true,
    };

    // Initialize Daily.co call
    callRef.current = DailyIframe.createCallObject();
    callRef.current.join({ url });

    // Handle transcription events
    callRef.current.on('transcription-message', (event: any) => {
      const { participant, text } = event;
      const timestamp = new Date().toLocaleTimeString();
      
      setTranscript(prev => [...prev, {
        speaker: participant.user_name || 'Unknown',
        text,
        timestamp,
      }]);
    });

    // Handle participant updates
    callRef.current.on('participant-joined', updateParticipants);
    callRef.current.on('participant-left', updateParticipants);

    // Handle recording events
    callRef.current.on('recording-started', () => {
      setIsRecording(true);
      setNotification('Recording started');
    });

    callRef.current.on('recording-stopped', async (event: any) => {
      setIsRecording(false);
      setNotification('Recording stopped');

      try {
        const recordingData = {
          participants: participants.map(p => p.user_name || 'Unknown'),
          transcript,
          chatMessages,
          recordingUrl: event.recordingUrl,
          endTime: new Date().toISOString()
        };

        const response = await fetch('/api/save-recording-metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recordingData),
        });

        const data = await response.json();
        
        if (response.ok) {
          setNotification('Recording saved successfully');
          if (onRecordingSaved) {
            onRecordingSaved(data.meeting_id);
          }
        } else {
          throw new Error(data.error || 'Failed to save recording');
        }
      } catch (error) {
        console.error('Error saving recording metadata:', error);
        setNotification('Error saving recording');
      }
    });

    callRef.current.on('recording-error', (error: any) => {
      console.error('Recording error:', error);
      setNotification('Recording error occurred');
      setIsRecording(false);
    });

    return () => {
      if (callRef.current) {
        callRef.current.destroy();
      }
    };
  }, [url, onRecordingSaved, participants, transcript, chatMessages]);

  const updateParticipants = () => {
    const participantData = callRef.current?.participants();
    if (participantData) {
      setParticipants(Object.values(participantData));
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage: ChatItem = {
      speaker: 'You',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');

    // Send message to other participants
    callRef.current?.sendAppMessage({ type: 'chat', message: newMessage }, '*');
  };

  // Handle incoming chat messages
  useEffect(() => {
    if (!callRef.current) return;

    const handleAppMessage = (event: any) => {
      if (event.data.type === 'chat') {
        setChatMessages(prev => [...prev, event.data.message]);
      }
    };

    callRef.current.on('app-message', handleAppMessage);

    return () => {
      callRef.current?.off('app-message', handleAppMessage);
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      await callRef.current?.startRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
      setNotification('Failed to start recording');
    }
  };

  const handleStopRecording = async () => {
    try {
      await callRef.current?.stopRecording();
    } catch (error) {
      console.error('Error stopping recording:', error);
      setNotification('Failed to stop recording');
    }
  };

  return (
    <VideoRoomContainer>
      {notification && <Notification>{notification}</Notification>}
      <VideoGrid ref={videoContainerRef} />
      <BottomPanel>
        <TranscriptContainer>
          <h3>Transcript</h3>
          {transcript.map((item, index) => (
            <TranscriptEntry key={index}>
              <span className="timestamp">{item.timestamp}</span>
              <span className="speaker">{item.speaker}:</span> {item.text}
            </TranscriptEntry>
          ))}
        </TranscriptContainer>
        <ChatContainer>
          <h3>Chat</h3>
          <ChatMessages>
            {chatMessages.map((item, index) => (
              <ChatMessage key={index}>
                <span className="timestamp">{item.timestamp}</span>
                <span className="speaker">{item.speaker}:</span>
                <span className="message">{item.text}</span>
              </ChatMessage>
            ))}
          </ChatMessages>
          <ChatInput>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </ChatInput>
        </ChatContainer>
      </BottomPanel>
      <ControlsContainer>
        <RecordingButton
          $isRecording={isRecording}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </RecordingButton>
        {notification && <NotificationText>{notification}</NotificationText>}
      </ControlsContainer>
    </VideoRoomContainer>
  );
};

export default VideoRoom; 