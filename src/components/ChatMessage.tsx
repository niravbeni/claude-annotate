'use client';

import { ChatMessage as ChatMessageType } from '@/types/chat';
import { format } from 'date-fns';
import { memo } from 'react';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessageComponent = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message bubble */}
        <div
          className={
            isUser
              ? 'rounded-lg px-4 py-3 bg-[#F0EEE6] text-gray-900'
              : 'text-gray-900'
          }
        >
          <p className="text-ui-body-small whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* Timestamp */}
        <p className={`text-ui-body-extra-small text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {format(new Date(message.timestamp), 'HH:mm')}
        </p>
      </div>
    </div>
  );
};

export const ChatMessage = memo(ChatMessageComponent);

