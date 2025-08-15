import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export type ChatMessage = {
    _id?: string;
    sender: { _id: string; fullname?: string; avatar?: string } | string;
    roomId?: string | null;
    receiverUser?: string | null;
    content: string;
    type: 'text' | 'image' | 'video';
    createdAt?: string;
    replyTo?: { _id: string; content: string; type: 'text'|'image'|'video'; sender?: any; createdAt?: string } | null;
};

type ChatContextType = {
    socket: Socket | null;
    connected: boolean;
    onlineUsers: Set<string>;
    joinRoom: (roomId: string) => void;
    leaveRoom: (roomId: string) => void;
    sendRoomMessage: (roomId: string, content: string, type?: ChatMessage['type'], replyToId?: string | null) => void;
    sendPrivateMessage: (toUserId: string, content: string, type?: ChatMessage['type'], replyToId?: string | null) => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChat must be used within ChatProvider');
    return ctx;
};

function getApiBase(): string {
    const env = (import.meta as any).env;
    return env?.VITE_API_URL || '';
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const onlineRef = useRef(onlineUsers);
    onlineRef.current = onlineUsers;

    const apiBase = useMemo(() => getApiBase(), []);

    useEffect(() => {
        const s = io(apiBase, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });
        setSocket(s);

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);
        const onUserOnline = ({ userId }: { userId: string }) => {
            const next = new Set(onlineRef.current);
            next.add(userId);
            setOnlineUsers(next);
        };
        const onUserOffline = ({ userId }: { userId: string }) => {
            const next = new Set(onlineRef.current);
            next.delete(userId);
            setOnlineUsers(next);
        };

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);
        s.on('userOnline', onUserOnline);
        s.on('userOffline', onUserOffline);

        return () => {
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
            s.off('userOnline', onUserOnline);
            s.off('userOffline', onUserOffline);
            s.close();
        };
    }, [apiBase]);

    const value = useMemo<ChatContextType>(() => ({
        socket,
        connected,
        onlineUsers,
        joinRoom: (roomId: string) => socket?.emit('joinRoom', { roomId }),
        leaveRoom: (roomId: string) => socket?.emit('leaveRoom', { roomId }),
        sendRoomMessage: (roomId: string, content: string, type: ChatMessage['type'] = 'text', replyToId: string | null = null) =>
            socket?.emit('roomMessage', { roomId, content, type, replyTo: replyToId }),
        sendPrivateMessage: (toUserId: string, content: string, type: ChatMessage['type'] = 'text', replyToId: string | null = null) =>
            socket?.emit('privateMessage', { toUserId, content, type, replyTo: replyToId }),
    }), [socket, connected, onlineUsers]);

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
