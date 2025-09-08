import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ChevronRight, User, Code, Target, CheckCircle, Sparkles } from 'lucide-react';
import axios from 'axios';

interface Me {
  _id: string;
  fullname: string;
  email: string;
  onboardingCompleted?: boolean;
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [fullname, setFullname] = useState('');
  const [usn, setUsn] = useState('');
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');
  const [formData, setFormData] = useState({
    bio: '',
    skills: [],
    interests: [],
    goals: [],
    yearOfStudy: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const BRANCHES = ['CSE', 'ISE', 'AIML', 'CSD', 'CSBS', 'ECE'];
  const GRADUATION_YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i);

  const skillOptions = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 
    'Machine Learning', 'Data Science', 'Web Design', 'Mobile Development',
    'DevOps', 'Cybersecurity', 'Blockchain', 'AI', 'Database Management'
  ];

  const interestOptions = [
    'Web Development', 'Mobile Apps', 'AI/ML', 'Data Science', 
    'Cybersecurity', 'Game Development', 'IoT', 'Blockchain',
    'Cloud Computing', 'UI/UX Design', 'Robotics', 'AR/VR'
  ];

  const goalOptions = [
    'Build a portfolio', 'Find internships', 'Learn new technologies',
    'Network with peers', 'Join hackathons', 'Find mentors',
    'Start a project', 'Improve coding skills', 'Get job-ready'
  ];

  const steps = [
    {
      title: 'Basic Information',
      subtitle: 'Tell us about your academic background',
      icon: <User className="h-6 w-6" />,
    },
    {
      title: 'Tell us about yourself',
      subtitle: 'Help others know who you are',
      icon: <User className="h-6 w-6" />,
    },
    {
      title: 'Your Skills',
      subtitle: 'What technologies do you know?',
      icon: <Code className="h-6 w-6" />,
    },
    {
      title: 'Your Interests',
      subtitle: 'What areas excite you most?',
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      title: 'Your Goals',
      subtitle: 'What do you want to achieve?',
      icon: <Target className="h-6 w-6" />,
    }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`${apiBase}/api/v1/users/current-user`, { withCredentials: true });
        if (!mounted) return;
        const user: Me = res.data?.data || res.data?.user || res.data;
        setFullname(user?.fullname || '');
        if (user?.onboardingCompleted) {
          navigate('/dashboard');
        }
      } catch (e: any) {
        navigate('/login');
      }
    })();
    return () => { mounted = false; };
  }, [apiBase, navigate]);

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleNext = () => {
    if (currentStep === 0 && (!usn || !year || !branch)) {
      setError('Please provide your USN, Graduation Year and Branch');
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setError('');
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    
    try {
      await axios.post(
        `${apiBase}/api/v1/users/auth/complete-onboarding`,
        { 
          usn: usn.trim().toUpperCase(), 
          year: Number(year), 
          fullname, 
          branch,
          bio: formData.bio,
          skills: formData.skills,
          interests: formData.interests,
          goals: formData.goals,
          yearOfStudy: formData.yearOfStudy
        },
        { withCredentials: true }
      );
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfoStep = () => (
    <div className="space-y-4">
      <div>
        <input
          name="fullname"
          type="text"
          placeholder="Full Name"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          className="w-full p-4 rounded-lg bg-gray-900/60 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition"
        />
      </div>

      <div>
        <input
          name="usn"
          type="text"
          placeholder="Your USN"
          value={usn}
          onChange={(e) => setUsn(e.target.value)}
          className="w-full p-4 rounded-lg bg-gray-900/60 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition"
        />
      </div>

      <div>
        <select
          name="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full p-4 rounded-lg bg-gray-900/60 text-white border border-gray-700 focus:outline-none appearance-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition"
        >
          <option value="" disabled>Select Graduation Year</option>
          {GRADUATION_YEARS.map(y => (
            <option key={y} value={String(y)} className="bg-gray-800">
              {y}
            </option>
          ))}
        </select>
      </div>

      <div>
        <select
          name="branch"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="w-full p-4 rounded-lg bg-gray-900/60 text-white border border-gray-700 focus:outline-none appearance-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition"
        >
          <option value="" disabled>Select Branch</option>
          {BRANCHES.map(b => (
            <option key={b} value={b} className="bg-gray-800">
              {b}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderBioStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tell us about yourself
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="I'm a passionate developer interested in..."
          className="w-full p-4 rounded-lg bg-gray-900/60 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition resize-none"
          rows={4}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Current Year of Study
        </label>
        <select
          value={formData.yearOfStudy}
          onChange={(e) => setFormData(prev => ({ ...prev, yearOfStudy: parseInt(e.target.value) }))}
          className="w-full p-4 rounded-lg bg-gray-900/60 text-white border border-gray-700 focus:outline-none appearance-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition"
        >
          <option value={1}>1st Year</option>
          <option value={2}>2nd Year</option>
          <option value={3}>3rd Year</option>
          <option value={4}>4th Year</option>
        </select>
      </div>
    </div>
  );

  const renderSkillsStep = () => (
    <div className="space-y-4">
      <p className="text-gray-300">Select the technologies you're familiar with:</p>
      <div className="grid grid-cols-2 gap-3">
        {skillOptions.map(skill => (
          <button
            type="button"
            key={skill}
            onClick={() => handleSkillToggle(skill)}
            className={`
              p-3 rounded-lg border transition-all duration-200 text-left
              ${formData.skills.includes(skill)
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-purple-500'
              }
            `}
          >
            {skill}
          </button>
        ))}
      </div>
    </div>
  );

  const renderInterestsStep = () => (
    <div className="space-y-4">
      <p className="text-gray-300">What areas interest you the most?</p>
      <div className="grid grid-cols-2 gap-3">
        {interestOptions.map(interest => (
          <button
            type="button"
            key={interest}
            onClick={() => handleInterestToggle(interest)}
            className={`
              p-3 rounded-lg border transition-all duration-200 text-left
              ${formData.interests.includes(interest)
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-blue-500'
              }
            `}
          >
            {interest}
          </button>
        ))}
      </div>
    </div>
  );

  const renderGoalsStep = () => (
    <div className="space-y-4">
      <p className="text-gray-300">What do you want to achieve this year?</p>
      <div className="grid grid-cols-1 gap-3">
        {goalOptions.map(goal => (
          <button
            type="button"
            key={goal}
            onClick={() => handleGoalToggle(goal)}
            className={`
              p-3 rounded-lg border transition-all duration-200 text-left flex items-center justify-between
              ${formData.goals.includes(goal)
                ? 'bg-green-600 border-green-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-green-500'
              }
            `}
          >
            <span>{goal}</span>
            {formData.goals.includes(goal) && <CheckCircle className="h-5 w-5" />}
          </button>
        ))}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderBasicInfoStep();
      case 1: return renderBioStep();
      case 2: return renderSkillsStep();
      case 3: return renderInterestsStep();
      case 4: return renderGoalsStep();
      default: return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return usn && year && branch;
      case 1: return formData.bio.trim().length > 10;
      case 2: return formData.skills.length > 0;
      case 3: return formData.interests.length > 0;
      case 4: return formData.goals.length > 0;
      default: return true;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -right-24 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-24 w-[28rem] h-[28rem] bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl p-[1px] rounded-2xl bg-gradient-to-r from-purple-500/30 to-blue-500/30 shadow-2xl">
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-2">
              <img src="/logo1.png" alt="logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">InnovateHubCEC</span>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-white">{steps[currentStep].title}</h2>
                <span className="text-gray-400 text-sm">{currentStep + 1} of {steps.length}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">{steps[currentStep].subtitle}</p>
            </div>
          </div>

          {error && (
            <p className="text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded text-sm text-center">{error}</p>
          )}

          {renderCurrentStep()}

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-6 py-3 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <span>{currentStep === steps.length - 1 ? 'Complete' : 'Next'}</span>
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;