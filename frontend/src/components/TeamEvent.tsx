import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, UserPlus, Link, Search, Check, X, Copy, UserCheck, ChevronDown, ChevronUp, User, UserX, LogOut } from 'lucide-react';
import { competitionApi } from '../services/competitionApi';
import teamApi, { Team } from '../services/teamApi';
import { getCurrentUser } from '../services/userApi';

const TeamEvent = () => {
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [competition, setCompetition] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [isLeader, setIsLeader] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showSearchTeams, setShowSearchTeams] = useState(false);
  const [showJoinViaLink, setShowJoinViaLink] = useState(false);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Team[]>([]);
  const [invitationLink, setInvitationLink] = useState('');
  const [joinLink, setJoinLink] = useState('');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [userId, setUserId] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!competitionId) return;
      
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await getCurrentUser();
        const currentUser = userResponse;
        setUserId(currentUser._id);
        
        // Get competition details
        const competitionResponse = await competitionApi.getCompetitionDetails(competitionId);
        const competitionData = competitionResponse.data;
        setCompetition(competitionData);
        
        if (!competitionData.isTeamEvent) {
          navigate(`/competitions/${competitionId}`);
          return;
        }
        
        // Get teams for this competition
        const teamsResponse = await teamApi.getTeamsByCompetition(competitionId);
        const teamsData = teamsResponse.data;
        
        setTeams(teamsData);
        
        // Check if user is already in a team
        const userTeamData = teamsData.find((team: Team) => 
          team.leader === currentUser._id || team.members.includes(currentUser._id)
        );
        
        if (userTeamData) {
          // Always fetch detailed team info to get populated user data
          const teamDetails = await teamApi.getTeam(userTeamData._id as string);
          const detailedTeam = teamDetails.data;
          
          setUserTeam(detailedTeam);
          setIsLeader(detailedTeam.leader._id === currentUser._id);
          
          // If user is leader, set pending requests
          if (detailedTeam.leader._id === currentUser._id) {
            setPendingRequests(detailedTeam.pendingRequests || []);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load team event data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [competitionId, navigate]);
  
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }
    
    try {
      const response = await teamApi.createTeam({
        name: teamName,
        maxMembers
      }, competitionId as string);
      
      setUserTeam(response.data);
      setIsLeader(true);
      setShowCreateTeam(false);
      setTeams([...teams, response.data]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create team');
    }
  };
  
  const handleGenerateLink = async () => {
    if (!userTeam?._id) return;
    
    try {
      const response = await teamApi.generateInvitationLink(userTeam._id);
      // The backend returns invitationCode, not invitationLink
      const invitationCode = response.data.invitationCode;
      // Create a shareable link with the invitation code
      const baseUrl = window.location.origin;
      const shareableLink = `${baseUrl}/join-team?code=${invitationCode}`;
      setInvitationLink(shareableLink);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate invitation link');
    }
  };
  
  const handleJoinViaLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinLink.trim()) {
      setError('Invitation link is required');
      return;
    }
    
    try {
      await teamApi.joinViaLink(joinLink);
      setError(null);
      // Show success message
      alert('Request to join team sent successfully! The team leader will review your request.');
      setShowJoinViaLink(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join team');
    }
  };
  
  const handleRemoveMember = async (memberId: string) => {
    if (!userTeam?._id) return;
    
    if (!confirm('Are you sure you want to remove this member from the team?')) {
      return;
    }
    
    try {
      await teamApi.removeMember(userTeam._id, memberId);
      // Refresh team data
      const response = await teamApi.getTeam(userTeam._id);
      setUserTeam(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };
  
  const handleSearchTeams = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Search query is required');
      return;
    }
    
    try {
      const response = await teamApi.searchTeams(searchQuery, competitionId);
      setSearchResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search teams');
    }
  };
  
  const handleRequestToJoin = async (teamId: string) => {
    try {
      await teamApi.requestToJoin(teamId);
      setError(null);
      // Show success message
      alert('Request sent successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send join request');
    }
  };
  
  const handleRespondToRequest = async (userId: string, accept: boolean) => {
    if (!userTeam?._id) return;
    
    try {
      await teamApi.respondToRequest(userTeam._id, userId, accept);
      
      // Update pending requests list
      setPendingRequests(pendingRequests.filter(req => req.user === userId));
      
      // If accepted, refresh team data
      if (accept) {
        const teamResponse = await teamApi.getTeam(userTeam._id as string);
        setUserTeam(teamResponse.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${accept ? 'accept' : 'reject'} request`);
    }
  };
  
  const handleLeaveTeam = async () => {
    if (!userTeam?._id) return;
    
    if (window.confirm('Are you sure you want to leave this team?')) {
      try {
        await teamApi.leaveTeam(userTeam._id);
        setUserTeam(null);
        setIsLeader(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to leave team');
      }
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (!competition?.isTeamEvent) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-400 mb-2">This is not a team event</h3>
        <button 
          onClick={() => navigate(`/competitions/${competitionId}`)}
          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Back to Competition
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">{competition?.title} - Team Event</h1>
        <button 
          onClick={() => navigate(`/competitions/${competitionId}`)}
          className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Back to Competition
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {!userTeam ? (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Join or Create a Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 flex flex-col items-center hover:border-purple-500 transition-colors duration-300">
              <UserPlus className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Create a Team</h3>
              <p className="text-gray-400 text-center mb-4">Start your own team and become the leader</p>
              <button 
                onClick={() => setShowCreateTeam(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 w-full transition-colors duration-200"
              >
                Create Team
              </button>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 flex flex-col items-center hover:border-purple-500 transition-colors duration-300">
              <Search className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Find a Team</h3>
              <p className="text-gray-400 text-center mb-4">Search for teams and request to join</p>
              <button 
                onClick={() => setShowSearchTeams(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 w-full transition-colors duration-200"
              >
                Search Teams
              </button>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 flex flex-col items-center hover:border-purple-500 transition-colors duration-300">
              <Link className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Join via Link</h3>
              <p className="text-gray-400 text-center mb-4">Use an invitation link to join a team</p>
              <button 
                onClick={() => setShowJoinViaLink(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 w-full transition-colors duration-200"
              >
                Enter Link
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">{userTeam.name}</h2>
              <p className="text-gray-400 flex items-center gap-2">
                {isLeader ? 
                  <><UserCheck className="h-4 w-4 text-purple-500" /> You are the team leader</> : 
                  <><Users className="h-4 w-4 text-purple-500" /> You are a team member</>}
              </p>
            </div>
            <button 
              onClick={handleLeaveTeam}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Leave Team
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Team Members <span className="text-purple-500 font-bold">({userTeam.members.length}/{userTeam.maxMembers})</span>
            </h3>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner">
              {userTeam.members.map((member: any, index: number) => {
                const isLeaderMember = member._id === userTeam.leader._id ;
                const memberId = member._id || member;
                const memberName = member.fullname || `Member ${index + 1}`;
                const isCurrentUser = memberId === userId;
                
                return (
                  <div key={index} className="flex items-center justify-between mb-2 last:mb-0">
                    <div className="flex items-center">
                      {isLeaderMember ? (
                        <UserCheck className="h-5 w-5 text-purple-500 mr-2" />
                      ) : (
                        <Users className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span className={`${isLeaderMember ? 'text-white' : 'text-gray-300'}`}>
                        {isCurrentUser ? 
                          `You${isLeaderMember ? ' (Leader)' : ''}` : 
                          `${memberName}${isLeaderMember ? ' (Leader)' : ''}`}
                      </span>
                    </div>
                    
                    {isLeader && !isCurrentUser && !isLeaderMember && (
                      <button 
                        onClick={() => handleRemoveMember(memberId)}
                        className="text-red-500 hover:text-red-400"
                        title="Remove member"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {isLeader && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <Link className="h-5 w-5 text-purple-500" />
                  Invitation Link
                </h3>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner">
                  {invitationLink ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400 mb-2">Share this link with others to request to join your team:</p>
                      <div className="flex items-center">
                        <input 
                          type="text" 
                          value={invitationLink} 
                          readOnly 
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-3 py-2 text-white" 
                        />
                        <button 
                          onClick={() => copyToClipboard(invitationLink)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 flex items-center transition-colors duration-200"
                          title="Copy to clipboard"
                        >
                          {linkCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Note: Users joining via this link will need your approval</p>
                    </div>
                  ) : (
                    <button 
                      onClick={handleGenerateLink}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 w-full flex items-center justify-center gap-2 transition-colors duration-200"
                    >
                      <Link className="h-5 w-5" /> Generate Invitation Link
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-purple-500" />
                    Pending Requests {pendingRequests.length > 0 && (
                      <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                        {pendingRequests.length}
                      </span>
                    )}
                  </h3>
                  <button 
                    onClick={() => setShowPendingRequests(!showPendingRequests)}
                    className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors duration-200"
                  >
                    {showPendingRequests ? (
                      <><ChevronUp className="h-4 w-4" /> Hide</>
                    ) : (
                      <><ChevronDown className="h-4 w-4" /> Show</>
                    )}
                  </button>
                </div>
                
                {showPendingRequests && (
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner">
                    {pendingRequests.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <UserX className="h-12 w-12 text-gray-600 mb-2" />
                        <p className="text-gray-400">No pending requests</p>
                        <p className="text-xs text-gray-500 mt-1">When users request to join your team, they'll appear here</p>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {pendingRequests.map((request: any) => (
                          <li key={request._id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors duration-200">
                            <div className="flex items-center gap-2">
                              <User className="h-5 w-5 text-gray-400" />
                              <div>
                                <span className="text-white font-medium">{request.user.fullname || request.user.name || 'User'}</span>
                                {request.user.email && (
                                  <p className="text-xs text-gray-400">{request.user.email}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleRespondToRequest(request.user, true)}
                                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                                title="Accept"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleRespondToRequest(request.user, false)}
                                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-60" onClick={() => setShowCreateTeam(false)}></div>
          <div className="relative bg-gray-900 border border-gray-700 rounded-xl w-11/12 max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Create a Team</h3>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowCreateTeam(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Team Name</label>
                <input 
                  type="text" 
                  value={teamName} 
                  onChange={(e) => setTeamName(e.target.value)} 
                  required 
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Maximum Members</label>
                <input 
                  type="number" 
                  min="2" 
                  max="10" 
                  value={maxMembers} 
                  onChange={(e) => setMaxMembers(parseInt(e.target.value))} 
                  required 
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" 
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateTeam(false)} 
                  className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Search Teams Modal */}
      {showSearchTeams && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-60" onClick={() => setShowSearchTeams(false)}></div>
          <div className="relative bg-gray-900 border border-gray-700 rounded-xl w-11/12 max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Search Teams</h3>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowSearchTeams(false)}>✕</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSearchTeams} className="mb-6">
                <div className="flex">
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search by team name" 
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l text-white" 
                  />
                  <button 
                    type="submit" 
                    className="bg-purple-600 text-white px-4 py-2 rounded-r hover:bg-purple-700"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>
              
              {searchResults.length > 0 ? (
                <ul className="space-y-3">
                  {searchResults.map((team) => (
                    <li key={team._id} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-medium">{team.name}</h4>
                          <p className="text-gray-400 text-sm">{team.members.length + 1}/{team.maxMembers} members</p>
                        </div>
                        <button 
                          onClick={() => handleRequestToJoin(team._id as string)}
                          className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm"
                        >
                          Request to Join
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : searchQuery ? (
                <p className="text-gray-400 text-center">No teams found</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
      
      {/* Join via Link Modal */}
      {showJoinViaLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-60" onClick={() => setShowJoinViaLink(false)}></div>
          <div className="relative bg-gray-900 border border-gray-700 rounded-xl w-11/12 max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Join via Invitation Link</h3>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowJoinViaLink(false)}>✕</button>
            </div>
            <form onSubmit={handleJoinViaLink} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Invitation Link</label>
                <input 
                  type="text" 
                  value={joinLink} 
                  onChange={(e) => setJoinLink(e.target.value)} 
                  required 
                  placeholder="Paste invitation link here" 
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" 
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowJoinViaLink(false)} 
                  className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamEvent;