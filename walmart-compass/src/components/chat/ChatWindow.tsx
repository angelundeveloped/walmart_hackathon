'use client';

import React, { useState, useEffect } from 'react';
import { askGemini, parseItemsFromYaml, mapItemsToCoordinates } from '@/lib/llm';
import { useSelection } from '@/lib/selection';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const { setTargetsAbsolute, setPendingItems } = useSelection();

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

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      const reply = await askGemini(newMessage.text);
      // Show a friendly confirmation instead of raw YAML
      const extracted = parseItemsFromYaml(reply);
      const pretty = extracted.length > 0
        ? `Got it! I found: ${extracted.join(', ')}. Adding them to your list and route.`
        : `I understand. Let me try to add that to your route.`;
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: pretty,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Try to parse items from YAML and add as targets (name-only; mapping to coordinates is next step)
      const items = extracted;
      if (items.length > 0) {
        const coords = await mapItemsToCoordinates(items);
        if (coords.length > 0) {
          const targets = coords.map(c => ({ id: c.id, x: c.x, y: c.y, label: c.name }));
          setTargetsAbsolute(targets);
          // Also queue them as pending to sync into ShoppingList if not present
          setPendingItems(targets);
        }
      }
    } catch (e) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I had trouble understanding that. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsProcessing(false);
    }
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
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-contrast">
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
          
          {/* Loading indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-white border border-gray-200 text-contrast shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="animate-spin text-sm">⏳</div>
                  <p className="text-sm">Processing your request...</p>
                </div>
              </div>
            </div>
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
            disabled={!inputText.trim() || isProcessing}
            className="px-6 py-3 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors btn-primary"
          >
            {isProcessing ? 'Processing...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
