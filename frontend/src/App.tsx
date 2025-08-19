import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Messages from './components/Messages';
import Network from './components/Network';
import Jobs from './components/Jobs';
import Notifications from './components/Notifications';
import Login from './components/Login';
import SignupForm from './components/register';
import Leaderboard from './components/Leaderboard';
import LandingPage from './components/LandingPage';
import Team from './components/Team';
import AddPost from './components/addpost';
import UserProfileView from './components/UserProfileView';
import Chat from './components/Chat';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/team" element={<Team />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/network" element={<Network />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignupForm />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/addpost" element={<AddPost />} />
          <Route path="/profile/c/:fullname" element={<UserProfileView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;