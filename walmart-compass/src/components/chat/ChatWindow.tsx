'use client';

import React, { useState, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatWindowProps {
  className?: string;
}

export default function ChatWindow({ className = '' }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize with welcome message only on client side
    setMessages([
      {
        id: '1',
        text: 'Hi! I\'m your Walmart shopping assistant. What items are you looking for today?',
        isUser: false,
        timestamp: new Date()
      }
    ]);
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate AI response (placeholder for now)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I understand you\'re looking for those items. Let me help you find the best route through the store!',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`bg-white border-2 border-gray-300 rounded-lg flex flex-col ${className}`}>
      <div className="p-4 border-b border-gray-200 bg-[rgba(0,113,206,0.05)]">
        <h3 className="text-lg font-semibold text-walmart">Shopping Assistant</h3>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto max-h-[400px]">
        <div className="space-y-4">
          {!isClient ? (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800">
                <p className="text-sm">Loading chat...</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-walmart text-white'
                    : 'bg-white border border-gray-200 text-contrast'
                } shadow-sm`}
                >
                <p className="text-sm text-contrast">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.isUser ? 'text-blue-100' : 'text-contrast-light'
                }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for items like 'I need milk, bread, and eggs'"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--walmart-blue)]"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="px-6 py-3 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors btn-primary"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
