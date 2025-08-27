import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from './Header';
import { 
  Search, Plus, Reply as ReplyIcon, X, Menu, Paperclip, 
  Smile, Users, Send, Pin, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { listContacts, getPrivateMessages, uploadChatFile, getOrCreateChatThread, reactToMessage as reactToMessageApi, pinMessage as pinMessageApi, unpinMessage as unpinMessageApi, type Message as ChatMsg, type Contact } from '../services/chatApi';
import UserSearchModal from './UserSearchModal';
import { type UserMin } from '../services/userApi';
import MediaLightbox, { type LightboxMedia } from './MediaLightbox';

const deleteMessageApi = async (messageId: string, forEveryone: boolean) => {
  console.log(`Deleting message ${messageId}. For everyone: ${forEveryone}`);
  return new Promise(resolve => setTimeout(resolve, 500));
};

const Messages = () => {
  const { sendPrivateMessage, socket, onlineUsers } = useChat();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [thread, setThread] = useState<ChatMsg[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [openNewModal, setOpenNewModal] = useState(false);
  const [searchParams] = useSearchParams();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMedia | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMsg | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<ChatMsg | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const genClientId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeDeleteMenu, setActiveDeleteMenu] = useState<string | null>(null);
  const [searchMatches, setSearchMatches] = useState<string[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL;
  const avatarUrlFrom = (id?: string, name?: string, avatar?: string) => {
    const isUsable = avatar && (avatar.startsWith('http') || avatar.startsWith('/'));
    const isDefault = avatar && avatar.includes('default_avatar');
    if (!isUsable || isDefault) {
      const seed = id || name || 'user';
      return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&size=64`;
    }
    return avatar as string;
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const list = await listContacts();
        setContacts(list || []);
      } catch (e) {
        console.error('Failed to load contacts', e);
      }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    const to = searchParams.get('to');
    if (!to) return;
    if (selectedChat === to) return;
    const existing = contacts.find(c => c.user._id === to);
    if (existing) {
      setSelectedChat(to);
      return;
    }
    const fetchChatThread = async () => {
      try {
        const chatThread = await getOrCreateChatThread(to);
        const newContact: Contact = {
          user: { 
            _id: chatThread.user._id, 
            fullname: chatThread.user.fullname, 
            avatar: chatThread.user.avatar 
          },
          lastMessage: undefined,
          online: onlineUsers.has(chatThread.user._id),
        } as any;
        setContacts(prev => [newContact, ...prev]);
        setSelectedChat(chatThread.user._id);
      } catch (e) {
        console.error('Failed to get or create chat thread for deep-link', e);
      }
    };
    fetchChatThread();
  }, [searchParams, contacts, onlineUsers, selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;
    const fetchMessages = async () => {
      try {
        const msgs = await getPrivateMessages(selectedChat);
        setThread(msgs || []);
        
        const pinned = (msgs as any[]).find((m) => (m as any).pinned);
        if (pinned) {
          setPinnedMessage(pinned);
        }
      } catch (e) {
        console.error('Failed to load private messages', e);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;
    const onPm = (m: ChatMsg) => {
      if (!selectedChat) return;
      const senderId = typeof m.sender === 'string' ? m.sender : m.sender?._id;
      if (senderId === selectedChat || m.receiverUser === selectedChat) {
        setThread(prev => {
          if ((m as any).clientId) {
            const idx = prev.findIndex(p => (p as any).clientId === (m as any).clientId);
            if (idx !== -1) {
              const next = prev.slice();
              next[idx] = { ...prev[idx], ...m } as any;
              return next;
            }
          }
          if ((m as any)._id && prev.some(p => (p as any)._id === (m as any)._id)) return prev;
          return [...prev, m];
        });
      }
    };
    socket.on('privateMessage', onPm);
    return () => {
      socket.off('privateMessage', onPm);
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    if (!socket) return;
    const onUpdated = (payload: Partial<ChatMsg> & { _id?: string }) => {
      if (!payload || !(payload as any)._id) return;
      setThread(prev => {
        const idx = prev.findIndex(m => (m as any)._id === (payload as any)._id);
        if (idx === -1) return prev;
        const next = prev.slice();
        next[idx] = { ...next[idx], ...(payload as any) } as any;
        if (Object.prototype.hasOwnProperty.call(payload, 'pinned')) {
          if ((payload as any).pinned) {
            setPinnedMessage(next[idx] as any);
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

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [thread]);

  const initials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  };

  const messageDomId = (m: ChatMsg, idx: number) => (m as any)?._id || `idx-${idx}`;

  useEffect(() => {
    if (!messageSearch.trim()) {
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      return;
    }
    const q = messageSearch.toLowerCase();
    const matches = thread
      .filter(m => m.type === 'text' && m.content.toLowerCase().includes(q))
      .map((m, idx) => messageDomId(m, idx));
    setSearchMatches(matches);
    setCurrentMatchIndex(matches.length > 0 ? 0 : 0);
  }, [messageSearch, thread]);

  const handleSendMessage = () => {
    if (!selectedChat) return;
    const content = newMessage.trim();
    if (!content) return;
    const cid = genClientId();
    sendPrivateMessage(selectedChat, content, 'text', (replyTo as any)?._id || null, cid);
    const optimistic: ChatMsg = {
      content,
      type: 'text',
      receiverUser: selectedChat,
      createdAt: new Date().toISOString(),
      sender: 'me',
      clientId: cid,
      replyTo: replyTo
        ? {
            _id: (replyTo as any)._id,
            content: replyTo.content,
            type: replyTo.type,
            sender: replyTo.sender,
            createdAt: replyTo.createdAt,
          }
        : undefined,
    } as any;
    setThread(prev => [...prev, optimistic]);
    setNewMessage('');
    setReplyTo(null);
  };

  const handleUpload = async (file?: File) => {
    if (!file || !selectedChat) return;
    setUploading(true);
    try {
      const up = await uploadChatFile(file);
      const cid = genClientId();
      sendPrivateMessage(selectedChat, up.url, up.type, (replyTo as any)?._id || null, cid);
      const optimistic: ChatMsg = {
        content: up.url,
        type: up.type,
        receiverUser: selectedChat,
        createdAt: new Date().toISOString(),
        sender: 'me',
        clientId: cid,
        replyTo: replyTo
          ? {
              _id: (replyTo as any)._id,
              content: replyTo.content,
              type: replyTo.type,
              sender: replyTo.sender,
              createdAt: replyTo.createdAt,
            }
          : undefined,
      } as any;
      setThread(prev => [...prev, optimistic]);
    } catch (e) {
      console.error('Upload failed', e);
    } finally {
      setUploading(false);
      setReplyTo(null);
    }
  };

  const handleDeleteMessage = async (messageId: string, forEveryone: boolean) => {
    if (!messageId) return;
    try {
      setThread(prev => prev.filter(m => (m as any)._id !== messageId));
      await deleteMessageApi(messageId, forEveryone);
    } catch (error) {
      console.error('Failed to delete message', error);
    } finally {
      setActiveDeleteMenu(null);
    }
  };

  const handlePinMessage = async (message: ChatMsg) => {
    try {
      if (pinnedMessage) {
        setThread(prev => prev.map(m => 
          (m as any)._id === (pinnedMessage as any)._id ? {...m, pinned: false} : m
        ));
      }
      
      setThread(prev => prev.map(m => 
        (m as any)._id === (message as any)._id ? {...m, pinned: true} : m
      ));
      
      setPinnedMessage({...message, pinned: true} as any);
      await pinMessageApi((message as any)._id);
    } catch (error) {
      console.error('Failed to pin message', error);
    }
  };

  const selectedConversation = useMemo(() => {
    if (!selectedChat) return null;
    const c = contacts.find(c => c.user._id === selectedChat);
    if (!c) return null;
    return {
      id: c.user._id,
      name: c.user.fullname,
      role: 'Direct Message',
      avatar: initials(c.user.fullname) || 'U',
      online: onlineUsers.has(c.user._id),
      lastMessage: c.lastMessage?.content,
      timestamp: c.lastMessage?.createdAt
    };
  }, [selectedChat, contacts, onlineUsers]);

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c => c.user.fullname.toLowerCase().includes(q));
  }, [contacts, search]);

  const filteredMessages = useMemo(() => {
    const q = messageSearch.trim().toLowerCase();
    if (!q) return thread;
    return thread.filter(m => {
      if (m.type === 'text') {
        return m.content.toLowerCase().includes(q);
      }
      return false;
    });
  }, [thread, messageSearch]);

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

  const jumpToCurrentMatch = (index: number) => {
    if (!searchMatches.length) return;
    const validIndex = (index + searchMatches.length) % searchMatches.length; 
    setCurrentMatchIndex(validIndex);
    jumpToMessage(searchMatches[validIndex]);
  };

  const [reactionPicker, setReactionPicker] = useState<string | null>(null);

  const handleReact = (messageId: string, emoji: string) => {
    const newThread = thread.map(msg => {
      const mid = (msg as any)._id;
      if (mid === messageId) {
        const reactions = msg.reactions || {};
        const isAlreadyReacted = reactions[emoji]?.includes('me');
        if (isAlreadyReacted) {
          reactions[emoji] = reactions[emoji].filter(id => id !== 'me');
        } else {
          reactions[emoji] = [...(reactions[emoji] || []), 'me'];
        }
        return { ...msg, reactions };
      }
      return msg;
    });
    setThread(newThread as any);
    setReactionPicker(null);
    const real = thread.find(m => (m as any)._id === messageId) as any;
    if (real && real._id) {
      reactToMessageApi(real._id, emoji).catch(() => {});
    }
  };
  
  const emojis = ['👍', '❤', '😂', '😮', '😢', '🔥', '👏'];

  // Close mobile sidebar when selecting a chat
  useEffect(() => {
    if (selectedChat && mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  }, [selectedChat]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeDeleteMenu && !(e.target as Element)?.closest('[data-delete-menu]')) {
        setActiveDeleteMenu(null);
      }
      if (reactionPicker && !(e.target as Element)?.closest('[data-reaction-picker]')) {
        setReactionPicker(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDeleteMenu, reactionPicker]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-x-hidden">
      <Header />
      
      <div className="h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex h-full relative overflow-x-hidden">
          {/* Mobile Overlay */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-full max-w-sm bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Messages</h2>
                    <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-400 hover:text-white">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={() => setOpenNewModal(true)}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mb-4"
                  >
                    <Plus className="h-5 w-5" />
                    <span>New Conversation</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pb-4">
                  {filteredContacts.map((c) => {
                    const id = c.user._id;
                    const convo = {
                      id,
                      name: c.user.fullname,
                      avatar: initials(c.user.fullname),
                      online: onlineUsers.has(id),
                      role: 'Direct Message',
                      lastMessage: c.lastMessage?.content || '',
                      timestamp: c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                    };
                    return (
                      <div
                        key={id}
                        onClick={() => setSelectedChat(id)}
                        className={`mx-2 mb-1 p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors ${
                          selectedChat === id ? 'bg-gray-800 border-l-4 border-l-purple-500' : ''
                        }`}
                      >
                        <div className="flex items-center min-w-0">
                          <div className="relative flex-shrink-0">
                            <img
                              src={avatarUrlFrom(c.user._id, c.user.fullname, c.user.avatar)}
                              alt={c.user.fullname}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                              onError={(e) => { 
                                (e.currentTarget as HTMLImageElement).onerror = null; 
                                (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); 
                              }}
                            />
                            {convo.online && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-white truncate flex-1 min-w-0">{convo.name}</h3>
                              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{convo.timestamp}</span>
                            </div>
                            <p className="text-xs text-blue-400 mb-1 truncate">{convo.role}</p>
                            <p className="text-sm text-gray-400 truncate">{convo.lastMessage}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Floating Action Buttons */}
          <div className="lg:hidden fixed right-4 bottom-4 z-40 flex flex-col space-y-3">
            <button 
              className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors flex items-center justify-center"
              onClick={() => setOpenNewModal(true)}
              title="New conversation"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:flex lg:w-80 xl:w-96 border-r border-gray-700 flex-col overflow-hidden">
            <div className="p-4 xl:p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Messages</h2>
                <button 
                  className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors" 
                  onClick={() => setOpenNewModal(true)}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map((c) => {
                const id = c.user._id;
                const convo = {
                  id,
                  name: c.user.fullname,
                  avatar: initials(c.user.fullname),
                  online: onlineUsers.has(id),
                  role: 'Direct Message',
                  lastMessage: c.lastMessage?.content || '',
                  timestamp: c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                };
                return (
                  <div
                    key={id}
                    onClick={() => setSelectedChat(id)}
                    className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                      selectedChat === id ? 'bg-gray-700 border-l-4 border-l-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-center min-w-0">
                      <div className="relative flex-shrink-0">
                        <img
                          src={avatarUrlFrom(c.user._id, c.user.fullname, c.user.avatar)}
                          alt={c.user.fullname}
                          className="w-12 h-12 rounded-full object-cover mr-3"
                          onError={(e) => { 
                            (e.currentTarget as HTMLImageElement).onerror = null; 
                            (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); 
                          }}
                        />
                        {convo.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white truncate flex-1 min-w-0">{convo.name}</h3>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{convo.timestamp}</span>
                        </div>
                        <p className="text-sm text-blue-400 mb-1 truncate">{convo.role}</p>
                        <p className="text-sm text-gray-400 truncate">{convo.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-700 flex-shrink-0 relative z-20">
                  <div className="flex items-center justify-between min-w-0">
                    <div className="flex items-center flex-1 min-w-0 mr-2 sm:mr-4">
                      <button 
                        className="lg:hidden mr-2 sm:mr-3 text-gray-300 hover:text-white flex-shrink-0" 
                        onClick={() => setMobileSidebarOpen(true)} 
                        aria-label="Open conversations"
                      >
                        <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                      </button>
                      <div className="relative flex-shrink-0">
                        <img
                          src={avatarUrlFrom(
                            selectedConversation.id,
                            selectedConversation.name,
                            (contacts.find(c => c.user._id === selectedConversation.id)?.user.avatar)
                          )}
                          alt={selectedConversation.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover mr-2 sm:mr-3 lg:mr-4"
                          onError={(e) => { 
                            (e.currentTarget as HTMLImageElement).onerror = null; 
                            (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); 
                          }}
                        />
                        {selectedConversation.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate text-sm sm:text-base">{selectedConversation.name}</h3>
                        <p className="text-xs sm:text-sm text-blue-400 truncate">{selectedConversation.role}</p>
                        {selectedConversation.online && (
                          <p className="text-xs text-green-400 hidden sm:block">Active now</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
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
                          value={messageSearch}
                          onChange={(e) => setMessageSearch(e.target.value)}
                          className="w-40 xl:w-48 pl-8 pr-16 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                        {searchMatches.length > 0 && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                            <button
                              onClick={() => jumpToCurrentMatch(currentMatchIndex - 1)}
                              className="p-1 hover:bg-gray-600 rounded"
                              title="Previous match"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{currentMatchIndex + 1}/{searchMatches.length}</span>
                            <button
                              onClick={() => jumpToCurrentMatch(currentMatchIndex + 1)}
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
                  </div>

                  {/* Mobile Search Bar */}
                  {showMobileSearch && (
                    <div className="mt-3 lg:hidden relative z-10">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search messages..."
                          value={messageSearch}
                          onChange={(e) => setMessageSearch(e.target.value)}
                          className="w-full pl-10 pr-20 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                        {searchMatches.length > 0 && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                            <button
                              onClick={() => jumpToCurrentMatch(currentMatchIndex - 1)}
                              className="p-1 hover:bg-gray-600 rounded"
                              title="Previous match"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{currentMatchIndex + 1}/{searchMatches.length}</span>
                            <button
                              onClick={() => jumpToCurrentMatch(currentMatchIndex + 1)}
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
                </div>

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
                        setThread(prev => prev.map(m => 
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

                {/* Search Results Info */}
                {messageSearch && (
                  <div className="px-3 sm:px-6 py-2 bg-gray-800 border-b border-gray-700 text-sm text-gray-400 relative z-10">
                    {filteredMessages.length === 0 ? (
                      "No messages found"
                    ) : (
                      `Found ${filteredMessages.length} message${filteredMessages.length === 1 ? '' : 's'}`
                    )}
                  </div>
                )}
               
                {/* Messages */}
                <div ref={messagesRef} className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-20 sm:pb-24 lg:pb-28 space-y-3 sm:space-y-4 min-h-0">
                  {filteredMessages.map((m, idx) => {
                    const senderId = typeof m.sender === 'string' ? m.sender : m.sender?._id;
                    const isOwn = senderId !== selectedChat;
                    const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    const avatar = isOwn ? 'ME' : (selectedConversation?.name || 'U');
                    const sel = contacts.find(c => c.user._id === selectedChat);
                    const avatarUrl = isOwn ? null : avatarUrlFrom(sel?.user?._id, sel?.user?.fullname, sel?.user?.avatar);
                    const mid = messageDomId(m, idx);
                    const reactions = ((m as any).reactions) as Record<string, string[]> | undefined;
                    
                    return (
                      <div key={mid} data-mid={mid} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group overflow-hidden`}>
                        <div className={`flex items-end space-x-2 w-full max-w-[85%] sm:max-w-[75%] lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''} min-w-0`}>
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt="avatar"
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                              onError={(e) => { 
                                (e.currentTarget as HTMLImageElement).onerror = null; 
                                (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); 
                              }}
                            />
                          ) : (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                              {avatar?.toString().slice(0, 2) || 'U'}
                            </div>
                          )}
                          
                          <div className={`w-full max-w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow transition-transform duration-150 ${isOwn ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'} hover:scale-[1.02] ${highlightId === mid ? 'ring-2 ring-purple-400' : ''} min-w-0 overflow-hidden`}>
                            {m.replyTo && (
                              <div className={`mb-2 border-l-2 pl-2 sm:pl-3 ${isOwn ? 'border-purple-300' : 'border-purple-500'} min-w-0`}>
                                <div className="text-xs font-semibold opacity-90 truncate">{(m.replyTo as any)?.sender?.fullname || 'Replied message'}</div>
                                <button 
                                  type="button" 
                                  onClick={() => jumpToMessage((m.replyTo as any)?._id)} 
                                  className="text-left w-full min-w-0"
                                >
                                  <div className="text-xs opacity-80 truncate hover:underline">
                                    {m.replyTo.type === 'text' ? m.replyTo.content : `Media: ${m.replyTo.type}`}
                                  </div>
                                </button>
                              </div>
                            )}
                            
                            {m.type === 'image' ? (
                              <img
                                src={m.content}
                                alt="image"
                                className="max-w-full w-full h-auto rounded-lg cursor-zoom-in hover:opacity-90 transition"
                                style={{ maxWidth: '200px' }}
                                onClick={() => { 
                                  setLightboxMedia({ type: 'image', url: m.content }); 
                                  setLightboxOpen(true); 
                                }}
                              />
                            ) : m.type === 'video' ? (
                              <video
                                src={m.content}
                                controls
                                className="max-w-full w-full h-auto rounded-lg cursor-zoom-in hover:opacity-90 transition"
                                style={{ maxWidth: '200px' }}
                                onClick={() => { 
                                  setLightboxMedia({ type: 'video', url: m.content }); 
                                  setLightboxOpen(true); 
                                }}
                              />
                            ) : (
                              <p className="text-sm sm:text-base whitespace-pre-wrap break-words w-full leading-relaxed overflow-hidden">{m.content}</p>
                            )}
                            
                            {reactions && Object.values(reactions).some(arr => (arr?.length || 0) > 0) && (
                              <div className="flex items-center space-x-1 mt-2 flex-wrap">
                                {Object.entries(reactions).map(([emoji, users]) => (users && users.length > 0) ? (
                                  <span key={emoji} className={`text-xs rounded-full px-2 py-1 mb-1 ${isOwn ? 'bg-purple-700 text-white' : 'bg-gray-600 text-gray-300'}`}>
                                    {emoji} {users.length}
                                  </span>
                                ) : null)}
                              </div>
                            )}
                            
                            <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-gray-500'}`}>{time}</p>
                          </div>
                          
                          {/* Message Actions */}
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity space-x-1 sm:space-x-2 flex-shrink-0">
                            <div className="relative" data-reaction-picker>
                              <button
                                title="React"
                                onClick={() => setReactionPicker(reactionPicker === mid ? null : mid)}
                                className="text-gray-400 hover:text-white p-1"
                              >
                                <Smile className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                              {reactionPicker === mid && (
                                <div className={`absolute z-20 ${isOwn ? 'right-0' : 'left-0'} bottom-full transform -translate-y-2 flex space-x-1 p-2 rounded-full bg-gray-900 shadow-lg border border-gray-700`}>
                                  {emojis.map(emoji => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReact(mid, emoji)}
                                      className="hover:bg-gray-700 rounded-full p-1 transition-colors text-sm"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <button
                              title="Reply"
                              onClick={() => setReplyTo(m)}
                              className="text-gray-400 hover:text-white p-1"
                            >
                              <ReplyIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            
                            <button
                              title="Pin message"
                              onClick={() => handlePinMessage(m)}
                              className="text-gray-400 hover:text-white p-1"
                            >
                              <Pin className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            
                            <div className="relative" data-delete-menu>
                              <button
                                title="Delete message"
                                onClick={() => setActiveDeleteMenu(activeDeleteMenu === mid ? null : mid)}
                                className="text-gray-400 hover:text-white p-1"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                              {activeDeleteMenu === mid && (
                                <div className={`absolute z-20 ${isOwn ? 'right-0' : 'left-0'} bottom-full transform -translate-y-2 flex flex-col p-2 rounded-lg bg-gray-900 shadow-lg border border-gray-700 min-w-[160px] sm:min-w-[180px]`}>
                                  <h4 className="text-xs text-gray-400 px-3 py-1 border-b border-gray-700 mb-1">Delete message</h4>
                                  {isOwn ? (
                                    <>
                                      <button
                                        onClick={() => handleDeleteMessage(mid, false)}
                                        className="text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-md"
                                      >
                                        Delete for me
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMessage(mid, true)}
                                        className="text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-md"
                                      >
                                        Delete for everyone
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleDeleteMessage(mid, false)}
                                      className="text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-md"
                                    >
                                      Delete for me
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setActiveDeleteMenu(null)}
                                    className="text-left px-3 py-2 mt-1 text-sm text-gray-400 hover:bg-gray-700 rounded-md border-t border-gray-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-700 flex-shrink-0 bg-gray-900">
                  {replyTo && (
                    <div className="mb-3 bg-gray-800/70 border border-gray-700 rounded-lg p-2 sm:p-3 flex items-start justify-between min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-400 mb-1">
                          Replying to {(replyTo as any)?.sender?._id === selectedChat ? selectedConversation?.name : 'You'}
                        </div>
                        <div className="text-sm truncate">
                          {replyTo.type === 'text' ? replyTo.content : `Media: ${replyTo.type}`}
                        </div>
                      </div>
                      <button 
                        className="ml-3 text-gray-400 hover:text-white flex-shrink-0" 
                        onClick={() => setReplyTo(null)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-end space-x-2 sm:space-x-3 min-w-0">
                    <button 
                      className="text-gray-400 hover:text-white transition-colors p-2 sm:p-0 flex-shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!selectedChat || uploading}
                      title={uploading ? 'Uploading...' : 'Attach file'}
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e.target.files?.[0] || undefined)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none min-h-[40px] sm:min-h-[48px] max-h-32"
                        style={{
                          height: 'auto',
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                        }}
                      />
                    </div>
                    
                    <button 
                      onClick={handleSendMessage}
                      className="bg-purple-600 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      disabled={!newMessage.trim() || !selectedChat || uploading}
                    >
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a conversation</h3>
                  <p className="text-gray-500 mb-4 text-sm sm:text-base">Choose a conversation from the sidebar to start messaging</p>
                  <button 
                    className="lg:hidden bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors" 
                    onClick={() => setMobileSidebarOpen(true)}
                  >
                    Open conversations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <UserSearchModal
        open={openNewModal}
        onClose={() => setOpenNewModal(false)}
        onSelect={(u: UserMin) => {
          const exists = contacts.some(c => c.user._id === u._id);
          if (!exists) {
            const newContact: Contact = {
              user: { _id: u._id, fullname: u.fullname, avatar: u.avatar },
              lastMessage: undefined,
              online: onlineUsers.has(u._id),
            } as any;
            setContacts(prev => [newContact, ...prev]);
          }
          setSelectedChat(u._id);
        }}
      />
      
      <MediaLightbox 
        open={lightboxOpen} 
        media={lightboxMedia} 
        onClose={() => setLightboxOpen(false)} 
      />
    </div>
  );
};

export default Messages;