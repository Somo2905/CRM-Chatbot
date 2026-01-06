/**
 * Backend Status Indicator
 * Shows connection status for both backends
 */

import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { healthService } from '../services';
import { API_CONFIG } from '../services/api.config';

export function BackendStatus() {
  const [nodeStatus, setNodeStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [pythonStatus, setPythonStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkBackends();
    const interval = setInterval(checkBackends, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkBackends = async () => {
    // Check Node.js backend
    try {
      const response = await fetch(`${API_CONFIG.NODE_BACKEND.BASE_URL}/`, {
        method: 'GET',
      });
      setNodeStatus(response.ok ? 'online' : 'offline');
    } catch {
      setNodeStatus('offline');
    }

    // Check Python backend
    try {
      await healthService.checkHealth();
      setPythonStatus('online');
    } catch {
      setPythonStatus('offline');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />;
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
    }
  };

  const allOnline = nodeStatus === 'online' && pythonStatus === 'online';
  const allOffline = nodeStatus === 'offline' && pythonStatus === 'offline';

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        title="Backend Status"
      >
        <Activity className="h-4 w-4 text-gray-600" />
        {allOnline ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : allOffline ? (
          <AlertCircle className="h-4 w-4 text-red-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        )}
      </button>

      {showDetails && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-900">Backend Status</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(nodeStatus)}
                <span className="text-sm text-gray-700">Node.js Backend</span>
              </div>
              <span className="text-xs font-medium text-gray-500">
                {getStatusText(nodeStatus)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(pythonStatus)}
                <span className="text-sm text-gray-700">Python RAG</span>
              </div>
              <span className="text-xs font-medium text-gray-500">
                {getStatusText(pythonStatus)}
              </span>
            </div>
          </div>

          <button
            onClick={checkBackends}
            className="w-full mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh Status
          </button>
        </div>
      )}
    </div>
  );
}
