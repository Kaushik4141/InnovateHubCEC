import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface MentorApplication {
  _id: string;
  fullName: string;
  email: string;
  specialization: string;
  expertise?: string[];
  experienceYears?: string;
  availability?: string;
  whySuitable: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

const Admin = () => {
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const [apps, setApps] = useState<MentorApplication[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${apiBase}/api/v1/mentors/applications`, {
        params: { status: statusFilter },
        withCredentials: true,
      });
      const data = res.data?.data || [];
      setApps(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load applications');
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    try {
      await axios.post(`${apiBase}/api/v1/mentors/applications/${id}/${action}`, {}, { withCredentials: true });
      setApps(prev => prev.map(a => a._id === id ? { ...a, status: action === 'approve' ? 'approved' : 'rejected' } : a));
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || `Failed to ${action}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Admin • Mentor Applications</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/competitions')}
              className="px-3 py-1.5 text-sm rounded bg-purple-600 hover:bg-purple-700"
            >Competitions Admin</button>
            <button
              onClick={() => navigate('/admin/contests')}
              className="px-3 py-1.5 text-sm rounded bg-indigo-600 hover:bg-indigo-700"
            >Contests Admin</button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-gray-400">Filter:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
          <button onClick={load} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm hover:bg-gray-700">Refresh</button>
        </div>

        {loading && <div className="text-sm text-gray-400">Loading...</div>}
        {error && <div className="text-sm text-red-400 mb-3">{error}</div>}

        <div className="space-y-3">
          {apps.length === 0 && !loading ? (
            <div className="text-sm text-gray-400">No applications.</div>
          ) : (
            apps.map(app => (
              <div key={app._id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="font-medium text-lg">{app.fullName}</div>
                    <div className="text-sm text-gray-400">{app.email}</div>
                    <div className="text-sm text-gray-400">{app.specialization}</div>
                    {app.expertise?.length ? (
                      <div className="text-xs text-gray-500 mt-1">Expertise: {app.expertise.join(', ')}</div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded border ${app.status === 'pending' ? 'border-yellow-500 text-yellow-400' : app.status === 'approved' ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>{app.status}</span>
                    <button
                      onClick={() => navigate(`/profile/c/${encodeURIComponent(app.fullName)}`)}
                      className="px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700"
                    >View Profile</button>
                    <button
                      onClick={() => act(app._id, 'approve')}
                      disabled={app.status === 'approved'}
                      className="px-3 py-1.5 text-sm rounded bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >Approve</button>
                    <button
                      onClick={() => act(app._id, 'reject')}
                      disabled={app.status === 'rejected'}
                      className="px-3 py-1.5 text-sm rounded bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >Reject</button>
                  </div>
                </div>
                {app.whySuitable && (
                  <p className="text-sm text-gray-300 mt-3 whitespace-pre-wrap">{app.whySuitable}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
