import api from './api.ts';

export interface Team {
  _id?: string;
  name: string;
  competitionId: string;
  leader: string;
  members: string[];
  invitationLinks?: string[];
  pendingRequests?: string[];
  maxMembers: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamRequest {
  _id?: string;
  team: string;
  user: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
}

const teamApi = {
  createTeam: async (teamData: Partial<Team>,competitionId: string) => {
 
    const requestData = {
      teamName: teamData.name,
      maxMembers: teamData.maxMembers
    };
    const response = await api.post(`api/v1/teams/${competitionId}/create`, requestData);
    return response.data;
  },

  getTeam: async (teamId: string) => {
    const response = await api.get(`api/v1/teams/details/${teamId}`);
    return response.data;
  },

  getTeamsByCompetition: async (competitionId: string) => {
    const response = await api.get(`api/v1/teams/search?competition=${competitionId}`);
    return response.data;
  },

  generateInvitationLink: async (teamId: string) => {
    const response = await api.post(`api/v1/teams/invite/${teamId}`, {});
    return response.data;
  },

  joinViaLink: async (invitationCode: string) => {
    const response = await api.post('api/v1/teams/join/invitation', { invitationCode });
    return response.data;
  },

  removeMember: async (teamId: string, memberId: string) => {
    const response = await api.post(`api/v1/teams/remove-member/${teamId}`, { memberId });
    return response.data;
  },

  requestToJoin: async (teamId: string) => {
    const response = await api.post(`api/v1/teams/join/request/${teamId}`, {});
    return response.data;
  },

  respondToRequest: async (teamId: string, userId: string, accept: boolean) => {
    const response = await api.post('api/v1/teams/request/respond', { teamId, userId, accept });
    return response.data;
  },

  searchTeams: async (query: string, competitionId?: string) => {
    let url = `api/v1/teams/search?q=${query}`;
    if (competitionId) {
      url += `&competition=${competitionId}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },

  leaveTeam: async (teamId: string) => {
    const response = await api.post(`api/v1/teams/leave/${teamId}`, {});
    return response.data;
  },
};

export default teamApi;