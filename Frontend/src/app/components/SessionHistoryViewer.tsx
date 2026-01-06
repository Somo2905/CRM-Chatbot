/**
 * Session History Viewer Component
 * View and manage conversation history from the Python RAG backend
 */

import React, { useState } from 'react';
import { History, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { sessionService, pythonChatService } from '../services';

export function SessionHistoryViewer() {
  const [sessionId, setSessionId] = useState('');
  const [history, setHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLoadHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a session ID' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const response = await sessionService.getHistory(sessionId);
      setHistory(response);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to load session history' 
      });
      setHistory(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = async () => {
    if (!sessionId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a session ID' });
      return;
    }

    if (!window.confirm('Are you sure you want to clear this session? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    setMessage(null);
    try {
      const response = await sessionService.clearSession(sessionId);
      setMessage({ type: 'success', text: response.message });
      setHistory(null);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to clear session' 
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleLoadCurrentSession = () => {
    const currentSessionId = pythonChatService.getSessionId();
    setSessionId(currentSessionId);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Session History</h1>
        <p className="text-gray-600 mt-2">View and manage conversation history</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Load Session History
          </CardTitle>
          <CardDescription>
            Enter a session ID to view its conversation history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLoadHistory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionId">Session ID</Label>
              <div className="flex gap-2">
                <Input
                  id="sessionId"
                  type="text"
                  placeholder="session_1234567890_abc123def"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLoadCurrentSession}
                >
                  Use Current
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <History className="h-4 w-4 mr-2" />
                    Load History
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleClearSession}
                disabled={isClearing || !sessionId}
              >
                {isClearing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Session
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {history && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversation History
            </CardTitle>
            <CardDescription>
              {history.message_count} messages in session {history.session_id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.history.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No messages in this session
              </p>
            ) : (
              <div className="space-y-4">
                {history.history.map((msg: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      msg.role === 'HumanMessage'
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          msg.role === 'HumanMessage'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {msg.role === 'HumanMessage' ? 'User' : 'AI'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Message {index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
