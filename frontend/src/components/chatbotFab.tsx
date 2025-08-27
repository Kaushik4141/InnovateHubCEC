import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { X, Send } from 'lucide-react';

const ChatBotFab: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: 'bot', text: 'Hello! I am your assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);

    // Dummy bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: "That's interesting! Tell me more." }]);
    }, 800);

    setInput('');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        type="button"
        aria-label="Chatbot"
        onClick={() => setIsOpen(true)}
        className="fixed left-2 md:left-4 bottom-32 md:bottom-36 z-50 focus:outline-none"
      >
        <DotLottieReact
          src="https://lottie.host/b9372abe-014b-4928-a5a2-740a8c323a18/NiyISE6UlT.lottie"
          loop
          autoplay
          style={{ width: 150, height: 150, background: 'transparent' }} // MUCH BIGGER + transparent
        />
      </button>

      {/* Chatbot Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-end justify-end p-4 md:p-6 z-50">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />

          {/* Chatbox */}
          <div className="relative w-full sm:w-96 h-[450px] bg-gray-900 rounded-2xl shadow-xl flex flex-col z-10">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-t-2xl">
              <div className="flex items-center">
                <DotLottieReact
                  src="https://lottie.host/71F5hrIok7/hello-bot.lottie"
                  autoplay
                  loop
                  style={{ width: 120, height: 120, background: 'transparent' }} // larger in header too
                />
                <span className="ml-2 font-semibold">Chatbot</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-red-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-xs ${
                      msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center p-3 bg-gray-800 rounded-b-2xl">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-full bg-gray-700 text-white outline-none"
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="ml-3 bg-blue-500 p-2 rounded-full hover:bg-blue-600"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBotFab;
