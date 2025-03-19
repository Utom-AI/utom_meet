import React, { useState } from 'react';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import NextMeetingCard from '../components/NextMeetingCard';
import MeetingsList from '../components/MeetingsList';

const Container = styled.div`
  min-height: 100vh;
  background-color: var(--background-color);
`;

const Content = styled.div`
  padding: 2rem 0;
`;

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'previous'>('upcoming');

  // Mock data for demonstration
  const nextMeeting = {
    title: 'Team Standup',
    time: '10:00 AM',
    meetingId: '123'
  };

  const meetings = [
    {
      id: '1',
      title: 'Project Review',
      date: 'Mar 15',
      time: '2:00 PM'
    },
    {
      id: '2',
      title: 'Client Meeting',
      date: 'Mar 16',
      time: '11:00 AM'
    }
  ];

  return (
    <Container>
      <Navbar />
      <Content>
        {activeTab === 'upcoming' ? (
          <>
            <NextMeetingCard {...nextMeeting} />
            <MeetingsList meetings={meetings} />
          </>
        ) : (
          <MeetingsList meetings={meetings} />
        )}
      </Content>
    </Container>
  );
};

export default HomePage; 