import axios from '../cookiescheker';

const apiBase = import.meta.env.VITE_API_URL;

export type CommentItem = {
  commentId: string;
  comment: string;
  createdAt: string;
  commentlikes?: string[];
  user: { _id: string; fullname: string; avatar?: string } | null;
};

export async function toggleLike(postId: string) {
  const res = await axios.post(`${apiBase}/api/v1/posts/${postId}/like`, {}, { withCredentials: true });
  return res.data?.data as { likesCount: number; commentsCount: number; views: number; isLiked: boolean };
}

export async function getComments(postId: string, page = 1, limit = 10) {
  const res = await axios.get(`${apiBase}/api/v1/posts/${postId}/comments`, {
    params: { page, limit },
    withCredentials: true,
  });
  return res.data?.data as { items: CommentItem[]; total: number; page: number; limit: number };
}

export async function addComment(postId: string, comment: string) {
  const res = await axios.post(
    `${apiBase}/api/v1/posts/${postId}/comments`,
    { comment },
    { withCredentials: true }
  );
  return res.data?.data as CommentItem;
}

export async function incrementView(postId: string) {
  const res = await axios.post(`${apiBase}/api/v1/posts/${postId}/view`, {}, { withCredentials: true });
  return res.data?.data as { views: number };
}
