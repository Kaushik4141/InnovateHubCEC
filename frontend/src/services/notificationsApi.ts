import axios from '../cookiescheker';

const apiBase = import.meta.env.VITE_API_URL as string;

export type RawNotification = {
  _id: string;
  type: 'follow-request' | 'other' | string;
  from?: { _id: string; fullname: string; avatar?: string } | string;
  date?: string;
  read?: boolean;
};

export async function getNotifications() {
  const { data } = await axios.get(`${apiBase}/api/v1/users/notifications`, {
    withCredentials: true,
  });
  const list: RawNotification[] = data?.data?.notifications || [];
  return list;
}
