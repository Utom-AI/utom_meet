import React, { useState, useEffect, useCallback } from 'react';
import { processWithAI, createMeeting } from '../services/api';
import VideoRoom from '../components/VideoRoom';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, FileText, List, Users, Clock, Layout, ArrowUp, Loader } from 'react-feather';
import MeetingConfirmation from '../components/MeetingConfirmation';
import MeetingLinkDialog from '../components/MeetingLinkDialog';

const Container = styled.div`
  height: 100vh;
  background: #161515;
  font-family: 'Archivo', sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ChatSection = styled.div<{ isVisible: boolean }>`
  width: ${props => props.isVisible ? '33.33%' : '0'};
  background: #161515;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;
  height: calc(100vh - 64px);
  position: relative;
  opacity: ${props => props.isVisible ? '1' : '0'};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
`;

const InfoSection = styled.div<{ isChatVisible: boolean }>`
  width: ${props => props.isChatVisible ? '66.67%' : '100%'};
  background: #161515;
  transition: width 0.3s ease;
  height: calc(100vh - 64px);
  overflow-y: auto;
  padding: 1.5rem;
  scrollbar-width: thin;
  scrollbar-color: #333333 #161515;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #161515;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #333333;
    border-radius: 4px;
  }
`;

const MeetingDetails = styled.div<{ $isChatVisible?: boolean }>`
  padding: 2rem;
  border: 1px solid #2D2D2D;
  border-radius: 8px;
  background: #262626;
  margin: 0 auto;
  max-width: ${props => props.$isChatVisible ? '100%' : '900px'};
`;

const NavbarContainer = styled.div`
  display: flex;
  width: 100%;
  position: relative;
  height: 64px;
`;

const ChatNavbar = styled.div<{ isVisible: boolean }>`
  width: ${props => props.isVisible ? '33.33%' : '64px'};
  padding: 1rem;
  display: flex;
  justify-content: ${props => props.isVisible ? 'space-between' : 'center'};
  align-items: center;
  background: #161515;
  border-bottom: 1px solid #33333340;
  transition: all 0.3s ease;
  overflow: hidden;
`;

const InfoNavbar = styled.div<{ isChatVisible: boolean }>`
  width: ${props => props.isChatVisible ? '66.67%' : 'calc(100% - 64px)'};
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1A1A1A;
  border-bottom: 1px solid #33333340;
  transition: all 0.3s ease;
  margin-left: ${props => props.isChatVisible ? '0' : '64px'};
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: #808080;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translate(0, -1px);
  }
`;

const Title = styled.h1`
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  font-family: 'Archivo', sans-serif;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const DiscardButton = styled.button`
  background: #3333333D;
  color: #F2F2F2;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  font-family: 'Archivo', sans-serif;
  transition: all 0.2s ease;

  &:hover {
    transform: translate(0, -1px);
  }
`;

const StartButton = styled.button`
  background: #4A9163;
  color: #F2F2F2;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  font-family: 'Archivo', sans-serif;
  transition: all 0.2s ease;

  &:hover {
    transform: translate(0, -1px);
  }
`;

const ChatContent = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
  gap: 1rem;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 120px;
  scrollbar-width: thin;
  scrollbar-color: #333333 #161515;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #161515;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #333333;
    border-radius: 4px;
  }
`;

const InputContainer = styled.div`
  padding: 1rem;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #161515;
  height: 120px;
`;

const ChatInput = styled.textarea`
  width: 100%;
  padding: 1rem;
  padding-right: 3.5rem;
  background: #1A1A1A;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 14px;
  min-height: 80px;
  resize: none;
  font-family: 'Archivo', sans-serif;
  transition: all 0.2s ease;
  background-image: linear-gradient(#1A1A1A, #1A1A1A), 
                    linear-gradient(to right, #4F1E4C67, #24ADD880, #61025480, #15D7F980);
  background-origin: border-box;
  background-clip: padding-box, border-box;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #808080;
    font-family: 'Archivo', sans-serif;
    font-size: 14px;
  }
`;

const SendButton = styled.button`
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  background: #367C4F;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;

  &:hover {
    transform: translate(0, -1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const MeetingTitle = styled.h1`
  color: #10B981;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const DurationBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #374151;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: #E5E7EB;
  margin-bottom: 1.5rem;
  
  svg {
    width: 16px;
    height: 16px;
    color: #6B7280;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #E5E7EB;
  font-weight: 600;

  svg {
    width: 18px;
    height: 18px;
    color: #6B7280;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #374151;
  margin-bottom: 1rem;
`;

const SectionContent = styled.div`
  color: #D1D5DB;
  margin-bottom: 2rem;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;

    &:before {
      content: "•";
      position: absolute;
      left: 0;
      color: #6B7280;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 2px solid #ffffff30;
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Message = styled.div<{ $isUser: boolean }>`
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  background: ${props => props.$isUser ? '#3333333D' : '#161515'};
  color: #FFFFFF;
  padding: 1rem;
  border-radius: 8px;
  max-width: 80%;
  font-size: 14px;
  font-family: 'Archivo', sans-serif;
  border: ${props => props.$isUser ? 'none' : '1px solid #33333340'};
  word-break: break-word;
`;

const LoadingIndicator = styled.div`
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #808080;
  padding: 1rem;
  font-family: 'Archivo', sans-serif;
  font-size: 14px;

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

interface MeetingInfo {
  title: string;
  description: string;
  duration: number;
  agenda: string[];
  attendees: string[];
}

const MeetingSetup: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; isInitial?: boolean }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState<MeetingInfo | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDuration, setMeetingDuration] = useState(30);

  const processInitialPrompt = useCallback(async (prompt: string) => {
    try {
      setIsProcessing(true);
      setMessages([{ text: prompt, isUser: true, isInitial: true }]);
      
      console.log('Sending prompt to API:', prompt);
      const response = await processWithAI(prompt);
      console.log('Received API response:', JSON.stringify(response, null, 2));
      
      if (response && typeof response === 'object') {
        const meetingInfo = {
          title: response.title || 'Untitled Meeting',
          description: response.description || '',
          duration: response.duration || 30,
          agenda: Array.isArray(response.agenda) ? response.agenda : [],
          attendees: Array.isArray(response.attendees) ? response.attendees : []
        };
        
        console.log('Setting meeting details:', meetingInfo);
        setMeetingDetails(meetingInfo);
        
        setMessages(prev => [
          ...prev,
          { 
            text: `The meeting brief has been set up. Would you like to make any changes to the ${meetingInfo.title.toLowerCase()}?`, 
            isUser: false 
          }
        ]);
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error processing initial prompt:', error);
      setMessages([
        { text: prompt, isUser: true, isInitial: true },
        { 
          text: 'I apologize, but I encountered an error while processing your request. Could you please try describing the meeting again?', 
          isUser: false 
        }
      ]);
      setMeetingDetails(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  useEffect(() => {
    const initialPrompt = location.state?.initialPrompt || localStorage.getItem('initialMeetingDescription');
    if (initialPrompt) {
      console.log('Processing initial prompt:', initialPrompt);
      processInitialPrompt(initialPrompt);
      // Clear localStorage to avoid reprocessing
      localStorage.removeItem('initialMeetingDescription');
    }
  }, [location.state, processInitialPrompt]);

  const handleSend = async () => {
    const currentMessage = messages.length > 0 ? messages[messages.length - 1].text.trim() : '';
    if (!currentMessage) return;

    try {
      setIsProcessing(true);
      console.log('Processing additional context:', currentMessage);
      const response = await processWithAI(currentMessage);
      console.log('Received AI response:', response);
      
      setMeetingDetails(response);
      
      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: currentMessage, isUser: true },
        { text: `I've updated the meeting details. Would you like to make any other changes to the ${response.title.toLowerCase()}?`, isUser: false }
      ]);
      
      // Clear the input after sending
      setMessages(prev => [...prev, { text: '', isUser: true }]);
    } catch (error) {
      console.error('Error processing with AI:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: currentMessage, isUser: true },
        { text: 'I apologize, but I encountered an error while processing your request. Could you please try again?', isUser: false },
        { text: '', isUser: true }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartMeeting = async () => {
    if (!meetingDetails) return;

    try {
      setIsCreatingMeeting(true);
      console.log('Creating meeting with details:', meetingDetails);
      
      const response = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: meetingDetails.title.toLowerCase().replace(/\s+/g, '-'),
          meeting_name: meetingDetails.title,
          duration: meetingDetails.duration,
          start_time: Math.floor(Date.now() / 1000),
          end_time: Math.floor(Date.now() / 1000) + (meetingDetails.duration || 30) * 60
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const data = await response.json();
      setMeetingLink(data.url);
      setMeetingTitle(meetingDetails.title || 'Untitled Meeting');
      setMeetingDuration(meetingDetails.duration || 30);
      setIsLinkDialogOpen(true);
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting. Please try again.');
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const handleJoinMeeting = () => {
    window.location.href = meetingLink;
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setRoomUrl(null);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard this meeting setup?')) {
      navigate('/');
    }
  };

  if (showConfirmation && meetingDetails && roomUrl) {
    return (
      <>
        <Container>
          <NavbarContainer>
            <ChatNavbar isVisible={isChatVisible}>
              <NavButton onClick={handleBack}>
                <ArrowLeft size={20} />
              </NavButton>
              <NavButton onClick={() => setIsChatVisible(!isChatVisible)}>
                <Layout size={20} />
              </NavButton>
            </ChatNavbar>
            <InfoNavbar isChatVisible={isChatVisible}>
              <Title>Product Review</Title>
              <ButtonGroup>
                <DiscardButton onClick={handleDiscard}>Discard</DiscardButton>
                <StartButton 
                  onClick={handleStartMeeting}
                  disabled={!meetingDetails || isCreatingMeeting}
                >
                  {isCreatingMeeting && <LoadingSpinner />}
                  Start meeting
                </StartButton>
              </ButtonGroup>
            </InfoNavbar>
          </NavbarContainer>
          <MainContent>
            <ChatSection isVisible={isChatVisible}>
              <ChatContent>
                {messages
                  .filter(message => !message.isInitial || message.isUser)
                  .map((message, index) => (
                    <Message key={index} $isUser={message.isUser}>
                      {message.text}
                    </Message>
                  ))}
                {isProcessing && (
                  <LoadingIndicator>
                    <Loader size={16} />
                    Loading Meta...
                  </LoadingIndicator>
                )}
              </ChatContent>
              <InputContainer>
                <ChatInput
                  value={messages.length > 0 && !messages[messages.length - 1].isUser ? '' : (messages.length > 0 ? messages[messages.length - 1].text : '')}
                  onChange={(e) => {
                    if (messages.length === 0) {
                      setMessages([{ text: e.target.value, isUser: true }]);
                    } else {
                      const lastMessage = messages[messages.length - 1];
                      if (!lastMessage.isUser) {
                        setMessages([...messages, { text: e.target.value, isUser: true }]);
                      } else {
                        setMessages(prev => [...prev.slice(0, -1), { ...prev[prev.length - 1], text: e.target.value }]);
                      }
                    }
                  }}
                  placeholder="Type a message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <SendButton onClick={handleSend}>
                  <ArrowUp />
                </SendButton>
              </InputContainer>
            </ChatSection>
            <InfoSection isChatVisible={isChatVisible}>
              {meetingDetails && (
                <MeetingDetails $isChatVisible={isChatVisible}>
                  <div>
                    <MeetingTitle>{meetingDetails.title}</MeetingTitle>
                    <DurationBadge>
                      <Clock />
                      {meetingDetails.duration} minutes
                    </DurationBadge>

                    <SectionHeader>
                      <FileText />
                      <span>Description</span>
                    </SectionHeader>
                    <Divider />
                    <SectionContent>
                      <p>{meetingDetails.description}</p>
                    </SectionContent>

                    <SectionHeader>
                      <List />
                      <span>Agenda</span>
                    </SectionHeader>
                    <Divider />
                    <SectionContent>
                      <ul>
                        {meetingDetails.agenda.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </SectionContent>

                    <SectionHeader>
                      <Users />
                      <span>Attendees</span>
                    </SectionHeader>
                    <Divider />
                    <SectionContent>
                      <ul>
                        {meetingDetails.attendees.map((attendee, index) => (
                          <li key={index}>{attendee}</li>
                        ))}
                      </ul>
                    </SectionContent>
                  </div>
                </MeetingDetails>
              )}
            </InfoSection>
          </MainContent>
        </Container>
        <MeetingConfirmation
          meetingDetails={meetingDetails}
          meetingUrl={roomUrl}
          onJoinMeeting={handleJoinMeeting}
          onClose={handleCloseConfirmation}
        />
        <MeetingLinkDialog
          isOpen={isLinkDialogOpen}
          onClose={() => setIsLinkDialogOpen(false)}
          title={meetingTitle}
          duration={meetingDuration}
          meetingLink={meetingLink}
          onStartMeeting={handleJoinMeeting}
        />
      </>
    );
  }

  if (!showConfirmation && roomUrl) {
    return <VideoRoom url={roomUrl} />;
  }

  return (
    <Container>
      <NavbarContainer>
        <ChatNavbar isVisible={isChatVisible}>
          <NavButton onClick={handleBack}>
            <ArrowLeft size={20} />
          </NavButton>
          <NavButton onClick={() => setIsChatVisible(!isChatVisible)}>
            <Layout size={20} />
          </NavButton>
        </ChatNavbar>
        <InfoNavbar isChatVisible={isChatVisible}>
          <Title>Product Review</Title>
          <ButtonGroup>
            <DiscardButton onClick={handleDiscard}>Discard</DiscardButton>
            <StartButton 
              onClick={handleStartMeeting}
              disabled={!meetingDetails || isCreatingMeeting}
            >
              {isCreatingMeeting && <LoadingSpinner />}
              Start meeting
            </StartButton>
          </ButtonGroup>
        </InfoNavbar>
      </NavbarContainer>
      <MainContent>
        <ChatSection isVisible={isChatVisible}>
          <ChatContent>
            {messages
              .filter(message => !message.isInitial || message.isUser)
              .map((message, index) => (
                <Message key={index} $isUser={message.isUser}>
                  {message.text}
                </Message>
              ))}
            {isProcessing && (
              <LoadingIndicator>
                <Loader size={16} />
                Loading Meta...
              </LoadingIndicator>
            )}
          </ChatContent>
          <InputContainer>
            <ChatInput
              value={messages.length > 0 && !messages[messages.length - 1].isUser ? '' : (messages.length > 0 ? messages[messages.length - 1].text : '')}
              onChange={(e) => {
                if (messages.length === 0) {
                  setMessages([{ text: e.target.value, isUser: true }]);
                } else {
                  const lastMessage = messages[messages.length - 1];
                  if (!lastMessage.isUser) {
                    setMessages([...messages, { text: e.target.value, isUser: true }]);
                  } else {
                    setMessages(prev => [...prev.slice(0, -1), { ...prev[prev.length - 1], text: e.target.value }]);
                  }
                }
              }}
              placeholder="Say something to Retina..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <SendButton onClick={handleSend}>
              <ArrowUp />
            </SendButton>
          </InputContainer>
        </ChatSection>
        <InfoSection isChatVisible={isChatVisible}>
          {meetingDetails && (
            <MeetingDetails $isChatVisible={isChatVisible}>
              <div>
                <MeetingTitle>{meetingDetails.title}</MeetingTitle>
                <DurationBadge>
                  <Clock />
                  {meetingDetails.duration} minutes
                </DurationBadge>

                <SectionHeader>
                  <FileText />
                  <span>Description</span>
                </SectionHeader>
                <Divider />
                <SectionContent>
                  <p>{meetingDetails.description}</p>
                </SectionContent>

                <SectionHeader>
                  <List />
                  <span>Agenda</span>
                </SectionHeader>
                <Divider />
                <SectionContent>
                  <ul>
                    {meetingDetails.agenda.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </SectionContent>

                <SectionHeader>
                  <Users />
                  <span>Attendees</span>
                </SectionHeader>
                <Divider />
                <SectionContent>
                  <ul>
                    {meetingDetails.attendees.map((attendee, index) => (
                      <li key={index}>{attendee}</li>
                    ))}
                  </ul>
                </SectionContent>
              </div>
            </MeetingDetails>
          )}
        </InfoSection>
      </MainContent>
      <MeetingLinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        title={meetingTitle}
        duration={meetingDuration}
        meetingLink={meetingLink}
        onStartMeeting={handleJoinMeeting}
      />
    </Container>
  );
};

export default MeetingSetup;