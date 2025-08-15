import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Reply as ReplyIcon, X } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { listRooms, listContacts, getRoomMessages, getPrivateMessages, uploadChatFile, type Message as Msg, type Room, type Contact } from '../services/chatApi';
import MediaLightbox, { type LightboxMedia } from './MediaLightbox';

const Chat: React.FC = () => {
  const { socket, onlineUsers, sendPrivateMessage, sendRoomMessage, joinRoom, leaveRoom } = useChat();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [scope, setScope] = useState<'room'|'dm'>('room');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMedia | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const activeTitle = useMemo(() => {
    if (!activeId) return '';
    if (scope === 'room') return rooms.find(r => r._id === activeId)?.name || '';
    const c = contacts.find(c => c.user._id === activeId);
    return c?.user.fullname || '';
  }, [scope, activeId, rooms, contacts]);

  // Load lists
  useEffect(() => {
    listRooms().then(setRooms).catch(() => {});
    listContacts().then(setContacts).catch(() => {});
  }, []);

  // Scroll bottom when messages change
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Socket listeners for live messages
  useEffect(() => {
    if (!socket) return;
    const onRoom = (msg: Msg) => {
      if (scope === 'room' && msg.roomId === activeId) setMessages(prev => [...prev, msg]);
    };
    const onDM = (msg: Msg) => {
      const target = typeof msg.sender === 'string' ? msg.sender : (msg.sender as any)._id;
      if (scope === 'dm' && (msg.receiverUser === activeId || target === activeId)) setMessages(prev => [...prev, msg]);
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
    const hist = await getRoomMessages(id);
    setMessages(hist);
  }
  async function openDM(id: string) {
    if (activeId && scope === 'room') leaveRoom(activeId);
    setScope('dm');
    setActiveId(id);
    const hist = await getPrivateMessages(id);
    setMessages(hist);
  }

  async function handleSend() {
    if (!input.trim() || !activeId) return;
    const content = input.trim();
    if (scope === 'room') {
      sendRoomMessage(activeId, content, 'text', (replyTo as any)?._id || null);
      // optimistic
      setMessages(prev => [...prev, { content, type: 'text', roomId: activeId, createdAt: new Date().toISOString(), sender: 'me', replyTo: replyTo ? { _id: (replyTo as any)._id, content: replyTo.content, type: replyTo.type, sender: replyTo.sender, createdAt: replyTo.createdAt } : undefined } as any]);
    } else {
      sendPrivateMessage(activeId, content, 'text', (replyTo as any)?._id || null);
      // optimistic
      setMessages(prev => [...prev, { content, type: 'text', receiverUser: activeId, createdAt: new Date().toISOString(), sender: 'me', replyTo: replyTo ? { _id: (replyTo as any)._id, content: replyTo.content, type: replyTo.type, sender: replyTo.sender, createdAt: replyTo.createdAt } : undefined } as any]);
    }
    setInput('');
    setReplyTo(null);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeId) return;
    const up = await uploadChatFile(file);
    if (scope === 'room') {
      sendRoomMessage(activeId, up.url, up.type, (replyTo as any)?._id || null);
      setMessages(prev => [...prev, { content: up.url, type: up.type, roomId: activeId, createdAt: new Date().toISOString(), sender: 'me', replyTo: replyTo ? { _id: (replyTo as any)._id, content: replyTo.content, type: replyTo.type, sender: replyTo.sender, createdAt: replyTo.createdAt } : undefined } as any]);
    } else {
      sendPrivateMessage(activeId, up.url, up.type, (replyTo as any)?._id || null);
      setMessages(prev => [...prev, { content: up.url, type: up.type, receiverUser: activeId, createdAt: new Date().toISOString(), sender: 'me', replyTo: replyTo ? { _id: (replyTo as any)._id, content: replyTo.content, type: replyTo.type, sender: replyTo.sender, createdAt: replyTo.createdAt } : undefined } as any]);
    }
    e.target.value = '';
    setReplyTo(null);
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
    <div className="min-h-screen bg-gray-900 text-white flex">
      <aside className="w-72 border-r border-gray-800 p-4 space-y-4">
        <div>
          <h2 className="text-sm uppercase text-gray-400 mb-2">Rooms</h2>
          <ul className="space-y-1">
            {rooms.map(r => (
              <li key={r._id}>
                <button onClick={() => openRoom(r._id)} className={`w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors ${scope==='room' && activeId===r._id ? 'bg-gray-800 ring-1 ring-purple-500/30' : ''}`}>
                  #{r.name}
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
                <button onClick={() => openDM(c.user._id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition-colors ${scope==='dm' && activeId===c.user._id ? 'bg-gray-800 ring-1 ring-purple-500/30' : ''}`}>
                  <span className={`h-2 w-2 rounded-full ${c.online ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                  <img src={c.user.avatar} className="h-6 w-6 rounded-full object-cover" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
                  <span>{c.user.fullname}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="h-14 flex items-center px-4 border-b border-gray-800">
          <h1 className="text-lg font-semibold">{activeTitle || 'Select a chat'}</h1>
        </header>
        <section ref={messagesRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => {
            const senderId = typeof m.sender === 'string' ? m.sender : (m.sender as any)?._id;
            const isOwn = scope === 'dm' ? senderId !== activeId : senderId === 'me';
            const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            const avatar = isOwn ? 'ME' : (scope==='dm' ? (contacts.find(c=>c.user._id===activeId)?.user.avatar || 'U') : (typeof m.sender==='object' && (m.sender as any)?.fullname ? (m.sender as any).fullname[0]?.toUpperCase() : 'U'));
            const mid = messageDomId(m, idx);
            return (
              <div key={mid} data-mid={mid} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {typeof avatar === 'string' ? avatar.toString().slice(0,2) : 'U'}
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
                      <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                    )}
                    <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-gray-500'}`}>{time}</p>
                  </div>
                  <button
                    title="Reply"
                    onClick={() => setReplyTo(m)}
                    className={`opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-white`}
                  >
                    <ReplyIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </section>
        <footer className="p-6 border-t border-gray-800">
          {replyTo && (
            <div className="mb-3 bg-gray-800/70 border border-gray-700 rounded-lg p-2 flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs text-gray-400">Replying to {(replyTo as any)?.sender?.fullname || 'message'}</div>
                <div className="text-sm truncate">
                  {replyTo.type === 'text' ? replyTo.content : `Media: ${replyTo.type}`}
                </div>
              </div>
              <button className="ml-3 text-gray-400 hover:text-white" onClick={() => setReplyTo(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <label className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <input type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
              <span className="px-3 py-2 bg-gray-800 rounded border border-gray-700 text-xs">Attach</span>
            </label>
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') handleSend(); }}
              placeholder={activeId ? 'Type a message' : 'Select a chat to start messaging'}
              disabled={!activeId}
              className="flex-1 bg-gray-800 rounded px-3 py-2 outline-none border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
            />
            <button onClick={handleSend} disabled={!activeId || !input.trim()} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded transition-colors">Send</button>
          </div>
        </footer>
      </main>
      <aside className="w-56 border-l border-gray-800 p-4">
        <h2 className="text-sm uppercase text-gray-400 mb-2">Online</h2>
        <ul className="space-y-1">
          {Array.from(onlineUsers).map(id => (<li key={id} className="text-gray-300 text-sm">{id}</li>))}
        </ul>
      </aside>
      <MediaLightbox open={lightboxOpen} media={lightboxMedia} onClose={() => setLightboxOpen(false)} />
    </div>
  );
};

export default Chat;
