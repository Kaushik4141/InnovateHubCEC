import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from "./Header";

interface AddPostProps {
  onSuccess?: () => void;
}

const AddPost: React.FC<AddPostProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [postFiles, setPostFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [liveLink, setLiveLink] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setPostFiles(filesArray);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!postFiles.length || !description) {
      setError('At least one file and description are required.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      postFiles.forEach(file => {
        formData.append('postFile', file);
      });
      formData.append('description', description);
      if (liveLink) formData.append('liveLink', liveLink);
      if (githubLink) formData.append('githubLink', githubLink);
      if (tags) tags.split(',').forEach(tag => formData.append('tags', tag.trim()));

      await axios.post(`${apiBase}/api/v1/posts/uploadPost`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      setPostFiles([]);
      setDescription('');
      setTags('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add project post');
    } finally {
      setLoading(false);
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/*  Navigation bar (Header) */}
      <Header />

      {/*  Main Form */}
      <div className="p-6">
        <form 
          onSubmit={handleSubmit} 
          className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4 max-w-lg mx-auto"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Add Project</h2>
          <input
            type="file"
            accept="*"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 
                      file:rounded-full file:border-0 file:text-sm file:font-semibold 
                      file:bg-purple-600 file:text-white hover:file:bg-purple-700"
          />
          {postFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {postFiles.map((file, idx) => (
                <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded text-white">{file.name}</span>
              ))}
            </div>
          )}
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white"
            rows={3}
            required
          />
          <input
            type="url"
            value={liveLink}
            onChange={e => setLiveLink(e.target.value)}
            placeholder="Live Demo Link (optional)"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
          />
          <input
            type="url"
            value={githubLink}
            onChange={e => setGithubLink(e.target.value)}
            placeholder="GitHub Repository Link (optional)"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
          />
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Project'}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-2">Project post added successfully!</p>}
        </form>
      </div>
    </div>
  );
};

export default AddPost;
