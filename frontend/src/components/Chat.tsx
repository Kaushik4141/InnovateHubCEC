import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from './Header';
import {
  Search, Plus, Reply as ReplyIcon, X, Menu, Paperclip, Send, Users,
  Pin, Trash2, Smile, ChevronUp, ChevronDown, ArrowLeft
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import {
  listRooms,
  listContacts,
  getRoomMessages,
  getPrivateMessages,
  uploadChatFile,
  getOrCreateChatThread,
  reactToMessage as reactToMessageApi,
  pinMessage as pinMessageApi,
  unpinMessage as unpinMessageApi,
  type Message as Msg,
  type Room,
  type Contact,
} from '../services/chatApi';
import { getCurrentUser, type CurrentUser, type UserMin } from '../services/userApi';
import MediaLightbox, { type LightboxMedia } from './MediaLightbox';
import UserSearchModal from './UserSearchModal';

const deleteMessageApi = async (messageId: string, forEveryone: boolean) => {
  console.log('deleteMessageApi', messageId, forEveryone);
  return new Promise((r) => setTimeout(r, 400));
};

const Chat: React.FC = () => {
  const { socket, onlineUsers, sendPrivateMessage, sendRoomMessage, joinRoom, leaveRoom } = useChat();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [scope, setScope] = useState<'room' | 'dm'>('room');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [pinnedMessage, setPinnedMessage] = useState<Msg | null>(null);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMedia | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);
  const [openNewModal, setOpenNewModal] = useState(false);
  const [reactionPicker, setReactionPicker] = useState<string | null>(null);
  const [activeDeleteMenu, setActiveDeleteMenu] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Msg[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL;
  const genClientId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const hasAutoOpenedGeneral = useRef(false);

  // Detect mobile device
  const isMobile = window.innerWidth < 768;

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

  const messageDomId = (m: Msg, idx: number) => String((m as any)?._id || (m as any)?.clientId || `idx-${idx}`);

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    if (text.indexOf(' ') === -1 && text.length > maxLength) {
      return text.substring(0, maxLength - 3) + '...';
    }
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > maxLength * 0.7 ? truncated.substring(0, lastSpace) : truncated) + '...';
  };

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roomsData, contactsData, userData] = await Promise.all([
          listRooms(),
          listContacts(),
          getCurrentUser()
        ]);
        
        setRooms(roomsData);
        setContacts(contactsData);
        setCurrentUser(userData);
        
        if (!isMobile && !hasAutoOpenedGeneral.current) {
          const generalRoom = roomsData.find(r => r.name.toLowerCase() === 'general');
          if (generalRoom) {
            hasAutoOpenedGeneral.current = true;
            openRoom(generalRoom._id);
          }
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    const to = searchParams.get('to');
    if (!to) return;
    if (contacts.some(c => c.user._id === to)) {
      setScope('dm');
      setActiveId(to);
      setMobileSidebarOpen(false);
      return;
    }
    (async () => {
      try {
        const chatThread = await getOrCreateChatThread(to);
        const newContact: Contact = {
          user: { 
            _id: chatThread.user._id, 
            fullname: chatThread.user.fullname, 
            avatar: chatThread.user.avatar 
          } as any,
          lastMessage: undefined,
          online: onlineUsers.has(chatThread.user._id),
        } as any;
        setContacts(prev => [newContact, ...prev]);
        setScope('dm');
        setActiveId(chatThread.user._id);
        setMobileSidebarOpen(false);
      } catch (e) {
        console.warn('deep link chat thread creation failed', e);
      }
    })();
  }, [searchParams, contacts, onlineUsers]);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (activeId && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeId]);
  
  useEffect(() => {
    if (!socket) return;
    const onRoom = (msg: Msg) => {
      if (!(scope === 'room' && msg.roomId === activeId)) return;
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
    const onDM = (msg: Msg) => {
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

  useEffect(() => {
    if (!socket) return;
    const onUpdated = (payload: Partial<Msg> & { _id?: string }) => {
      if (!payload || !(payload as any)._id) return;
      setMessages(prev => {
        const idx = prev.findIndex(m => (m as any)._id === (payload as any)._id);
        if (idx === -1) return prev;
        const next = prev.slice();
        next[idx] = { ...next[idx], ...(payload as any) } as any;
        if (Object.prototype.hasOwnProperty.call(payload, 'pinned')) {
          if ((payload as any).pinned) {
            const pinned = next[idx] as Msg;
            setPinnedMessage(pinned);
          } else if ((pinnedMessage as any)?._id === (payload as any)._id) {
            setPinnedMessage(null);
          }
        }
        return next;
      });
    };
    socket.on('messageUpdated', onUpdated);
    return () => {
      socket.off('messageUpdated', onUpdated);
    };
  }, [socket, pinnedMessage]);

  async function openRoom(id: string) {
    if (activeId && scope === 'room') leaveRoom(activeId);
    setScope('room');
    setActiveId(id);
    setMobileSidebarOpen(false);
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
    setMobileSidebarOpen(false);
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
  
  const handleDeleteMessage = async (messageId: string | undefined, forEveryone: boolean) => {
    if (!messageId) return;
    setMessages(prev => prev.filter(m => !((m as any)._id === messageId || (m as any).clientId === messageId)));
    try {
      await deleteMessageApi(messageId, forEveryone);
    } catch (err) {
      console.error('delete failed', err);
    } finally {
      setActiveDeleteMenu(null);
    }
  };
  
  const handlePinMessage = async (message: Msg) => {
    try {
      if (pinnedMessage) {
        setMessages(prev => prev.map(m => ((m as any)._id === (pinnedMessage as any)._id ? { ...m, pinned: false } : m)));
      }
      setMessages(prev => prev.map(m => ((m as any)._id === (message as any)._id ? { ...m, pinned: true } : m)));
      setPinnedMessage({ ...message, pinned: true } as Msg);
      await pinMessageApi((message as any)._id);
    } catch (err) {
      console.error('pin failed', err);
    }
  };
  
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
    const real = messages.find(m => (m as any)._id && (m as any)._id === messageId) as any;
    if (real && real._id) {
      reactToMessageApi(real._id, emoji).catch(() => {});
    }
  };
  
  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c => c.user.fullname.toLowerCase().includes(q));
  }, [contacts, search]);
  
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
  
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setIsSearchActive(false);
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }
    
    const results = messages.filter(msg => 
      msg.type === 'text' && 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
    setIsSearchActive(true);
    
    if (results.length > 0) {
      setCurrentSearchIndex(0);
      jumpToMessage((results[0] as any)._id);
    } else {
      setCurrentSearchIndex(-1);
    }
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

  const closeSearch = () => {
    setIsSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
    setCurrentSearchIndex(-1);
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setReactionPicker(null);
      setActiveDeleteMenu(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleBackToConversations = () => {
    setActiveId(null);
    setMobileSidebarOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      <Header />
      <div className="h-[calc(100vh-64px)] bg-gray-900 text-white flex overflow-hidden">
        {/* Mobile Conversations List (WhatsApp style) */}
        {(!activeId || mobileSidebarOpen) && isMobile && (
          <div className="fixed inset-0 z-50 bg-gray-900 lg:hidden">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-700 bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Chats</h2>
                  <button 
                    onClick={() => setOpenNewModal(true)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Plus className="h-6 w-6" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
              </div>
              
              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {/* Rooms section */}
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-sm uppercase text-gray-400 mb-3 font-medium">Rooms</h3>
                  <ul className="space-y-1">
                    {rooms.map(r => (
                      <li key={r._id}>
                        <button 
                          onClick={() => { 
                            openRoom(r._id); 
                            setMobileSidebarOpen(false); 
                          }} 
                          className="w-full text-left px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                        >
                          <span className="text-purple-400 mr-3 flex-shrink-0">#</span>
                          <span className="truncate text-base">{r.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Direct Messages section */}
                <div className="p-4">
                  <h3 className="text-sm uppercase text-gray-400 mb-3 font-medium">Direct Messages</h3>
                  <ul className="space-y-1">
                    {filteredContacts.map(c => (
                      <li key={c.user._id}>
                        <button 
                          onClick={() => { 
                            openDM(c.user._id); 
                            setMobileSidebarOpen(false); 
                          }} 
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          <div className="relative flex-shrink-0">
                            <span className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${c.online ? 'bg-green-400 ring-2 ring-gray-900' : 'bg-gray-500'}`}></span>
                            <img 
                              src={avatarUrlFrom(c.user._id, c.user.fullname, c.user.avatar)} 
                              alt={c.user.fullname} 
                              className="h-10 w-10 rounded-full object-cover" 
                              onError={(e) => { 
                                (e.currentTarget as HTMLImageElement).onerror = null; 
                                (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); 
                              }} 
                            />
                          </div>
                          <span className="truncate min-w-0 text-base">{c.user.fullname}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 border-r border-gray-800 pt-16 px-4 pb-4 space-y-6 h-full overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" 
              placeholder="Search conversations..." 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase text-gray-400">Rooms</h2>
            <button 
              title="New conversation" 
              onClick={() => setOpenNewModal(true)} 
              className="text-gray-400 hover:text-white p-1 rounded-md"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <ul className="space-y-1">
            {rooms.map(r => (
              <li key={r._id}>
                <button 
                  onClick={() => openRoom(r._id)} 
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center ${scope === 'room' && activeId === r._id ? 'bg-gray-800 ring-1 ring-purple-500/50' : ''}`}
                >
                  <span className="text-purple-400 mr-2 flex-shrink-0">#</span>
                  <span className="truncate min-w-0">{r.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm uppercase text-gray-400">Direct Messages</h2>
              <button 
                title="New" 
                className="text-gray-400 hover:text-white p-1 rounded-md" 
                onClick={() => setOpenNewModal(true)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-1">
              {filteredContacts.map(c => (
                <li key={c.user._id}>
                  <button 
                    onClick={() => openDM(c.user._id)} 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${scope === 'dm' && activeId === c.user._id ? 'bg-gray-800 ring-1 ring-purple-500/50' : ''}`}
                  >
                    <div className="relative flex-shrink-0">
                      <span className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${c.online ? 'bg-green-400 ring-2 ring-gray-900' : 'bg-gray-500'}`}></span>
                      <img 
                        src={avatarUrlFrom(c.user._id, c.user.fullname, c.user.avatar)} 
                        alt={c.user.fullname} 
                        className="h-8 w-8 rounded-full object-cover" 
                        onError={(e) => { 
                          (e.currentTarget as HTMLImageElement).onerror = null; 
                          (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); 
                        }} 
                      />
                    </div>
                    <span className="truncate min-w-0">{c.user.fullname}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-900">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <header className="min-h-[56px] flex items-center justify-between px-3 sm:px-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-20">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isMobile && (
                    <button 
                      className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-800 flex-shrink-0" 
                      onClick={handleBackToConversations}
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                  )}
                  <div className="min-w-0 flex-1">
                    <h1 className="text-base sm:text-lg font-semibold truncate">
                      {selectedConversation.name}
                    </h1>
                    {selectedConversation.online && (
                      <span className="text-xs text-green-400">Active now</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {pinnedMessage && (
                    <button 
                      className="text-gray-400 hover:text-white"
                      onClick={() => jumpToMessage((pinnedMessage as any)._id)}
                      title="Jump to pinned message"
                    >
                      <Pin className="h-4 w-4 sm:h-5 sm:w-5 fill-current text-purple-500" />
                    </button>
                  )}
                  
                  {/* Desktop Search */}
                  <div className="hidden lg:block relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                        if (e.key === 'Escape') closeSearch();
                      }}
                      className="w-40 xl:w-48 pl-8 pr-16 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        <button
                          onClick={() => navigateSearchResults('prev')}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Previous match"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{currentSearchIndex + 1}/{searchResults.length}</span>
                        <button
                          onClick={() => navigateSearchResults('next')}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Next match"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mobile Search Toggle */}
                  <button
                    className="lg:hidden text-gray-400 hover:text-white"
                    onClick={() => setShowMobileSearch(!showMobileSearch)}
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </header>

              {/* Mobile Search Bar */}
              {showMobileSearch && (
                <div className="lg:hidden relative z-10 bg-gray-800 p-3 border-b border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                        if (e.key === 'Escape') closeSearch();
                      }}
                      className="w-full pl-10 pr-20 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        <button
                          onClick={() => navigateSearchResults('prev')}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Previous match"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{currentSearchIndex + 1}/{searchResults.length}</span>
                        <button
                          onClick={() => navigateSearchResults('next')}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Next match"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pinned Message */}
              {pinnedMessage && (
                <div className="p-3 sm:p-4 bg-gray-700 border-b border-gray-600 flex items-center justify-between text-sm text-gray-300 relative z-10">
                  <div 
                    className="flex items-center flex-1 min-w-0 cursor-pointer"
                    onClick={() => jumpToMessage((pinnedMessage as any)._id)}
                  >
                    <Pin className="h-4 w-4 mr-2 flex-shrink-0 text-purple-400" />
                    <p className="truncate">
                      {pinnedMessage.type === 'text' 
                        ? pinnedMessage.content 
                        : `Media: ${pinnedMessage.type}`
                      }
                    </p>
                  </div>
                  <button 
                    onClick={async () => {
                      const id = (pinnedMessage as any)?._id as string | undefined;
                      setPinnedMessage(null);
                      setMessages(prev => prev.map(m => 
                        (m as any)._id === (pinnedMessage as any)._id ? { ...m, pinned: false } : m
                      ));
                      if (id) {
                        try { await unpinMessageApi(id); } catch {}
                      }
                    }} 
                    className="text-gray-400 hover:text-white ml-2 flex-shrink-0"
                    title="Unpin message"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Messages Area */}
              <section ref={messagesRef} className="flex-1 overflow-y-auto p-2 sm:p-4 safe-area-bottom space-y-3 bg-gray-900 relative">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-4">
                    <div className="text-center max-w-sm">
                      <div className="bg-gray-800 p-6 rounded-full inline-flex mb-4">
                        <Send className="h-10 w-10 text-gray-400" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
                      <p className="text-gray-400">Send a message to start the conversation</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = typeof msg.sender === 'string' ? msg.sender === 'me' : (msg.sender as UserMin)?._id === currentUser?._id;
                    const senderName = typeof msg.sender === 'string' ? 'Me' : (msg.sender as UserMin)?.fullname || 'Unknown';
                    const senderAvatar = typeof msg.sender === 'string' ? currentUser?.avatar : (msg.sender as UserMin)?.avatar;
                    const messageId = messageDomId(msg, idx);
                    const isHighlighted = highlightId === ((msg as any)._id || (msg as any).clientId);
                    
                    return (
                      <div
                        key={messageId}
                        data-mid={messageId}
                        className={`flex gap-2 sm:gap-3 group px-1 py-2 ${isMe ? 'justify-end' : 'justify-start'} ${isHighlighted ? 'animate-pulse bg-purple-900/20 rounded-lg' : ''}`}
                      >
                        {!isMe && (
                          <img
                            src={avatarUrlFrom(
                              typeof msg.sender === 'string' ? undefined : (msg.sender as UserMin)?._id,
                              senderName,
                              senderAvatar
                            )}
                            alt={senderName}
                            className="h-8 w-8 rounded-full object-cover flex-shrink-0 mt-1"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).onerror = null;
                              (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png');
                            }}
                          />
                        )}
                        <div className={`max-w-[85%] sm:max-w-[70%] ${isMe ? 'flex flex-col items-end' : ''}`}>
                          {!isMe && <span className="text-xs text-gray-400 mb-1 px-2">{senderName}</span>}
                          
                          {/* Reply context */}
                          {msg.replyTo && (
                            <div className={`bg-gray-800/50 border-l-2 border-purple-500 rounded-tr-lg rounded-br-lg p-2 mb-1 text-sm max-w-full ${isMe ? 'rounded-tl-lg' : 'rounded-tl-lg'}`}>
                              <div className="text-purple-400 text-xs">
                                {typeof msg.replyTo.sender === 'string' 
                                  ? 'Me' 
                                  : (msg.replyTo.sender as UserMin)?.fullname || 'Unknown'}
                              </div>
                              <div className="text-gray-300 truncate">
                                {msg.replyTo.type === 'text' 
                                  ? msg.replyTo.content 
                                  : msg.replyTo.type === 'image' 
                                    ? '📷 Image' 
                                    : msg.replyTo.type === 'video' 
                                      ? '🎥 Video' 
                                      : msg.replyTo.type === 'file' 
                                        ? '📄 File' 
                                        : 'Media'}
                              </div>
                            </div>
                          )}
                          
                          <div className={`relative group/message ${isMe ? 'bg-purple-600' : 'bg-gray-800'} rounded-2xl px-3 sm:px-4 py-2`}>
                            {/* Message content */}
                            {msg.type === 'text' ? (
                              <div className="text-white break-words text-sm sm:text-base leading-relaxed">
                                {msg.content}
                              </div>
                            ) : msg.type === 'image' ? (
                              <img
                                src={normalizeMediaUrl(msg.content)}
                                alt="Shared image"
                                className="max-w-full max-h-48 sm:max-h-64 rounded-lg cursor-pointer"
                                onClick={() => {
                                  setLightboxMedia({ type: 'image', url: normalizeMediaUrl(msg.content) });
                                  setLightboxOpen(true);
                                }}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).onerror = null;
                                  (e.currentTarget as HTMLImageElement).src = '/image-placeholder.png';
                                }}
                              />
                            ) : msg.type === 'video' ? (
                              <video
                                src={normalizeMediaUrl(msg.content)}
                                className="max-w-full max-h-48 sm:max-h-64 rounded-lg"
                                controls
                                preload="metadata"
                              />
                            ) : (
                              <a
                                href={normalizeMediaUrl(msg.content)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
                              >
                                <Paperclip className="h-4 w-4" />
                                <span className="text-sm">Download file</span>
                              </a>
                            )}
                            
                            {/* Message time and status */}
                            <div className={`text-xs mt-1 ${isMe ? 'text-purple-200' : 'text-gray-400'} flex items-center justify-end gap-1`}>
                              {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isMe && (msg as any).status === 'sending' && (
                                <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse"></span>
                              )}
                              {isMe && (msg as any).status === 'sent' && (
                                <span className="h-2 w-2 rounded-full bg-green-400"></span>
                              )}
                            </div>
                            
                            {/* Message actions hover menu - Desktop */}
                            <div className="absolute -top-10 right-2 z-20 opacity-0 group-hover/message:opacity-100 transition-opacity bg-gray-800 rounded-lg shadow-lg border border-gray-700 hidden md:flex">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReplyTo(msg);
                                }}
                                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-l-lg"
                                title="Reply"
                              >
                                <ReplyIcon className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReactionPicker(reactionPicker === messageId ? null : messageId);
                                }}
                                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700"
                                title="React"
                              >
                                <Smile className="h-4 w-4" />
                              </button>
                              
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDeleteMenu(activeDeleteMenu === messageId ? null : messageId);
                                  }}
                                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-r-lg"
                                  title="More options"
                                >
                                  <Menu className="h-4 w-4" />
                                </button>
                                
                                {activeDeleteMenu === messageId && (
                                  <div className="absolute left-0 bottom-full mb-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-30 w-40">
                                    <button
                                      onClick={() => copyMessage(msg.type === 'text' ? msg.content : msg.content)}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded-t-lg"
                                    >
                                      Copy
                                    </button>
                                    <button
                                      onClick={() => handlePinMessage(msg)}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700"
                                    >
                                      {(msg as any).pinned ? 'Unpin' : 'Pin'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMessage((msg as any)._id || (msg as any).clientId, false)}
                                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700"
                                    >
                                      Delete
                                    </button>
                                    {isMe && (
                                      <button
                                        onClick={() => handleDeleteMessage((msg as any)._id || (msg as any).clientId, true)}
                                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg"
                                      >
                                        Delete for everyone
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Reaction picker */}
                          {reactionPicker === messageId && (
                            <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-2 flex gap-2 z-30">
                              {emojis.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReact(messageId, emoji);
                                  }}
                                  className="p-2 hover:bg-gray-700 rounded transition-transform hover:scale-125"
                                >
                                  <span className="text-lg">{emoji}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Reactions display */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="absolute bottom-0 translate-y-full mt-1 flex gap-1 flex-wrap">
                              {Object.entries(msg.reactions).map(([emoji, users]) => (
                                users.length > 0 && (
                                  <div key={emoji} className="bg-gray-800/80 rounded-full px-2 py-1 text-xs flex items-center gap-1">
                                    <span>{emoji}</span>
                                    <span className="text-gray-300">{users.length}</span>
                                  </div>
                                )
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} className="pb-4" />
              </section>
              
              {/* Reply preview */}
              {replyTo && (
                <div className="sticky bottom-16 sm:bottom-20 bg-gray-800 border-t border-gray-700 p-3 flex justify-between items-center mx-2 sm:mx-4 rounded-t-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-purple-400">
                      Replying to {typeof replyTo.sender === 'string' ? 'yourself' : (replyTo.sender as UserMin)?.fullname}
                    </div>
                    <div className="text-sm text-gray-300 truncate">
                      {replyTo.type === 'text' 
                        ? replyTo.content 
                        : replyTo.type === 'image' 
                          ? '📷 Image' 
                          : replyTo.type === 'video' 
                            ? '🎥 Video' 
                            : replyTo.type === 'file' 
                              ? '📄 File' 
                              : 'Media'}
                    </div>
                  </div>
                  <button 
                    onClick={() => setReplyTo(null)} 
                    className="text-gray-400 hover:text-white ml-2 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              {/* Message input */}
              <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-3 sm:p-4 safe-area-bottom">
                <div className="flex items-end gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFile}
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="text-gray-400 hover:text-white p-2 sm:p-3 rounded-full hover:bg-gray-800 flex-shrink-0"
                    title="Attach file"
                  >
                    {uploadingFile ? (
                      <div className="h-5 w-5 border-t-2 border-purple-500 rounded-full animate-spin"></div>
                    ) : (
                      <Paperclip className="h-5 w-5" />
                    )}
                  </button>
                  
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white text-base resize-none max-h-32 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    rows={1}
                    style={{
                      minHeight: '44px',
                    }}
                  />
                  
                  <button
                    onClick={handleSend}
                    disabled={sendingMessage || !input.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white p-2 sm:p-3 rounded-full flex-shrink-0 transition-colors"
                    title="Send message"
                  >
                    {sendingMessage ? (
                      <div className="h-5 w-5 border-t-2 border-white rounded-full animate-spin"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-gray-900">
              {!isMobile && (
                <div className="text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a conversation</h3>
                  <p className="text-gray-500 mb-4 text-sm sm:text-base">Choose a conversation from the sidebar to start messaging</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      
      {/* Media Lightbox */}
      <MediaLightbox
        open={lightboxOpen}
        media={lightboxMedia}
        onClose={() => setLightboxOpen(false)}
      />
      
      {/* User Search Modal */}
      <UserSearchModal
        open={openNewModal}
        onClose={() => setOpenNewModal(false)}
        onSelect={(user) => {
          const existing = contacts.find(c => c.user._id === user._id);
          if (existing) {
            openDM(user._id);
          } else {
            const newContact: Contact = {
              user: { _id: user._id, fullname: user.fullname, avatar: user.avatar } as any,
              lastMessage: undefined,
              online: onlineUsers.has(user._id),
            } as any;
            setContacts(prev => [newContact, ...prev]);
            setScope('dm');
            setActiveId(user._id);
            setMobileSidebarOpen(false);
          }
          setOpenNewModal(false);
        }}
      />
    </div>
  );
};

export default Chat;