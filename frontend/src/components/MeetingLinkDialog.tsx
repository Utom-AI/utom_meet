import React from 'react';
import styled from 'styled-components';
import { X, Copy, Clock, Users } from 'react-feather';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(22, 21, 21, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContainer = styled.div`
  background: #3333333D;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  position: relative;
  border: 1px solid #33333380;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #808080;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    transform: translate(0, -1px);
    color: #FFFFFF;
  }
`;

const Title = styled.h2`
  color: #FFFFFF;
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 1rem;
  font-family: 'Archivo', sans-serif;
`;

const Duration = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #808080;
  font-size: 14px;
  margin-bottom: 2rem;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LinkContainer = styled.div`
  background: #1A1A1A;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Link = styled.div`
  color: #FFFFFF;
  font-family: 'Archivo', sans-serif;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 1rem;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #808080;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-family: 'Archivo', sans-serif;
  font-size: 14px;

  &:hover {
    color: #FFFFFF;
    transform: translate(0, -1px);
  }
`;

const InviteSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #33333340;
`;

const InviteButton = styled.button`
  background: none;
  border: none;
  color: #808080;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-family: 'Archivo', sans-serif;
  font-size: 14px;
  width: 100%;
  justify-content: center;

  &:hover {
    color: #FFFFFF;
    transform: translate(0, -1px);
  }
`;

const StartButton = styled.button`
  background: #4A9163;
  color: #F2F2F2;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  width: 100%;
  font-size: 16px;
  cursor: pointer;
  font-family: 'Archivo', sans-serif;
  margin-top: 2rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translate(0, -1px);
  }
`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  duration: number;
  meetingLink: string;
  onStartMeeting: () => void;
}

const MeetingLinkDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  duration,
  meetingLink,
  onStartMeeting,
}) => {
  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Overlay>
      <DialogContainer>
        <CloseButton onClick={onClose}>
          <X size={20} />
        </CloseButton>
        <Title>{title}</Title>
        <Duration>
          <Clock />
          {duration} minutes
        </Duration>
        <LinkContainer>
          <Link>{meetingLink}</Link>
          <CopyButton onClick={handleCopy}>
            <Copy size={16} />
            Copy
          </CopyButton>
        </LinkContainer>
        <InviteSection>
          <InviteButton>
            <Users size={16} />
            Invite Participants
          </InviteButton>
        </InviteSection>
        <StartButton onClick={onStartMeeting}>
          Start Meeting
        </StartButton>
      </DialogContainer>
    </Overlay>
  );
};

export default MeetingLinkDialog; 