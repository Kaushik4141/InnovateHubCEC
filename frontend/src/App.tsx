import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
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
import Onboarding from './components/Onboarding';
import Mentors from './components/Mentors';
import Admin from './components/Admin';
import MentorApply from './components/MentorApply';
import FeedbackForm from './components/feedbackform';
import FeedbackFab from './components/FeedbackFab';
import ChatBotFab from './components/chatbotFab';
import ChatBot from './components/chatbot';
import { Analytics } from '@vercel/analytics/react';
import Contests from './components/Contests';
import ContestView from './components/ContestView';
import SolveProblem from './components/SolveProblem';
import ContestLeaderboard from './components/ContestLeaderboard';

import AdminContests from './components/AdminContests';
import AdminContestProblems from './components/AdminContestProblems';


type Me = {
  _id: string;
  onboardingCompleted?: boolean;
  isAdmin?: boolean;
};

const useMe = () => {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`${apiBase}/api/v1/users/current-user`, { withCredentials: true });
        if (!mounted) return;
        const data = res.data?.data || res.data?.user || res.data;
        setMe(data);
      } catch (_) {
        setMe(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [apiBase]);
  return { me, loading };
};

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { me, loading } = useMe();
  if (loading) return null;
  if (!me) return <Navigate to="/login" replace />;
  return children;
};

const RequireOnboardingComplete = ({ children }: { children: JSX.Element }) => {
  const { me, loading } = useMe();
  if (loading) return null;
  if (!me) return <Navigate to="/login" replace />;
  if (!me.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return children;
};

const OnboardingOnly = () => {
  const { me, loading } = useMe();
  if (loading) return null;
  if (!me) return <Navigate to="/login" replace />;
  if (me.onboardingCompleted) return <Navigate to="/dashboard" replace />;
  return <Onboarding />;
};

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const { me, loading } = useMe();
  if (loading) return null;
  if (!me) return <Navigate to="/login" replace />;
  if (!me.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/team" element={<Team />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/mentors/apply" element={<MentorApply />} />
        <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
        <Route path="/admin/contests" element={<RequireAdmin><AdminContests /></RequireAdmin>} />
        <Route path="/admin/contests/:contestId/problems" element={<RequireAdmin><AdminContestProblems /></RequireAdmin>} />
        <Route path="/dashboard" element={<RequireOnboardingComplete><Dashboard /></RequireOnboardingComplete>} />
        <Route path="/profile" element={<RequireOnboardingComplete><Profile /></RequireOnboardingComplete>} />
        <Route path="/messages" element={<RequireOnboardingComplete><Messages /></RequireOnboardingComplete>} />
        <Route path="/chat" element={<RequireOnboardingComplete><Chat /></RequireOnboardingComplete>} />
        <Route path="/network" element={<RequireOnboardingComplete><Network /></RequireOnboardingComplete>} />
        <Route path="/jobs" element={<RequireOnboardingComplete><Jobs /></RequireOnboardingComplete>} />
        <Route path="/notifications" element={<RequireOnboardingComplete><Notifications /></RequireOnboardingComplete>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignupForm />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/addpost" element={<RequireOnboardingComplete><AddPost /></RequireOnboardingComplete>} />
        <Route path="/profile/c/:fullname" element={<RequireAuth><UserProfileView /></RequireAuth>} />
        <Route path="/onboarding" element={<OnboardingOnly />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/chatbot" element={<ChatBot />} />
        <Route path="/contests" element={<RequireAuth><Contests /></RequireAuth>} />
        <Route path="/contests/:contestId" element={<RequireAuth><ContestView /></RequireAuth>} />
        <Route path="/contests/:contestId/problems/:problemId" element={<RequireAuth><SolveProblem /></RequireAuth>} />
        <Route path="/contests/:contestId/leaderboard" element={<RequireAuth><ContestLeaderboard /></RequireAuth>} />
        
      </Routes>

      {/* Floating Feedback Button */}
      <FeedbackFab />

      {/* Floating Chatbot Button (self-contained) */}
      <ChatBotFab />

      <Analytics />
    </>
  );
}


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 relative">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
