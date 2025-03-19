import React from 'react';
import styled from 'styled-components';
import { FileText, List, Users, Link as LinkIcon, Copy, Video, Clock, X } from 'react-feather';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  background: #262626;
  border: 1px solid #2D2D2D;
  border-radius: 12px;
  padding: 2rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: #6B7280;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  &:hover {
    color: #E5E7EB;
  }
`;

const Title = styled.h2`
  color: #E5E7EB;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  padding-right: 2rem;
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

const LinkContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #374151;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 2rem;
`;

const Link = styled.div`
  flex: 1;
  color: #E5E7EB;
  font-family: monospace;
  word-break: break-all;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #E5E7EB;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #10B981;
  }
`;

const JoinButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: #065F46;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 1rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  
  &:hover {
    background: #10B981;
  }
`;

interface MeetingConfirmationProps {
  meetingDetails: {
    title: string;
    description: string;
    duration: number;
    agenda: string[];
    attendees: string[];
  };
  meetingUrl: string;
  onJoinMeeting: () => void;
  onClose: () => void;
}

const MeetingConfirmation: React.FC<MeetingConfirmationProps> = ({
  meetingDetails,
  meetingUrl,
  onJoinMeeting,
  onClose
}) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingUrl);
  };

  return (
    <Overlay>
      <Container>
        <CloseButton onClick={onClose}>
          <X size={24} />
        </CloseButton>

        <Title>{meetingDetails.title}</Title>
        
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

        <SectionHeader>
          <LinkIcon />
          <span>Meeting Link</span>
        </SectionHeader>
        <Divider />
        <LinkContainer>
          <Link>{meetingUrl}</Link>
          <CopyButton onClick={handleCopyLink}>
            <Copy size={20} />
          </CopyButton>
        </LinkContainer>

        <JoinButton onClick={onJoinMeeting}>
          <Video size={20} />
          Join Meeting Now
        </JoinButton>
      </Container>
    </Overlay>
  );
};

export default MeetingConfirmation; 