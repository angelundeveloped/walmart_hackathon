'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { askGemini, parseItemsFromYaml, mapItemsToCoordinatesWithSemantic, extractNaturalResponse } from '@/lib/llm';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useSelection } from '@/lib/selection';
import { useLanguage } from '@/contexts/LanguageContext';
import { detectLanguage, shouldSwitchLanguage } from '@/lib/language-detection';
import { useUserContext } from '@/hooks/useUserContext';

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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { setTargetsAbsolute, setPendingItems } = useSelection();
  const { profile, user } = useAuth();
  const { preferences } = usePreferences();
  const { dictionary, locale, setLocale } = useLanguage();
  const { userContext } = useUserContext();

  // Load chat history from database
  const loadChatHistory = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/chat-history');
      if (response.ok) {
        const data = await response.json();
        if (data.sessions && data.sessions.length > 0) {
          // Load the most recent session
          const latestSession = data.sessions[0];
          setCurrentSessionId(latestSession.id);
          
          // Convert database messages to component format
          const loadedMessages = latestSession.messages.map((msg: { id: string; text: string; isUser: boolean; timestamp: string }) => ({
            id: msg.id,
            text: msg.text,
            isUser: msg.isUser,
            timestamp: new Date(msg.timestamp)
          }));
          
          setMessages(loadedMessages);
        } else {
          // No history, initialize with welcome message
          initializeWelcomeMessage();
        }
      } else {
        console.error('Failed to load chat history');
        initializeWelcomeMessage();
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      initializeWelcomeMessage();
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initialize welcome message
  const initializeWelcomeMessage = useCallback(() => {
    const welcomeMessage = dictionary?.chat?.welcome || 'Hi! I\'m your Walmart shopping assistant. What items are you looking for today?';
    setMessages([
      {
        id: '1',
        text: welcomeMessage,
        isUser: false,
        timestamp: new Date()
      }
    ]);
  }, [dictionary]);

  // Save message to database
  const saveMessage = useCallback(async (message: Message) => {
    if (!user) return;

    try {
      const response = await fetch('/api/chat-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.text,
          isUser: message.isUser,
          sessionId: currentSessionId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (!currentSessionId) {
          setCurrentSessionId(data.sessionId);
        }
      } else {
        console.error('Failed to save message');
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }, [user, currentSessionId]);

  useEffect(() => {
    setIsClient(true);
    loadChatHistory();
  }, [loadChatHistory]);

  // RAG-enhanced chat function
  const askGeminiWithRAG = async (message: string, context?: string) => {
    // Use persistent user context if available, otherwise fall back to local preferences
    const contextToUse = userContext || {
      preferences: {
        dietaryRestrictions: preferences.dietaryRestrictions || [],
        brandPreferences: preferences.brandPreferences || [],
        organicPreference: preferences.organicPreference || false
      },
      shoppingHistory: (profile as { shoppingHistory?: Array<{ items: string[]; date: string; context?: string }> })?.shoppingHistory || []
    };

    // Detect language from user input
    const detectedLanguage = detectLanguage(message);

    const response = await fetch('/api/chat-simple-rag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userContext: contextToUse,
        context,
        language: locale,
        detectedLanguage
      }),
    });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`RAG chat failed: ${response.status} - ${errorData}`);
        }

    const data = await response.json();
    return data.response;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    // Detect language and potentially switch
    const detectedLanguage = detectLanguage(inputText);
    const shouldSwitch = shouldSwitchLanguage(inputText, locale);
    
    if (shouldSwitch && detectedLanguage !== 'unknown') {
      setLocale(detectedLanguage);
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsProcessing(true);
    
    // Save user message to database
    saveMessage(newMessage);

    try {
      let reply;
      try {
        reply = await askGeminiWithRAG(newMessage.text);
          } catch {
            reply = await askGemini(newMessage.text);
          }
      
      // Extract the natural response text (before YAML) and items
      const extracted = parseItemsFromYaml(reply);
      const naturalResponse = extractNaturalResponse(reply);
      
      // Use the natural response from AI, or fallback to our own message
      const pretty = naturalResponse || (extracted.length > 0 
        ? `Great! I found ${extracted.length} items: ${extracted.slice(0, 3).join(', ')}${extracted.length > 3 ? `, and ${extracted.length - 3} more` : ''}. Adding them to your list!`
        : `I understand your request. Let me try to find relevant items for you.`);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: pretty,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Save AI message to database
      saveMessage(aiMessage);

      // Try to parse items from YAML and add as targets with enhanced semantic search
      const items = extracted;
      if (items.length > 0) {
        const coords = await mapItemsToCoordinatesWithSemantic(items);
        if (coords.length > 0) {
          const targets = coords.map(c => ({ id: c.id, x: c.x, y: c.y, label: c.name }));
          setTargetsAbsolute(targets);
          // Also queue them as pending to sync into ShoppingList if not present
          setPendingItems(targets);
        }
      }
    } catch {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I had trouble understanding that. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Save AI error message to database
      saveMessage(aiMessage);
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
          {!isClient || loading ? (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-walmart border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm">Loading chat...</p>
                </div>
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
                    : 'bg-white border border-gray-200 text-gray-800'
                } shadow-sm`}
                >
                <div className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">
                    {message.isUser ? '👤' : '🤖'}
                  </span>
                  <p className="text-sm text-gray-800 flex-1">{message.text}</p>
                </div>
                <p className={`text-xs mt-1 ${
                  message.isUser ? 'text-blue-100' : 'text-gray-600'
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
              <div className="max-w-[80%] p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-walmart shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🤖</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-walmart"></div>
                  <p className="text-sm font-medium">{dictionary?.chat.thinking || "AI is thinking..."}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-3 sm:p-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={dictionary?.chat.placeholder || "Ask for items like 'I need milk, bread, and eggs'"}
            className="flex-1 p-3 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--walmart-blue)] text-sm sm:text-base touch-manipulation"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isProcessing}
            className="px-4 sm:px-6 py-3 bg-walmart-yellow text-walmart rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base touch-manipulation min-w-[80px] sm:min-w-auto font-semibold hover:bg-yellow-400"
          >
            {isProcessing ? (dictionary?.common.processing || 'Processing...') : (dictionary?.chat.send || 'Send')}
          </button>
        </div>
      </div>
    </div>
  );
}
