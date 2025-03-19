import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import Room from './components/Room';
import MeetingSetup from './pages/MeetingSetup';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/setup" element={<MeetingSetup />} />
      </Routes>
    </Router>
  );
};

export default App;
