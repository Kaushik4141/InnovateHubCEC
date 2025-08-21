import React, { useEffect, useRef, useState } from "react";
import {
  Reply as ReplyIcon,
  X,
  Menu,
  Image,
  Video,
  Paperclip,
  Send,
  Users,
} from "lucide-react";
import { useChat } from "../context/ChatContext";
import {
  listRooms,
  listContacts,
  getRoomMessages,
  getPrivateMessages,
  uploadChatFile,
  type Message as Msg,
  type Room,
  type Contact,
} from "../services/chatApi";

import MediaLightbox, { type LightboxMedia } from "./MediaLightbox";

export default function Chat() {
  const {
    selectedRoom,
    selectedContact,
    setSelectedRoom,
    setSelectedContact,
  } = useChat();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMedia[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      const res = await listRooms();
      setRooms(res);
    };
    const fetchContacts = async () => {
      const res = await listContacts();
      setContacts(res);
    };
    fetchRooms();
    fetchContacts();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedRoom) {
        const res = await getRoomMessages(selectedRoom.id);
        setMessages(res);
      } else if (selectedContact) {
        const res = await getPrivateMessages(selectedContact.id);
        setMessages(res);
      }
    };
    fetchMessages();
  }, [selectedRoom, selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Msg = {
      id: Date.now().toString(),
      content: input,
      sender: "me",
      timestamp: new Date().toISOString(),
      type: "text",
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  const handleFileUpload = async (file: File) => {
    const res = await uploadChatFile(file);
    const newMsg: Msg = {
      id: Date.now().toString(),
      content: res.url,
      sender: "me",
      timestamp: new Date().toISOString(),
      type: file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("video")
        ? "video"
        : "file",
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const openLightbox = (media: LightboxMedia, index: number) => {
    setLightboxMedia([media]);
    setLightboxIndex(index);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col">
        <div className="flex items-center p-2 border-b font-semibold">
          <Menu className="mr-2" /> Chats
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 font-semibold text-sm">Rooms</div>
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                selectedRoom?.id === room.id ? "bg-gray-200" : ""
              }`}
              onClick={() => {
                setSelectedRoom(room);
                setSelectedContact(null);
              }}
            >
              <Users className="inline mr-2" size={16} /> {room.name}
            </div>
          ))}
          <div className="p-2 font-semibold text-sm">Contacts</div>
          {contacts.map((c) => (
            <div
              key={c.id}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                selectedContact?.id === c.id ? "bg-gray-200" : ""
              }`}
              onClick={() => {
                setSelectedContact(c);
                setSelectedRoom(null);
              }}
            >
              {c.name}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-2 border-b flex items-center font-semibold">
          {selectedRoom ? selectedRoom.name : selectedContact?.name || "Chat"}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs rounded-lg px-3 py-2 shadow ${
                  m.sender === "me"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {/* ✅ FIX: No bars between letters */}
                {m.type === "text" && (
                  <span className="whitespace-pre-wrap break-words">
                    {m.content}
                  </span>
                )}
                {m.type === "image" && (
                  <img
                    src={m.content}
                    alt="img"
                    className="rounded cursor-pointer max-w-[200px]"
                    onClick={() =>
                      openLightbox({ type: "image", src: m.content }, 0)
                    }
                  />
                )}
                {m.type === "video" && (
                  <video
                    controls
                    className="rounded max-w-[200px] cursor-pointer"
                    onClick={() =>
                      openLightbox({ type: "video", src: m.content }, 0)
                    }
                  >
                    <source src={m.content} />
                  </video>
                )}
                {m.type === "file" && (
                  <a
                    href={m.content}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Download File
                  </a>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-2 border-t flex items-center space-x-2">
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={(e) =>
                e.target.files && handleFileUpload(e.target.files[0])
              }
            />
            <Paperclip />
          </label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded-full px-3 py-1 focus:outline-none"
            placeholder="Type a message..."
          />
          <button onClick={handleSend}>
            <Send />
          </button>
        </div>
      </div>

      {/* Media Lightbox */}
      {lightboxMedia.length > 0 && (
        <MediaLightbox
          media={lightboxMedia}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxMedia([])}
        />
      )}
    </div>
  );
}
