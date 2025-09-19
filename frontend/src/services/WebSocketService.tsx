import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../contexts/AuthContext';

interface WebSocketMessage {
  type: string;
  data: any;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  connect(token: string, userId: string) {
    try {
      this.ws = new WebSocket(`${this.url}/ws/${userId}?token=${token}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          const handler = this.messageHandlers.get(message.type);
          if (handler) {
            handler(message.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect(token, userId);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  private handleReconnect(token: string, userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.connect(token, userId);
      }, 2000 * this.reconnectAttempts);
    }
  }

  subscribe(messageType: string, handler: (data: any) => void) {
    this.messageHandlers.set(messageType, handler);
  }

  unsubscribe(messageType: string) {
    this.messageHandlers.delete(messageType);
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Global WebSocket service instance
let wsService: WebSocketService | null = null;

export const useWebSocket = () => {
  const { user, token } = useAuth();
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (user && token) {
      // Initialize WebSocket service
      if (!wsService) {
        const wsUrl = 'ws://localhost:8000';
        wsService = new WebSocketService(wsUrl);
      }

      // Connect to WebSocket
      wsService.connect(token, user.id.toString());

      // Set up message handlers
      wsService.subscribe('alert', (data) => {
        setMessages(prev => [...prev, { type: 'alert', data, timestamp: new Date() }]);
      });

      wsService.subscribe('geofence_alert', (data) => {
        setMessages(prev => [...prev, { type: 'geofence_alert', data, timestamp: new Date() }]);
      });

      wsService.subscribe('emergency_panic', (data) => {
        setMessages(prev => [...prev, { type: 'emergency_panic', data, timestamp: new Date() }]);
      });

      wsService.subscribe('geofence_violation', (data) => {
        setMessages(prev => [...prev, { type: 'geofence_violation', data, timestamp: new Date() }]);
      });

      // Check connection status
      const checkConnection = setInterval(() => {
        setConnected(wsService?.isConnected() || false);
      }, 1000);

      return () => {
        clearInterval(checkConnection);
        wsService?.disconnect();
        wsService = null;
      };
    }
  }, [user, token]);

  const sendMessage = (message: any) => {
    wsService?.send(message);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    connected,
    messages,
    sendMessage,
    clearMessages,
  };
};

export default WebSocketService;