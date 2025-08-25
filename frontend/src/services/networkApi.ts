import axios from 'axios';

const RAW_API = import.meta.env.VITE_API_URL as string | undefined;
const API_BASE_URL = RAW_API ? RAW_API.replace(/\/+$/, '') : '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export interface NetworkStats {
  connections: number;
  pendingInvitations: number;
  followers: number;
  following: number;
}

export interface Connection {
  _id: string;
  fullname: string;
  email: string;
  year: number;
  avatar?: string;
  skills?: string[];
  bio?: string;
  linkedin?: string;
  github?: string;
  leetcode?: string;
  followers?: string[];
  following?: string[];
  isOnline?: boolean;
  lastActive?: string;
}

export interface ConnectionSuggestion extends Connection {
  mutualConnections: number;
  reason: string;
}

export interface ConnectionRequest {
  _id: string;
  type: string;
  from: Connection;
  date: string;
  read: boolean;
}

export const networkApi = {
  // Get network statistics
  getNetworkStats: async () => {
    const response = await api.get('/users/network-stats');
    return response.data.data;
  },

  // Get user connections
  getConnections: async (search?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const response = await api.get(`/users/connections?${params}`);
    return response.data.data;
  },

  // Get connection suggestions
  getConnectionSuggestions: async (search?: string, limit = 10) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', limit.toString());
    
    const response = await api.get(`/users/connection-suggestions?${params}`);
    return response.data.data;
  },

  // Get pending connection requests  
  getPendingRequests: async () => {
    const response = await api.get('/users/pending-requests');
    return response.data.data;
  },

  // Send connection request
  sendConnectionRequest: async (targetUserId: string) => {
    const response = await api.post(`/users/${targetUserId}/request-follow`);
    return response.data;
  },

  // Accept connection request
  acceptConnectionRequest: async (userId: string) => {
    const response = await api.post(`/users/${userId}/accept-follow`);
    return response.data;
  },

  // Decline connection request
  declineConnectionRequest: async (userId: string) => {
    const response = await api.post(`/users/${userId}/reject-follow`);
    return response.data;
  }
};
