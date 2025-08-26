import { useEffect, useState } from 'react';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

const API_BASE: string = ((import.meta as any).env?.VITE_API_URL as string | undefined) || '';

const MentorApply = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
    specialization: '',
    expertise: '', 
    whySuitable: '',
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/users/current-user`, { credentials: 'include' });
        if (!mounted) return;
        if (!res.ok) return;
        const j = await res.json();
        const u = j?.data || j;
        if (!u) return;
        setForm(f => ({
          ...f,
          fullName: u.fullname || f.fullName,
          email: u.email || f.email,
          linkedin: u.linkedin || f.linkedin,
          github: u.github || f.github,
          portfolio: (Array.isArray(u.otherLinks) && u.otherLinks.length > 0)
            ? (u.otherLinks.find((l: any) => /portfolio|website|site/i.test(l?.title || ''))?.url || u.otherLinks[0]?.url || f.portfolio)
            : f.portfolio,
          expertise: Array.isArray(u.skills) && u.skills.length > 0 ? u.skills.join(', ') : f.expertise,
          whySuitable: f.whySuitable || (u.bio ? `About me: ${u.bio}` : ''),
        }));
      } catch {
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessId(null);

    if (!form.fullName || !form.email || !form.specialization || !form.whySuitable) {
      setError('Please fill in full name, email, specialization and why you are suitable.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        expertise: form.expertise,
        page: 'mentors-apply',
        sent_at: new Date().toISOString(),
      };
      const res = await fetch(`${API_BASE}/api/v1/mentors/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || 'Failed to submit application');
      }
      setSuccessId(json?.data?.id || 'submitted');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Become a Mentor</h1>
              <p className="text-gray-400">Apply to mentor students and share your expertise</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600"
            >
              Go back
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-700 text-red-300 px-3 py-2 rounded">
              {error}
            </div>
          )}

          {successId ? (
            <div className="space-y-4">
              <div className="bg-green-900/30 border border-green-700 text-green-300 px-3 py-2 rounded">
                Your application has been received. ID: {successId}
              </div>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate('/mentors')}
                >
                  Back to Mentors
                </button>
                <button
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
                  onClick={() => { setSuccessId(null); setForm({ ...form, whySuitable: '' }); }}
                >
                  Submit another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Full Name *</label>
                  <input name="fullName" value={form.fullName} onChange={onChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email *</label>
                  <input type="email" name="email" value={form.email} onChange={onChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Phone</label>
                  <input name="phone" value={form.phone} onChange={onChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Specialization *</label>
                  <input name="specialization" value={form.specialization} onChange={onChange}
                    placeholder="e.g., Web Development, AI/ML"
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">LinkedIn</label>
                  <input name="linkedin" value={form.linkedin} onChange={onChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">GitHub</label>
                  <input name="github" value={form.github} onChange={onChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-300 mb-1">Portfolio / Website</label>
                  <input name="portfolio" value={form.portfolio} onChange={onChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Expertise (comma separated)</label>
                  <input name="expertise" value={form.expertise} onChange={onChange}
                    placeholder="React, Node, UI/UX"
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Why are you suitable? *</label>
                <textarea name="whySuitable" value={form.whySuitable} onChange={onChange}
                  rows={5}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
                <button type="button" onClick={() => navigate('/mentors')}
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorApply;
