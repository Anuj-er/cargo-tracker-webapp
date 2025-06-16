import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Box, Typography, Paper, Alert } from '@mui/material';

// Use environment variable for Mapbox token
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// Disable Mapbox telemetry and analytics to prevent token exposure
mapboxgl.config.SEND_EVENTS_DEFAULT = false;

// Set the token
mapboxgl.accessToken = MAPBOX_TOKEN;

const ShipmentMap = ({ shipment }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapError, setMapError] = useState(null);
  const { origin, destination, currentLocation, status, checkpoints } = shipment || {};

  useEffect(() => {
    // Check if token is available
    if (!MAPBOX_TOKEN) {
      console.error('Mapbox token is missing');
      setMapError('Mapbox token is missing. Please check your environment configuration.');
      return;
    }

    // Safety check for required data
    if (!mapContainer.current || !origin || !destination || !currentLocation) {
      return;
    }

    // Validate coordinates
    const originCoords = origin.coordinates;
    const destCoords = destination.coordinates;
    const currentCoords = currentLocation.coordinates;
    
    if (!originCoords || !destCoords || !currentCoords ||
        !Array.isArray(originCoords) || !Array.isArray(destCoords) || !Array.isArray(currentCoords) ||
        originCoords.length !== 2 || destCoords.length !== 2 || currentCoords.length !== 2) {
      console.error('Invalid coordinates in shipment data');
      setMapError('Invalid location data. Cannot display map.');
      return;
    }

    try {
      // Initialize map with fallback
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [currentCoords[0], currentCoords[1]],
        zoom: 3
      });

      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Error loading map. Please check your connection and try again.');
      });

      // Add markers when map loads
      map.current.on('load', () => {
        try {
          // Add origin marker
          new mapboxgl.Marker({ color: '#3f51b5' })
            .setLngLat([originCoords[0], originCoords[1]])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="color: #000000;">
                <strong>Origin</strong><br>
                ${origin.address || ''}
              </div>
            `))
            .addTo(map.current);

          // Add destination marker
          new mapboxgl.Marker({ color: '#4caf50' })
            .setLngLat([destCoords[0], destCoords[1]])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="color: #000000;">
                <strong>Destination</strong><br>
                ${destination.address || ''}
              </div>
            `))
            .addTo(map.current);

          // Add checkpoint markers if available
          const checkpointMarkers = [];
          if (checkpoints && checkpoints.length > 0) {
            checkpoints.forEach((checkpoint, index) => {
              if (checkpoint.location && checkpoint.location.coordinates) {
                const cpCoords = checkpoint.location.coordinates;
                
                // Validate checkpoint coordinates
                if (Array.isArray(cpCoords) && cpCoords.length === 2) {
                  const marker = new mapboxgl.Marker({ color: checkpoint.reached ? '#4caf50' : '#9c27b0' })
                    .setLngLat([cpCoords[0], cpCoords[1]])
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
                      <div style="color: #000000;">
                        <strong>Checkpoint: ${checkpoint.name || `#${index + 1}`}</strong><br>
                        ${checkpoint.location.address || ''}<br>
                        <small>${checkpoint.reached ? 'Reached' : 'Not reached yet'}</small>
                      </div>
                    `))
                    .addTo(map.current);
                  
                  checkpointMarkers.push(marker);
                }
              }
            });
          }

          // Add current location marker
          new mapboxgl.Marker({ color: status === 'delivered' ? '#4caf50' : '#ff9800' })
            .setLngLat([currentCoords[0], currentCoords[1]])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="color: #000000;">
                <strong>${status === 'delivered' ? 'Delivered' : 'Current Location'}</strong><br>
                ${currentLocation.address || ''}<br>
                <small>${currentLocation.timestamp ? new Date(currentLocation.timestamp).toLocaleString() : ''}</small>
              </div>
            `))
            .addTo(map.current);

          // Add route line if the map is loaded
          if (map.current.loaded()) {
            addRouteLine();
          } else {
            map.current.once('load', addRouteLine);
          }

          // Fit bounds to include all markers
          const bounds = new mapboxgl.LngLatBounds()
            .extend([originCoords[0], originCoords[1]])
            .extend([destCoords[0], destCoords[1]])
            .extend([currentCoords[0], currentCoords[1]]);
          
          // Add checkpoint coordinates to bounds
          if (checkpoints && checkpoints.length > 0) {
            checkpoints.forEach(checkpoint => {
              if (checkpoint.location && checkpoint.location.coordinates) {
                const cpCoords = checkpoint.location.coordinates;
                if (Array.isArray(cpCoords) && cpCoords.length === 2) {
                  bounds.extend([cpCoords[0], cpCoords[1]]);
                }
              }
            });
          }

          map.current.fitBounds(bounds, { padding: 70 });
        } catch (err) {
          console.error('Error adding markers to map:', err);
          setMapError('Error adding shipment data to map.');
        }
      });

      function addRouteLine() {
        try {
          // Create route coordinates array including checkpoints
          const routeCoordinates = [
            [originCoords[0], originCoords[1]]
          ];
          
          // Add checkpoints to route in order
          if (checkpoints && checkpoints.length > 0) {
            // Sort checkpoints by their order or by estimated arrival time
            const sortedCheckpoints = [...checkpoints].sort((a, b) => {
              if (a.estimatedArrival && b.estimatedArrival) {
                return new Date(a.estimatedArrival) - new Date(b.estimatedArrival);
              }
              return 0;
            });
            
            sortedCheckpoints.forEach(checkpoint => {
              if (checkpoint.location && checkpoint.location.coordinates) {
                const cpCoords = checkpoint.location.coordinates;
                if (Array.isArray(cpCoords) && cpCoords.length === 2) {
                  routeCoordinates.push([cpCoords[0], cpCoords[1]]);
                }
              }
            });
          }
          
          // Add current location if not at destination
          if (currentCoords[0] !== destCoords[0] || currentCoords[1] !== destCoords[1]) {
            routeCoordinates.push([currentCoords[0], currentCoords[1]]);
          }
          
          // Add destination
          routeCoordinates.push([destCoords[0], destCoords[1]]);
          
          // Add route line
          if (!map.current.getSource('route')) {
            map.current.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: routeCoordinates
                }
              }
            });

            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': status === 'delivered' ? '#4caf50' : '#1976d2',
                'line-width': 3,
                'line-dasharray': status === 'delivered' ? [0, 0] : [2, 2]
              }
            });
          }
        } catch (err) {
          console.error('Error adding route line to map:', err);
        }
      }
    } catch (err) {
      console.error('Error initializing map:', err);
      setMapError('Failed to initialize map. Please check your connection and try again.');
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [origin, destination, currentLocation, status, checkpoints]);

  // Show error if any
  if (mapError) {
    return (
      <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', p: 2 }}>
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{mapError}</Alert>
        <Typography variant="body2">
          Please ensure you have a valid Mapbox token in your environment variables.
        </Typography>
      </Box>
    );
  }

  // Fallback UI for missing data
  if (!origin || !destination || !currentLocation) {
    return (
      <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading map data...</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}>
      <Box ref={mapContainer} sx={{ width: '100%', height: '100%' }} />
    </Paper>
  );
};

export default ShipmentMap;
