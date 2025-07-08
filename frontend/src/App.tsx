import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Messages from './components/Messages';
import Network from './components/Network';
import Jobs from './components/Jobs';
import Notifications from './components/Notifications';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/network" element={<Network />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;