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
};