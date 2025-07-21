import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Certification {
  title: string;
  issuer?: string;
  date?: string;
}
interface ProjectItem {
  title: string;
  description?: string;
  link?: string;
  date?: string;
}
interface Achievement {
  title: string;
  description?: string;
  date?: string;
}
interface OtherLink {
  title: string;
  url: string;
}
interface User {
  fullname: string;
  email: string;
  usn: string;
  year: number | string;
  bio?: string;
  skills: string[];
  linkedin?: string;
  github?: string;
  leetcode?: string;
  certifications: Certification[];
  projects: ProjectItem[];
  achievements: Achievement[];
  otherLinks: OtherLink[];
  coverimage?: string;
}

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onSave: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onClose, user, onSave }) => {
  const [editForm, setEditForm] = useState<User>({
    fullname: '',
    email: '',
    usn: '',
    year: '',
    bio: '',
    skills: [],
    linkedin: '',
    github: '',
    leetcode: '',
    certifications: [],
    projects: [],
    achievements: [],
    otherLinks: [],
    coverimage: '',
  });
  const [error, setError] = useState<string | null>(null);
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user) {
      setEditForm({
        fullname: user.fullname || '',
        email: user.email || '',
        usn: user.usn || '',
        year: user.year ? String(user.year) : '',
        bio: user.bio || '',
        skills: user.skills || [],
        linkedin: user.linkedin || '',
        github: user.github || '',
        leetcode: user.leetcode || '',
        certifications: user.certifications || [],
        projects: user.projects || [],
        achievements: user.achievements || [],
        otherLinks: user.otherLinks || [],
        coverimage: user.coverimage || '',
      });
    }
  }, [user, open]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.patch(`${apiBase}/api/v1/users/update-account`, editForm, { withCredentials: true });
      onSave(res.data.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-4 bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Edit Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-1">Full Name</label>
            <input type="text" name="fullname" value={editForm.fullname} onChange={handleEditChange} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">USN</label>
            <input type="text" name="usn" value={editForm.usn} onChange={handleEditChange} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Year</label>
            <input type="number" name="year" value={editForm.year} onChange={handleEditChange} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Email</label>
            <input type="email" name="email" value={editForm.email} onChange={handleEditChange} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-300 mb-1">Bio</label>
            <textarea name="bio" value={editForm.bio} onChange={handleEditChange} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-300 mb-1">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editForm.skills.map((skill, idx) => (
                <span key={idx} className="bg-purple-600 text-white px-3 py-1 rounded-full flex items-center">
                  {skill}
                  <button type="button" className="ml-2 text-xs" onClick={() => setEditForm(f => ({ ...f, skills: f.skills.filter((_, i) => i !== idx) }))}>×</button>
                </span>
              ))}
            </div>
            <input type="text" placeholder="Add skill" className="w-full px-3 py-2 rounded bg-gray-800 text-white" onKeyDown={e => { if (e.key === 'Enter' && e.currentTarget.value) { setEditForm(f => ({ ...f, skills: [...f.skills, e.currentTarget.value] })); e.currentTarget.value = ''; e.preventDefault(); } }} />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">LinkedIn</label>
            <input type="url" name="linkedin" value={editForm.linkedin} onChange={handleEditChange} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">GitHub</label>
            <input type="url" name="github" value={editForm.github} onChange={handleEditChange} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">LeetCode</label>
            <input type="url" name="leetcode" value={editForm.leetcode} onChange={handleEditChange} className="w-full px-3 py-2 rounded bg-gray-800 text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-300 mb-1">Certifications</label>
            {editForm.certifications.map((cert, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" placeholder="Title" value={cert.title} onChange={e => setEditForm(f => { const arr = [...f.certifications]; arr[idx].title = e.target.value; return { ...f, certifications: arr }; })} className="px-2 py-1 rounded bg-gray-800 text-white" />
                <input type="text" placeholder="Issuer" value={cert.issuer || ''} onChange={e => setEditForm(f => { const arr = [...f.certifications]; arr[idx].issuer = e.target.value; return { ...f, certifications: arr }; })} className="px-2 py-1 rounded bg-gray-800 text-white" />
                <button type="button" onClick={() => setEditForm(f => ({ ...f, certifications: f.certifications.filter((_, i) => i !== idx) }))} className="text-xs">×</button>
              </div>
            ))}
            <button type="button" className="bg-purple-600 text-white px-2 py-1 rounded" onClick={() => setEditForm(f => ({ ...f, certifications: [...f.certifications, { title: '', issuer: '' }] }))}>Add Certification</button>
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-300 mb-1">Projects</label>
            {editForm.projects.map((proj, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" placeholder="Title" value={proj.title} onChange={e => setEditForm(f => { const arr = [...f.projects]; arr[idx].title = e.target.value; return { ...f, projects: arr }; })} className="px-2 py-1 rounded bg-gray-800 text-white" />
                <input type="text" placeholder="Description" value={proj.description || ''} onChange={e => setEditForm(f => { const arr = [...f.projects]; arr[idx].description = e.target.value; return { ...f, projects: arr }; })} className="px-2 py-1 rounded bg-gray-800 text-white" />
                <input type="url" placeholder="Link" value={proj.link || ''} onChange={e => setEditForm(f => { const arr = [...f.projects]; arr[idx].link = e.target.value; return { ...f, projects: arr }; })} className="px-2 py-1 rounded bg-gray-800 text-white" />
                <button type="button" onClick={() => setEditForm(f => ({ ...f, projects: f.projects.filter((_, i) => i !== idx) }))} className="text-xs">×</button>
              </div>
            ))}
            <button type="button" className="bg-purple-600 text-white px-2 py-1 rounded" onClick={() => setEditForm(f => ({ ...f, projects: [...f.projects, { title: '', description: '', link: '' }] }))}>Add Project</button>
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-300 mb-1">Achievements</label>
            {editForm.achievements.map((ach, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" placeholder="Title" value={ach.title} onChange={e => setEditForm(f => { const arr = [...f.achievements]; arr[idx].title = e.target.value; return { ...f, achievements: arr }; })} className="px-2 py-1 rounded bg-gray-800 text-white" />
                <input type="text" placeholder="Description" value={ach.description || ''} onChange={e => setEditForm(f => { const arr = [...f.achievements]; arr[idx].description = e.target.value; return { ...f, achievements: arr }; })} className="px-2 py-1 rounded bg-gray-800 text-white" />
                <button type="button" onClick={() => setEditForm(f => ({ ...f, achievements: f.achievements.filter((_, i) => i !== idx) }))} className="text-xs">×</button>
              </div>
            ))}
            <button type="button" className="bg-purple-600 text-white px-2 py-1 rounded" onClick={() => setEditForm(f => ({ ...f, achievements: [...f.achievements, { title: '', description: '' }] }))}>Add Achievement</button>
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-300 mb-1">Other Links</label>
            {editForm.otherLinks.map((link, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" placeholder="Title" value={link.title} onChange={e => setEditForm(f => { const arr = [...f.otherLinks]; arr[idx].title = e.target.value; return { ...f, otherLinks: arr }; })} className="px-2 py-1 rounded bg-gray-800 text-white" />
                <input type="url" placeholder="URL" value={link.url} onChange={e => setEditForm(f => { const arr = [...f.otherLinks]; arr[idx].url = e.target.value; return { ...f, otherLinks: arr }; })} className="px-2 py-1 rounded bg-gray-800 text-white" />
                <button type="button" onClick={() => setEditForm(f => ({ ...f, otherLinks: f.otherLinks.filter((_, i) => i !== idx) }))} className="text-xs">×</button>
              </div>
            ))}
            <button type="button" className="bg-purple-600 text-white px-2 py-1 rounded" onClick={() => setEditForm(f => ({ ...f, otherLinks: [...f.otherLinks, { title: '', url: '' }] }))}>Add Link</button>
          </div>
         
        </div>
        <div className="flex space-x-2 mt-4 justify-end">
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Save</button>
          <button type="button" className="bg-gray-600 text-white px-4 py-2 rounded" onClick={onClose}>Cancel</button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default EditProfileModal; 