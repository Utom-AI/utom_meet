import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Video, MoreHorizontal } from 'react-feather';
import MeetingPrompt from '../components/MeetingPrompt';
import PreviousMeetingsList from '../components/PreviousMeetingsList';
import { upcomingMeetings, previousMeetings } from '../data/mockMeetings';
import MeetingDetailsCard from '../components/MeetingDetailsCard';

const Container = styled.div`
  min-height: 100vh;
  background: #161515;
  font-family: 'Archivo', sans-serif;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Logo = styled.div`
  color: #FFFFFF;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #367C4F;
  }
`;

const Navbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  border-bottom: 1px solid #80808040;
`;

const NavCenter = styled.div`
  display: flex;
  background: #0D0D0D;
  border-radius: 8px;
  padding: 2px;
`;

const NavButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? '#1A1A1A' : '#0D0D0D'};
  color: ${props => props.active ? '#FFFFFF' : '#808080'};
  border: 1px solid ${props => props.active ? '#000000' : 'transparent'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-family: 'Archivo', sans-serif;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const HostButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: #367C4F;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const NextMeetingCard = styled.div`
  width: 50%;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #242424;
  border: 1px solid #33333380;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
  }
`;

const NextMeetingContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const TimeSection = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .label {
    color: white;
    margin-bottom: 0.45rem;
    font-size: 0.875rem;
  }
  .time {
    color: #808080;
    font-size: 0.875rem;
  }
`;

const MeetingTitleSection = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;

  .title {
    color: #06DE3C;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }
  .schedule {
    color: #808080;
    font-size: 0.875rem;
  }
`;

const ActionSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const JoinButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #367C4F;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const MoreButton = styled.button`
  background: transparent;
  border: none;
  color: #808080;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const MeetingsContainer = styled.div`
  width: 85%;
  margin: 2rem auto;
  padding: 1.5rem 1rem;
  background: #1A1A1A80;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MeetingPromptOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Home: React.FC = () => {
  const [showPreviousMeetings, setShowPreviousMeetings] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const navigate = useNavigate();

  const displayedMeetings = showPreviousMeetings ? previousMeetings : upcomingMeetings;

  const handleHostClick = () => {
    setShowPrompt(true);
  };

  const handlePromptClose = () => {
    setShowPrompt(false);
  };

  const handleMeetingSubmit = (description: string) => {
    localStorage.setItem('initialMeetingDescription', description);
    setShowPrompt(false);
    navigate('/setup');
  };

  return (
    <Container>
      <Navbar>
        <LogoContainer>
          <Logo>
          <Video size={20} color="#367C4F" />
            Meetings
          </Logo>
        </LogoContainer>
        <NavCenter>
          <NavButton
            active={!showPreviousMeetings}
            onClick={() => setShowPreviousMeetings(false)}
          >
            Upcoming meetings
          </NavButton>
          <NavButton
            active={showPreviousMeetings}
            onClick={() => setShowPreviousMeetings(true)}
          >
            Previous meetings
          </NavButton>
        </NavCenter>
        <HostButton onClick={handleHostClick}>
          <Video size={20} />
          Host Meeting
        </HostButton>
      </Navbar>

      {!showPreviousMeetings && upcomingMeetings.length > 0 && (
        <NextMeetingCard>
          <NextMeetingContent>
            <TimeSection>
              <div className="label">Next Meeting in</div>
              <div className="time">{upcomingMeetings[0].startTime}</div>
            </TimeSection>
            <MeetingTitleSection>
              <div className="title">{upcomingMeetings[0].title}</div>
              <div className="schedule">{new Date(upcomingMeetings[0].date).toLocaleDateString()}</div>
            </MeetingTitleSection>
            <ActionSection>
              <JoinButton>
                <Video size={16} />
                Join Now
              </JoinButton>
              <MoreButton>
                <MoreHorizontal size={20} />
              </MoreButton>
            </ActionSection>
          </NextMeetingContent>
        </NextMeetingCard>
      )}

      <MeetingsContainer>
        {displayedMeetings.map((meeting) => (
          <MeetingDetailsCard key={meeting.id} meeting={meeting} />
        ))}
      </MeetingsContainer>

      {showPrompt && (
        <MeetingPromptOverlay>
          <MeetingPrompt
            isOpen={showPrompt}
            onClose={handlePromptClose}
            onSubmit={handleMeetingSubmit}
          />
        </MeetingPromptOverlay>
      )}
    </Container>
  );
};

export default Home; 