import axios from '../cookiescheker';

export type Room = { _id: string; name: string; isPrivate: boolean };
export type Contact = { user: { _id: string; fullname: string; avatar?: string }, lastMessage?: any, online: boolean };
export type Message = {
  _id?: string;
  sender: any;
  roomId?: string | null;
  receiverUser?: string | null;
  content: string;
  type: 'text'|'image'|'video';
  createdAt?: string;
  replyTo?: { _id: string; content: string; type: 'text'|'image'|'video'; sender?: any; createdAt?: string } | null;
  clientId?: string | null;
};

export async function listRooms() {
  const { data } = await axios.get('/api/v1/chat/rooms', { withCredentials: true });
  return data?.data as Room[];
}

export async function listContacts() {
  const { data } = await axios.get('/api/v1/chat/private/contacts', { withCredentials: true });
  return data?.data as Contact[];
}

export async function getRoomMessages(roomId: string, before?: string, limit = 50) {
  const { data } = await axios.get(`/api/v1/chat/rooms/${roomId}/messages`, { params: { before, limit }, withCredentials: true });
  return data?.data as Message[];
}

export async function getPrivateMessages(userId: string, before?: string, limit = 50) {
  const { data } = await axios.get(`/api/v1/chat/private/${userId}/messages`, { params: { before, limit }, withCredentials: true });
  return data?.data as Message[];
}

export async function uploadChatFile(file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await axios.post('/api/v1/chat/upload', form, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
  return data?.data as { url: string; type: 'image'|'video' };
}
