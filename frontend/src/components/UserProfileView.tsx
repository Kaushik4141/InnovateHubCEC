import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Mail, Phone, Github, Linkedin, Globe,
  Award, MessageCircle, Code, ExternalLink
} from 'lucide-react';

interface User {
  _id: string;
  usn: string;
  fullname: string;
  year: number;
  email: string;
  avatar?: string;
  skills: string[];
  certifications: any[];
  projects: any[];
  phone?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  bio?: string;
}

const LinkedinStyleProfile: React.FC = () => {
  const { fullname } = useParams();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`http://localhost:5000/api/users/${fullname}`);
      setUser(res.data);
    };
    fetchUser();
  }, [fullname]);

  if (!user) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="h-44 bg-blue-800 relative">
          <div className="absolute -bottom-12 left-10">
            <img
              src={user.avatar || '/default-avatar.png'}
              alt="Avatar"
              className="h-28 w-28 rounded-full border-4 border-white object-cover"
            />
          </div>
        </div>
        <div className="pt-16 px-10 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.fullname}</h1>
              <p className="text-sm text-gray-600">USN: {user.usn} • Year: {user.year}</p>
              <p className="text-sm text-gray-500 mt-1">{user.bio || "Student | Tech Enthusiast | Learner"}</p>
              <div className="flex flex-wrap items-center mt-2 gap-3 text-gray-600 text-sm">
                {user.email && (
                  <div className="flex items-center gap-1"><Mail size={16} /> {user.email}</div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-1"><Phone size={16} /> {user.phone}</div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md">Connect</button>
              <button className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-md">More</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="px-10 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="col-span-2 space-y-6">
          {/* About */}
          <div className="bg-white shadow p-5 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">About</h2>
            <p className="text-gray-700">{user.bio || "No bio provided."}</p>
          </div>

          {/* Skills */}
          <div className="bg-white shadow p-5 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-3">
              {user.skills.map((skill, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">{skill}</span>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white shadow p-5 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Projects</h2>
            {user.projects.length > 0 ? (
              <ul className="space-y-3">
                {user.projects.map((proj: any, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Code size={18} className="text-gray-600" />
                    <div>
                      <h3 className="font-medium">{proj.title}</h3>
                      <p className="text-sm text-gray-600">{proj.description}</p>
                      {proj.link && (
                        <a href={proj.link} target="_blank" className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1">
                          View <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No projects added.</p>
            )}
          </div>

          {/* Certifications */}
          <div className="bg-white shadow p-5 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Certifications</h2>
            {user.certifications.length > 0 ? (
              <ul className="space-y-3">
                {user.certifications.map((cert: any, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Award size={18} className="text-yellow-600" />
                    <div>
                      <h3 className="font-medium">{cert.title}</h3>
                      <p className="text-sm text-gray-600">{cert.organization}</p>
                      {cert.link && (
                        <a href={cert.link} target="_blank" className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1">
                          Verify <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No certifications listed.</p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="space-y-6">
          <div className="bg-white shadow p-5 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Info</h2>
            <ul className="space-y-2 text-gray-700">
              {user.github && (
                <li className="flex items-center gap-2"><Github size={18} /> <a href={user.github} target="_blank" className="hover:underline">{user.github}</a></li>
              )}
              {user.linkedin && (
                <li className="flex items-center gap-2"><Linkedin size={18} /> <a href={user.linkedin} target="_blank" className="hover:underline">{user.linkedin}</a></li>
              )}
              {user.website && (
                <li className="flex items-center gap-2"><Globe size={18} /> <a href={user.website} target="_blank" className="hover:underline">{user.website}</a></li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedinStyleProfile;
