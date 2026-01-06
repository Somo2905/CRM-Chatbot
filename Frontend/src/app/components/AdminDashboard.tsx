/**
 * Admin Dashboard Component
 * Provides admin controls for the Python RAG backend
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, Info, Activity, Database, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { adminService, healthService, sessionService } from '../services';

export function AdminDashboard() {
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSystemInfo();
    checkHealth();
  }, []);

  const loadSystemInfo = async () => {
    setIsLoadingInfo(true);
    try {
      const info = await healthService.getInfo();
      setSystemInfo(info);
    } catch (error) {
      console.error('Failed to load system info:', error);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const checkHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const healthStatus = await healthService.checkHealth();
      setHealth(healthStatus);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({ status: 'unhealthy' });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const handleReloadDocuments = async () => {
    setIsReloading(true);
    setMessage(null);
    try {
      const response = await adminService.reloadDocuments();
      setMessage({ type: 'success', text: response.message });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to reload documents' 
      });
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your RAG system configuration and data</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Health Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Current status of the Python backend</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHealth ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking health...
              </div>
            ) : health ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      health.status === 'healthy'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {health.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">App:</span>
                  <span className="text-sm text-gray-600">{health.app_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Version:</span>
                  <span className="text-sm text-gray-600">{health.version}</span>
                </div>
                <Button
                  onClick={checkHealth}
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Health
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Failed to check health status</p>
            )}
          </CardContent>
        </Card>

        {/* System Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              System Information
            </CardTitle>
            <CardDescription>RAG system configuration details</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInfo ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading info...
              </div>
            ) : systemInfo ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Model:</span>
                  <span className="text-gray-600">{systemInfo.model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Embedding:</span>
                  <span className="text-gray-600">{systemInfo.embedding_model?.split('/').pop()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Top K Results:</span>
                  <span className="text-gray-600">{systemInfo.top_k_results}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Security:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      systemInfo.security_enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {systemInfo.security_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <Button
                  onClick={loadSystemInfo}
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Info
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Failed to load system info</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Document Management
          </CardTitle>
          <CardDescription>
            Reload RAG documents after adding new files to the data folder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Click the button below to rebuild the vector store with updated documents.
            This process may take a few moments depending on the number of documents.
          </p>
          <Button
            onClick={handleReloadDocuments}
            disabled={isReloading}
            className="w-full md:w-auto"
          >
            {isReloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reloading Documents...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Documents
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
