import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DailyProvider, DailyVideo } from '@daily-co/daily-react';
import styled from 'styled-components';

const MeetingContainer = styled.div`
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
  padding: 20px;
`;

const VideoContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  aspect-ratio: 16/9;
  background-color: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
`;

const MeetingRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  if (error) {
    return (
      <MeetingContainer>
        <div>Error: {error}</div>
        <button onClick={() => navigate('/')}>Return to Home</button>
      </MeetingContainer>
    );
  }

  if (!id) {
    return <MeetingContainer>Loading...</MeetingContainer>;
  }

  return (
    <MeetingContainer>
      <VideoContainer>
        <DailyProvider
          url={`https://utom-meet.daily.co/${id}`}
          token={process.env.REACT_APP_DAILY_TOKEN}
        >
          <DailyVideo
            sessionId={id}
            type="video"
          />
        </DailyProvider>
      </VideoContainer>
    </MeetingContainer>
  );
};

export default MeetingRoom; 