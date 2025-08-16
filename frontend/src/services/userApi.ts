import axios from '../cookiescheker';

export type UserMin = { _id: string; fullname: string; avatar?: string };

const apiBase = import.meta.env.VITE_API_URL;

export async function searchUsers(q: string) {
  const { data } = await axios.get(`${apiBase}/api/v1/users/search`, {
    params: { q },
    withCredentials: true,
  });
  return (data?.data || []) as UserMin[];
}

export async function getUserMin(id: string) {
  const { data } = await axios.get(`${apiBase}/api/v1/users/min/${id}`, {
    withCredentials: true,
  });
  return data?.data as UserMin;
}
