import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket';
import styles from './LocationSender.module.css';
import { Button } from '../Button/Button';
import { Select } from '../Select/Select';
import { Input } from '../Input/Input';

type LocationAckResponse =
  | { success: true; location: string; message?: never }
  | { success: false; location?: never; message: string };

type LocationInputType = 'name' | 'coordinates';

const LocationSender: React.FC = () => {
  const [status, setStatus] = useState<string>('Idle');
  const { socket } = useSocket();
  const [loading, setLoading] = useState<boolean>(false);
  const [locationSent, setLocationSent] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [locationType, setLocationType] = useState<LocationInputType>('name');
  const [locationInput, setLocationInput] = useState<string>('');
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    if (!socket || !socket.connected) {
      setStatus('Waiting for connection...');
      return;
    }

    setStatus('Fetching location...');
    socket.on('locationSetAck', ({ success, location, message }: LocationAckResponse) => {
      if (success) {
        setLocationSent(location);
        setLoading(false);
        setIsError(false);
        setStatus('Location sent successfully!');
      } else {
        setIsError(true);
        setLoading(false);
        setStatus(message || 'Location not sent');
      }
    });

    return () => {
      socket.off('locationSetAck');
    };
  }, [socket]);

  const handleLocationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocationType(e.target.value as LocationInputType);
    setLocationInput('');
    setCoordinates({ latitude: '', longitude: '' });
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationInput(e.target.value);
  };

  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCoordinates(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendLocation = () => {
    let locationToSend = '';
    if (locationType === 'coordinates') {
      if (coordinates.latitude && coordinates.longitude) {
        locationToSend = `${coordinates.latitude},${coordinates.longitude}`;
      }
    } else {
      locationToSend = locationInput;
    }

    if (locationToSend) {
      setLoading(true);
      socket?.emit('setLocation', locationToSend);
    }
  };

  const locationStatusByAck = () => {
    if (locationSent) {
      if (isError) {
        return <span title={status} className={styles.error}>✕</span>;
      } else {
        return <span title="Success" className={styles.success}>✓</span>;
      }
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <Select
          value={locationType}
          onChange={handleLocationTypeChange}
        >
          <option value="name">Location by Name</option>
          <option value="coordinates">Location by Coordinates</option>
        </Select>

        {locationType === 'name' ? (
          <Input
            type="text"
            id="location"
            name="location"
            placeholder="Enter location name (e.g., New York, London)"
            value={locationInput}
            onChange={handleNameInputChange}
            required
          />
        ) : (
          <div className={styles.coordinatesGroup}>
            <Input
              type="number"
              id="latitude"
              name="latitude"
              placeholder="Latitude"
              value={coordinates.latitude}
              onChange={handleCoordinateChange}
              step="0.000001"
              min="-90"
              max="90"
              required
            />
            <Input
              type="number"
              id="longitude"
              name="longitude"
              placeholder="Longitude"
              value={coordinates.longitude}
              onChange={handleCoordinateChange}
              step="0.000001"
               min="-90"
              max="90"
              required
            />
          </div>
        )}

        <Button onClick={handleSendLocation}>
          Send Location
        </Button>
      </div>

      <div className={styles.status}>
        <span className={styles.location}>
          {
             locationType === 'name' 
          }
          Location: {loading ? 'Loading...' : locationSent || 'Not set'} {locationStatusByAck()}
        </span>
      </div>
    </div>
  );
};

export default LocationSender; 