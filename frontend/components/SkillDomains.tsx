import React from 'react';
import { Code, Brain, Cpu, Palette, Database, Smartphone, Globe, Zap } from 'lucide-react';

const SkillDomains = () => {
  const domains = [
    {
      name: "Web Development",
      icon: Globe,
      count: 45,
      color: "bg-green-100 text-green-800 border-green-200",
      popular: ["React", "Node.js", "JavaScript", "CSS"]
    },
    {
      name: "Artificial Intelligence",
      icon: Brain,
      count: 38,
      color: "bg-purple-100 text-purple-800 border-purple-200",
      popular: ["Python", "TensorFlow", "PyTorch", "NLP"]
    },
    {
      name: "Mobile Development",
      icon: Smartphone,
      count: 32,
      color: "bg-blue-100 text-blue-800 border-blue-200",
      popular: ["React Native", "Flutter", "Swift", "Kotlin"]
    },
    {
      name: "Hardware & IoT",
      icon: Cpu,
      count: 28,
      color: "bg-orange-100 text-orange-800 border-orange-200",
      popular: ["Arduino", "Raspberry Pi", "PCB Design", "Sensors"]
    },
    {
      name: "UI/UX Design",
      icon: Palette,
      count: 25,
      color: "bg-pink-100 text-pink-800 border-pink-200",
      popular: ["Figma", "Adobe XD", "Prototyping", "User Research"]
    },
    {
      name: "Data Science",
      icon: Database,
      count: 22,
      color: "bg-indigo-100 text-indigo-800 border-indigo-200",
      popular: ["Python", "R", "SQL", "Tableau"]
    },
    {
      name: "Software Engineering",
      icon: Code,
      count: 35,
      color: "bg-gray-100 text-gray-800 border-gray-200",
      popular: ["Java", "C++", "System Design", "Testing"]
    },
    {
      name: "Automation",
      icon: Zap,
      count: 18,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      popular: ["Python", "Selenium", "CI/CD", "DevOps"]
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Skill Domains</h2>
          <p className="text-lg text-gray-600">Find mentors and peers in your area of interest</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {domains.map((domain) => (
            <div key={domain.name} className={`rounded-xl p-6 border-2 ${domain.color} hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}>
              <div className="flex items-center justify-between mb-4">
                <domain.icon className="h-8 w-8" />
                <span className="text-sm font-medium">{domain.count} students</span>
              </div>
              
              <h3 className="text-lg font-semibold mb-3">{domain.name}</h3>
              
              <div className="space-y-2">
                <p className="text-sm opacity-75">Popular skills:</p>
                <div className="flex flex-wrap gap-1">
                  {domain.popular.slice(0, 2).map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-white bg-opacity-60 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">Ready to share your expertise or learn something new?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Become a Mentor
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Find a Mentor
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillDomains;