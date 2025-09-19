from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[str, List[str]] = {}  # user_id -> list of client_ids
    
    async def connect(self, websocket: WebSocket, client_id: str, user_id: str = None):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(client_id)
    
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            # Remove from active connections
            del self.active_connections[client_id]
            
            # Remove from user connections
            for user_id, client_ids in self.user_connections.items():
                if client_id in client_ids:
                    client_ids.remove(client_id)
                    if not client_ids:  # Remove user if no connections left
                        del self.user_connections[user_id]
                    break
    
    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            try:
                await websocket.send_text(message)
            except Exception:
                self.disconnect(client_id)
    
    async def send_user_message(self, message: str, user_id: str):
        """Send message to all connections of a specific user"""
        if user_id in self.user_connections:
            client_ids = self.user_connections[user_id].copy()
            for client_id in client_ids:
                await self.send_personal_message(message, client_id)
    
    async def broadcast_to_role(self, message: str, role: str):
        """Broadcast message to all users with a specific role"""
        # This would need to be implemented based on your user role tracking
        # For now, broadcast to all connections
        await self.broadcast(message)
    
    async def broadcast(self, message: str):
        """Broadcast message to all active connections"""
        disconnected_clients = []
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message)
            except Exception:
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    async def send_alert(self, alert_data: dict, target_roles: List[str] = None):
        """Send alert to specific roles or all users"""
        import json
        message = json.dumps({
            "type": "alert",
            "data": alert_data
        })
        
        if target_roles:
            for role in target_roles:
                await self.broadcast_to_role(message, role)
        else:
            await self.broadcast(message)
    
    def get_connection_count(self) -> int:
        return len(self.active_connections)
    
    def get_user_connections(self, user_id: str) -> List[str]:
        return self.user_connections.get(user_id, [])