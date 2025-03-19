import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronDown, ChevronUp } from 'react-feather';
import { format, parseISO } from 'date-fns';

interface Meeting {
  id: number;
  meeting_id: string;
  recording_url: string;
  recording_file_path: string;
  participants: string[];
  transcript: string;
  chat_messages: string[];
  end_time: string;
  created_at: string;
  transcription_status: 'pending' | 'completed' | 'error';
  transcription_text?: string;
  transcription_error?: string;
  agenda?: string[];
  title?: string;
  description?: string;
}

interface PreviousMeetingsListProps {
  meetings: Meeting[];
}

const Container = styled.div`
  padding: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const Card = styled.div<{ isExpanded: boolean }>`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.isExpanded ? '#007bff' : '#dee2e6'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const MeetingTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.2rem;
`;

const MeetingDate = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const MetadataSection = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
`;

const SectionTitle = styled.h4`
  color: #444;
  margin: 0 0 10px 0;
  font-size: 1rem;
`;

const Description = styled.p`
  color: #666;
  margin: 0 0 15px 0;
  line-height: 1.5;
`;

const AgendaList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 15px 0;
`;

const AgendaItem = styled.li`
  color: #666;
  margin-bottom: 5px;
  padding-left: 20px;
  position: relative;

  &:before {
    content: "•";
    position: absolute;
    left: 0;
    color: #007bff;
  }
`;

const AttendeesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
`;

const AttendeeTag = styled.span`
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #495057;
`;

const TranscriptContainer = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  max-height: 200px;
  overflow-y: auto;
`;

const TranscriptEntry = styled.div`
  margin-bottom: 10px;
  font-size: 0.9rem;
`;

const Timestamp = styled.span`
  color: #007bff;
  font-weight: 500;
  margin-right: 8px;
`;

const Speaker = styled.span`
  color: #28a745;
  font-weight: 500;
  margin-right: 8px;
`;

const Message = styled.span`
  color: #495057;
`;

const VideoContainer = styled.div`
  margin-top: 15px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const VideoPlayer = styled.video`
  width: 100%;
  height: auto;
  display: block;
`;

const PreviousMeetingsList: React.FC<PreviousMeetingsListProps> = ({ meetings }) => {
  const [expandedMeetingId, setExpandedMeetingId] = useState<number | null>(null);

  const toggleExpand = (meetingId: number) => {
    setExpandedMeetingId(expandedMeetingId === meetingId ? null : meetingId);
  };

  const formatTranscript = (transcript: string) => {
    // Assuming transcript is in format: "timestamp - speaker: message"
    return transcript.split('\n').map((line, index) => {
      const [timestamp, ...rest] = line.split(' - ');
      const [speaker, ...messageParts] = rest.join(' - ').split(': ');
      const message = messageParts.join(': ');

      return (
        <TranscriptEntry key={index}>
          <Timestamp>{timestamp}</Timestamp>
          <Speaker>{speaker}:</Speaker>
          <Message>{message}</Message>
        </TranscriptEntry>
      );
    });
  };

  return (
    <Container>
      <h2>Previous Meetings</h2>
      <Grid>
        {meetings.map((meeting) => {
          const isExpanded = expandedMeetingId === meeting.id;
          const meetingDate = meeting.end_time ? new Date(meeting.end_time).toLocaleDateString() : '';

          return (
            <Card 
              key={meeting.id} 
              isExpanded={isExpanded}
              onClick={() => toggleExpand(meeting.id)}
            >
              <CardHeader>
                <MeetingTitle>{meeting.title || meeting.meeting_id}</MeetingTitle>
                <MeetingDate>{meetingDate}</MeetingDate>
              </CardHeader>

              {isExpanded && (
                <>
                  <MetadataSection>
                    <SectionTitle>Description</SectionTitle>
                    <Description>{meeting.description}</Description>
                  </MetadataSection>

                  <MetadataSection>
                    <SectionTitle>Agenda</SectionTitle>
                    <AgendaList>
                      {meeting.agenda?.map((item, index) => (
                        <AgendaItem key={index}>{item}</AgendaItem>
                      ))}
                    </AgendaList>
                  </MetadataSection>

                  <MetadataSection>
                    <SectionTitle>Attendees</SectionTitle>
                    <AttendeesList>
                      {meeting.participants.map((participant, index) => (
                        <AttendeeTag key={index}>{participant}</AttendeeTag>
                      ))}
                    </AttendeesList>
                  </MetadataSection>

                  <MetadataSection>
                    <SectionTitle>Transcript</SectionTitle>
                    <TranscriptContainer>
                      {formatTranscript(meeting.transcript)}
                    </TranscriptContainer>
                  </MetadataSection>

                  {meeting.recording_file_path && (
                    <MetadataSection>
                      <SectionTitle>Recording</SectionTitle>
                      <VideoContainer>
                        <VideoPlayer controls>
                          <source 
                            src={`http://localhost:5000/api/recordings/${meeting.recording_file_path.split('/').pop()}`} 
                            type="video/webm" 
                          />
                          Your browser does not support the video tag.
                        </VideoPlayer>
                      </VideoContainer>
                    </MetadataSection>
                  )}
                </>
              )}
            </Card>
          );
        })}
      </Grid>
    </Container>
  );
};

export default PreviousMeetingsList; 