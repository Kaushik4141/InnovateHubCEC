import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { competitionApi, Competition } from '../services/competitionApi';
import { Users } from 'lucide-react';

interface CompetitionWithParticipants extends Competition {
  // Extended competition interface
}

const AdminCompetitions = () => {
  const [competitions, setCompetitions] = useState<CompetitionWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      const response = await competitionApi.listCompetitions();
      setCompetitions(response.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load competitions');
    } finally {
      setLoading(false);
    }
  };

  // No longer need the loadParticipants function as we're navigating to a separate page

  useEffect(() => {
    loadCompetitions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Admin • Competitions</h1>
          <Link to="/admin" className="text-sm text-blue-400 hover:underline">Back to Admin</Link>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading competitions...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-8">{error}</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-medium mb-4">All Competitions</h2>
              {competitions.length === 0 ? (
                <div className="text-gray-400 text-center py-4">No competitions found</div>
              ) : (
                <div className="space-y-3">
                  {competitions.map((competition) => (
                    <div key={competition._id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-gray-900 border border-gray-700 rounded px-3 py-2">
                      <div>
                        <div className="font-medium">{competition.title}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(competition.startDate).toLocaleDateString()} → {new Date(competition.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          Participants: {competition.applicationCount || 0}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/competitions/${competition._id}/participants`}
                          className="px-3 py-1.5 text-sm rounded bg-purple-600 hover:bg-purple-700 flex items-center gap-1"
                        >
                          <Users className="h-4 w-4" />
                          View Participants
                        </Link>
                        <Link to={`/competitions/${competition._id}/team`} className="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600">
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Participants are now displayed on a separate page */}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCompetitions;