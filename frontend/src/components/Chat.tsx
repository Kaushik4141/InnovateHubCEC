import React, { useEffect, useMemo, useRef, useState } from "react";
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

const Chat = () => {
  const { user } = useChat();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRooms().then(setRooms);
    listContacts().then(setContacts);
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      getRoomMessages(selectedRoom.id).then(setMessages);
    }
  }, [selectedRoom]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Msg = {
      id: Date.now().toString(),
      sender: user,
      text: input,
      replyTo: replyTo ? replyTo.id : null,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setReplyTo(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-gray-300 p-2 overflow-y-auto">
        <h2 className="font-bold text-lg mb-2 flex items-center">
          <Users className="w-5 h-5 mr-2" /> Chats
        </h2>
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`p-2 cursor-pointer rounded-lg hover:bg-gray-200 ${
              selectedRoom?.id === room.id ? "bg-gray-300" : ""
            }`}
            onClick={() => setSelectedRoom(room)}
          >
            {room.name}
          </div>
        ))}
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-300 flex items-center justify-between">
          <span className="font-bold">
            {selectedRoom ? selectedRoom.name : "Select a chat"}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            const isMine = msg.sender.id === user.id;
            const replyMsg = messages.find((m) => m.id === msg.replyTo);

            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[70%] break-words ${
                    isMine ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
                  }`}
                  style={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {replyMsg && (
                    <div
                      className={`text-sm p-2 mb-2 rounded-lg ${
                        isMine
                          ? "bg-blue-600/60 text-gray-100"
                          : "bg-gray-400/70 text-gray-800"
                      }`}
                      style={{
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <span className="font-semibold">
                        {replyMsg.sender.name}:
                      </span>{" "}
                      {replyMsg.text}
                    </div>
                  )}
                  {msg.text}
                  <button
                    className="ml-2 text-xs opacity-80 hover:opacity-100"
                    onClick={() => setReplyTo(msg)}
                  >
                    <ReplyIcon size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Preview */}
        {replyTo && (
          <div className="p-2 border-t border-gray-300 bg-gray-200 flex items-center justify-between">
            <div className="text-sm truncate max-w-[80%]">
              Replying to <b>{replyTo.sender.name}</b>: {replyTo.text}
            </div>
            <button onClick={() => setReplyTo(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-gray-300 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
