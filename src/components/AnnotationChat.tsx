'use client';

import { useAppStore } from '@/lib/store';
import { ChatMessage } from './ChatMessage';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/chat';

export function AnnotationChat() {
  const {
    activeAnnotationId,
    pinnedAnnotationId,
    annotations,
    annotationChats,
    addChatMessage,
    clearAnnotationChat,
    text,
    textEditHistory,
  } = useAppStore();

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeId = pinnedAnnotationId || activeAnnotationId;
  const activeAnnotation = annotations.find(a => a.id === activeId);
  const messages = activeId ? annotationChats[activeId] || [] : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  const handleSend = async () => {
    if (!inputValue.trim() || !activeAnnotation || isSending) return;

    const userMessage: ChatMessageType = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    addChatMessage(activeAnnotation.id, userMessage);
    setInputValue('');
    setIsSending(true);

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          annotationId: activeAnnotation.id,
          message: userMessage.content,
          context: {
            fullText: text,
            annotation: activeAnnotation,
            edits: textEditHistory,
            previousMessages: messages,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add Claude's response
      const assistantMessage: ChatMessageType = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      addChatMessage(activeAnnotation.id, assistantMessage);
    } catch (error: any) {
      console.error('Chat error:', error);
      // Add error message
      const errorMessage: ChatMessageType = {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      addChatMessage(activeAnnotation.id, errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeAnnotation) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p className="text-ui-body-small text-gray-500 text-center">
          Select an annotation to start chatting with Claude
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with New Chat button */}
      {messages.length > 0 && (
        <div className="border-b border-gray-200 px-4 py-2 flex items-center justify-end">
          <button
            onClick={() => clearAnnotationChat(activeAnnotation.id)}
            className="flex items-center gap-1.5 px-2 py-1 text-ui-body-extra-small text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
            aria-label="Clear chat"
          >
            <RotateCcw className="h-3 w-3" />
            Clear Chat
          </button>
        </div>
      )}
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-ui-body-small text-gray-500 text-center">
              Ask Claude about this annotation
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="p-4">
        <div className="relative bg-white rounded-lg" style={{ 
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Reply to Claude..."
            disabled={isSending}
            className="w-full resize-none px-3 py-2 pr-11 bg-transparent border-none rounded-lg focus:outline-none text-ui-body-small disabled:opacity-50"
            rows={1}
            style={{ minHeight: '36px', maxHeight: '64px' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="absolute right-1.5 bottom-1.5 flex items-center justify-center rounded-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#C6613F',
              border: '0.5px solid rgba(31, 30, 29, 0.15)',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)'
            }}
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            ) : (
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
              >
                <line x1="12" y1="18" x2="12" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <polyline points="7 12 12 7 17 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

