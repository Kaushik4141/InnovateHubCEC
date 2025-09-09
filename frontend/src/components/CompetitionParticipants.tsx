import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { competitionApi, Competition, teamApi, mockTeamData } from '../services/competitionApi';
import { Users, ArrowLeft } from 'lucide-react';

interface Participant {
  _id: string;
  fullname: string;
  email: string;
}

interface Team {
  _id: string;
  name: string;
  members: Participant[];
  leader: Participant;
  competition: string;
}

const CompetitionParticipants = () => {
  const { competitionId } = useParams<{ competitionId: string }>();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCompetitionDetails = async () => {
      if (!competitionId) return;

      try {
        setLoading(true);
        const response = await competitionApi.getCompetitionParticipants(competitionId);
        const competitionData = response.data;
        
        setCompetition(competitionData);
        
        if (competitionData && competitionData.aplliedBy) {
          setParticipants(competitionData.aplliedBy);
          
          // If it's a team competition, fetch team information
          if (competitionData.isTeamEvent) {
            try {
                // For testing purposes, use mock data instead of API call
                console.log('Using mock team data for testing');
                setTeams(mockTeamData);
                
                // Uncomment this section when API is ready
                
                // Fetch teams for this competition
                const teamsResponse = await teamApi.searchTeams(competitionId);
                console.log('Teams response:', teamsResponse);
                
                // The API returns data in the format: { success: true, statusCode: 200, data: [...], message: '...' }
                if (teamsResponse.data && Array.isArray(teamsResponse.data)) {
                  console.log('Teams data:', teamsResponse.data);
                  
                  // Fetch full member details for each team
                  const teamsWithMembers = await Promise.all(teamsResponse.data.map(async (team: Team) => {
                    try {
                      const teamDetailsResponse = await teamApi.getTeamDetails(team._id);
                      console.log('Team details response:', teamDetailsResponse);
                      if (teamDetailsResponse.data) {
                        return teamDetailsResponse.data;
                      }
                      return team;
                    } catch (error) {
                      console.error(`Failed to fetch details for team ${team._id}:`, error);
                      return team;
                    }
                  }));
                  console.log('Teams with members:', teamsWithMembers);
                  setTeams(teamsWithMembers);
                } else {
                
                // When using mock data, we don't need this else block
                 // Uncomment this when API is ready
                 
                 // If no teams found or invalid response, create an unassigned team
                 const unassignedParticipants = competitionData.aplliedBy.filter((participant: Participant) => {
                   // Check if participant is not in any team
                   return true; // This would need logic to determine if they're in a team
                 });
                 
                 if (unassignedParticipants.length > 0) {
                   setTeams([{
                     _id: 'unassigned',
                     name: 'Unassigned',
                     members: unassignedParticipants,
                     leader: unassignedParticipants[0],
                     competition: competitionId
                   }]);
                 }
                 
              }
            } catch (teamErr) {
                console.error('Failed to load teams:', teamErr);
                // For testing, still use mock data in case of error
                setTeams(mockTeamData);
                
                // Uncomment this when API is ready
                /*
                // Create an unassigned team with all participants
                setTeams([{
                  _id: 'unassigned',
                  name: 'Unassigned',
                  members: competitionData.aplliedBy,
                  leader: competitionData.aplliedBy[0],
                  competition: competitionId
                }]);
                */
              }
          }
        } else {
          setParticipants([]);
          setTeams([]);
        }
      } catch (err: any) {
        console.error('Failed to load competition details:', err);
        setError(err?.message || 'Failed to load competition details');
      } finally {
        setLoading(false);
      }
    };

    loadCompetitionDetails();
  }, [competitionId]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">
            {competition ? `Participants: ${competition.title}` : 'Competition Participants'}
          </h1>
          <Link to="/admin/competitions" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Competitions
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading participants...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-8">{error}</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">
                  {competition?.isTeamEvent ? 'Teams' : 'Participants'}
                </h2>
                <div className="text-sm text-gray-400">
                  {competition?.isTeamEvent 
                    ? `${teams.length} teams, ${participants.length} participants total` 
                    : `${participants.length} participants total`}
                </div>
              </div>

              {participants.length === 0 ? (
                <div className="text-gray-400 text-center py-4">No participants found</div>
              ) : competition?.isTeamEvent ? (
                // Display participants organized by teams
                <div className="space-y-6">
                  {teams.map((team) => {
                    console.log('Team object:', team);
                    return (
                    <div key={team._id} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                      <h3 className="text-md font-medium mb-3 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {team.name ? team.name : 'Unnamed Team'} ({team.members.length} members)
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {team.members.map((member, index) => (
                              <tr key={member._id} className="hover:bg-gray-700">
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{index + 1}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{member.fullname}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{member.email}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  <button
                                    onClick={() => navigate(`/profile/c/${encodeURIComponent(member.fullname)}`)}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    View Profile
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )})}
                </div>
              ) : (
                // Display participants in a simple table
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {participants.map((participant, index) => (
                        <tr key={participant._id} className="hover:bg-gray-700">
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{index + 1}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{participant.fullname}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{participant.email}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={() => navigate(`/profile/c/${encodeURIComponent(participant.fullname)}`)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionParticipants;