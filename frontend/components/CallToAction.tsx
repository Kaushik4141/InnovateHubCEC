import React from 'react';
import { ArrowRight, Users, Lightbulb, Target } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join thousands of students who are already building, learning, and growing together. 
            Your next breakthrough project or meaningful connection is just a click away.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect</h3>
              <p className="text-blue-100">Find mentors and peers in your field</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Learn</h3>
              <p className="text-blue-100">Gain insights from real projects</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Build</h3>
              <p className="text-blue-100">Create amazing projects together</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
              Join CampusConnect
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Learn More
            </button>
          </div>

          <p className="text-blue-100 text-sm mt-6">
            Free for all students • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;