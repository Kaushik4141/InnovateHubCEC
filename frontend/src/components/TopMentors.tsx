import React from 'react';
import { MessageCircle, Star, Award, Code, Cpu, Palette, Brain, Database, Smartphone } from 'lucide-react';

const TopMentors = () => {
  const mentors = [
    {
      id: 1,
      name: "Aditya Kumar",
      year: "Final Year CSE",
      specialization: "Full Stack Development",
      skills: ["React", "Node.js", "Python", "AWS"],
      rating: 4.9,
      mentees: 15,
      projects: 8,
      icon: Code,
      avatar: "AK"
    },
    {
      id: 2,
      name: "Sneha Agarwal",
      year: "4th Year CSE",
      specialization: "Machine Learning",
      skills: ["TensorFlow", "PyTorch", "Python", "Data Science"],
      rating: 4.8,
      mentees: 12,
      projects: 6,
      icon: Brain,
      avatar: "SA"
    },
    {
      id: 3,
      name: "Vikram Singh",
      year: "Final Year ECE",
      specialization: "IoT & Embedded Systems",
      skills: ["Arduino", "Raspberry Pi", "C++", "PCB Design"],
      rating: 4.7,
      mentees: 10,
      projects: 12,
      icon: Cpu,
      avatar: "VS"
    },
    {
      id: 4,
      name: "Priyanka Joshi",
      year: "4th Year IT",
      specialization: "UI/UX Design",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      rating: 4.9,
      mentees: 18,
      projects: 15,
      icon: Palette,
      avatar: "PJ"
    },
    {
      id: 5,
      name: "Rohit Sharma",
      year: "Final Year CSE",
      specialization: "Database Systems",
      skills: ["MySQL", "MongoDB", "PostgreSQL", "System Design"],
      rating: 4.6,
      mentees: 8,
      projects: 5,
      icon: Database,
      avatar: "RS"
    },
    {
      id: 6,
      name: "Kavya Reddy",
      year: "4th Year IT",
      specialization: "Mobile Development",
      skills: ["React Native", "Flutter", "iOS", "Android"],
      rating: 4.8,
      mentees: 14,
      projects: 9,
      icon: Smartphone,
      avatar: "KR"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect with Top Mentors</h2>
          <p className="text-lg text-gray-600">Learn from experienced seniors who are passionate about sharing knowledge</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {mentor.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                  <p className="text-sm text-gray-600">{mentor.year}</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{mentor.rating}</span>
                  </div>
                </div>
                <mentor.icon className="h-5 w-5 text-gray-400" />
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{mentor.specialization}</h4>
                <div className="flex flex-wrap gap-2">
                  {mentor.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                      {skill}
                    </span>
                  ))}
                  {mentor.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                      +{mentor.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-lg font-semibold text-gray-900">{mentor.mentees}</p>
                  <p className="text-xs text-gray-600">Mentees</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-lg font-semibold text-gray-900">{mentor.projects}</p>
                  <p className="text-xs text-gray-600">Projects</p>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Connect
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
            Browse All Mentors
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopMentors;