import React from 'react';
import styled from 'styled-components';
import { MoreVertical } from 'lucide-react';

const Container = styled.div`
  width: 75%;
  margin: 2rem auto;
  padding: 1.5rem;
  background-color: var(--meetings-container-bg);
  border-radius: 8px;
`;

const MeetingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: var(--meeting-card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  box-shadow: 0 4px 6px var(--card-shadow);
`;

const DateCard = styled.div`
  padding: 0.75rem 1.5rem;
  background-color: var(--meeting-card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  color: white;
  font-weight: 500;
`;

const MeetingInfoCard = styled.div`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background-color: var(--meeting-card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  color: white;
`;

const MeetingTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const MeetingTime = styled.p`
  color: #808080;
  font-size: 0.9rem;
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

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
}

interface MeetingsListProps {
  meetings: Meeting[];
}

const MeetingsList: React.FC<MeetingsListProps> = ({ meetings }) => {
  return (
    <Container>
      {meetings.map((meeting) => (
        <MeetingRow key={meeting.id}>
          <DateCard>{meeting.date}</DateCard>
          <MeetingInfoCard>
            <MeetingTitle>{meeting.title}</MeetingTitle>
            <MeetingTime>{meeting.time}</MeetingTime>
          </MeetingInfoCard>
          <MoreButton>
            <MoreVertical size={20} />
          </MoreButton>
        </MeetingRow>
      ))}
    </Container>
  );
};

export default MeetingsList; 