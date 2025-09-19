import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  LocationOn,
  MyLocation,
  Refresh,
  LocationOff,
  GpsFixed,
  Map,
} from '@mui/icons-material';

interface LocationTrackerProps {
  currentLocation: {
    lat: number;
    lng: number;
  };
  onLocationUpdate: (lat: number, lng: number) => void;
}

interface NearbyPlace {
  id: string;
  name: string;
  type: string;
  distance: number;
  safetyRating: number;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({
  currentLocation,
  onLocationUpdate,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [autoTrackingEnabled, setAutoTrackingEnabled] = useState(false);
  const [trackingAccuracy, setTrackingAccuracy] = useState<number | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [locationHistory, setLocationHistory] = useState<{lat: number, lng: number, timestamp: Date}[]>([]);
  const watchIdRef = useRef<number | null>(null);

  // Initialize map with enhanced features
  useEffect(() => {
    if (!mapContainer.current) return;

    // Enhanced map visualization with location details
    const mapElement = mapContainer.current;
    mapElement.innerHTML = `
      <div style="
        width: 100%;
        height: 350px;
        background: linear-gradient(45deg, #e3f2fd 25%, transparent 25%), 
                    linear-gradient(-45deg, #e3f2fd 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #e3f2fd 75%), 
                    linear-gradient(-45deg, transparent 75%, #e3f2fd 75%);
        background-size: 20px 20px;
        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        color: #666;
        font-family: Arial, sans-serif;
        position: relative;
        border: 2px solid #e0e0e0;
      ">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 24px; margin-bottom: 8px;">🗺️ Interactive Tourist Map</div>
          <div style="font-size: 14px; color: #888;">
            Current: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}
          </div>
          ${userLocation ? `<div style="font-size: 14px; color: #4CAF50; font-weight: bold;">
            Live: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}
          </div>` : ''}
        </div>
        <div style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.9); padding: 8px; border-radius: 4px; font-size: 12px;">
          📍 You are here
        </div>
        <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(255,255,255,0.9); padding: 8px; border-radius: 4px; font-size: 12px;">
          🔒 Secure Location Tracking
        </div>
      </div>
    `;
  }, [currentLocation, userLocation]);

  // Enhanced location fetching with accuracy tracking
  const getCurrentLocation = () => {
    setIsTracking(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setIsTracking(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        
        setUserLocation(newLocation);
        setTrackingAccuracy(accuracy);
        onLocationUpdate(latitude, longitude);
        
        // Add to location history
        setLocationHistory(prev => [
          ...prev.slice(-9), // Keep last 10 locations
          { ...newLocation, timestamp: new Date() }
        ]);
        
        // Fetch nearby places (mock data for now)
        fetchNearbyPlaces(latitude, longitude);
        
        setIsTracking(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user. Please enable location permissions for enhanced safety features.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your GPS settings.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        setLocationError(errorMessage);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    );
  };

  // Auto tracking with enhanced monitoring
  const toggleAutoTracking = (enabled: boolean) => {
    setAutoTrackingEnabled(enabled);
    
    if (enabled) {
      startContinuousTracking();
    } else {
      stopContinuousTracking();
    }
  };

  const startContinuousTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        
        setUserLocation(newLocation);
        setTrackingAccuracy(accuracy);
        onLocationUpdate(latitude, longitude);
        
        // Add to location history
        setLocationHistory(prev => [
          ...prev.slice(-9),
          { ...newLocation, timestamp: new Date() }
        ]);
        
        // Update nearby places periodically
        fetchNearbyPlaces(latitude, longitude);
      },
      (error) => {
        console.error('Continuous location tracking error:', error);
        setLocationError('Location tracking interrupted. Please check your GPS settings.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );

    watchIdRef.current = watchId;
  };

  const stopContinuousTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Mock function to fetch nearby places
  const fetchNearbyPlaces = (lat: number, lng: number) => {
    // In a real app, this would call a places API
    const mockPlaces: NearbyPlace[] = [
      { id: '1', name: 'Tourist Information Center', type: 'info', distance: 0.3, safetyRating: 5 },
      { id: '2', name: 'Police Station', type: 'safety', distance: 0.8, safetyRating: 5 },
      { id: '3', name: 'Hospital', type: 'medical', distance: 1.2, safetyRating: 5 },
      { id: '4', name: 'Popular Restaurant', type: 'dining', distance: 0.5, safetyRating: 4 },
      { id: '5', name: 'Shopping Mall', type: 'shopping', distance: 0.7, safetyRating: 4 },
    ];
    setNearbyPlaces(mockPlaces);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopContinuousTracking();
    };
  }, []);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Location Tracker</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={userLocation ? <GpsFixed /> : <LocationOff />}
              label={userLocation ? 'Location Active' : 'Location Inactive'}
              color={userLocation ? 'success' : 'default'}
              size="small"
            />
            {trackingAccuracy && (
              <Chip
                label={`±${Math.round(trackingAccuracy)}m`}
                color={trackingAccuracy < 10 ? 'success' : trackingAccuracy < 50 ? 'warning' : 'error'}
                size="small"
              />
            )}
          </Box>
        </Box>

        {locationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {locationError}
          </Alert>
        )}

        {/* Enhanced Map Container */}
        <Box ref={mapContainer} sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }} />

        {/* Location Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {currentLocation.lat !== 0 && currentLocation.lng !== 0 && (
            <Typography variant="body2">
              <strong>Registered Location:</strong> {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </Typography>
          )}
          
          {userLocation && (
            <Box>
              <Typography variant="body2" color="success.main">
                <strong>Live Location:</strong> {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </Typography>
              {trackingAccuracy && (
                <Typography variant="caption" color="text.secondary">
                  Accuracy: ±{Math.round(trackingAccuracy)} meters
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Auto Tracking Control */}
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoTrackingEnabled}
                onChange={(e) => toggleAutoTracking(e.target.checked)}
                color="primary"
              />
            }
            label="Continuous Location Tracking"
          />
          <Typography variant="caption" display="block" color="text.secondary">
            Enables real-time location monitoring for enhanced safety
          </Typography>
        </Box>

        {/* Nearby Places */}
        {nearbyPlaces.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <Map sx={{ mr: 1, verticalAlign: 'middle', fontSize: 16 }} />
              Nearby Important Places
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 150, overflowY: 'auto' }}>
              {nearbyPlaces.slice(0, 5).map((place) => (
                <Box key={place.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {place.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {place.distance.toFixed(1)} km away
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip
                      label={place.type}
                      size="small"
                      color={
                        place.type === 'safety' ? 'error' :
                        place.type === 'medical' ? 'warning' :
                        place.type === 'info' ? 'info' : 'default'
                      }
                    />
                    <Typography variant="caption">
                      {'★'.repeat(place.safetyRating)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={isTracking ? <CircularProgress size={16} color="inherit" /> : <MyLocation />}
            onClick={getCurrentLocation}
            disabled={isTracking}
            size="small"
          >
            {isTracking ? 'Getting Location...' : 'Update Location'}
          </Button>
          
          <Button
            variant={autoTrackingEnabled ? "outlined" : "contained"}
            startIcon={autoTrackingEnabled ? <LocationOff /> : <GpsFixed />}
            onClick={() => toggleAutoTracking(!autoTrackingEnabled)}
            size="small"
            color={autoTrackingEnabled ? "error" : "success"}
          >
            {autoTrackingEnabled ? 'Stop Tracking' : 'Start Tracking'}
          </Button>
        </Box>

        {/* Safety Notice */}
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="caption" color="info.contrastText">
            🛡️ Your location is securely monitored for safety purposes. Data is encrypted and shared only with authorized personnel during emergencies.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LocationTracker;