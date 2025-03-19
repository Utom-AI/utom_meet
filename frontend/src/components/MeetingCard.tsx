import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: #242424;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  gap: 2rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    background: #2a2a2a;
  }
`;

const Calendar = styled.div`
  background: #1a1a1a;
  border-radius: 6px;
  padding: 1rem 1.5rem;
  text-align: center;
  min-width: 100px;

  .month {
    font-size: 0.875rem;
    color: #27ae60;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }

  .date {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ffffff;
  }
`;

const MeetingInfo = styled.div`
  flex: 1;

  h3 {
    margin: 0 0 0.5rem;
    color: #ffffff;
    font-size: 1.125rem;
  }

  p {
    margin: 0;
    color: #a0a0a0;
    font-size: 0.875rem;
  }
`;

interface MeetingCardProps {
  title: string;
  datetime: Date;
  onClick?: () => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ title, datetime, onClick }) => {
  return (
    <Card onClick={onClick}>
      <Calendar>
        <div className="month">
          {datetime.toLocaleString('default', { month: 'short' })}
        </div>
        <div className="date">
          {datetime.getDate()}
        </div>
      </Calendar>
      <MeetingInfo>
        <h3>{title}</h3>
        <p>
          {datetime.toLocaleTimeString('default', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </MeetingInfo>
    </Card>
  );
};

export default MeetingCard; 