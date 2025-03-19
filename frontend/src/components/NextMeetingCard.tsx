import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';

const CardContainer = styled.div`
  width: 50%;
  margin: 2rem auto;
  padding: 1.5rem;
  background-color: var(--background-color);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  box-shadow: 0 4px 6px var(--card-shadow);
  position: relative;
`;

const MeetingInfo = styled.div`
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white;
`;

const Time = styled.p`
  color: #808080;
  font-size: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const JoinButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--host-meeting-btn);
  color: white;
  border-radius: 4px;
  font-weight: 500;
`;

const MoreButton = styled.button`
  padding: 0.5rem;
  color: #808080;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface NextMeetingCardProps {
  title: string;
  time: string;
  meetingId: string;
}

const NextMeetingCard: React.FC<NextMeetingCardProps> = ({ title, time, meetingId }) => {
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate(`/meeting/${meetingId}`);
  };

  return (
    <CardContainer>
      <MeetingInfo>
        <Title>{title}</Title>
        <Time>{time}</Time>
      </MeetingInfo>
      <ButtonContainer>
        <JoinButton onClick={handleJoin}>
          Join now
          <span>→</span>
        </JoinButton>
        <MoreButton>
          <MoreVertical size={20} />
        </MoreButton>
      </ButtonContainer>
    </CardContainer>
  );
};

export default NextMeetingCard; 