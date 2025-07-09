import React from 'react';
import { ArrowRight, Zap, Users, Award } from 'lucide-react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect. Collaborate. 
            <span className="text-blue-600"> Create.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover amazing projects, connect with talented seniors, and build the future together. 
            Your college's dedicated platform for innovation, mentorship, and peer learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">500+</h3>
              <p className="text-gray-600">Active Students</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">200+</h3>
              <p className="text-gray-600">Projects Shared</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">50+</h3>
              <p className="text-gray-600">Skill Domains</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;