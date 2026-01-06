import React from 'react';
import { X, Plus, MessageSquare, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { ConversationThread } from '../types/chat';

interface ChatSidebarProps {
  conversations: ConversationThread[];
  isOpen: boolean;
  onClose: () => void;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
}

export function ChatSidebar({
  conversations,
  isOpen,
  onClose,
  onNewConversation,
  onSelectConversation
}: ChatSidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 bg-white border-r
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Conversations</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* New Conversation Button */}
        <div className="p-4">
          <Button
            onClick={onNewConversation}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-2 pb-4 space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`
                  w-full text-left px-3 py-3 rounded-lg
                  transition-colors
                  ${conversation.isActive
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    conversation.isActive ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {conversation.title}
                    </h3>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>
                        {conversation.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">Quick Actions</p>
            <ul className="space-y-1">
              <li>• Search Inventory</li>
              <li>• Schedule Service</li>
              <li>• Customer Lookup</li>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}
