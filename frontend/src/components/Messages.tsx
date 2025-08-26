import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from './Header';
import { 
  Search, Plus, Reply as ReplyIcon, X, Menu, Paperclip, 
  Smile, Users, Send, Pin, Trash2
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { listContacts, getPrivateMessages, uploadChatFile, getOrCreateChatThread, type Message as ChatMsg, type Contact } from '../services/chatApi';
import UserSearchModal from './UserSearchModal';
import { type UserMin } from '../services/userApi';
import MediaLightbox, { type LightboxMedia } from './MediaLightbox';

// A mock API function for demonstration purposes
const deleteMessageApi = async (messageId: string, forEveryone: boolean) => {
  console.log(`Deleting message ${messageId}. For everyone: ${forEveryone}`);
  // In a real application, this would be an API call to your backend
  return new Promise(resolve => setTimeout(resolve, 500));
};

// Mock API for pinning messages
const pinMessageApi = async (messageId: string) => {
  console.log(`Pinning message ${messageId}`);
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

  // Removed auto-selection of first chat - let user choose

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
        
        // Check for pinned message
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
      // Optimistic UI update
      setThread(prev => prev.filter(m => (m as any)._id !== messageId));
      
      // Call the API to delete the message
      await deleteMessageApi(messageId, forEveryone);

      // Optionally, you could handle a failure state here by reverting the UI change
    } catch (error) {
      console.error('Failed to delete message', error);
      // Revert the optimistic update if the API call fails
      // You would need to store the message temporarily to put it back
    } finally {
      setActiveDeleteMenu(null);
    }
  };

  const handlePinMessage = async (message: ChatMsg) => {
    try {
      // Unpin the current pinned message if exists
      if (pinnedMessage) {
        setThread(prev => prev.map(m => 
          (m as any)._id === (pinnedMessage as any)._id ? {...m, pinned: false} : m
        ));
      }
      
      // Pin the new message
      setThread(prev => prev.map(m => 
        (m as any)._id === (message as any)._id ? {...m, pinned: true} : m
      ));
      
      setPinnedMessage({...message, pinned: true} as any);
      
      // Call API to pin message
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

  // Filter messages based on search
  const filteredMessages = useMemo(() => {
    const q = messageSearch.trim().toLowerCase();
    if (!q) return thread;
    return thread.filter(m => {
      if (m.type === 'text') {
        return m.content.toLowerCase().includes(q);
      }
      return false; // For media messages, you might want to search in metadata
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
  const validIndex = (index + searchMatches.length) % searchMatches.length; // wrap around
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
  };
  
  const emojis = ['👍', '❤', '😂', '😮', '😢', '🔥', '👏'];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      
      {/* Container for the chat interface. h-screen ensures it takes up full viewport height */}
      <div className="h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex h-full relative">
          {/* Mobile Drawer */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm uppercase text-gray-400">Messages</h2>
                  <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-0 border-b border-gray-700">
                  <div className="relative mb-4">
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
                        onClick={() => { setSelectedChat(id); setMobileSidebarOpen(false); }}
                        className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                          selectedChat === id ? 'bg-gray-700 border-l-4 border-l-purple-500' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="relative">
                            <img
                              src={avatarUrlFrom(c.user._id, c.user.fullname, c.user.avatar)}
                              alt={c.user.fullname}
                              className="w-12 h-12 rounded-full object-cover mr-3"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); }}
                            />
                            {convo.online && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-white truncate">{convo.name}</h3>
                              <span className="text-xs text-gray-400">{convo.timestamp}</span>
                            </div>
                            <p className="text-sm text-blue-400 mb-1">{convo.role}</p>
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

          {/* Floating New Chat Button for Mobile */}
          <button 
            className="md:hidden fixed right-4 bottom-24 z-20 w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors flex items-center justify-center"
            onClick={() => setOpenNewModal(true)}
            title="New conversation"
          >
            <Plus className="h-6 w-6" />
          </button>

          {/* Conversations Sidebar */}
          <div className="hidden md:flex md:w-80 border-r border-gray-700 flex-col">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Messages</h2>
                <button className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors" onClick={() => setOpenNewModal(true)}>
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
                    <div className="flex items-center">
                      <div className="relative">
                        <img
                          src={avatarUrlFrom(c.user._id, c.user.fullname, c.user.avatar)}
                          alt={c.user.fullname}
                          className="w-12 h-12 rounded-full object-cover mr-3"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); }}
                        />
                        {convo.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white truncate">{convo.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">{convo.timestamp}</span>
                          </div>
                        </div>
                        <p className="text-sm text-blue-400 mb-1">
                          {convo.role}
                        </p>
                        <p className="text-sm text-gray-400 truncate">{convo.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
<div className="p-6 border-b border-gray-700">
  <div className="flex items-center justify-between">
    {/* Left: Avatar + Name */}
    <div className="flex items-center flex-1 min-w-0 mr-4">
      <button className="md:hidden mr-3 text-gray-300 hover:text-white" onClick={() => setMobileSidebarOpen(true)} aria-label="Open conversations">
        <Menu className="h-6 w-6" />
      </button>
      <div className="relative">
        <img
          src={avatarUrlFrom(
            selectedConversation.id,
            selectedConversation.name,
            (contacts.find(c => c.user._id === selectedConversation.id)?.user.avatar)
          )}
          alt={selectedConversation.name}
          className="w-12 h-12 rounded-full object-cover mr-4"
          onError={(e) => { 
            (e.currentTarget as HTMLImageElement).onerror = null; 
            (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); 
          }}
        />
        {selectedConversation.online && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">{selectedConversation.name}</h3>
        <p className="text-sm text-blue-400">{selectedConversation.role}</p>
        {selectedConversation.online && (
          <p className="text-xs text-green-400">Active now</p>
        )}
      </div>
    </div>

    {/* Right: Pinned + Search beside name */}
    <div className="flex items-center space-x-3">
      {pinnedMessage && (
        <button 
          className="text-gray-400 hover:text-white"
          onClick={() => jumpToMessage((pinnedMessage as any)._id)}
          title="Jump to pinned message"
        >
          <Pin className="h-5 w-5 fill-current text-purple-500" />
        </button>
      )}
      <div className="relative flex items-center">
  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
  <input
    type="text"
    placeholder="Search messages..."
    value={messageSearch}
    onChange={(e) => setMessageSearch(e.target.value)}
    className="w-64 pl-8 pr-16 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
  />
  {searchMatches.length > 0 && (
    <div className="absolute right-2 flex items-center space-x-1">
      <button
        onClick={() => jumpToCurrentMatch(currentMatchIndex - 1)}
        className="p-1 hover:bg-gray-600 rounded"
        title="Previous match"
      >↑</button>
      <span className="text-xs text-gray-400">{currentMatchIndex + 1}/{searchMatches.length}</span>
      <button
        onClick={() => jumpToCurrentMatch(currentMatchIndex + 1)}
        className="p-1 hover:bg-gray-600 rounded"
        title="Next match"
      >↓</button>
    </div>
  )}
</div>

    </div>
  </div>
</div>


                {/* Pinned message display */}
                {pinnedMessage && (
  <div className="p-3 bg-gray-700 border-b border-gray-600 flex items-center justify-between text-sm text-gray-300">
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
      onClick={() => {
        setPinnedMessage(null);
        setThread(prev => prev.map(m => 
          (m as any)._id === (pinnedMessage as any)._id ? {...m, pinned: false} : m
        ));
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
                  <div className="px-6 py-2 bg-gray-800 border-b border-gray-700 text-sm text-gray-400">
                    {filteredMessages.length === 0 ? (
                      "No messages found"
                    ) : (
                      `Found ${filteredMessages.length} message${filteredMessages.length === 1 ? '' : 's'}`
                    )}
                  </div>
                )}
               
                {/* Messages */}
                <div ref={messagesRef} className="flex-1 overflow-y-auto p-6 pb-28 space-y-4">
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
                      <div key={mid} data-mid={mid} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                        <div className={`flex items-end space-x-2 max-w-[90%] sm:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt="avatar"
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); }}
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                              {avatar?.toString().slice(0, 2) || 'U'}
                            </div>
                          )}
                          <div className={`max-w-full px-4 py-2 rounded-lg shadow transition-transform duration-150 ${isOwn ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'} hover:scale-[1.02] ${highlightId === mid ? 'ring-2 ring-purple-400' : ''}`}>
                            {m.replyTo && (
                              <div className={`mb-2 border-l-2 pl-3 ${isOwn ? 'border-purple-300' : 'border-purple-500'}`}>
                                <div className="text-xs font-semibold opacity-90">{(m.replyTo as any)?.sender?.fullname || 'Replied message'}</div>
                                <button type="button" onClick={() => jumpToMessage((m.replyTo as any)?._id)} className="text-left w-full">
                                <div className="text-xs opacity-80 truncate hover:underline max-w-[200px]">
                                  {m.replyTo.type === 'text' ? m.replyTo.content : `Media: ${m.replyTo.type}`}
                                </div>
                                </button>
                              </div>
                            )}
                            {m.type === 'image' ? (
                              <img
                                src={m.content}
                                alt="image"
                                className="max-w-full sm:max-w-xs rounded cursor-zoom-in hover:opacity-90 transition"
                                onClick={() => { setLightboxMedia({ type: 'image', url: m.content }); setLightboxOpen(true); }}
                              />
                            ) : m.type === 'video' ? (
                              <video
                                src={m.content}
                                controls
                                className="max-w-full sm:max-w-xs rounded cursor-zoom-in hover:opacity-90 transition"
                                onClick={() => { setLightboxMedia({ type: 'video', url: m.content }); setLightboxOpen(true); }}
                              />
                            ) : (
                              <p className="text-sm whitespace-pre-wrap break-words max-w-full">{m.content}</p>
                            )}
                            {reactions && Object.values(reactions).some(arr => (arr?.length || 0) > 0) && (
                              <div className="flex items-center space-x-1 mt-1 flex-wrap">
                                {Object.entries(reactions).map(([emoji, users]) => (users && users.length > 0) ? (
                                  <span key={emoji} className={`text-xs rounded-full px-2 py-0.5 mb-1 ${isOwn ? 'bg-purple-700 text-white' : 'bg-gray-600 text-gray-300'}`}>
                                    {emoji} {users.length}
                                  </span>
                                ) : null)}
                              </div>
                            )}
                            <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-gray-500'}`}>{time}</p>
                          </div>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition space-x-2">
                            <div className="relative">
                              <button
                                title="React"
                                onClick={() => setReactionPicker(mid)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Smile className="h-4 w-4" />
                              </button>
                              {reactionPicker === mid && (
                                <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 flex space-x-1 p-2 rounded-full bg-gray-900 shadow-lg border border-gray-700">
                                  {emojis.map(emoji => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReact(mid, emoji)}
                                      className="hover:bg-gray-700 rounded-full p-1 transition-colors"
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
                              className="text-gray-400 hover:text-white"
                            >
                              <ReplyIcon className="h-4 w-4" />
                            </button>
                            <button
                              title="Pin message"
                              onClick={() => handlePinMessage(m)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Pin className="h-4 w-4" />
                            </button>
                            <div className="relative">
                              <button
                                title="Delete message"
                                onClick={() => setActiveDeleteMenu(mid)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              {activeDeleteMenu === mid && (
                                <div className="absolute z-10 bottom-full left-0 transform -translate-y-2 flex flex-col p-2 rounded-lg bg-gray-900 shadow-lg border border-gray-700 min-w-[180px]">
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
                <div className="p-6 border-t border-gray-700">
                  {replyTo && (
                    <div className="mb-3 bg-gray-800/70 border border-gray-700 rounded-lg p-2 flex items-start justify-between">
                      <div className="flex-1 max-w-[calc(100%-30px)]">
                        <div className="text-xs text-gray-400">Replying to {(replyTo as any)?.sender?._id === selectedChat ? selectedConversation?.name : 'You'}</div>
                        <div className="text-sm truncate max-w-full">
                          {replyTo.type === 'text' ? replyTo.content : `Media: ${replyTo.type}`}
                        </div>
                      </div>
                      <button className="ml-3 text-gray-400 hover:text-white flex-shrink-0" onClick={() => setReplyTo(null)}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <button 
                      className="text-gray-400 hover:text-white transition-colors"
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
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                      />
                    </div>
                    <button 
                      onClick={handleSendMessage}
                      className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!newMessage.trim() || !selectedChat || uploading}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a conversation</h3>
                  <p className="text-gray-500 mb-4">Choose a conversation from the sidebar to start messaging</p>
                  <button className="md:hidden bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700" onClick={() => setMobileSidebarOpen(true)}>
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
      <MediaLightbox open={lightboxOpen} media={lightboxMedia} onClose={() => setLightboxOpen(false)} />
    </div>
  );
};

export default Messages;
