import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import axios from 'axios';

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.2);
  color: white;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  height: calc(100vh - 8.125rem);
  overflow: hidden;
  background: #1a1a1a;
`;

const VideoContainer = styled.div`
  flex: 1;
  position: relative;
  height: 100%;
  width: 100%;

  iframe {
    width: 100% !important;
    height: 100% !important;
    border: none;
    background: #1a1a1a;
  }
`;

const Sidebar = styled.div<{ isOpen: boolean }>`
  width: ${props => props.isOpen ? '300px' : '0'};
  background: #2a2a2a;
  transition: width 0.3s ease;
  overflow: hidden;
`;

const SidebarContent = styled.div`
  padding: 1rem;
  color: white;
`;

const ParticipantList = styled.div`
  margin-top: 1rem;
`;

const ParticipantItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const Controls = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 0.75rem;
  z-index: 1000;
`;

const Button = styled.button<{ $active?: boolean }>`
  width: 3.125rem;
  height: 3.125rem;
  border-radius: 50%;
  border: none;
  background: ${props => props.$active ? '#dc2626' : '#2a2a2a'};
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#ef4444' : '#404040'};
  }

  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 0.625rem);
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    white-space: nowrap;
  }
`;

const ParticipantRequest = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  backdrop-filter: blur(10px);
  animation: slideIn 0.3s ease;

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

const Room: React.FC = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  const [callFrame, setCallFrame] = useState<DailyCall | null>(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [waitingParticipants, setWaitingParticipants] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participantRequest, setParticipantRequest] = useState<any | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuthorization = () => {
      const storedMeetingDetails = localStorage.getItem('meetingDetails');
      if (!storedMeetingDetails) {
        navigate('/', { replace: true });
        return false;
      }

      const meetingDetails = JSON.parse(storedMeetingDetails);
      const isAuthorizedUser = meetingDetails.name === roomName || 
                             (meetingDetails.participants && 
                              meetingDetails.participants.includes(localStorage.getItem('userEmail')));

      if (!isAuthorizedUser) {
        navigate('/', { replace: true });
        return false;
      }

      return true;
    };

    const isAuthorizedUser = checkAuthorization();
    setIsAuthorized(isAuthorizedUser);
  }, [roomName, navigate]);

  useEffect(() => {
    let frameInstance: DailyCall | null = null;

    const initializeDaily = async () => {
      if (!isAuthorized) return;

      try {
        const response = await axios.get(`http://localhost:8000/api/rooms/${roomName}`);
        const url = response.data.url;

        const storedMeetingDetails = localStorage.getItem('meetingDetails');
        const meetingDetails = storedMeetingDetails ? JSON.parse(storedMeetingDetails) : null;
        const isHostUser = meetingDetails && meetingDetails.name === roomName;
        setIsHost(isHostUser);

        const container = document.getElementById('video-container');
        if (!container) return;

        const frame = DailyIframe.createFrame(container, {
          showLeaveButton: false,
          showFullscreenButton: false,
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            background: '#1a1a1a',
          },
          showLocalVideo: true,
          showParticipantsBar: false,
        });

        frameInstance = frame;

        if (!isHostUser) {
          await new Promise((resolve) => {
            frame.once('joined-meeting', resolve);
          });
        }

        await frame.join({ 
          url,
          showLocalVideo: true,
          userName: localStorage.getItem('userEmail') || 'Anonymous'
        });
        setCallFrame(frame);

        frame.on('participant-joined', (evt?: { participant: any }) => {
          if (evt) {
            if (isHostUser && !evt.participant.local) {
              setWaitingParticipants(prev => [...prev, evt.participant]);
            }
            setParticipants(prev => [...prev, evt.participant]);
          }
        });

        frame.on('participant-left', (evt?: { participant: any }) => {
          if (evt) {
            setParticipants(prev => prev.filter(p => p.session_id !== evt.participant.session_id));
          }
        });

        frame.on('left-meeting', () => {
          frame.destroy();
          window.location.href = '/';
        });

      } catch (error) {
        console.error('Error joining room:', error);
        navigate('/', { replace: true });
      }
    };

    initializeDaily();

    return () => {
      if (frameInstance) {
        frameInstance.destroy();
      }
    };
  }, [roomName, isAuthorized, navigate]);

  const toggleAudio = () => {
    if (callFrame) {
      callFrame.setLocalAudio(!isAudioOn);
      setIsAudioOn(!isAudioOn);
    }
  };

  const toggleVideo = () => {
    if (callFrame) {
      callFrame.setLocalVideo(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleScreenShare = async () => {
    if (callFrame) {
      if (!isScreenSharing) {
        try {
          await callFrame.startScreenShare();
          setIsScreenSharing(true);
        } catch (e) {
          console.error('Error sharing screen:', e);
        }
      } else {
        try {
          await callFrame.stopScreenShare();
          setIsScreenSharing(false);
        } catch (e) {
          console.error('Error stopping screen share:', e);
        }
      }
    }
  };

  const leaveCall = () => {
    if (callFrame) {
      callFrame.leave();
    }
  };

  const handleParticipant = (participantId: string, accept: boolean) => {
    if (callFrame && isHost) {
      if (accept) {
        callFrame.updateParticipant(participantId, {
          updatePermissions: {
            hasPresence: true,
            canSend: true,
            canAdmin: false
          }
        });
      } else {
        callFrame.updateParticipant(participantId, {
          updatePermissions: {
            hasPresence: false,
            canSend: false,
            canAdmin: false
          }
        });
      }
      setWaitingParticipants(prev => prev.filter(p => p.id !== participantId));
    }
  };

  const handleParticipantRequest = (accept: boolean) => {
    if (participantRequest) {
      handleParticipant(participantRequest.id, accept);
      setParticipantRequest(null);
    }
  };

  return (
    <Container>
      <Header>
        <h2>{roomName}</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button 
            $active={isSidebarOpen}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            data-tooltip="Participants"
          >
            👥
          </Button>
          <Button 
            data-tooltip="Settings"
          >
            🔧
          </Button>
        </div>
      </Header>

      <MainContent>
        <VideoContainer id="video-container" ref={videoContainerRef} />
        
        <Sidebar isOpen={isSidebarOpen}>
          <SidebarContent>
            <h3>Participants ({participants.length})</h3>
            <ParticipantList>
              {participants.map((participant) => (
                <ParticipantItem key={participant.session_id}>
                  {participant.user_name || 'Anonymous'} {participant.local && '(You)'}
                </ParticipantItem>
              ))}
            </ParticipantList>
          </SidebarContent>
        </Sidebar>
      </MainContent>
      
      {isHost && waitingParticipants.map((participant) => (
        <ParticipantRequest key={participant.id}>
          <p>{participant.user_name || 'Someone'} wants to join</p>
          <Button 
            onClick={() => handleParticipant(participant.id, true)}
            data-tooltip="Accept"
          >
            ✅
          </Button>
          <Button 
            onClick={() => handleParticipant(participant.id, false)}
            $active={true}
            data-tooltip="Decline"
            style={{ marginLeft: '0.5rem' }}
          >
            ❌
          </Button>
        </ParticipantRequest>
      ))}

      <Controls>
        <Button 
          onClick={toggleAudio} 
          $active={!isAudioOn}
          data-tooltip={isAudioOn ? 'Mute' : 'Unmute'}
        >
          🎤
        </Button>
        <Button 
          onClick={toggleVideo} 
          $active={!isVideoOn}
          data-tooltip={isVideoOn ? 'Stop Video' : 'Start Video'}
        >
          📹
        </Button>
        <Button 
          onClick={toggleScreenShare}
          $active={isScreenSharing}
          data-tooltip={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
        >
          ⏹️
        </Button>
        <Button 
          onClick={leaveCall} 
          $active={true}
          data-tooltip="Leave Meeting"
        >
          📞
        </Button>
      </Controls>
    </Container>
  );
};

export default Room; 