import api from './api.ts';

export interface Competition {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  link: string;
  coverImage?: string;
  teamsize?: string;
  Prize?: string;
  Tag?: string;
  Reqirements?: string;
  isTeamEvent?: boolean;
  aplliedBy?: string[];
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

export const competitionApi = {
  listCompetitions: async () => {
    const response = await api.get('api/v1/competitions');
    //console.log(response.data);
    return response.data;
  },

  getCompetitionDetails: async (id: string) => {
    const response = await api.get(`api/v1/competitions/${id}/details`);
    return response.data;
  },

  applyToCompetition: async (id: string) => {
    const response = await api.post(`api/v1/competitions/${id}/apply`);
    return response.data;
  },

  createCompetition: async (formData: FormData) => {
    const response = await api.post('api/v1/competitions/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteCompetition: async (id: string) => {
    const response = await api.delete(`api/v1/competitions/${id}/delete`);
    return response.data;
  },
  
  getCompetitionParticipants: async (id: string) => {
    const response = await api.get(`api/v1/competitions/${id}/details`);
    return response.data;
  },
};

export const teamApi = {
  searchTeams: async (competitionId: string) => {
    const response = await api.get(`api/v1/teams/search?competition=${competitionId}`);
    return response.data;
  },
  
  getTeamDetails: async (teamId: string) => {
    const response = await api.get(`api/v1/teams/details/${teamId}`);
    return response.data;
  }
};

// Mock team data for testing
export const mockTeamData = [
  {
    _id: 'team1',
    name: 'Team Alpha',
    members: [
      { _id: 'user1', fullname: 'Kaushik H S', email: 'kaushik0r0s@gmail.com' },
      { _id: 'user2', fullname: 'test kaush', email: 'k92032398@gmail.com' },
      { _id: 'user3', fullname: 'Chaithra S', email: 'schaithra2006@gmail.com' }
    ],
    leader: { _id: 'user1', fullname: 'Kaushik H S', email: 'kaushik0r0s@gmail.com' },
    competition: 'comp1'
  }
];