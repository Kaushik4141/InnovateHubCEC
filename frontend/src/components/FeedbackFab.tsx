import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const FeedbackFab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Optional: hide on feedback page to avoid redundancy
  const hideOnFeedback = location.pathname === '/feedback';
  if (hideOnFeedback) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Give feedback"
        onClick={() => navigate('/feedback')}
        className="fixed left-4 md:left-6 bottom-14 md:bottom-16 z-50 group focus:outline-none"
      >
        {/* Glow aura */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-white-500/40 to-white-500/40 blur-xl fab-glow" aria-hidden="true" />

        {/* Button core */}
        <span className="relative inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-white-500 to-white-600 text-white shadow-xl ring-2 ring-white/20 transition-transform duration-200 fab-float group-hover:scale-105 overflow-hidden">
          <DotLottieReact
            src="https://lottie.host/ab96b3a1-de10-4b9c-a355-0369b4e83379/09Su2hDlNd.lottie"
            loop
            autoplay
            style={{ width: 65, height: 65 }}
          />

          {/* Sparkle accent */}
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 drop-shadow fab-sparkle" />

          {/* Ripple/pulse ring */}
          <span className="absolute inset-0 rounded-full ring-2 ring-white/10 fab-pulse" aria-hidden="true" />
        </span>
      </button>

      <style>{`
        @keyframes fab-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .fab-float { animation: fab-float 3s ease-in-out infinite; }

        @keyframes fab-glow {
          0%, 100% { opacity: .45; transform: scale(1); }
          50% { opacity: .85; transform: scale(1.08); }
        }
        .fab-glow { animation: fab-glow 3s ease-in-out infinite; }

        @keyframes fab-sparkle {
          0%, 100% { transform: rotate(0deg) scale(1); opacity: .9; }
          50% { transform: rotate(15deg) scale(1.15); opacity: 1; }
        }
        .fab-sparkle { animation: fab-sparkle 2.4s ease-in-out infinite; transform-origin: center; }

        @keyframes fab-pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.15); }
          70% { box-shadow: 0 0 0 10px rgba(255,255,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
        .fab-pulse { animation: fab-pulse 2.8s ease-out infinite; }
      `}</style>
    </>
  );
};

export default FeedbackFab;
