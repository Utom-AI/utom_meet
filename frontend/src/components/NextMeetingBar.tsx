import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const BarContainer = styled.div`
  background: #242424;
  border-radius: 8px;
  padding: 1.5rem 2rem;
  margin-top: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 2rem;
`;

const TimerSection = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const Timer = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  background: #1a1a1a;
  padding: 1rem 1.5rem;
  border-radius: 6px;
`;

const MeetingDetails = styled.div`
  text-align: center;
  
  h3 {
    margin: 0;
    color: #27ae60;
    font-size: 1.25rem;
  }

  p {
    margin: 0.5rem 0 0;
    color: #ffffff;
  }
`;

const ButtonSection = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const JoinButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #1a472a;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #27ae60;
  }
`;

interface NextMeetingBarProps {
  meetingTitle: string;
  meetingTime: Date;
}

const NextMeetingBar: React.FC<NextMeetingBarProps> = ({ meetingTitle, meetingTime }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = meetingTime.getTime() - Date.now();
      
      if (difference <= 0) {
        return 'Meeting started';
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [meetingTime]);

  return (
    <BarContainer>
      <TimerSection>
        <Timer>{timeLeft}</Timer>
      </TimerSection>
      <MeetingDetails>
        <h3>{meetingTitle}</h3>
        <p>{meetingTime.toLocaleString()}</p>
      </MeetingDetails>
      <ButtonSection>
        <JoinButton>Join Now</JoinButton>
      </ButtonSection>
    </BarContainer>
  );
};

export default NextMeetingBar; 