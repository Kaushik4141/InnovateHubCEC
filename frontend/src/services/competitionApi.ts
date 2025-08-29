import api from './api.ts';

export interface Competition {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  link: string;
  coverImage?: string;
  aplliedBy?: string[];
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

export const competitionApi = {
  listCompetitions: async () => {
    const response = await api.get('/competitions');
    //console.log(response.data);
    return response.data;
  },

  getCompetitionDetails: async (id: string) => {
    const response = await api.get(`/competitions/${id}/details`);
    return response.data;
  },

  applyToCompetition: async (id: string) => {
    const response = await api.post(`/competitions/${id}/apply`);
    return response.data;
  },

  createCompetition: async (formData: FormData) => {
    const response = await api.post('/competitions/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteCompetition: async (id: string) => {
    const response = await api.delete(`/competitions/${id}/delete`);
    return response.data;
  },
};