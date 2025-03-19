import React, { useState } from 'react';
import styled from 'styled-components';
import { X, ArrowUp } from 'react-feather';

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(22, 21, 21, 0.8);
  backdrop-filter: blur(8px);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PromptContainer = styled.div`
  width: 66.67vw;
  padding: 2rem;
  position: relative;
  margin-top: 2rem;
`;

const CloseButton = styled.button`
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  background: none;
  border: 1px solid #80808040;
  color: #808080;
  cursor: pointer;
  padding: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  z-index: 1001;

  &:hover {
    transform: translateY(-1px);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Title = styled.h2`
  color: #ffffff;
  margin: 0 0 2rem;
  font-size: 40px;
  font-weight: 500;
  text-align: center;
  font-family: 'Archivo', sans-serif;
`;

const Subtitle = styled.p`
  color: #808080;
  margin: 0 0 2rem;
  font-size: 18px;
  text-align: center;
  font-family: 'Archivo', sans-serif;
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.textarea`
  width: 100%;
  padding: 1.5rem;
  padding-right: 3rem;
  background: #1A1A1A;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  min-height: 200px;
  resize: none;
  transition: all 0.2s ease;
  background-image: linear-gradient(#1A1A1A, #1A1A1A), 
                    linear-gradient(to right, #4F1E4C67, #24ADD880, #61025480, #15D7F980);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  border: 1px solid transparent;
  font-family: 'Archivo', sans-serif;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #808080;
    font-family: 'Archivo', sans-serif;
    font-size: 18px;
  }
`;

const SendButton = styled.button`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: #367C4F;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-1px);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

interface MeetingPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string) => void;
}

const MeetingPrompt: React.FC<MeetingPromptProps> = ({ isOpen, onClose, onSubmit }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (description.trim()) {
      onSubmit(description);
      setDescription('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Overlay isOpen={isOpen} onClick={onClose}>
      <PromptContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <X />
        </CloseButton>
        <Title>Describe your meeting</Title>
        <InputContainer>
          <Input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell Retina more about your meeting"
            onKeyPress={handleKeyPress}
            autoFocus
          />
          <SendButton onClick={handleSubmit} title="Send">
            <ArrowUp />
          </SendButton>
        </InputContainer>
      </PromptContainer>
    </Overlay>
  );
};

export default MeetingPrompt; 