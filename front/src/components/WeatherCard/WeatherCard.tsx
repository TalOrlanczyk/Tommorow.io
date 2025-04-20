import React from 'react';
import styles from './WeatherCard.module.css'; 

interface WeatherCardProps {
  title: string;
  value?: number | null;
  unit: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ title, value, unit }) => {
  return (
    // Use styles from the CSS module
    <div className={styles.weatherCard}>
      <h3>{title}</h3>
      <p className={styles.weatherValue}>{value !== null ? `${value}${unit}` : 'Loading...'}</p>
    </div>
  );
};

export default WeatherCard; 