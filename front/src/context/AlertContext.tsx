import React, { createContext, useContext, useState, useCallback } from 'react';
import alertsAPIV1, { Alert } from '../services/alertsAPIV1';
import { useSocket } from '../hooks/useSocket';
type AlertContextType = {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  addAlert: (alert: Omit<Alert, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'userId'>) => Promise<void>;
  fetchAlerts: () => Promise<void>;
  hasMore: boolean;
  fetchMoreAlerts: () => Promise<void>;
};
const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlerts = () => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
interface AlertProviderProps {
  children: React.ReactNode;
}
export const AlertProvider:React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); 
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 20;
  const { socket } = useSocket();


  // Fetch alerts on mount
  React.useEffect(() => {
    fetchAlerts();
  }, []);
 // Listen for alertStatusTriggered from the socket server
 React.useEffect(() => {
  if (socket) {
    socket.on('alertStatusTriggered', (alert: {alertId: string, status: "triggered" | "notTriggered", updatedAt: Date}) => {
      setAlerts(prev=> prev.map(a => a._id === alert.alertId ? {...a, status: alert.status,updatedAt: alert.updatedAt} : a));
       console.log('alertStatusTriggered', alert);
     });
  }

  return () => {
    if(socket) {  
      socket.off('alertStatusTriggered');
    }
  };
 }, [socket]);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertsAPIV1.getAlerts(page, ITEMS_PER_PAGE);
      setAlerts(data.data);
      setHasMore(data.pagination.totalPages > page);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMoreAlerts = useCallback(async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const data = await alertsAPIV1.getAlerts(nextPage, ITEMS_PER_PAGE );
      console.log('data', data);
      if (data.data.length > 0) {
        setAlerts(prev => [...prev, ...data.data]);
        setHasMore(data.pagination.totalPages > nextPage);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, page]);

  const addAlert = useCallback(async (alertData: Omit<Alert, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'userId'>) => {
    try {
      setLoading(true);
      const newAlert = await alertsAPIV1.createAlert(alertData);
      setAlerts(prevAlerts => [newAlert,...prevAlerts]);
      setError(null);
      return newAlert;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    alerts,
    loading,
    error,
    addAlert,
    fetchAlerts,
    hasMore,
    fetchMoreAlerts
  };
  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext; 