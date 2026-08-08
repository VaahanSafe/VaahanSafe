import { useState, useCallback, useEffect } from 'react';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationState {
  location: LocationCoordinates | null;
  loading: boolean;
  error: string | null;
  permission: PermissionState | 'unknown';
  requestLocation: () => Promise<LocationCoordinates | null>;
}

/**
 * Enterprise Geolocation Hook for Emergency Dispatches & Scan Tagging
 * Tracks browser location permissions and handles user denial gracefully.
 */
export function useGeolocation(options: PositionOptions = { enableHighAccuracy: true, timeout: 10000 }): GeolocationState {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionState | 'unknown'>('unknown');

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setPermission(result.state);
          result.onchange = () => setPermission(result.state);
        })
        .catch(() => setPermission('unknown'));
    }
  }, []);

  const requestLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      const err = 'Geolocation is not supported by your browser';
      setError(err);
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(coords);
          setLoading(false);
          setPermission('granted');
          resolve(coords);
        },
        (err) => {
          let errorMsg = 'Failed to retrieve location.';
          if (err.code === err.PERMISSION_DENIED) {
            errorMsg = 'Location permission denied by user.';
            setPermission('denied');
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errorMsg = 'Location information unavailable.';
          } else if (err.code === err.TIMEOUT) {
            errorMsg = 'Location request timed out.';
          }
          setError(errorMsg);
          setLoading(false);
          resolve(null);
        },
        options
      );
    });
  }, [options]);

  return {
    location,
    loading,
    error,
    permission,
    requestLocation,
  };
}

export default useGeolocation;
