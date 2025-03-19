import React, { useState } from 'react';
import styled from 'styled-components';
import { MoreHorizontal, Calendar, FileText, List, Paperclip, Plus, ChevronUp, Users } from 'react-feather';
import { Meeting } from '../data/mockMeetings';

const CardContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.5rem;
  width: 100%;
  margin: 0 auto;
`;

const DateCard = styled.div<{ $isExpanded: boolean }>`
  min-width: 120px;
  padding: 0.75rem;
  background: ${props => props.$isExpanded ? '#33333380' : '#0000004D'};
  border: 1px solid #33333380;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: all 0.2s ease;
  height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
  }
`;

const Month = styled.div`
  color: #808080;
  font-size: 12px;
  margin-bottom: 0.25rem;
`;

const Day = styled.div`
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const WeekDay = styled.div`
  color: #808080;
  font-size: 12px;
`;

const MeetingDetails = styled.div<{ $isExpanded: boolean }>`
  flex: 1;
  background: ${props => props.$isExpanded ? '#33333380' : '#0000004D'};
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #33333380;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: all 0.2s ease;
  min-height: 60px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
  }
`;

const Title = styled.h3`
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  margin-bottom: 0.25rem;
`;

const Time = styled.div`
  color: #808080;
  font-size: 12px;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  color: #808080;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    color: #FFFFFF;
  }
`;

const DropdownContent = styled.div<{ $isExpanded: boolean }>`
  max-height: ${props => props.$isExpanded ? '1000px' : '0'};
  opacity: ${props => props.$isExpanded ? '1' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: ${props => props.$isExpanded ? '1rem' : '0'};
  position: relative;
  z-index: 1;
`;

const DropdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  color: #FFFFFF;
  font-size: 14px;
`;

const HostInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Avatar = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

const Divider = styled.div`
  height: 1px;
  background: #33333340;
  margin: 0.5rem 0;
`;

const ContentSection = styled.div`
  color: #D1D5DB;
  font-size: 14px;
  padding: 0.5rem 0;

  ul {
    list-style: none;
    margin: 0.5rem 0;
    padding: 0;

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
  }
`;

const AttachmentPlaceholder = styled.div`
  color: #808080;
  font-size: 14px;
  padding: 0.5rem;
  border: 1px dashed #33333340;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    border-color: #4A9163;
    color: #4A9163;
  }
`;

interface Props {
  meeting: Meeting;
}

const MeetingDetailsCard: React.FC<Props> = ({ meeting }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const date = new Date(meeting.date);
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  const weekDay = date.toLocaleString('default', { weekday: 'short' });

  return (
    <CardContainer>
      <DateCard $isExpanded={isExpanded}>
        <Month>{month}</Month>
        <Day>{day}</Day>
        <WeekDay>{weekDay}</WeekDay>
      </DateCard>
      <MeetingDetails $isExpanded={isExpanded}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title>{meeting.title}</Title>
            <Time>{meeting.startTime} - {meeting.endTime}</Time>
          </div>
          <ActionButtons>
            <IconButton onClick={() => setIsExpanded(!isExpanded)}>
              <MoreHorizontal size={20} />
            </IconButton>
          </ActionButtons>
        </div>

        <DropdownContent $isExpanded={isExpanded}>
          <DropdownItem>
            <span>Duration</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} />
              <span>{meeting.startTime} - {meeting.endTime}</span>
            </div>
          </DropdownItem>
          <DropdownItem>
            <span>Host</span>
            <HostInfo>
              <Users size={16} />
              <Avatar src={meeting.host.avatar} alt={meeting.host.name} />
              <span>{meeting.host.name}</span>
            </HostInfo>
          </DropdownItem>
          <DropdownItem>
            <span>Reminder</span>
            <IconButton>
              <Plus size={16} />
            </IconButton>
          </DropdownItem>

          <Divider />

          <ContentSection>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FileText size={16} />
              <span>Description</span>
            </div>
            <p>{meeting.description}</p>
          </ContentSection>

          <Divider />

          <ContentSection>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <List size={16} />
              <span>Agenda</span>
            </div>
            <ul>
              {meeting.agenda.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </ContentSection>

          <Divider />

          <ContentSection>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Paperclip size={16} />
              <span>Attached</span>
            </div>
            <AttachmentPlaceholder>
              <Paperclip size={16} />
              <span>Click to attach files</span>
            </AttachmentPlaceholder>
          </ContentSection>
        </DropdownContent>
      </MeetingDetails>
    </CardContainer>
  );
};

export default MeetingDetailsCard; 