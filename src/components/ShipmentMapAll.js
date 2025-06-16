import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';

// Use environment variable for Mapbox token
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// Disable Mapbox telemetry and analytics to prevent token exposure
mapboxgl.config.SEND_EVENTS_DEFAULT = false;

// Set the token
mapboxgl.accessToken = MAPBOX_TOKEN;

// Status color mapping
const statusColors = {
  pending: '#9e9e9e',
  in_transit: '#1976d2',
  out_for_delivery: '#ff9800',
  delivered: '#4caf50',
  exception: '#f44336'
};

const ShipmentMapAll = ({ shipments }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Check if token is available
    if (!MAPBOX_TOKEN) {
      console.error('Mapbox token is missing');
      setMapError('Mapbox token is missing. Please check your environment configuration.');
      setMapLoading(false);
      return;
    }
    
    try {
      setMapLoading(true);
      
      // Skip if no shipments or empty array
      if (!shipments || !Array.isArray(shipments) || shipments.length === 0) {
        // Render empty map with default center
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [-98.5795, 39.8283], // Center of US as default
          zoom: 3,
          attributionControl: false // Hide attribution for cleaner look
        });
        
        // Add navigation control
        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        
        // Handle map errors
        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
          setMapError('Error loading map. Please check your connection and try again.');
        });
        
        map.current.on('load', () => {
          setMapLoading(false);
        });
        
        return () => {
          if (map.current) map.current.remove();
        };
      }

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-98.5795, 39.8283], // Center of US as default
        zoom: 3,
        attributionControl: false // Hide attribution for cleaner look
      });

      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Error loading map. Please check your connection and try again.');
        setMapLoading(false);
      });

      // Add markers when map loads
      map.current.on('load', () => {
        // Create a bounds object to fit all markers
        const bounds = new mapboxgl.LngLatBounds();
        let hasValidCoordinates = false;
        
        // Add markers for each shipment
        shipments.forEach(shipment => {
          if (!shipment || !shipment.currentLocation || !shipment.currentLocation.coordinates) return;
          
          try {
            const coords = shipment.currentLocation.coordinates;
            
            // Skip invalid coordinates
            if (!Array.isArray(coords) || coords.length !== 2 || 
                !coords[0] || !coords[1] || 
                isNaN(coords[0]) || isNaN(coords[1])) {
              console.warn('Invalid coordinates for shipment:', shipment.trackingNumber);
              return;
            }
            
            // Add marker
            const color = statusColors[shipment.status] || '#1976d2';
            
            // Create a custom popup with better styling
            const popup = new mapboxgl.Popup({ 
              offset: 25,
              closeButton: false,
              maxWidth: '300px'
            }).setHTML(`
              <div style="padding: 8px; color: #000000;">
                <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #000000;">${shipment.trackingNumber || 'Unknown'}</h4>
                <p style="margin: 0 0 5px 0; font-size: 14px; color: #000000;">
                  <strong>Status:</strong> ${((shipment.status || 'unknown').replace(/_/g, ' '))}
                </p>
                <p style="margin: 0; font-size: 14px; color: #000000;">
                  ${shipment.currentLocation.address || 'No address available'}
                </p>
              </div>
            `);
            
            new mapboxgl.Marker({ 
              color,
              scale: 0.8 // Slightly smaller markers
            })
              .setLngLat(coords)
              .setPopup(popup)
              .addTo(map.current);
              
            // Extend bounds to include this marker
            bounds.extend(coords);
            hasValidCoordinates = true;
          } catch (err) {
            console.error('Error adding marker for shipment:', err);
          }
        });
        
        // If we have valid bounds, fit the map to those bounds
        if (hasValidCoordinates) {
          // Use a custom function to smoothly fit bounds to avoid requestAnimationFrame warning
          const fitBoundsWithoutWarning = () => {
            map.current.fitBounds(bounds, { 
              padding: 50,
              maxZoom: 12 // Limit zoom level for better context
            });
            setMapLoading(false);
          };
          
          // Use setTimeout instead of direct requestAnimationFrame
          setTimeout(fitBoundsWithoutWarning, 0);
        } else {
          // Default to US if no valid bounds
          bounds.extend([-125.0, 24.396308]);
          bounds.extend([-66.934570, 49.384358]);
          
          // Use setTimeout to avoid requestAnimationFrame warning
          setTimeout(() => {
            map.current.fitBounds(bounds, { padding: 50 });
            setMapLoading(false);
          }, 0);
        }
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setMapError('Failed to initialize map. Please check your connection and try again.');
      setMapLoading(false);
    }

    // Clean up on unmount
    return () => {
      if (map.current) map.current.remove();
    };
  }, [shipments]);

  if (mapError) {
    return (
      <Box sx={{ height: '100%', p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{mapError}</Alert>
        <Typography variant="body2">
          Please ensure you have a valid Mapbox token in your environment variables.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Box ref={mapContainer} sx={{ width: '100%', height: '100%' }} />
      {mapLoading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)'
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default ShipmentMapAll; 