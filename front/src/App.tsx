import './App.css'
import LocationSender from './components/LocationSender/LocationSender';
import Alerts from './components/Alerts/Alerts';
import WeatherDisplay from './components/WeatherDisplay/WeatherDisplay';
import { SocketProvider } from './context/SocketContext';
import { useSocket } from './hooks/useSocket';

// Main App content separated to use the socket context
function AppContent() {
  const { isConnected } = useSocket();

  return (
    <>
      <h1>Weather Alert System</h1>
      {isConnected && <LocationSender />}
      {isConnected && <WeatherDisplay />}
       <Alerts />
    </>
  );
}

// Main App component wrapped with provider
function App() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}

export default App;
