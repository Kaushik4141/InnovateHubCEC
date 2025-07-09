import React from 'react';
import { ExternalLink, Star, Users, Code, Cpu, Palette, Brain } from 'lucide-react';

const FeaturedProjects = () => {
  const projects = [
    {
      id: 1,
      title: "AI-Powered Study Assistant",
      description: "An intelligent tutoring system that adapts to individual learning styles using machine learning algorithms.",
      author: "Priya Sharma",
      year: "Final Year CSE",
      likes: 45,
      domain: "AI/ML",
      tags: ["Python", "TensorFlow", "NLP", "React"],
      icon: Brain,
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 2,
      title: "IoT Smart Campus System",
      description: "A comprehensive IoT solution for energy management, security, and automation across campus facilities.",
      author: "Raj Patel",
      year: "3rd Year ECE",
      likes: 38,
      domain: "Hardware/IoT",
      tags: ["Arduino", "Raspberry Pi", "Node.js", "MQTT"],
      icon: Cpu,
      image: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 3,
      title: "Collaborative Code Editor",
      description: "Real-time collaborative coding platform with integrated chat, code sharing, and version control.",
      author: "Ananya Gupta",
      year: "4th Year IT",
      likes: 52,
      domain: "Web Development",
      tags: ["React", "Node.js", "Socket.io", "MongoDB"],
      icon: Code,
      image: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 4,
      title: "Sustainable Design Portfolio",
      description: "A collection of eco-friendly product designs with detailed sustainability impact analysis.",
      author: "Karthik Reddy",
      year: "2nd Year Design",
      likes: 29,
      domain: "Design",
      tags: ["Figma", "3D Modeling", "Sustainability", "UX Research"],
      icon: Palette,
      image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      "AI/ML": "bg-purple-100 text-purple-800",
      "Hardware/IoT": "bg-blue-100 text-blue-800",
      "Web Development": "bg-green-100 text-green-800",
      "Design": "bg-pink-100 text-pink-800"
    };
    return colors[domain] || "bg-gray-100 text-gray-800";
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Projects</h2>
          <p className="text-lg text-gray-600">Discover innovative work from your fellow students</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48 rounded-t-xl overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDomainColor(project.domain)}`}>
                    {project.domain}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <project.icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-3">
                      {project.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{project.author}</p>
                      <p className="text-xs text-gray-500">{project.year}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                      +{project.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 mr-1" />
                    <span>{project.likes} likes</span>
                  </div>
                  <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View Project
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Explore All Projects
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;