import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Reply as ReplyIcon, X, Menu, Image, Video, Paperclip, Send, Users } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { listRooms, listContacts, getRoomMessages, getPrivateMessages, uploadChatFile, type Message as Msg, type Room, type Contact } from '../services/chatApi';
import MediaLightbox, { type LightboxMedia } from './MediaLightbox';
import Header from './Header';

const Chat: React.FC = () => {
  const { socket, onlineUsers, sendPrivateMessage, sendRoomMessage, joinRoom, leaveRoom } = useChat();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [scope, setScope] = useState<'room' | 'dm'>('room');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMedia | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const genClientId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [onlineUsersOpen, setOnlineUsersOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const activeTitle = useMemo(() => {
    if (!activeId) return '';
    if (scope === 'room') return rooms.find(r => r._id === activeId)?.name || '';
    const c = contacts.find(c => c.user._id === activeId);
    return c?.user.fullname || '';
  }, [scope, activeId, rooms, contacts]);

  // Load lists
  useEffect(() => {
    listRooms().then(setRooms).catch(() => { });
    listContacts().then(setContacts).catch(() => { });
  }, []);

  // Scroll bottom when messages change
  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  // Focus input when chat is active
  useEffect(() => {
    if (activeId && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeId]);

  // Socket listeners for live messages
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
      const target = typeof msg.sender === 'string' ? msg.sender : (msg.sender as any)._id;
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

  async function openRoom(id: string) {
    if (activeId && scope === 'room') leaveRoom(activeId);
    setScope('room');
    setActiveId(id);
    joinRoom(id);
    setLoadingMessages(true);
    try {
      const hist = await getRoomMessages(id);
      setMessages(hist);
    } finally {
      setLoadingMessages(false);
    }
  }
  async function openDM(id: string) {
    if (activeId && scope === 'room') leaveRoom(activeId);
    setScope('dm');
    setActiveId(id);
    setLoadingMessages(true);
    try {
      const hist = await getPrivateMessages(id);
      setMessages(hist);
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
        // optimistic
        setMessages(prev => [...prev, { content, type: 'text', roomId: activeId, createdAt: new Date().toISOString(), sender: 'me', clientId: cid, replyTo: replyTo ? { _id: (replyTo as any)._id, content: replyTo.content, type: replyTo.type, sender: replyTo.sender, createdAt: replyTo.createdAt } : undefined } as any]);
      } else {
        const cid = genClientId();
        sendPrivateMessage(activeId, content, 'text', (replyTo as any)?._id || null, cid);
        // optimistic
        setMessages(prev => [...prev, { content, type: 'text', receiverUser: activeId, createdAt: new Date().toISOString(), sender: 'me', clientId: cid, replyTo: replyTo ? { _id: (replyTo as any)._id, content: replyTo.content, type: replyTo.type, sender: replyTo.sender, createdAt: replyTo.createdAt } : undefined } as any]);
      }
      setInput('');
      setReplyTo(null);
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeId || uploadingFile) return;
    setUploadingFile(true);
    try {
      const up = await uploadChatFile(file);
      if (scope === 'room') {
        const cid = genClientId();
        sendRoomMessage(activeId, up.url, up.type, (replyTo as any)?._id || null, cid);
        setMessages(prev => [...prev, { content: up.url, type: up.type, roomId: activeId, createdAt: new Date().toISOString(), sender: 'me', clientId: cid, replyTo: replyTo ? { _id: (replyTo as any)._id, content: replyTo.content, type: replyTo.type, sender: replyTo.sender, createdAt: replyTo.createdAt } : undefined } as any]);
      } else {
        const cid = genClientId();
        sendPrivateMessage(activeId, up.url, up.type, (replyTo as any)?._id || null, cid);
        setMessages(prev => [...prev, { content: up.url, type: up.type, receiverUser: activeId, createdAt: new Date().toISOString(), sender: 'me', clientId: cid, replyTo: replyTo ? { _id: (replyTo as any)._id, content: replyTo.content, type: replyTo.type, sender: replyTo.sender, createdAt: replyTo.createdAt } : undefined } as any]);
      }
      e.target.value = '';
      setReplyTo(null);
    } finally {
      setUploadingFile(false);
    }
  }

  const messageDomId = (m: Msg, idx: number) => (m as any)?._id || `idx-${idx}`;
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
      <div className="h-[calc(100vh-64px)] sm:h-[calc(100vh-72px)] bg-gray-900 text-white flex overflow-hidden">
        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm uppercase text-gray-400">Chats</h2>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-full bg-gray-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm uppercase text-gray-400 mb-2">Rooms</h2>
                  <ul className="space-y-1">
                    {rooms.map(r => (
                      <li key={r._id}>
                        <button onClick={() => { openRoom(r._id); setMobileSidebarOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center ${scope === 'room' && activeId === r._id ? 'bg-gray-800 ring-1 ring-purple-500/50' : ''}`}>
                          <span className="text-purple-400 mr-2">#</span>
                          {r.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-sm uppercase text-gray-400 mb-2">Direct Messages</h2>
                  <ul className="space-y-1">
                    {contacts.map(c => (
                      <li key={c.user._id}>
                        <button onClick={() => { openDM(c.user._id); setMobileSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${scope === 'dm' && activeId === c.user._id ? 'bg-gray-800 ring-1 ring-purple-500/50' : ''}`}>
                          <div className="relative">
                            <span className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${c.online ? 'bg-green-400 ring-2 ring-gray-900' : 'bg-gray-500'}`}></span>
                            <img
                              src={avatarUrlFrom(c.user._id, c.user.fullname, c.user.avatar)}
                              alt={c.user.fullname}
                              className="h-8 w-8 rounded-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); }}
                            />
                          </div>
                          <span className="truncate">{c.user.fullname}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
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
                      <span className="h-2 w-2 rounded-full bg-green-400"></span>
                      {contact ? (
                        <>
                          <img
                            src={avatarUrlFrom(contact.user._id, contact.user.fullname, contact.user.avatar)}
                            alt={contact.user.fullname}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-300">{contact.user.fullname}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-300">{id}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-72 border-r border-gray-800 p-4 space-y-6 h-full overflow-y-auto">
          <div>
            <h2 className="text-sm uppercase text-gray-400 mb-2">Rooms</h2>
            <ul className="space-y-1">
              {rooms.map(r => (
                <li key={r._id}>
                  <button onClick={() => openRoom(r._id)} className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center ${scope === 'room' && activeId === r._id ? 'bg-gray-800 ring-1 ring-purple-500/50' : ''}`}>
                    <span className="text-purple-400 mr-2">#</span>
                    {r.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm uppercase text-gray-400 mb-2">Direct Messages</h2>
            <ul className="space-y-1">
              {contacts.map(c => (
                <li key={c.user._id}>
                  <button onClick={() => openDM(c.user._id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${scope === 'dm' && activeId === c.user._id ? 'bg-gray-800 ring-1 ring-purple-500/50' : ''}`}>
                    <div className="relative">
                      <span className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${c.online ? 'bg-green-400 ring-2 ring-gray-900' : 'bg-gray-500'}`}></span>
                      <img
                        src={avatarUrlFrom(c.user._id, c.user.fullname, c.user.avatar)}
                        alt={c.user.fullname}
                        className="h-8 w-8 rounded-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); }}
                      />
                    </div>
                    <span className="truncate">{c.user.fullname}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-900">
          <header className="h-14 flex items-center px-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <button className="md:hidden mr-2 text-gray-300 hover:text-white p-1 rounded-md hover:bg-gray-800" onClick={() => setMobileSidebarOpen(true)} aria-label="Open chats">
                  <Menu className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-semibold truncate max-w-[150px] sm:max-w-xs">{activeTitle || 'Select a chat'}</h1>
              </div>
              <button className="lg:hidden text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800" onClick={() => setOnlineUsersOpen(true)} aria-label="Online users">
                <Users className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Messages Area */}
          <section ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
            {!activeId && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="bg-gray-800 p-6 rounded-xl text-center max-w-md">
                  <h3 className="text-lg font-medium mb-2">Welcome to Chat</h3>
                  <p className="text-sm">Select a room or start a direct message conversation to begin chatting.</p>
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
            
            {messages.length > 0 && messages.map((m, idx) => {
              const senderId = typeof m.sender === 'string' ? m.sender : (m.sender as any)?._id;
              const isOwn = scope === 'dm' ? senderId !== activeId : senderId === 'me';
              const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              const avatar = isOwn ? 'ME' : (scope === 'dm' ? (contacts.find(c => c.user._id === activeId)?.user.fullname || 'U') : (typeof m.sender === 'object' && (m.sender as any)?.fullname ? (m.sender as any).fullname[0]?.toUpperCase() : 'U'));
              const other = contacts.find(c => c.user._id === activeId);
              const avatarUrl = scope === 'dm'
                ? (isOwn ? null : avatarUrlFrom(other?.user?._id, other?.user?.fullname, other?.user?.avatar))
                : (typeof m.sender === 'object' ? avatarUrlFrom((m.sender as any)?._id, (m.sender as any)?.fullname, (m.sender as any)?.avatar) : null);
              const mid = messageDomId(m, idx);
              
              return (
                <div key={mid} data-mid={mid} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`flex items-end space-x-2 max-w-[90%] sm:max-w-sm md:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
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
                    <div className={`px-4 py-2 rounded-2xl shadow transition-all duration-150 ${isOwn ? 'bg-purple-600 text-white rounded-br-md' : 'bg-gray-800 text-gray-300 rounded-bl-md'} hover:scale-[1.02] ${highlightId === mid ? 'ring-2 ring-purple-400' : ''}`}>
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
                          className="max-w-full rounded-lg cursor-zoom-in hover:opacity-90 transition max-h-64 object-cover"
                          onClick={() => { setLightboxMedia({ type: 'image', url: m.content }); setLightboxOpen(true); }}
                        />
                      ) : m.type === 'video' ? (
                        <video
                          src={m.content}
                          controls
                          className="max-w-full rounded-lg cursor-zoom-in hover:opacity-90 transition max-h-64"
                          onClick={() => { setLightboxMedia({ type: 'video', url: m.content }); setLightboxOpen(true); }}
                        />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                      )}
                      <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-gray-500'} text-right`}>{time}</p>
                    </div>
                    <button
                      title="Reply"
                      onClick={() => setReplyTo(m)}
                      className={`opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700`}
                    >
                      <ReplyIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </section>

          {/* Input Area */}
          <footer className="p-4 border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
            {replyTo && (
              <div className="mb-3 bg-gray-800/70 border border-gray-700 rounded-lg p-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Replying to {(replyTo as any)?.sender?.fullname || 'message'}</div>
                  <div className="text-sm truncate">
                    {replyTo.type === 'text' ? replyTo.content : `Media: ${replyTo.type}`}
                  </div>
                </div>
                <button className="ml-3 text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700" onClick={() => setReplyTo(null)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <label className="text-gray-400 hover:text-white transition-colors cursor-pointer flex-shrink-0">
                <input type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" disabled={uploadingFile || !activeId} />
                <span className={`p-2 bg-gray-800 rounded-lg border border-gray-700 flex items-center gap-1 ${uploadingFile || !activeId ? 'opacity-50' : 'hover:bg-gray-700'}`}>
                  {uploadingFile ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
                </span>
              </label>
              
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={activeId ? 'Type a message...' : 'Select a chat to start messaging'}
                disabled={!activeId}
                className="flex-1 bg-gray-800 rounded-lg px-4 py-3 outline-none border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 resize-none"
              />
              
              <button 
                onClick={handleSend} 
                disabled={!activeId || !input.trim() || sendingMessage} 
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 p-2 rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
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
                      <img
                        src={avatarUrlFrom(contact.user._id, contact.user.fullname, contact.user.avatar)}
                        alt={contact.user.fullname}
                        className="h-6 w-6 rounded-full object-cover flex-shrink-0"
                      />
                      <span className="text-sm text-gray-300 truncate">{contact.user.fullname}</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-300 truncate">{id}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>
        
        <MediaLightbox open={lightboxOpen} media={lightboxMedia} onClose={() => setLightboxOpen(false)} />
      </div>
    </div>
  );
};

export default Chat;
