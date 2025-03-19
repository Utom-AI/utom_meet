import React from 'react';
import styled from 'styled-components';

export {};

export interface MeetingDetails {
    name?: string;
    url?: string;
    meeting_name: string;
    start_time?: string;
    end_time?: string;
    duration?: number;
    host_token?: string;
    expires_at?: number;
}

export interface MeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    meetingDetails: MeetingDetails;
    onJoinNow: () => void;
}

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    position: relative;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    &:hover {
        color: #666;
    }
`;

const Button = styled.button`
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin: 0.5rem;
    &:hover {
        background-color: #0056b3;
    }
`;

const CopyButton = styled(Button)`
    background-color: #28a745;
    &:hover {
        background-color: #218838;
    }
`;

export const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose, meetingDetails, onJoinNow }) => {
    if (!isOpen) return null;

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const formatDateTime = (timestamp?: number) => {
        if (!timestamp) return 'Not specified';
        return new Date(timestamp * 1000).toLocaleString();
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <h2>Meeting Created Successfully!</h2>
                <CloseButton onClick={onClose}>&times;</CloseButton>

                <div>
                    <h3>Meeting Details</h3>
                    <p><strong>Meeting Name:</strong> {meetingDetails.meeting_name}</p>
                    {meetingDetails.url && (
                        <p>
                            <strong>Meeting URL:</strong> {meetingDetails.url}
                            <CopyButton onClick={() => copyToClipboard(meetingDetails.url || '')}>
                                Copy URL
                            </CopyButton>
                        </p>
                    )}
                    {meetingDetails.host_token && (
                        <p>
                            <strong>Host Token:</strong> {meetingDetails.host_token}
                            <CopyButton onClick={() => copyToClipboard(meetingDetails.host_token || '')}>
                                Copy Token
                            </CopyButton>
                        </p>
                    )}
                    <p><strong>Start Time:</strong> {formatDateTime(meetingDetails.expires_at)}</p>
                    <p><strong>End Time:</strong> {formatDateTime(meetingDetails.expires_at)}</p>
                </div>

                <Button onClick={onJoinNow}>Join Meeting Now</Button>
            </ModalContent>
        </ModalOverlay>
    );
};

export default MeetingModal; 