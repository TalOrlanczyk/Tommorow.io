import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

/**
 * Custom hook to access the socket instance and connection status.
 * Must be used within a SocketProvider component.
 * @returns {{ socket: Socket | null, isConnected: boolean }} Socket instance and connection status
 * @throws {Error} If used outside of SocketProvider
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === null) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};