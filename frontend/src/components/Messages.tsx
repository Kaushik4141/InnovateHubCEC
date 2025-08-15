import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from './Header';
import { 
  Search, Plus, Phone, Video, MoreHorizontal, Send, Paperclip, 
  Smile, Users, Reply as ReplyIcon, X
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { listContacts, getPrivateMessages, uploadChatFile, type Message as ChatMsg, type Contact } from '../services/chatApi';
import UserSearchModal from './UserSearchModal';
import { getUserMin, type UserMin } from '../services/userApi';
import MediaLightbox, { type LightboxMedia } from './MediaLightbox';

const Messages = () => {
  const { sendPrivateMessage, socket, onlineUsers } = useChat();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null); // userId
  const [thread, setThread] = useState<ChatMsg[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState('');
  const [openNewModal, setOpenNewModal] = useState(false);
  const [searchParams] = useSearchParams();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMedia | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMsg | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const genClientId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  // Load contacts on mount
  useEffect(() => {
    (async () => {
      try {
        const list = await listContacts();
        setContacts(list || []);
      } catch (e) {
        console.error('Failed to load contacts', e);
      }
    })();
  }, []);

  // Auto-select first contact if none selected
  useEffect(() => {
    if (!selectedChat && contacts.length > 0) {
      setSelectedChat(contacts[0].user._id);
    }
  }, [contacts, selectedChat]);

  // Deep-link: /messages?to=<userId>
  useEffect(() => {
    const to = searchParams.get('to');
    if (!to) return;
    if (selectedChat === to) return;
    const existing = contacts.find(c => c.user._id === to);
    if (existing) {
      setSelectedChat(to);
      return;
    }
    (async () => {
      try {
        const u = await getUserMin(to);
        const newContact: Contact = {
          user: { _id: u._id, fullname: u.fullname, avatar: u.avatar },
          lastMessage: undefined,
          online: onlineUsers.has(u._id),
        } as any;
        setContacts(prev => [newContact, ...prev]);
        setSelectedChat(u._id);
      } catch (e) {
        console.error('Failed to load user for deep-link', e);
      }
    })();
  }, [searchParams, contacts, onlineUsers, selectedChat]);

  // Load messages when a contact is selected
  useEffect(() => {
    if (!selectedChat) return;
    (async () => {
      try {
        const msgs = await getPrivateMessages(selectedChat);
        setThread(msgs || []);
      } catch (e) {
        console.error('Failed to load private messages', e);
      }
    })();
  }, [selectedChat]);

  // Live updates via socket
  useEffect(() => {
    if (!socket) return;
    const onPm = (m: ChatMsg) => {
      // relevant if message involves the selected user
      if (!selectedChat) return;
      const senderId = typeof m.sender === 'string' ? m.sender : m.sender?._id;
      if (senderId === selectedChat || m.receiverUser === selectedChat) {
        setThread(prev => {
          // Replace optimistic message if clientId matches
          if ((m as any).clientId) {
            const idx = prev.findIndex(p => (p as any).clientId === (m as any).clientId);
            if (idx !== -1) {
              const next = prev.slice();
              next[idx] = { ...prev[idx], ...m } as any;
              return next;
            }
          }
          // Prevent duplicate by _id
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

  const initials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  };

  const handleSendMessage = () => {
    if (!selectedChat) return;
    const content = newMessage.trim();
    if (!content) return;
    const cid = genClientId();
    sendPrivateMessage(selectedChat, content, 'text', (replyTo as any)?._id || null, cid);
    // optimistic update
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
      // send url as content
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

  const messageDomId = (m: ChatMsg, idx: number) => (m as any)?._id || `idx-${idx}`;
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-700 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Messages</h2>
                  <button className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors" onClick={() => setOpenNewModal(true)}>
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Search */}
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

              {/* Conversations List */}
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
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {convo.avatar}
                          </div>
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
                          <p className={`text-sm text-blue-400 mb-1`}>
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
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                            {selectedConversation.avatar}
                          </div>
                          {selectedConversation.online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{selectedConversation.name}</h3>
                          <p className={`text-sm text-blue-400`}>{selectedConversation.role}</p>
                          {selectedConversation.online && (
                            <p className="text-xs text-green-400">Active now</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <Phone className="h-5 w-5" />
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <Video className="h-5 w-5" />
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div ref={messagesRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {thread.map((m, idx) => {
                      const senderId = typeof m.sender === 'string' ? m.sender : m.sender?._id;
                      const isOwn = senderId !== selectedChat; // if sender is not the selected user, it's me
                      const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                      const avatar = isOwn ? 'ME' : (selectedConversation?.avatar || 'U');
                      const mid = messageDomId(m, idx);
                      return (
                        <div key={mid} data-mid={mid} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                          <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {avatar}
                            </div>
                            <div className={`px-4 py-2 rounded-lg shadow transition-transform duration-150 ${isOwn ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'} hover:scale-[1.02] ${highlightId === mid ? 'ring-2 ring-purple-400' : ''}`}>
                              {m.replyTo && (
                                <div className={`mb-2 border-l-2 pl-3 ${isOwn ? 'border-purple-300' : 'border-purple-500'}`}>
                                  <div className="text-xs font-semibold opacity-90">{(m.replyTo as any)?.sender?.fullname || 'Replied message'}</div>
                                  <button type="button" onClick={() => jumpToMessage((m.replyTo as any)?._id)} className="text-left w-full">
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
                                  className="max-w-xs rounded cursor-zoom-in hover:opacity-90 transition"
                                  onClick={() => { setLightboxMedia({ type: 'image', url: m.content }); setLightboxOpen(true); }}
                                />
                              ) : m.type === 'video' ? (
                                <video
                                  src={m.content}
                                  controls
                                  className="max-w-xs rounded cursor-zoom-in hover:opacity-90 transition"
                                  onClick={() => { setLightboxMedia({ type: 'video', url: m.content }); setLightboxOpen(true); }}
                                />
                              ) : (
                                <p className="text-sm">{m.content}</p>
                              )}
                              <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-gray-500'}`}>{time}</p>
                            </div>
                            <button
                              title="Reply"
                              onClick={() => setReplyTo(m)}
                              className={`opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-white ${isOwn ? '' : ''}`}
                            >
                              <ReplyIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-gray-700">
                    {replyTo && (
                      <div className="mb-3 bg-gray-800/70 border border-gray-700 rounded-lg p-2 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-xs text-gray-400">Replying to {(replyTo as any)?.sender?._id === selectedChat ? selectedConversation?.name : 'You'}</div>
                          <div className="text-sm truncate">
                            {replyTo.type === 'text' ? replyTo.content : `Media: ${replyTo.type}`}
                          </div>
                        </div>
                        <button className="ml-3 text-gray-400 hover:text-white" onClick={() => setReplyTo(null)}>
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
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                          <Smile className="h-5 w-5" />
                        </button>
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
                    <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
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
      </div>
      <MediaLightbox open={lightboxOpen} media={lightboxMedia} onClose={() => setLightboxOpen(false)} />
    </div>
  );
};

export default Messages;