import React from 'react';
import {
  MapPin, Mail, Github, Linkedin, Globe,
  Award, Code
} from 'lucide-react';
import Header from './Header';

const LinkedinProfile = () => {
  const user = {
    fullname: 'Chaithra Shetty',
    email: 'chaithra@example.com',
    location: 'Mangalore, Karnataka',
    bio: 'Passionate CSE student from Canara Engineering College. Exploring Blockchain, Web3, and AI innovation.',
    avatar: '/chaithra-avatar.jpg',
    cover: '/cover-banner.jpg',
    github: 'https://github.com/chaithrashetty',
    linkedin: 'https://linkedin.com/in/chaithrashetty',
    website: 'https://chaithras.dev',
    skills: ['Solidity', 'React', 'ZKP', 'Web3.js', 'Node.js'],
    certifications: ['Blockchain Basics - Coursera', 'ZKP Bootcamp - ZKUniversity'],
    projects: ['CraftChain', 'Hospital Smart Display System', 'DreamChain']
  };

  return (
    <div className="bg-[#f3f2ef] min-h-screen font-sans">
      <Header />

      {/* Banner */}
      <div className="relative w-full h-56 bg-cover bg-center" style={{ backgroundImage: `url(${user.cover})` }}>
        <img
          src={user.avatar}
          alt="avatar"
          className="absolute bottom-[-40px] left-10 w-28 h-28 rounded-full border-4 border-white shadow-md"
        />
      </div>

      {/* Profile Section */}
      <div className="bg-white p-6 pt-12 mt-6 rounded-lg shadow mx-10">
        <div className="text-2xl font-semibold">{user.fullname}</div>
        <div className="text-gray-600 mt-1">Blockchain | AI | Full Stack Developer</div>
        <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">
          <MapPin size={16} /> {user.location}
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <a href={`mailto:${user.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
            <Mail size={16} /> {user.email}
          </a>
          <a href={user.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
            <Github size={16} /> GitHub
          </a>
          <a href={user.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
            <Linkedin size={16} /> LinkedIn
          </a>
          <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
            <Globe size={16} /> Portfolio
          </a>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white p-6 mt-4 mx-10 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">About</h2>
        <p className="text-gray-700">{user.bio}</p>
      </div>

      {/* Skills Section */}
      <div className="bg-white p-6 mt-4 mx-10 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {user.skills.map(skill => (
            <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{skill}</span>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white p-6 mt-4 mx-10 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-1"><Award size={20}/> Certifications</h2>
        <ul className="list-disc pl-5 text-gray-700">
          {user.certifications.map(cert => <li key={cert}>{cert}</li>)}
        </ul>
      </div>

      {/* Projects */}
      <div className="bg-white p-6 mt-4 mx-10 rounded-lg shadow mb-10">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-1"><Code size={20}/> Projects</h2>
        <ul className="list-disc pl-5 text-gray-700">
          {user.projects.map(project => <li key={project}>{project}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default LinkedinProfile;
