import { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

// Get socket server URL from environment variables
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

// Validate that the environment variable is set
if (!SOCKET_SERVER_URL) {
  throw new Error('VITE_SOCKET_SERVER_URL environment variable is not set');
}
type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType   | null>(null);
interface SocketProviderProps {
  children: React.ReactNode;
}
export const SocketProvider:React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Establish connection
    let clientId = localStorage.getItem('clientId');
    if (!clientId) {
      clientId = uuidv4();
      localStorage.setItem('clientId', clientId);
    }
    const newSocket = io(SOCKET_SERVER_URL,{auth:{type:"client",id:clientId}});
    setSocket(newSocket);

    // Basic connection listeners
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection...');
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.disconnect();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === null) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 