import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from './Header';
import {
  Search, Plus, Reply as ReplyIcon, X, Menu, Paperclip, Send, Users,
  Pin, Trash2, Smile
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import {
  listRooms,
  listContacts,
  getRoomMessages,
  getPrivateMessages,
  uploadChatFile,
  type Message as Msg,
  type Room,
  type Contact,
} from '../services/chatApi';
import { getCurrentUser, getUserMin, type CurrentUser, type UserMin } from '../services/userApi';
import MediaLightbox, { type LightboxMedia } from './MediaLightbox';
import UserSearchModal from './UserSearchModal';
// --- Mock small server-like API placeholders (replace with your real APIs) ---
const deleteMessageApi = async (messageId: string, forEveryone: boolean) => {
  // Replace with your real API call
  console.log('deleteMessageApi', messageId, forEveryone);
  return new Promise((r) => setTimeout(r, 400));
};
const pinMessageApi = async (messageId: string | undefined) => {
  // Replace with real API call
  console.log('pinMessageApi', messageId);
  return new Promise((r) => setTimeout(r, 400));
};
// -------------------------------------------------------------------------
const Chat: React.FC = () => {
  const { socket, onlineUsers, sendPrivateMessage, sendRoomMessage, joinRoom, leaveRoom } = useChat();
  // lists + selection
  const [rooms, setRooms] = useState<Room[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [scope, setScope] = useState<'room' | 'dm'>('room');
  const [activeId, setActiveId] = useState<string | null>(null); // roomId or userId
  const [messages, setMessages] = useState<Msg[]>([]);
  const [pinnedMessage, setPinnedMessage] = useState<Msg | null>(null);
  // UI state
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMedia | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [onlineUsersOpen, setOnlineUsersOpen] = useState(false);
  const [openNewModal, setOpenNewModal] = useState(false);
  // extra features
  const [reactionPicker, setReactionPicker] = useState<string | null>(null); // messageDomId
  const [activeDeleteMenu, setActiveDeleteMenu] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Msg[]>([]);
  const [searchActive, setSearchActive] = useState(false);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const apiBase = import.meta.env.VITE_API_URL;
  const genClientId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  // helpers
  const avatarUrlFrom = (id?: string, name?: string, avatar?: string) => {
    const isUsable = avatar && (avatar.startsWith('http') || avatar.startsWith('/'));
    const isDefault = avatar && avatar.includes('default_avatar');
    if (!isUsable || isDefault) {
      const seed = id || name || 'user';
      return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&size=64`;
    }
    return (avatar as string) || '';
  };
  const normalizeMediaUrl = (url: string) => {
    if (!url) return url;
    try {
      const u = new URL(url);
      if (u.protocol === 'http:' && (u.hostname === 'res.cloudinary.com' || u.hostname.endsWith('.res.cloudinary.com'))) {
        u.protocol = 'https:';
        return u.toString();
      }
      return url;
    } catch {
      return url.startsWith('http://res.cloudinary.com') ? url.replace(/^http:/, 'https:') : url;
    }
  };
  const initials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  };
  // message unique DOM id: prefer _id (DB id), fallback to clientId, fallback to index
  const messageDomId = (m: Msg, idx: number) => String((m as any)?._id || (m as any)?.clientId || `idx-${idx}`);
  // Smart text truncation that handles long words
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    // Check if it's a long word/URL without spaces
    if (text.indexOf(' ') === -1 && text.length > maxLength) {
      return text.substring(0, maxLength - 3) + '...';
    }
    // Normal truncation for sentences
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > maxLength * 0.7 ? truncated.substring(0, lastSpace) : truncated) + '...';
  };
  // --- Load lists & current user ---
  useEffect(() => {
    listRooms().then(setRooms).catch(() => { });
    listContacts().then(setContacts).catch(() => { });
    getCurrentUser().then(setCurrentUser).catch(() => { });
  }, []);
  // deep-link to ?to= (kept from second snippet)
  useEffect(() => {
    const to = searchParams.get('to');
    if (!to) return;
    if (contacts.some(c => c.user._id === to)) {
      setScope('dm');
      setActiveId(to);
      setShowWelcomeScreen(false);
      return;
    }
    // try to fetch minimal user and add as contact
    (async () => {
      try {
        const u = await getUserMin(to);
        const newContact: Contact = {
          user: { _id: u._id, fullname: u.fullname, avatar: u.avatar } as any,
          lastMessage: undefined,
          online: onlineUsers.has(u._id),
        } as any;
        setContacts(prev => [newContact, ...prev]);
        setScope('dm');
        setActiveId(u._id);
      } catch (e) {
        console.warn('deep link user load failed', e);
      }
    })();
  }, [searchParams, contacts, onlineUsers]);
  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  // focus input when chat opens
  useEffect(() => {
    if (activeId && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeId]);
  // socket listeners for real-time messages (merge of both snippets)
  useEffect(() => {
    if (!socket) return;
    const onRoom = (msg: Msg) => {
      // incoming room message
      if (!(scope === 'room' && msg.roomId === activeId)) return;
      setMessages(prev => {
        // if clientId present, merge update
        if ((msg as any).clientId) {
          const idx = prev.findIndex(p => (p as any).clientId === (msg as any).clientId);
          if (idx !== -1) {
            const next = prev.slice();
            next[idx] = { ...prev[idx], ...msg } as any;
            return next;
          }
        }
        if ((msg as any)._id && prev.some(p => (p as any)._id === (msg as any)._id)) return prev;
        return [...prev, msg];
      });
    };
    const onDM = (msg: Msg) => {
      // incoming private message
      const target = typeof msg.sender === 'string' ? msg.sender : (msg.sender as any)?._id;
      if (!(scope === 'dm' && (msg.receiverUser === activeId || target === activeId))) return;
      setMessages(prev => {
        if ((msg as any).clientId) {
          const idx = prev.findIndex(p => (p as any).clientId === (msg as any).clientId);
          if (idx !== -1) {
            const next = prev.slice();
            next[idx] = { ...prev[idx], ...msg } as any;
            return next;
          }
        }
        if ((msg as any)._id && prev.some(p => (p as any)._id === (msg as any)._id)) return prev;
        return [...prev, msg];
      });
    };
    socket.on('roomMessage', onRoom);
    socket.on('privateMessage', onDM);
    return () => {
      socket.off('roomMessage', onRoom);
      socket.off('privateMessage', onDM);
    };
  }, [socket, scope, activeId]);
  // open room / dm and load history (keeps pinned message logic)
  async function openRoom(id: string) {
    if (activeId && scope === 'room') leaveRoom(activeId);
    setScope('room');
    setActiveId(id);
    setShowWelcomeScreen(false);
    joinRoom(id);
    setLoadingMessages(true);
    try {
      const hist = await getRoomMessages(id);
      setMessages(hist || []);
      const pinned = (hist || []).find(m => (m as any).pinned);
      setPinnedMessage(pinned || null);
    } finally {
      setLoadingMessages(false);
    }
  }
  async function openDM(id: string) {
    if (activeId && scope === 'room') leaveRoom(activeId);
    setScope('dm');
    setActiveId(id);
    setShowWelcomeScreen(false);
    setLoadingMessages(true);
    try {
      const hist = await getPrivateMessages(id);
      setMessages(hist || []);
      const pinned = (hist || []).find(m => (m as any).pinned);
      setPinnedMessage(pinned || null);
    } finally {
      setLoadingMessages(false);
    }
  }
  // send message (room or dm) with optimistic UI
  async function handleSend() {
    if (!input.trim() || !activeId || sendingMessage) return;
    setSendingMessage(true);
    const content = input.trim();
    try {
      if (scope === 'room') {
        const cid = genClientId();
        sendRoomMessage(activeId, content, 'text', (replyTo as any)?._id || null, cid);
        setMessages(prev => [
          ...prev,
          {
            content,
            type: 'text',
            roomId: activeId,
            createdAt: new Date().toISOString(),
            sender: currentUser ? { _id: currentUser._id, fullname: currentUser.fullname, avatar: currentUser.avatar } : 'me',
            clientId: cid,
            replyTo: replyTo
              ? { _id: (replyTo as any)._id, content: replyTo.content, type: replyTo.type, sender: replyTo.sender, createdAt: replyTo.createdAt }
              : undefined,
          } as any,
        ]);
      } else {
        const cid = genClientId();
        sendPrivateMessage(activeId, content, 'text', (replyTo as any)?._id || null, cid);
        setMessages(prev => [
          ...prev,
          {
            content,
            type: 'text',
            receiverUser: activeId,
            createdAt: new Date().toISOString(),
            sender: currentUser ? { _id: currentUser._id, fullname: currentUser.fullname, avatar: currentUser.avatar } : 'me',
            clientId: cid,
            replyTo: replyTo
              ? { _id: (replyTo as any)._id, content: replyTo.content, type: replyTo.type, sender: replyTo.sender, createdAt: replyTo.createdAt }
              : undefined,
          } as any,
        ]);
      }
      setInput('');
      setReplyTo(null);
    } finally {
      setSendingMessage(false);
    }
  }
  // handle file upload and optimistic send
  async function handleFile(e: React.ChangeEvent<HTMLInputElement> | File | undefined) {
    const file = (e && (e as React.ChangeEvent<HTMLInputElement>).target) ? (e as React.ChangeEvent<HTMLInputElement>).target.files?.[0] : (e as File | undefined);
    if (!file || !activeId || uploadingFile) return;
    setUploadingFile(true);
    try {
      const up = await uploadChatFile(file);
      if (scope === 'room') {
        const cid = genClientId();
        sendRoomMessage(activeId, up.url, up.type, (replyTo as any)?._id || null, cid);
        setMessages(prev => [
          ...prev,
          {
            content: up.url,
            type: up.type,
            roomId: activeId,
            createdAt: new Date().toISOString(),
            sender: currentUser ? { _id: currentUser._id, fullname: currentUser.fullname, avatar: currentUser.avatar } : 'me',
            clientId: cid,
            replyTo: replyTo ? { _id: (replyTo as any)._id, content: replyTo.content, type: replyTo.type, sender: replyTo.sender, createdAt: replyTo.createdAt } : undefined,
          } as any,
        ]);
      } else {
        const cid = genClientId();
        sendPrivateMessage(activeId, up.url, up.type, (replyTo as any)?._id || null, cid);
        setMessages(prev => [
          ...prev,
          {
            content: up.url,
            type: up.type,
            receiverUser: activeId,
            createdAt: new Date().toISOString(),
            sender: currentUser ? { _id: currentUser._id, fullname: currentUser.fullname, avatar: currentUser.avatar } : 'me',
            clientId: cid,
            replyTo: replyTo ? { _id: (replyTo as any)._id, content: replyTo.content, type: replyTo.type, sender: replyTo.sender, createdAt: replyTo.createdAt } : undefined,
          } as any,
        ]);
      }
      if ((e as React.ChangeEvent<HTMLInputElement>)?.target) (e as React.ChangeEvent<HTMLInputElement>).target.value = '';
      setReplyTo(null);
    } finally {
      setUploadingFile(false);
    }
  }
  // delete message (optimistic)
  const handleDeleteMessage = async (messageId: string | undefined, forEveryone: boolean) => {
    if (!messageId) return;
    // optimistic remove: matches _id or clientId
    setMessages(prev => prev.filter(m => !((m as any)._id === messageId || (m as any).clientId === messageId)));
    try {
      await deleteMessageApi(messageId, forEveryone);
    } catch (err) {
      console.error('delete failed', err);
      // - optionally you could refetch messages to restore
    } finally {
      setActiveDeleteMenu(null);
    }
  };
  // Pin message for current conversation
  const handlePinMessage = async (message: Msg) => {
    try {
      // Unpin previous pinned message locally
      if (pinnedMessage) {
        setMessages(prev => prev.map(m => ((m as any)._id === (pinnedMessage as any)._id ? { ...m, pinned: false } : m)));
      }
      // Pin selected message locally
      setMessages(prev => prev.map(m => ((m as any)._id === (message as any)._id ? { ...m, pinned: true } : m)));
      setPinnedMessage({ ...message, pinned: true } as Msg);
      await pinMessageApi((message as any)._id);
    } catch (err) {
      console.error('pin failed', err);
    }
  };
  // jump to message in DOM, highlight momentarily
  const jumpToMessage = (id?: string) => {
    if (!id) return;
    const container = messagesRef.current;
    if (!container) return;
    const el = container.querySelector(`[data-mid="${id}"]`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightId(id);
      setTimeout(() => setHighlightId(null), 1200);
    }
  };
  // reaction handling (local only)
  const emojis = ['👍', '❤', '😂', '😮', '😢', '🔥', '👏'];
  const handleReact = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      const mid = (msg as any)._id || (msg as any).clientId;
      if (mid !== messageId) return msg;
      const reactions = { ...(msg as any).reactions || {} } as Record<string, string[]>;
      const users = reactions[emoji] ? [...reactions[emoji]] : [];
      const already = users.includes(currentUser ? currentUser._id : 'me');
      if (already) {
        reactions[emoji] = users.filter(u => u !== (currentUser ? currentUser._id : 'me'));
      } else {
        reactions[emoji] = [...users, (currentUser ? currentUser._id : 'me')];
      }
      return { ...msg, reactions } as Msg;
    }));
    setReactionPicker(null);
  };
  // filtered contacts search
  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c => c.user.fullname.toLowerCase().includes(q));
  }, [contacts, search]);
  // selectedConversation meta (for header)
  const selectedConversation = useMemo(() => {
    if (!activeId) return null;
    if (scope === 'room') {
      const r = rooms.find(rr => rr._id === activeId);
      return { id: activeId, name: r?.name || 'Room', role: 'Room', avatar: r?.name?.slice(0, 2).toUpperCase() || 'R' };
    } else {
      const c = contacts.find(cc => cc.user._id === activeId);
      return { id: activeId, name: c?.user?.fullname || 'User', role: 'Direct Message', avatar: initials(c?.user?.fullname) || 'U', online: onlineUsers.has(activeId) };
    }
  }, [activeId, scope, rooms, contacts, onlineUsers]);
  // when messages loaded we optionally scroll to bottom (some places also set pinned message earlier)
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);
  // Attempt to set a default selection when contacts available (like second snippet)
  // Search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchActive(false);
      setSearchResults([]);
      return;
    }
    
    const results = messages.filter(msg => 
      msg.type === 'text' && 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
    setSearchActive(true);
    setCurrentSearchIndex(-1);
  };
  const navigateSearchResults = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentSearchIndex + 1) % searchResults.length;
    } else {
      newIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    }
    
    setCurrentSearchIndex(newIndex);
    jumpToMessage((searchResults[newIndex] as any)._id);
  };
  // Copy message to clipboard
  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };
  // ----- Render -----
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="h-[calc(100vh-64px)] sm:h-[calc(100vh-72px)] bg-gray-900 text-white flex overflow-hidden">
        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 bg-gray-900 border-r border-gray-800 pt-16 px-4 pb-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm uppercase text-gray-400">Chats</h2>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-full bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-1 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="Search conversations..." />
                </div>
              </div>
              <div>
                <h2 className="text-sm uppercase text-gray-400 mb-2">Rooms</h2>
                <ul className="space-y-1">
                  {rooms.map(r => (
                    <li key={r._id}>
                      <button onClick={() => { openRoom(r._id); setMobileSidebarOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center ${scope === 'room' && activeId === r._id ? 'bg-gray-800 ring-1 ring-purple-500/50' : ''}`}>
                        <span className="text-purple-400 mr-2">#</span>
                        <span className="truncate">{r.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <h2 className="text-sm uppercase text-gray-400 mb-2">Direct Messages</h2>
                <ul className="space-y-1">
                  {filteredContacts.map(c => (
                    <li key={c.user._id}>
                      <button onClick={() => { openDM(c.user._id); setMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${scope === 'dm' && activeId === c.user._id ? 'bg-gray-800 ring-1 ring-purple-500/50' : ''}`}>
                        <div className="relative flex-shrink-0">
                          <span className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${c.online ? 'bg-green-400 ring-2 ring-gray-900' : 'bg-gray-500'}`}></span>
                          <img src={avatarUrlFrom(c.user._id, c.user.fullname, c.user.avatar)} alt={c.user.fullname} className="h-8 w-8 rounded-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); }} />
                        </div>
                        <span className="truncate min-w-0">{c.user.fullname}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        {/* Online Users Mobile Drawer */}
        {onlineUsersOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOnlineUsersOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-64 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm uppercase text-gray-400">Online Users</h2>
                <button onClick={() => setOnlineUsersOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-full bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ul className="space-y-2">
                {Array.from(onlineUsers).map(id => {
                  const contact = contacts.find(c => c.user._id === id);
                  return (
                    <li key={id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50">
                      <span className="h-2 w-2 rounded-full bg-green-400 flex-shrink-0"></span>
                      {contact ? (
                        <>
                          <img src={avatarUrlFrom(contact.user._id, contact.user.fullname, contact.user.avatar)} alt={contact.user.fullname} className="h-6 w-6 rounded-full object-cover flex-shrink-0" />
                          <span className="text-sm text-gray-300 truncate min-w-0">{contact.user.fullname}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-300 truncate min-w-0">{id}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-72 border-r border-gray-800 pt-16 px-4 pb-4 space-y-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase text-gray-400">Rooms</h2>
            <button title="New conversation" onClick={() => setOpenNewModal(true)} className="text-gray-400 hover:text-white p-1 rounded-md">
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <ul className="space-y-1">
            {rooms.map(r => (
              <li key={r._id}>
                <button onClick={() => openRoom(r._id)} className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center ${scope === 'room' && activeId === r._id ? 'bg-gray-800 ring-1 ring-purple-500/50' : ''}`}>
                  <span className="text-purple-400 mr-2 flex-shrink-0">#</span>
                  <span className="truncate min-w-0">{r.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm uppercase text-gray-400">Direct Messages</h2>
              <button title="New" className="text-gray-400 hover:text-white p-1 rounded-md" onClick={() => setOpenNewModal(true)}><Plus className="h-4 w-4" /></button>
            </div>
            <ul className="space-y-1">
              {filteredContacts.map(c => (
                <li key={c.user._id}>
                  <button onClick={() => openDM(c.user._id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${scope === 'dm' && activeId === c.user._id ? 'bg-gray-800 ring-1 ring-purple-500/50' : ''}`}>
                    <div className="relative flex-shrink-0">
                      <span className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${c.online ? 'bg-green-400 ring-2 ring-gray-900' : 'bg-gray-500'}`}></span>
                      <img src={avatarUrlFrom(c.user._id, c.user.fullname, c.user.avatar)} alt={c.user.fullname} className="h-8 w-8 rounded-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); }} />
                    </div>
                    <span className="truncate min-w-0">{c.user.fullname}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-900">
          <header className="h-14 flex items-center px-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
            <div className="flex flex-col w-full">
              {/* Top row with menu button and conversation name */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button className="md:hidden mr-2 text-gray-300 hover:text-white p-1 rounded-md hover:bg-gray-800 flex-shrink-0" onClick={() => setMobileSidebarOpen(true)} aria-label="Open chats">
                    <Menu className="h-5 w-5" />
                  </button>
                  <h1 className="text-lg font-semibold truncate min-w-0">
                    {showWelcomeScreen ? 'Chat' : (selectedConversation?.name || 'Select a chat')}
                  </h1>
                  {selectedConversation?.online && <span className="text-xs text-green-400 ml-2 flex-shrink-0">Active now</span>}
                </div>
                {!showWelcomeScreen && (
                  <button className="lg:hidden text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800" onClick={() => setOnlineUsersOpen(true)} aria-label="Online users">
                    <Users className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {/* Bottom row with search input - only shown when not in welcome screen */}
              {!showWelcomeScreen && (
                <div className="flex items-center mt-2 w-full">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search messages..."
                      className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  
                  {searchActive && (
                    <div className="flex items-center text-sm text-gray-400 ml-2">
                      <button 
                        onClick={() => navigateSearchResults('prev')} 
                        className="p-1 hover:text-white disabled:opacity-50"
                        disabled={searchResults.length === 0}
                      >
                        &uarr;
                      </button>
                      <span className="mx-1">
                        {searchResults.length > 0 ? `${currentSearchIndex + 1}/${searchResults.length}` : '0/0'}
                      </span>
                      <button 
                        onClick={() => navigateSearchResults('next')} 
                        className="p-1 hover:text-white disabled:opacity-50"
                        disabled={searchResults.length === 0}
                      >
                        &darr;
                      </button>
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setSearchActive(false);
                          setSearchResults([]);
                        }} 
                        className="ml-2 p-1 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>
          
          {/* Messages Area */}
          <section ref={messagesRef} className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 bg-gray-900">
            {showWelcomeScreen && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="bg-gray-800 p-6 rounded-xl text-center max-w-md mx-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Welcome to Chat</h3>
                  <p className="text-sm text-gray-400 mb-4">Connect with your team and friends through rooms and direct messages.</p>
                  <div className="space-y-2 text-xs text-gray-500">
                    <p className="flex items-center justify-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                      Select a room to join group conversations
                    </p>
                    <p className="flex items-center justify-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Start direct messages with contacts
                    </p>
                    <p className="flex items-center justify-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Share files, images, and videos
                    </p>
                  </div>
                  <button 
                    onClick={() => setMobileSidebarOpen(true)}
                    className="md:hidden mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Browse Chats
                  </button>
                </div>
              </div>
            )}
            {loadingMessages && (
              <div className="flex justify-center items-center py-8">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            {/* Pinned message banner */}
            {pinnedMessage && (
              <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-between text-sm text-gray-300 mx-2">
                <div className="flex items-center gap-2 cursor-pointer min-w-0 flex-1" onClick={() => jumpToMessage((pinnedMessage as any)._id)}>
                  <Pin className="h-4 w-4 text-purple-400 flex-shrink-0" />
                  <div className="truncate min-w-0">{pinnedMessage.type === 'text' ? pinnedMessage.content : `Media: ${pinnedMessage.type}`}</div>
                </div>
                <button onClick={() => { setPinnedMessage(null); setMessages(prev => prev.map(m => ((m as any)._id === (pinnedMessage as any)._id ? ({ ...m, pinned: false } as Msg) : m))); }} className="text-gray-400 hover:text-white flex-shrink-0 ml-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {/* Render messages */}
            {messages.length > 0 && messages.map((m, idx) => {
              const senderId = typeof m.sender === 'string' ? m.sender : (m.sender as any)?._id;
              // treat 'me' as own message or match currentUser._id
              const isOwn = currentUser ? (senderId === currentUser._id || senderId === 'me') : (senderId === 'me');
              const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              const avatar = isOwn ? 'ME' : (scope === 'dm' ? (contacts.find(c => c.user._id === activeId)?.user.fullname || 'U') : (typeof m.sender === 'object' && (m.sender as any)?.fullname ? (m.sender as any).fullname[0]?.toUpperCase() : 'U'));
              const other = contacts.find(c => c.user._id === activeId);
              const avatarUrl = scope === 'dm'
                ? (isOwn ? null : avatarUrlFrom(other?.user?._id, other?.user?.fullname, other?.user?.avatar))
                : (typeof m.sender === 'object' ? avatarUrlFrom((m.sender as any)?._id, (m.sender as any)?.fullname, (m.sender as any)?.avatar) : null);
              const mid = messageDomId(m, idx);
              const reactions = (m as any).reactions as Record<string, string[]> | undefined;
              return (
                <div key={mid} data-mid={mid} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group px-2`}>
                  <div className={`flex items-end space-x-2 max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        {typeof avatar === 'string' ? avatar.toString().slice(0, 2) : 'U'}
                      </div>
                    )}
                    <div className={`px-3 py-2 sm:px-4 sm:py-2 rounded-2xl shadow transition-all duration-150 min-w-0 ${isOwn ? 'bg-purple-600 text-white rounded-br-md' : 'bg-gray-800 text-gray-300 rounded-bl-md'} hover:scale-[1.01] ${highlightId === mid ? 'ring-2 ring-purple-400' : ''}`}>
                      {m.replyTo && (
                        <div className={`mb-2 border-l-2 pl-2 sm:pl-3 ${isOwn ? 'border-purple-300' : 'border-purple-500'}`}>
                          <div className="text-xs font-semibold opacity-90 truncate">{(m.replyTo as any)?.sender?.fullname || 'Replied message'}</div>
                          <button type="button" onClick={() => jumpToMessage((m.replyTo as any)?._id)} className="text-left w-full min-w-0">
                            <div className="text-xs opacity-80 truncate hover:underline">
                              {m.replyTo.type === 'text' ? truncateText(m.replyTo.content, 40) : `Media: ${m.replyTo.type}`}
                            </div>
                          </button>
                        </div>
                      )}
                      {m.type === 'image' ? (
                        <img
                          src={normalizeMediaUrl(m.content)}
                          alt="image"
                          className="max-w-full rounded-lg cursor-zoom-in hover:opacity-90 transition max-h-64 object-cover"
                          onClick={() => { setLightboxMedia({ type: 'image', url: normalizeMediaUrl(m.content) }); setLightboxOpen(true); }}
                        />
                      ) : m.type === 'video' ? (
                        <video
                          src={normalizeMediaUrl(m.content)}
                          controls
                          className="max-w-full rounded-lg cursor-zoom-in hover:opacity-90 transition max-h-64"
                          onClick={() => { setLightboxMedia({ type: 'video', url: normalizeMediaUrl(m.content) }); setLightboxOpen(true); }}
                        />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words hyphens-auto min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{m.content}</p>
                      )}
                      {/* Reactions */}
                      {reactions && Object.values(reactions).some(arr => (arr?.length || 0) > 0) && (
                        <div className="flex items-center space-x-1 mt-2 flex-wrap">
                          {Object.entries(reactions).map(([emoji, users]) => (users && users.length > 0) ? (
                            <span key={emoji} className={`text-xs rounded-full px-2 py-0.5 mb-1 ${isOwn ? 'bg-purple-700 text-white' : 'bg-gray-600 text-gray-300'}`}>
                              {emoji} {users.length}
                            </span>
                          ) : null)}
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-gray-500'} text-right`}>{time}</p>
                    </div>
                    {/* action buttons (visible on hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700 flex items-center space-x-1 flex-shrink-0">
                      {/* Reaction picker */}
                      <div className="relative">
                        <button title="React" onClick={() => setReactionPicker(mid)} className="p-1">
                          <Smile className="h-4 w-4" />
                        </button>
                        {reactionPicker === mid && (
                          <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 flex space-x-1 p-2 rounded-full bg-gray-900 shadow-lg border border-gray-700">
                            {emojis.map(emoji => (
                              <button key={emoji} onClick={() => handleReact((m as any)._id || (m as any).clientId || mid, emoji)} className="hover:bg-gray-700 rounded-full p-1 transition-colors">
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button title="Reply" onClick={() => setReplyTo(m)} className="p-1">
                        <ReplyIcon className="h-4 w-4" />
                      </button>
                      <button title="Pin message" onClick={() => handlePinMessage(m)} className="p-1">
                        <Pin className="h-4 w-4" />
                      </button>
                      <div className="relative">
                        <button title="Delete message" onClick={() => setActiveDeleteMenu(mid)} className="p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {activeDeleteMenu === mid && (
                          <div className="absolute z-10 bottom-full left-0 transform -translate-y-2 flex flex-col p-2 rounded-lg bg-gray-900 shadow-lg border border-gray-700 min-w-[180px]">
                            <h4 className="text-xs text-gray-400 px-3 py-1 border-b border-gray-700 mb-1">Delete message</h4>
                            {isOwn ? (
                              <>
                                <button onClick={() => handleDeleteMessage((m as any)._id || (m as any).clientId, false)} className="text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-md">Delete for me</button>
                                <button onClick={() => handleDeleteMessage((m as any)._id || (m as any).clientId, true)} className="text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-md">Delete for everyone</button>
                              </>
                            ) : (
                              <button onClick={() => handleDeleteMessage((m as any)._id || (m as any).clientId, false)} className="text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-md">Delete for me</button>
                            )}
                            <button onClick={() => setActiveDeleteMenu(null)} className="text-left px-3 py-2 mt-1 text-sm text-gray-400 hover:bg-gray-700 rounded-md border-t border-gray-700">Cancel</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </section>
          
          {/* Input Area */}
          <footer className="p-2 sm:p-4 border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
            {replyTo && (
              <div className="mb-3 bg-gray-800/70 border border-gray-700 rounded-lg p-3 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 truncate">Replying to {(replyTo as any)?.sender?.fullname || 'message'}</div>
                  <div className="text-sm truncate mt-1">
                    {replyTo.type === 'text' ? truncateText(replyTo.content, 60) : `Media: ${replyTo.type}`}
                  </div>
                </div>
                <button className="ml-3 text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700 flex-shrink-0" onClick={() => setReplyTo(null)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <label className="text-gray-400 hover:text-white transition-colors cursor-pointer flex-shrink-0">
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={(e) => handleFile(e)} className="hidden" disabled={uploadingFile || !activeId} />
                <span className={`p-2 bg-gray-800 rounded-lg border border-gray-700 flex items-center gap-1 ${uploadingFile || !activeId ? 'opacity-50' : 'hover:bg-gray-700'}`}>
                  {uploadingFile ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
                </span>
              </label>
              <textarea
                ref={inputRef as any}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { 
                  if (e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    handleSend(); 
                  }
                }}
                placeholder={activeId ? 'Type a message...' : 'Select a chat to start messaging'}
                disabled={!activeId}
                rows={1}
                className="flex-1 bg-gray-800 rounded-lg px-4 py-3 outline-none border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 resize-none max-h-32 min-h-[44px]"
                style={{ 
                  height: 'auto',
                  minHeight: '44px',
                  maxHeight: '128px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!activeId || !input.trim() || sendingMessage}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 p-2 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 self-end"
              >
                {sendingMessage ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </footer>
        </main>
        
        {/* Online Users Sidebar - Desktop */}
        <aside className="hidden lg:block w-56 border-l border-gray-800 p-4 h-full overflow-y-auto bg-gray-900">
          <h2 className="text-sm uppercase text-gray-400 mb-3">Online Users ({onlineUsers.size})</h2>
          <ul className="space-y-2">
            {Array.from(onlineUsers).map(id => {
              const contact = contacts.find(c => c.user._id === id);
              return (
                <li key={id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50">
                  <span className="h-2 w-2 rounded-full bg-green-400 flex-shrink-0"></span>
                  {contact ? (
                    <>
                      <img src={avatarUrlFrom(contact.user._id, contact.user.fullname, contact.user.avatar)} alt={contact.user.fullname} className="h-6 w-6 rounded-full object-cover flex-shrink-0" />
                      <span className="text-sm text-gray-300 truncate min-w-0">{contact.user.fullname}</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-300 truncate min-w-0">{id}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>
        
        {/* Floating Action Button for Mobile */}
        {!mobileSidebarOpen && !onlineUsersOpen && (
          <button
            onClick={() => setOpenNewModal(true)}
            className="md:hidden fixed bottom-24 right-6 z-30 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105"
            aria-label="New conversation"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}
        
        <MediaLightbox open={lightboxOpen} media={lightboxMedia} onClose={() => setLightboxOpen(false)} />
      </div>
      <UserSearchModal
        open={openNewModal}
        onClose={() => setOpenNewModal(false)}
        onSelect={(u: UserMin) => {
          const exists = contacts.some(c => c.user._id === u._id);
          if (!exists) {
            const newContact: Contact = {
              user: { _id: u._id, fullname: u.fullname, avatar: u.avatar } as any,
              lastMessage: undefined,
              online: onlineUsers.has(u._id),
            } as any;
            setContacts(prev => [newContact, ...prev]);
          }
          setScope('dm');
          setActiveId(u._id);
          setOpenNewModal(false);
        }}
      />
    </div>
  );
};
export default Chat;