import React, { useState, useRef, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatBot: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: 'bot', text: 'Hello! I am your assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to send a message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Call your Flask backend
      const response = await fetch('https://innovatehubcec-chatbot-ffqz.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Oops! Something went wrong.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-800 shadow-md">
        <button onClick={() => navigate(-1)} className="mr-3">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <DotLottieReact
          src="https://lottie.host/71F5hrIok7/hello-bot.lottie"
          autoplay
          loop
          style={{ width: 40, height: 40 }}
        />
        <h2 className="ml-2 text-lg font-semibold">Chatbot</h2>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs break-words ${
                msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl max-w-xs bg-gray-700 animate-pulse">
              Typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="flex items-center p-4 bg-gray-800">
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
  );
};

export default ChatBot;
