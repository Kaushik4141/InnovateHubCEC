import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Feed from './Feed';
import Projects from './Projects';
import Competitions from './Competitions';
import MentorsList from './MentorsList';

 

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <Feed />;
      case 'projects':
        return <Projects />;
      case 'competitions':
        return <Competitions />;
      case 'mentors':
        return <MentorsList />;
      default:
        return <Feed />;
    }
  };



  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="order-2 lg:order-1">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="order-1 lg:order-2 lg:col-span-2">
            {renderContent()}
          </div>
          <div className="hidden lg:block lg:order-3 lg:col-span-1">

            <div className="space-y-6">
              {/* Trending Topics */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4 text-purple-400">Trending Topics</h3>
                <div className="space-y-3">
                  {[
                    { tag: '#AIInnovation', posts: 156 },
                    { tag: '#WebDev', posts: 89 },
                    { tag: '#IoTProjects', posts: 67 },
                    { tag: '#MachineLearning', posts: 45 },
                    { tag: '#BlockchainTech', posts: 32 }
                  ].map((topic) => (
                    <div key={topic.tag} className="flex justify-between items-center hover:bg-gray-700 p-2 rounded cursor-pointer">
                      <span className="text-sm font-medium">{topic.tag}</span>
                      <span className="text-xs text-gray-400">{topic.posts} posts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4 text-purple-400">Upcoming Events</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium text-sm">Tech Talk: AI in Healthcare</h4>
                    <p className="text-xs text-gray-400">Tomorrow, 3:00 PM</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-sm">Hackathon Registration</h4>
                    <p className="text-xs text-gray-400">Dec 15, 2024</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-sm">Project Showcase</h4>
                    <p className="text-xs text-gray-400">Dec 20, 2024</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4 text-purple-400">Your Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Profile Completion</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Monthly Goal</span>
                      <span>3/5 projects</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Network Growth</span>
                      <span>89 connections</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggested Connections */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4 text-purple-400">People You May Know</h3>
                <div className="space-y-4">
                  {[
                    { name: "Arjun Mehta", role: "AI Researcher", mutual: 5 },
                    { name: "Kavya Singh", role: "Full Stack Developer", mutual: 3 },
                    { name: "Rohit Kumar", role: "Data Scientist", mutual: 7 }
                  ].map((person) => (
                    <div key={person.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{person.name}</p>
                          <p className="text-xs text-gray-400">{person.role}</p>
                          <p className="text-xs text-gray-500">{person.mutual} mutual connections</p>
                        </div>
                      </div>
                      <button className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors">
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;