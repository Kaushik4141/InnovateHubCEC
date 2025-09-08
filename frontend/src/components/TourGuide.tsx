import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Play, Sparkles, 
  ArrowRight, Home, Users, Trophy, Code, MessageCircle,
  User, Bell, Search, Plus, Briefcase, Handshake, Menu, Settings
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon?: React.ReactNode;
  scrollTo?: boolean;
  action?: () => void;
}

interface TourGuideProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to InnovateHubCEC! 🎉',
    description: 'Get ready for an amazing journey! This quick tour will show you all the powerful features that will help you connect, learn, and innovate.',
    target: 'body',
    position: 'bottom',
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    id: 'logo',
    title: 'Your Innovation Hub',
    description: 'This is your home base! Click the logo anytime to return to your dashboard and stay connected with your innovation community.',
    target: '[data-tour="logo"]',
    position: 'bottom',
    icon: <Home className="h-5 w-5" />,
    scrollTo: true,
  },
  {
    id: 'search',
    title: 'Smart Search 🔍',
    description: 'Find people, projects, and posts instantly! Our intelligent search helps you discover exactly what you\'re looking for.',
    target: '[data-tour="search"]',
    position: 'bottom',
    icon: <Search className="h-5 w-5" />,
    scrollTo: true,
  },
  {
    id: 'notifications',
    title: 'Stay Connected 🔔',
    description: 'Never miss important updates! Get notified about connection requests, project collaborations, and community activities.',
    target: '[data-tour="notifications"]',
    position: 'bottom',
    icon: <Bell className="h-5 w-5" />,
  },
  {
    id: 'profile-menu',
    title: 'Your Profile Hub',
    description: 'Access your profile, settings, and account options. This is your personal space to manage your innovation journey.',
    target: '[data-tour="profile-menu"]',
    position: 'bottom',
    icon: <User className="h-5 w-5" />,
  },
  {
    id: 'sidebar-profile',
    title: 'Your Digital Identity',
    description: 'This is your profile card showing your progress and achievements. Watch your stats grow as you engage with the community!',
    target: '[data-tour="sidebar-profile"]',
    position: 'right',
    icon: <User className="h-5 w-5" />,
    scrollTo: true,
  },
  {
    id: 'navigation',
    title: 'Explore Everything',
    description: 'Navigate through different sections: Feed for updates, Projects for showcases, Competitions for challenges, and Mentors for guidance.',
    target: '[data-tour="navigation"]',
    position: 'right',
    icon: <Code className="h-5 w-5" />,
    scrollTo: true,
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions ⚡',
    description: 'Fast-track your activities! Share projects, find mentors, and start conversations with just one click.',
    target: '[data-tour="quick-actions"]',
    position: 'right',
    icon: <ArrowRight className="h-5 w-5" />,
    scrollTo: true,
  },
  {
    id: 'add-post',
    title: 'Share Your Innovation 💡',
    description: 'Ready to showcase your projects? Click here to share your innovations, get feedback, and inspire others!',
    target: '[data-tour="add-post"]',
    position: 'left',
    icon: <Plus className="h-5 w-5" />,
    scrollTo: true,
  },
  {
    id: 'main-feed',
    title: 'Your Innovation Feed',
    description: 'This is where the magic happens! Discover projects, engage with posts, and stay updated with your community\'s latest innovations.',
    target: '[data-tour="main-feed"]',
    position: 'left',
    icon: <Home className="h-5 w-5" />,
    scrollTo: true,
  },
  {
    id: 'roadmaps',
    title: 'Developer Roadmaps 🗺️',
    description: 'Lost on your learning journey? These curated roadmaps will guide you from beginner to expert in various tech domains.',
    target: '[data-tour="roadmaps"]',
    position: 'left',
    icon: <Trophy className="h-5 w-5" />,
    scrollTo: true,
  },
  {
    id: 'events',
    title: 'Upcoming Events 📅',
    description: 'Never miss out! Stay updated with hackathons, tech talks, workshops, and networking events happening in your community.',
    target: '[data-tour="events"]',
    position: 'left',
    icon: <Trophy className="h-5 w-5" />,
    scrollTo: true,
  },
  {
    id: 'progress',
    title: 'Track Your Growth 📈',
    description: 'Watch your progress unfold! Monitor your profile completion, project goals, and network growth in real-time.',
    target: '[data-tour="progress"]',
    position: 'left',
    icon: <Trophy className="h-5 w-5" />,
    scrollTo: true,
  },
  {
    id: 'suggestions',
    title: 'Grow Your Network 🤝',
    description: 'Connect with like-minded innovators! These personalized suggestions help you build meaningful professional relationships.',
    target: '[data-tour="suggestions"]',
    position: 'left',
    icon: <Users className="h-5 w-5" />,
    scrollTo: true,
  },
  {
    id: 'floating-dock',
    title: 'Quick Navigation 🚀',
    description: 'Your mobile-friendly navigation dock! Access all major sections quickly from anywhere in the app.',
    target: '[data-tour="floating-dock"]',
    position: 'top',
    icon: <Handshake className="h-5 w-5" />,
    scrollTo: true,
  },
];

const TourGuide: React.FC<TourGuideProps> = ({ isVisible, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  
  // Check device type on mount and window resize
  useEffect(() => {
    const checkDeviceType = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    
    // Initial check
    checkDeviceType();
    
    // Add resize listener
    window.addEventListener('resize', checkDeviceType);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  // Calculate tooltip position and highlight target element
  useEffect(() => {
    if (!isVisible || !currentTourStep) return;

    const targetElement = document.querySelector(currentTourStep.target) as HTMLElement;
    const overlay = overlayRef.current;
    
    if (targetElement && currentTourStep.target !== 'body') {
      // Scroll to element if needed
      if (currentTourStep.scrollTo) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }

      // Store original styles to restore later
      const originalPosition = targetElement.style.position;
      const originalZIndex = targetElement.style.zIndex;
      
      // Add highlight class and adjust styles for proper highlighting
      targetElement.classList.add('tour-highlight');
      
      // Only change position if it's static to avoid layout shifts
      if (window.getComputedStyle(targetElement).position === 'static') {
        targetElement.style.position = 'relative';
      }
      targetElement.style.zIndex = '60';

      // Position tooltip and update overlay highlight position
      const updatePositions = () => {
        const rect = targetElement.getBoundingClientRect();
        const tooltip = tooltipRef.current;
        
        // Update the overlay highlight position
        if (overlay) {
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const highlightSize = Math.max(rect.width, rect.height) * 1.5; // Make highlight larger than element
          
          // Set CSS variables for the radial gradient
          overlay.style.setProperty('--highlight-x', `${centerX}px`);
          overlay.style.setProperty('--highlight-y', `${centerY}px`);
          overlay.style.setProperty('--highlight-size', `${highlightSize}px`);
          overlay.style.background = `radial-gradient(circle at var(--highlight-x) var(--highlight-y), transparent ${highlightSize / 2}px, rgba(0, 0, 0, 0.7) ${highlightSize}px)`;
        }
        
        if (tooltip) {
          const tooltipRect = tooltip.getBoundingClientRect();
          let left, top;
          const isMobile = window.innerWidth < 640;

          // For mobile, position tooltip at the bottom of the screen
          if (isMobile) {
            left = window.innerWidth / 2 - tooltipRect.width / 2;
            top = window.innerHeight - tooltipRect.height - 20;
          } else {
            // Calculate position based on the specified position
            switch (currentTourStep.position) {
              case 'top':
                left = rect.left + rect.width / 2 - tooltipRect.width / 2;
                top = rect.top - tooltipRect.height - 16;
                break;
              case 'bottom':
                left = rect.left + rect.width / 2 - tooltipRect.width / 2;
                top = rect.bottom + 16;
                break;
              case 'left':
                left = rect.left - tooltipRect.width - 16;
                top = rect.top + rect.height / 2 - tooltipRect.height / 2;
                break;
              case 'right':
                left = rect.right + 16;
                top = rect.top + rect.height / 2 - tooltipRect.height / 2;
                break;
            }

            // Ensure tooltip stays within viewport with padding
            const padding = 16;
            left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
            top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
          }

          // Apply position with smooth transition
          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${top}px`;
          tooltip.style.opacity = '1';
          tooltip.style.transform = 'scale(1)';
          
          // Add mobile class for styling
          if (isMobile) {
            tooltip.classList.add('tour-mobile-tooltip');
          } else {
            tooltip.classList.remove('tour-mobile-tooltip');
          }
        }
      };

      // Initial positioning with a slight delay to ensure DOM is ready
      setTimeout(updatePositions, 50);
      
      // Update positions on scroll and resize for responsiveness
      window.addEventListener('resize', updatePositions);
      window.addEventListener('scroll', updatePositions, { passive: true });

      return () => {
        // Remove highlight from previous element
        targetElement.classList.remove('tour-highlight');
        targetElement.style.zIndex = originalZIndex;
        targetElement.style.position = originalPosition;
        
        // Remove event listeners
        window.removeEventListener('resize', updatePositions);
        window.removeEventListener('scroll', updatePositions);
        
        // Reset overlay
        if (overlay) {
          overlay.style.background = 'rgba(0, 0, 0, 0.7)';
        }
        
        // Clean up any other elements that might have highlight class
        document.querySelectorAll('.tour-highlight').forEach(el => {
          el.classList.remove('tour-highlight');
          if (el !== targetElement) {
            el.style.zIndex = '';
            el.style.position = '';
          }
        });
      };
    } else if (overlay && currentTourStep.target === 'body') {
      // Reset overlay for body target
      overlay.style.background = 'rgba(0, 0, 0, 0.7)';
    }
  }, [currentStep, isVisible, currentTourStep]);

  const nextStep = async () => {
    if (currentTourStep.action) {
      currentTourStep.action();
    }

    setIsAnimating(true);
    
    // Remove highlight from current element before moving to next step
    const currentTarget = document.querySelector(currentTourStep.target) as HTMLElement;
    if (currentTarget && currentTourStep.target !== 'body') {
      currentTarget.classList.remove('tour-highlight');
    }
    
    setTimeout(() => {
      if (currentStep < tourSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
      setIsAnimating(false);
    }, 400); // Slightly longer delay for smoother transition
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      
      // Remove highlight from current element before moving to previous step
      const currentTarget = document.querySelector(currentTourStep.target) as HTMLElement;
      if (currentTarget && currentTourStep.target !== 'body') {
        currentTarget.classList.remove('tour-highlight');
      }
      
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 400); // Slightly longer delay for smoother transition
    }
  };

  const handleComplete = () => {
    // Clean up highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
      el.style.zIndex = '';
      el.style.position = '';
    });
    onComplete();
  };

  const handleSkip = () => {
    // Clean up highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
      el.style.zIndex = '';
      el.style.position = '';
    });
    onSkip();
  };

  if (!isVisible) return null;

  // Don't render tour guide on mobile or tablet
  if (isMobileOrTablet) {
    return null;
  }
  
  return (
    <>
      {/* Floating Tour Menu - Only visible on desktop */}
      {currentStep > 0 && (
        <div className="fixed top-4 right-4 z-70">
          <div className="bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-full shadow-lg border border-blue-500/30 p-2 flex items-center">
            <span className="text-white text-sm font-medium mx-2">Tour: {currentStep}/{tourSteps.length}</span>
            <div className="flex space-x-1">
              <button 
                onClick={prevStep} 
                disabled={currentStep <= 1}
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={nextStep}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white"
              >
                {currentStep === tourSteps.length - 1 ? <Play className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <button 
                onClick={handleSkip}
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 z-50 transition-all duration-500"
        style={{
          background: currentTourStep.target === 'body' ? 
            'rgba(0, 0, 0, 0.7)' : 
            'radial-gradient(circle at var(--highlight-x, 50%) var(--highlight-y, 50%), transparent 100px, rgba(0, 0, 0, 0.7) 200px)'
        }}
      >
        {/* Progress Bar */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-60">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-gray-600/50">
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm font-medium">
                {currentStep + 1} of {tourSteps.length}
              </span>
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Skip Tour
              </button>
            </div>
          </div>
        </div>

        {/* Welcome Step - Special Layout */}
        {currentStep === 0 && (
          <div className="fixed inset-0 flex items-center justify-center z-60">
            <div className={`
              bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg mx-4
              shadow-2xl border border-gray-600/50 transform transition-all duration-700
              ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
            `}>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">{currentTourStep.title}</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-8">{currentTourStep.description}</p>
                
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={handleSkip}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors font-medium"
                  >
                    Skip Tour
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold 
                             hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 
                             shadow-lg hover:shadow-purple-500/25 flex items-center space-x-2"
                  >
                    <Play className="h-5 w-5" />
                    <span>Start Tour</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Steps - Positioned Tooltip */}
        {currentStep > 0 && (
          <div
            ref={tooltipRef}
            className={`
              fixed z-60 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl p-6 max-w-sm
              shadow-2xl border border-blue-500/50 transform transition-all duration-700 ease-in-out
              ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
              sm:max-w-sm max-w-[90%] tour-mobile-tooltip
            `}
            style={{ 
              transformOrigin: 'center',
            }}
          >
            {/* Arrow pointing to target - hidden on mobile */}
            <div 
              className={`
                absolute w-0 h-0 border-8 hidden sm:block
                ${currentTourStep.position === 'top' && 'border-transparent border-t-gray-800/95 top-full left-1/2 transform -translate-x-1/2'}
                ${currentTourStep.position === 'bottom' && 'border-transparent border-b-gray-800/95 bottom-full left-1/2 transform -translate-x-1/2'}
                ${currentTourStep.position === 'left' && 'border-transparent border-l-gray-800/95 left-full top-1/2 transform -translate-y-1/2'}
                ${currentTourStep.position === 'right' && 'border-transparent border-r-gray-800/95 right-full top-1/2 transform -translate-y-1/2'}
              `}
            />

            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                {currentTourStep.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{currentTourStep.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{currentTourStep.description}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Skip
              </button>

              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg 
                         hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 font-medium"
              >
                <span>{currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <div className="flex sm:hidden items-center justify-between mt-4 pt-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white disabled:opacity-50 disabled:bg-gray-800"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <button
                  onClick={nextStep}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white"
                >
                  {currentStep === tourSteps.length - 1 ? 
                    <Play className="h-5 w-5" /> : 
                    <ChevronRight className="h-5 w-5" />}
                </button>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm text-gray-400 mr-2">{currentStep + 1}/{tourSteps.length}</span>
                <button
                  onClick={handleSkip}
                  className="px-3 py-1 bg-gray-700 text-white text-sm rounded-md"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tour Styles */}
      <style jsx>{`
        .tour-highlight {
          animation: tourPulse 2s infinite;
          border-radius: 8px !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.5) !important;
          outline: 2px solid rgba(59, 130, 246, 0.9) !important;
          transition: all 0.3s ease-in-out !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          filter: none !important;
          background-color: transparent !important;
        }
        
        @keyframes tourPulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.7);
          }
        }
        
        .backdrop-blur-xl {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        /* Mobile styles */
        @media (max-width: 640px) {
          .tour-mobile-menu {
            position: fixed;
            bottom: 16px;
            right: 16px;
            z-index: 100;
            background: transparent;
          }
          
          .tour-mobile-tooltip {
            position: fixed !important;
            bottom: 80px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            max-width: 90% !important;
            width: 90% !important;
            top: auto !important;
          }
            padding: 12px;
            border-top: 1px solid rgba(75, 85, 99, 0.4);
            z-index: 70;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
};

export default TourGuide;