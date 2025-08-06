import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface AddPostProps {
  onSuccess?: () => void;
}

const AddPost: React.FC<AddPostProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [postFile, setPostFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPostFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!postFile || !description) {
      setError('File and description are required.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('postFile', postFile);
      formData.append('description', description);
      if (tags) {
        tags.split(',').map(tag => formData.append('tags', tag.trim()));
      }
      await axios.post(`${apiBase}/api/v1/posts/uploadPost`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setPostFile(null);
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
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-white mb-2">Add Project</h2>
      <input
        type="file"
        accept="*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full px-3 py-2 rounded bg-gray-700 text-white"
        rows={3}
        required
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
  );
};

export default AddPost; 