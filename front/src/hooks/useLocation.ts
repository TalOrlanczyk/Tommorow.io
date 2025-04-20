import { useEffect, useState } from "react";

type Location = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
} 
export function useLocation(options: PositionOptions = {}) {
  const [location, setLocation] = useState<Location | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ code: number, message: string } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError({ code: 0, message: "Geolocation is not supported by this browser." });
      setLoading(false);
      return;
    }

    const geoOptions = {
      timeout: options.timeout || 10000,
      maximumAge: options.maximumAge || 0,
    };

    const onSuccess = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
      setError(null);
      setLoading(false);
    };

    const onError = (err: GeolocationPositionError) => {
      setError({ code: err.code, message: err.message });
      setLoading(false);
    };


    navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions);

    
  }, [])
  return { location, error, loading };
}
