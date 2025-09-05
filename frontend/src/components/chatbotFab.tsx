import React, { useState, useRef, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { X, Send, Bot, Mic, MicOff, Minimize2 } from 'lucide-react';

const ChatBotFab: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: 'bot', text: 'Hello! I am your assistant 🤖 How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isTyping, isOpen]);

  // ---------------- API Call ----------------
  const sendMessage = async (msg?: string) => {
    const text = msg || input;
    if (!text.trim()) return;

    // Show user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setIsTyping(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL as string;
      const response = await fetch(`${apiBase}/api/v1/chatbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.reply || "Sorry, I didn't understand that.";

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    } catch (error) {
      console.error('Error contacting chatbot backend:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Oops! Something went wrong.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTimeout(() => {
        setInput("This is a simulated voice input");
        setIsListening(false);
      }, 2000);
    }
  };

  const quickReplies = ['Hello', 'Help', 'Features', 'Support'];

  return (
    <>
      {/* Floating Chat Button - Positioned in bottom left corner */}
      {!isOpen && (
        <button
          aria-label="Chatbot"
          onClick={() => setIsOpen(true)}
          className="fixed left-4 bottom-4 z-50 transition-transform hover:scale-110 animate-pulse"
        >
          <DotLottieReact
            src="https://lottie.host/83918992-7e51-48d7-bb5a-4a7086c57027/Lr0QJJj1Zi.lottie"
            loop
            autoplay
            style={{
              width: window.innerWidth < 640 ? 80 : 100,
              height: window.innerWidth < 640 ? 80 : 100,
              background: 'transparent',
              filter: 'drop-shadow(0 0 15px #9f7aea)',
            }}
          />
        </button>
      )}

      {/* Chatbox overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-start">
          <div 
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          <div className={`relative z-50 transition-all duration-300 ${isMinimized ? 'bottom-6' : 'bottom-24'} left-6`}>
            {isMinimized ? (
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-2xl p-3 flex items-center justify-between w-64">
                <div className="flex items-center">
                  <Bot className="w-6 h-6 text-white mr-2" />
                  <span className="text-white font-medium">Chat Assistant</span>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setIsMinimized(false)} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition">
                    <Minimize2 className="w-4 h-4 text-white rotate-45" />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-80 sm:w-96 h-[500px] sm:h-[550px] bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-700/50">

                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-700 to-indigo-800">
                  <div className="flex items-center">
                    <DotLottieReact
                      src="https://lottie.host/1323f360-55d5-43dc-bea5-1a6a74428278/XAtuhx1ec2.lottie"
                      autoplay
                      loop
                      style={{ width: 80, height: 40, background: 'transparent' }}
                    />
                    <div className="ml-3">
                      <h3 className="font-semibold text-white text-sm sm:text-base">AI Assistant</h3>
                      <p className="text-xs text-purple-200">Online • Ready to help</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition">
                      <Minimize2 className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-300`}>
                      <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl max-w-[80%] break-words relative ${msg.sender === 'user' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none' : 'bg-gray-800/70 text-white rounded-bl-none'}`}>
                        {msg.text}
                        <span className={`text-xs opacity-50 block mt-1 ${msg.sender === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="px-4 py-3 rounded-2xl bg-gray-800/70 text-white flex space-x-1.5 rounded-bl-none">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick replies */}
                <div className="flex flex-wrap gap-2 p-3 bg-gray-800/40 border-t border-gray-700/30">
                  {quickReplies.map((text) => (
                    <button
                      key={text}
                      onClick={() => sendMessage(text)}
                      className="px-3 py-1.5 bg-purple-600/40 hover:bg-purple-600/70 text-white rounded-full text-xs transition-all duration-200 backdrop-blur-sm"
                    >
                      {text}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="p-3 bg-gray-800/40 border-t border-gray-700/30">
                  <div className="flex items-center">
                    <button
                      onClick={toggleVoiceInput}
                      className={`p-2 rounded-full mr-2 transition ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'}`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 rounded-full bg-gray-700/50 text-white outline-none placeholder-gray-400 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/30 text-sm sm:text-base"
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim()}
                      className="ml-2 bg-gradient-to-r from-purple-600 to-indigo-600 p-2.5 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBotFab;