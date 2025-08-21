import React, { useEffect, useRef, useState } from "react";
import {
  Reply as ReplyIcon,
  X,
  Image,
  Video,
  Paperclip,
  Send,
  Check,
  CheckCheck,
  Smile,
} from "lucide-react";
import { useChat } from "../context/ChatContext";
import {
  listRooms,
  listContacts,
  getRoomMessages,
  uploadChatFile,
  type Message as Msg,
  type Room,
  type Contact,
} from "../services/chatApi";

import EmojiPicker from "emoji-picker-react";

type TypingState = { [roomId: string]: boolean };

export default function ChatApp() {
  const { currentUser } = useChat();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typing, setTyping] = useState<TypingState>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch rooms & contacts
  useEffect(() => {
    async function fetchData() {
      setRooms(await listRooms());
      setContacts(await listContacts());
    }
    fetchData();
  }, []);

  // Fetch messages when room changes
  useEffect(() => {
    if (!activeRoom) return;
    async function fetchMessages() {
      const msgs = await getRoomMessages(activeRoom.id);
      setMessages(msgs);
    }
    fetchMessages();
  }, [activeRoom]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate typing indicator
  const handleTyping = () => {
    if (!activeRoom) return;
    setTyping((prev) => ({ ...prev, [activeRoom.id]: true }));
    setTimeout(
      () => setTyping((prev) => ({ ...prev, [activeRoom.id]: false })),
      1500
    );
  };

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() && !replyTo) return;
    const msg: Msg = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: newMessage,
      timestamp: new Date().toISOString(),
      replyTo: replyTo?.id,
      seen: false,
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
    setReplyTo(null);
    setShowEmojiPicker(false);
  };

  // Upload file
  const handleFileUpload = async (file: File, type: "image" | "video" | "doc") => {
    if (!activeRoom) return;
    const url = await uploadChatFile(file);
    const msg: Msg = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: "",
      mediaUrl: url,
      mediaType: type,
      timestamp: new Date().toISOString(),
      seen: false,
    };
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 border-r bg-white">
        <h2 className="p-3 font-bold text-lg">Chats</h2>
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`p-3 cursor-pointer hover:bg-gray-200 ${
              activeRoom?.id === room.id ? "bg-gray-300" : ""
            }`}
            onClick={() => setActiveRoom(room)}
          >
            {room.name}
            <span
              className={`ml-2 text-sm ${
                room.online ? "text-green-600" : "text-gray-400"
              }`}
            >
              ●
            </span>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {activeRoom && (
          <div className="p-3 bg-white border-b flex items-center justify-between">
            <h3 className="font-semibold">{activeRoom.name}</h3>
            <span
              className={`text-sm ${
                activeRoom.online ? "text-green-600" : "text-gray-400"
              }`}
            >
              {activeRoom.online ? "Online" : "Offline"}
            </span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-lg max-w-xs ${
                msg.senderId === currentUser.id
                  ? "bg-green-100 ml-auto"
                  : "bg-white"
              }`}
            >
              {msg.replyTo && (
                <div className="text-xs text-gray-500 border-l-2 border-gray-300 pl-2 mb-1">
                  Replying to: {messages.find((m) => m.id === msg.replyTo)?.text}
                </div>
              )}
              {msg.mediaType === "image" && (
                <img
                  src={msg.mediaUrl}
                  alt="media"
                  className="rounded-lg mb-1"
                  width={200}
                />
              )}
              {msg.mediaType === "video" && (
                <video src={msg.mediaUrl} controls className="rounded-lg mb-1" />
              )}
              {msg.mediaType === "doc" && (
                <a
                  href={msg.mediaUrl}
                  target="_blank"
                  className="text-blue-600 underline"
                  rel="noreferrer"
                >
                  📎 Document
                </a>
              )}
              <p>{msg.text}</p>
              <div className="text-xs text-gray-400 flex justify-end items-center gap-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
                {msg.senderId === currentUser.id &&
                  (msg.seen ? (
                    <CheckCheck size={14} className="text-blue-500" />
                  ) : (
                    <Check size={14} />
                  ))}
              </div>
              <button
                className="text-xs text-gray-500 mt-1 flex items-center gap-1"
                onClick={() => setReplyTo(msg)}
              >
                <ReplyIcon size={14} /> Reply
              </button>
            </div>
          ))}
          {typing[activeRoom?.id || ""] && (
            <div className="text-sm text-gray-500">Typing...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Preview */}
        {replyTo && (
          <div className="p-2 bg-gray-200 flex justify-between items-center">
            <span className="text-sm">
              Replying to: <b>{replyTo.text}</b>
            </span>
            <X
              size={18}
              className="cursor-pointer"
              onClick={() => setReplyTo(null)}
            />
          </div>
        )}

        {/* Input Box */}
        {activeRoom && (
          <div className="p-3 bg-white border-t flex items-center gap-2">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-600"
            >
              <Smile size={22} />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-16 left-10 z-10">
                <EmojiPicker
                  onEmojiClick={(e) =>
                    setNewMessage((prev) => prev + e.emoji)
                  }
                />
              </div>
            )}
            <label>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type.startsWith("image"))
                      handleFileUpload(file, "image");
                    else if (file.type.startsWith("video"))
                      handleFileUpload(file, "video");
                    else handleFileUpload(file, "doc");
                  }
                }}
              />
              <Paperclip className="cursor-pointer text-gray-600" />
            </label>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              className="flex-1 p-2 border rounded-lg"
              placeholder="Type a message"
            />
            <button
              onClick={handleSend}
              className="bg-green-500 p-2 rounded-full text-white"
            >
              <Send size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
