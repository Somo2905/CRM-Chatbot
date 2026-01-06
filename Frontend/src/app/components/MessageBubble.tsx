import React from 'react';
import { Message } from '../types/chat';
import { Bot, User } from 'lucide-react';
import { VehicleList } from './data-displays/VehicleList';
import { ServiceOptions } from './data-displays/ServiceOptions';
import { CustomerInfo } from './data-displays/CustomerInfo';
import { TimeSlots } from './data-displays/TimeSlots';
import { Button } from './ui/button';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.sender === 'bot';

  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isBot ? 'bg-blue-600' : 'bg-gray-600'
      }`}>
        {isBot ? (
          <Bot className="w-5 h-5 text-white" />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </div>

      <div className={`flex flex-col gap-2 max-w-2xl ${isBot ? '' : 'items-end'}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isBot
            ? 'bg-white border border-gray-200'
            : 'bg-blue-600 text-white'
        }`}>
          <p className="text-sm whitespace-pre-line">{message.text}</p>
        </div>

        {message.data && (
          <div className="w-full">
            {message.data.type === 'vehicle-list' && (
              <VehicleList vehicles={message.data.vehicles} />
            )}
            {message.data.type === 'service-options' && (
              <ServiceOptions services={message.data.services} />
            )}
            {message.data.type === 'customer-info' && (
              <CustomerInfo customer={message.data.customer} />
            )}
            {message.data.type === 'time-slots' && (
              <TimeSlots slots={message.data.slots} />
            )}
          </div>
        )}

        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}

        <span className="text-xs text-gray-400 px-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
