import React, { useState, useEffect } from 'react';
import WeatherCard from '../WeatherCard/WeatherCard';
import styles from './WeatherDisplay.module.css';
import { useSocket } from '../../hooks/useSocket';
interface WeatherValues {
  cloudBase: number;
  cloudCeiling: number;
  cloudCover: number;
  dewPoint: number;
  freezingRainIntensity: number;
  humidity: number;
  precipitationProbability: number;
  pressureSeaLevel: number;
  pressureSurfaceLevel: number;
  rainIntensity: number;
  sleetIntensity: number;
  snowIntensity: number;
  temperature: number;
  temperatureApparent: number;
  uvHealthConcern: number;
  uvIndex: number;
  visibility: number;
  weatherCode: number;
  windDirection: number;
  windGust: number;
  windSpeed: number;
}

interface Weather {
  time: string;
  values: WeatherValues;
}
const WeatherDisplay: React.FC = () => {
  const [weather, setWeather] = useState<WeatherValues | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) {
      return; // Do nothing if socket is not available
    }

    // Listener for temperature updates
    const handleTemperatureUpdate = (newTemp: Weather) => {
      console.log('WeatherDisplay received update:', newTemp);
      // Assuming newTemp contains { values: { temperature, humidity, windSpeed } }
      setLastUpdated(new Date().toLocaleString());
      setWeather(newTemp?.values);
    };
   
    socket.on('temperatureUpdate', handleTemperatureUpdate);
    console.log('WeatherDisplay attached listener for temperatureUpdate');

    // Cleanup: remove listener when socket changes or component unmounts
    return () => {
      console.log('WeatherDisplay removing listener for temperatureUpdate');
      socket.off('temperatureUpdate', handleTemperatureUpdate);
    };

  }, [socket]); // Re-run effect if socket instance changes


  return (
    <>
    <div className={styles.lastUpdated}>
        Last Updated: {lastUpdated}
    </div>
    <div className={styles.weatherCardsContainer}>
      <WeatherCard
        title="Temperature"
        value={weather?.temperature}
        unit="°C"
      />
      <WeatherCard
        title="Humidity"
        value={weather?.humidity}
        unit="%"
      />
      <WeatherCard
        title="Wind Speed"
        value={weather?.windSpeed}
        unit=" m/s"
      />
    </div>
    </>
  );
}

export default WeatherDisplay; 