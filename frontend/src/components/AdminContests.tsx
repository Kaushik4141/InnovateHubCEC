import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listContests, createContest, Contest } from '../services/contestApi';

const AdminContests: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState(''); // datetime-local
  const [endAt, setEndAt] = useState(''); // datetime-local
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listContests();
      setContests(items);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !startAt || !endAt) {
      alert('Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        title,
        description,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        visibility,
      };
      const c = await createContest(payload);
      // simple reset and refresh
      setTitle('');
      setDescription('');
      setStartAt('');
      setEndAt('');
      setVisibility('public');
      await load();
      // Offer to manage problems immediately
      if (c?._id) navigate(`/admin/contests/${c._id}/problems`);
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || 'Failed to create contest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Admin • Contests</h1>
          <Link to="/admin" className="text-sm text-blue-400 hover:underline">Back to Admin</Link>
        </div>

        <form onSubmit={onCreate} className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-8 space-y-3">
          <div className="text-lg font-medium">Create Contest</div>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />
            <select
              value={visibility}
              onChange={e => setVisibility(e.target.value as any)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <input
              value={startAt}
              onChange={e => setStartAt(e.target.value)}
              type="datetime-local"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />
            <input
              value={endAt}
              onChange={e => setEndAt(e.target.value)}
              type="datetime-local"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 min-h-[90px]"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >Create</button>
            {loading && <span className="text-sm text-gray-400">Working...</span>}
          </div>
        </form>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-lg font-medium mb-3">Existing Contests</div>
          {error && <div className="text-sm text-red-400 mb-3">{error}</div>}
          {loading && <div className="text-sm text-gray-400">Loading...</div>}
          {!loading && contests.length === 0 ? (
            <div className="text-sm text-gray-400">No contests yet.</div>
          ) : (
            <div className="space-y-2">
              {contests.map(c => (
                <div key={c._id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-gray-900 border border-gray-700 rounded px-3 py-2">
                  <div>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-xs text-gray-400">{new Date(c.startAt).toLocaleString()} → {new Date(c.endAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/contests/${c._id}/problems`} className="px-3 py-1.5 text-sm rounded bg-indigo-600 hover:bg-indigo-700">Manage Problems</Link>
                    <Link to={`/contests/${c._id}`} className="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600">View</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContests;
