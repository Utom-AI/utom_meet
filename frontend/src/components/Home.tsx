import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MeetingModal, { MeetingDetails } from './MeetingModal';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
`;

const CardsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Card = styled.div<{ active?: boolean }>`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 300px;
  cursor: pointer;
  transition: transform 0.2s;
  border: 2px solid ${props => props.active ? '#0066ff' : 'transparent'};

  &:hover {
    transform: translateY(-5px);
  }
`;

const FormCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
`;

const CardTitle = styled.h2`
  color: #333;
  margin-bottom: 1rem;
`;

const CardDescription = styled.p`
  color: #666;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background-color: #0066ff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:hover {
    background-color: #0052cc;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #0066ff;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
`;

interface CreateRoomPayload {
  name?: string;
  meeting_name: string;
  duration?: number;
}

const Home: React.FC = () => {
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [meetingDetails, setMeetingDetails] = useState<MeetingDetails>({
    meeting_name: '',
    duration: 1
  });
  const [joinRoomName, setJoinRoomName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<MeetingDetails | null>(null);
  const navigate = useNavigate();

  const createRoom = async (startNow: boolean = false) => {
    try {
      const payload: CreateRoomPayload = {
        name: meetingDetails.name,
        meeting_name: meetingDetails.meeting_name,
        duration: meetingDetails.duration
      };

      const response = await axios.post('http://localhost:8000/api/rooms', payload);
      
      // Store meeting details and host token in localStorage
      localStorage.setItem('meetingDetails', JSON.stringify(response.data));
      setCreatedMeeting(response.data);

      if (startNow) {
        navigate(`/room/${response.data.name}`);
      } else {
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create meeting room. Please try again.');
    }
  };

  const joinRoom = () => {
    if (joinRoomName.trim()) {
      navigate(`/room/${joinRoomName}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMeetingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJoinCreatedMeeting = () => {
    if (createdMeeting) {
      navigate(`/room/${createdMeeting.name}`);
    }
  };

  return (
    <Container>
      <Title>Utom Meet</Title>
      
      <CardsContainer>
        <Card active={mode === 'create'} onClick={() => setMode('create')}>
          <CardTitle>Create Meeting</CardTitle>
          <CardDescription>
            Schedule a new meeting and invite participants
          </CardDescription>
        </Card>
        
        <Card active={mode === 'join'} onClick={() => setMode('join')}>
          <CardTitle>Join Meeting</CardTitle>
          <CardDescription>
            Join an existing meeting with a room name
          </CardDescription>
        </Card>
      </CardsContainer>

      {mode === 'create' && (
        <FormCard>
          <CardTitle>Create New Meeting</CardTitle>
          
          <FormGroup>
            <Label>Meeting Name</Label>
            <Input
              type="text"
              name="meeting_name"
              placeholder="Enter meeting name"
              value={meetingDetails.meeting_name}
              onChange={handleInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Room Name (optional)</Label>
            <Input
              type="text"
              name="name"
              placeholder="Custom room name (optional)"
              value={meetingDetails.name}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Duration (hours)</Label>
            <Input
              type="number"
              name="duration"
              placeholder="Meeting duration in hours"
              value={meetingDetails.duration}
              onChange={handleInputChange}
              min="1"
              max="24"
            />
          </FormGroup>

          <Button onClick={() => createRoom(false)}>Create Meeting</Button>
          <Button onClick={() => createRoom(true)} style={{ backgroundColor: '#28a745' }}>
            Start Meeting Now
          </Button>
        </FormCard>
      )}

      {mode === 'join' && (
        <FormCard>
          <CardTitle>Join Meeting</CardTitle>
          <FormGroup>
            <Label>Room Name</Label>
            <Input
              type="text"
              placeholder="Enter room name"
              value={joinRoomName}
              onChange={(e) => setJoinRoomName(e.target.value)}
            />
          </FormGroup>
          <Button onClick={joinRoom}>Join Meeting</Button>
        </FormCard>
      )}

      {createdMeeting && (
        <MeetingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          meetingDetails={createdMeeting}
          onJoinNow={handleJoinCreatedMeeting}
        />
      )}
    </Container>
  );
};

export default Home; 