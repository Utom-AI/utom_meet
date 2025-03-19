import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--navbar-active-bg);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--navbar-active-text);
`;

const NavButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const NavButton = styled.button<{ isActive?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: ${props => props.isActive ? 'var(--navbar-active-bg)' : 'var(--navbar-inactive-bg)'};
  color: ${props => props.isActive ? 'var(--navbar-active-text)' : 'var(--navbar-inactive-text)'};
  font-weight: 500;
  transition: all 0.2s ease;
`;

const HostButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: var(--host-meeting-btn);
  color: white;
  font-weight: 500;
  transition: all 0.2s ease;
`;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('upcoming');

  return (
    <NavContainer>
      <Logo>Meetings</Logo>
      <NavButtons>
        <NavButton 
          isActive={activeTab === 'upcoming'} 
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Meetings
        </NavButton>
        <NavButton 
          isActive={activeTab === 'previous'} 
          onClick={() => setActiveTab('previous')}
        >
          Previous Meetings
        </NavButton>
        <HostButton onClick={() => navigate('/setup')}>
          Host Meeting
        </HostButton>
      </NavButtons>
    </NavContainer>
  );
};

export default Navbar; 