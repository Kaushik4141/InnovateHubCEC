import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Users, Briefcase, MessageCircle, Trophy, Group, Handshake, Menu
} from 'lucide-react';

interface DockItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  color: string;
}

const dockItems: DockItem[] = [
  { icon: Home, label: 'Home', path: '/dashboard', color: 'from-purple-500 to-purple-600' },
  { icon: Handshake, label: 'Chat', path: '/chat', color: 'from-blue-500 to-blue-600' },
  { icon: Briefcase, label: 'Jobs', path: '/jobs', color: 'from-orange-500 to-orange-600' },
  { icon: MessageCircle, label: 'competitions', path: '/competitions', color: 'from-teal-500 to-teal-600' },
  { icon: Trophy, label: 'Leaderboard', path: '/Leaderboard', color: 'from-yellow-500 to-yellow-600' },
];

const FloatingDock: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint in Tailwind
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 px-3 py-2 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between overflow-x-auto hide-scrollbar">
          {dockItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isHovered = hoveredItem === item.path;
            
            return (
              <div key={item.path} className="relative flex-shrink-0 flex-1 flex justify-center">
                <button
                  onClick={() => navigate(item.path)}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    group relative flex flex-col items-center justify-center rounded-xl p-1.5
                    transition-all duration-300 ease-out w-full max-w-[60px]
                    ${isActive 
                      ? 'text-white scale-105' 
                      : 'text-gray-400 hover:text-white'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg mb-1 transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r ' + item.color + ' shadow-md shadow-purple-500/30' 
                      : isHovered 
                        ? 'bg-gray-700/80' 
                        : 'bg-transparent'
                    }
                  `}>
                    <Icon className={`transition-all duration-300 ${isActive ? 'h-5 w-5' : 'h-4 w-4'}`} />
                  </div>
                  <span className="text-xs font-medium transition-all duration-300 truncate w-full text-center">
                    {item.label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-pulse" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add safe area padding for iOS devices */}
      <div className="pb-safe-bottom bg-gray-900/95" />
      
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .pb-safe-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
          height: env(safe-area-inset-bottom, 0);
        }
      `}</style>
    </div>
  );
};

export default FloatingDock;