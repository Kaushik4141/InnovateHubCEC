import React, { useEffect, useRef, useState } from 'react';
import axios from '../cookiescheker';
import { useNavigate } from 'react-router-dom';
import { Star, Send, MessageSquare, Bug, Lightbulb, HelpCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


const SUCCESS_LOTTIE_SRC = 'https://lottie.host/0355c5b5-4902-4f4c-863c-3b20338bd7e0/dRVPPthQTu.lottie';

interface FeedbackData {
  category: string;
  rating: number;
  title: string;
  message: string;
  email: string;
  name: string;
}

function App() {
  const [feedback, setFeedback] = useState<FeedbackData>({
    category: 'general',
    rating: 0,
    title: '',
    message: '',
    email: '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const navigate = useNavigate();
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  // Prefetched Lottie URL and player container
  const [lottieSrc, setLottieSrc] = useState<string>(SUCCESS_LOTTIE_SRC);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  // Prefetch the Lottie file to avoid initial blank delay
  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;
    (async () => {
      try {
        const res = await fetch(SUCCESS_LOTTIE_SRC, { cache: 'force-cache' as RequestCache });
        if (!res.ok) return;
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (isMounted) setLottieSrc(objectUrl);
      } catch {}
    })();
    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const categories = [
    { id: 'general', label: 'General Feedback', icon: MessageSquare, color: 'bg-purple-600' },
    { id: 'bug', label: 'Bug Report', icon: Bug, color: 'bg-red-600' },
    { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'bg-green-600' },
    { id: 'support', label: 'Support', icon: HelpCircle, color: 'bg-blue-600' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`${apiBase}/api/v1/users/current-user`, { withCredentials: true });
        if (!mounted) return;
        const data = res.data?.data || res.data?.user || res.data;
        const fullName = data?.fullname || data?.name || [data?.firstName, data?.lastName].filter(Boolean).join(' ');
        const email = data?.email;
        setFeedback(prev => ({
          ...prev,
          name: fullName || prev.name,
          email: email || prev.email,
        }));
      } catch (_) {
        // ignore if unauthenticated
      }
    })();
    return () => { mounted = false; };
  }, [apiBase]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!feedback.title.trim()) newErrors.title = 'Title is required';
    if (!feedback.message.trim()) newErrors.message = 'Message is required';
    if (!feedback.email.trim()) newErrors.email = 'Email is required';
    if (feedback.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(feedback.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!feedback.name.trim()) newErrors.name = 'Name is required';
    if (feedback.rating === 0) newErrors.rating = 'Please provide a rating';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('category', feedback.category);
      formData.append('rating', String(feedback.rating));
      formData.append('title', feedback.title);
      formData.append('message', feedback.message);
      formData.append('email', feedback.email);
      formData.append('name', feedback.name);
      formData.append('_subject', `Feedback: ${feedback.category} - ${feedback.title || 'No title'}`);
      try { formData.append('page', window.location.href); } catch {}

      const resp = await fetch('https://formspree.io/f/mqadkgpb', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (!resp.ok) {
        let serverMsg = 'Failed to submit feedback. Please try again.';
        try {
          const data = await resp.json();
          if (data?.errors?.length) serverMsg = data.errors.map((e: any) => e.message).join(', ');
        } catch {}
        throw new Error(serverMsg);
      }

      setIsSubmitted(true);
          setFeedback({ category: 'general', rating: 0, title: '', message: '', email: feedback.email, name: feedback.name });
    } catch (err: any) {
      setSubmissionError(err?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isSubmitted) return;
    const el = playerContainerRef.current?.querySelector('dotlottie-player') as any;
    let timeoutId: any;
    const onComplete = () => {
      if (timeoutId) clearTimeout(timeoutId);
      navigate('/dashboard');
    };
    if (el?.addEventListener) {
      el.addEventListener('complete', onComplete);
    }
    timeoutId = setTimeout(onComplete, 5000);
    return () => {
      if (el?.removeEventListener) {
        el.removeEventListener('complete', onComplete);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSubmitted, navigate]);

  const handleRatingClick = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
    setErrors(prev => ({ ...prev, rating: '' }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div ref={playerContainerRef} className="w-[400px] h-[400px] mx-auto">
            <DotLottieReact
              src={lottieSrc}
              loop={false}
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <p className="mt-4 text-slate-300">Thanks for your feedback! Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Top Bar with Back */}
        <div className="pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-slate-300 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            We'd Love Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> Feedback</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Help us improve by sharing your experience. Every piece of feedback helps us create better products for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Category Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">What type of feedback do you have?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = feedback.category === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setFeedback(prev => ({ ...prev, category: category.id }))}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-900/30 shadow-lg shadow-purple-500/20'
                        : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${category.color} ${isSelected ? 'shadow-lg' : ''} flex items-center justify-center mb-3 mx-auto transition-all duration-200`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className={`font-medium text-sm ${isSelected ? 'text-purple-300' : 'text-slate-300'}`}>
                      {category.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">How would you rate your overall experience?</h3>
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className="p-1 transition-transform duration-150 hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors duration-200 ${
                      star <= feedback.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-500 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-slate-400">
              {feedback.rating === 0 && 'Click to rate'}
              {feedback.rating === 1 && 'Poor'}
              {feedback.rating === 2 && 'Fair'}
              {feedback.rating === 3 && 'Good'}
              {feedback.rating === 4 && 'Very Good'}
              {feedback.rating === 5 && 'Excellent'}
            </p>
            {errors.rating && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-sm text-red-400">{errors.rating}</p>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                value={feedback.name}
                onChange={(e) => {
                  setFeedback(prev => ({ ...prev, name: e.target.value }));
                  setErrors(prev => ({ ...prev, name: '' }));
                }}
                className={`w-full px-4 py-3 bg-slate-700 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 text-white placeholder-slate-400 ${
                  errors.name ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <div className="flex items-center gap-2 mt-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <p className="text-sm text-red-400">{errors.name}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={feedback.email}
                onChange={(e) => {
                  setFeedback(prev => ({ ...prev, email: e.target.value }));
                  setErrors(prev => ({ ...prev, email: '' }));
                }}
                className={`w-full px-4 py-3 bg-slate-700 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 text-white placeholder-slate-400 ${
                  errors.email ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <div className="flex items-center gap-2 mt-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <p className="text-sm text-red-400">{errors.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Title */}
          <div className="mb-8">
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
              Feedback Title *
            </label>
            <input
              type="text"
              id="title"
              value={feedback.title}
              onChange={(e) => {
                setFeedback(prev => ({ ...prev, title: e.target.value }));
                setErrors(prev => ({ ...prev, title: '' }));
              }}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 text-white placeholder-slate-400 ${
                errors.title ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Brief summary of your feedback"
            />
            {errors.title && (
              <div className="flex items-center gap-2 mt-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-sm text-red-400">{errors.title}</p>
              </div>
            )}
          </div>

          {/* Feedback Message */}
          <div className="mb-8">
            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
              Your Feedback *
            </label>
            <textarea
              id="message"
              rows={6}
              value={feedback.message}
              onChange={(e) => {
                setFeedback(prev => ({ ...prev, message: e.target.value }));
                setErrors(prev => ({ ...prev, message: '' }));
              }}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 resize-none text-white placeholder-slate-400 ${
                errors.message ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Please share your detailed feedback here..."
            />
            <div className="flex justify-between items-center mt-2">
              {errors.message ? (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <p className="text-sm text-red-400">{errors.message}</p>
                </div>
              ) : (
                <div></div>
              )}
              <p className="text-sm text-slate-400">{feedback.message.length} characters</p>
            </div>
          </div>

          {/* Submit Button */}
          {submissionError && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm">
              {submissionError}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 ${
              isSubmitting
                ? 'opacity-75 cursor-not-allowed'
                : 'hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transform'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Feedback
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 pb-8">
          <p className="text-slate-400">
            Your feedback is important to us. We read every submission and use it to improve our products.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .animate-progress {
          animation: progress 3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;