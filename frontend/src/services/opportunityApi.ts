import api from './api.ts';

export interface Opportunity {
  _id: string;
  job_id: string;
  title: string;
  company: string;
  location: string;
  employment_type: string;
  remote: string;
  salary: string;
  posted_on: string;
  skills: string[];
  good_to_have: string[];
  topics: string[];
  buzzwords: string[];
  rounds?: string;
  cutoff?: string;
  apply_link: string;
  description: string;
  type: 'job' | 'internship';
}

export const opportunityApi = {
  listOpportunities: async (params?: {
    type?: 'all' | 'job' | 'internship';
    q?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.q) searchParams.append('q', params.q);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await api.get(`/api/v1/opportunities?${searchParams}`);
    return response.data;
  }
};