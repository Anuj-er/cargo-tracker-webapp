import React, { createContext, useState, useContext, useCallback } from 'react';
import { shipmentService } from '../services/api';

const ShipmentContext = createContext();

export const ShipmentProvider = ({ children }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);

  const trackShipment = useCallback(async (number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await shipmentService.getShipment(number);
      setShipment(data);
      setTrackingNumber(number);
    } catch (err) {
      setError(err.message);
      setShipment(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const getShipment = useCallback(async (number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentService.getShipment(number);
      
      // Handle different response formats
      let shipmentData;
      if (response.success && response.data) {
        // New API format: { success: true, data: {...} }
        shipmentData = response.data;
      } else if (response.data) {
        // Alternative format: { data: {...} }
        shipmentData = response.data;
      } else {
        // Direct data format
        shipmentData = response;
      }
      
      setShipment(shipmentData);
      setTrackingNumber(number);
      return shipmentData;
    } catch (err) {
      setError(err.message || 'Failed to fetch shipment details');
      setShipment(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateShipmentLocation = useCallback(async (number, locationData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentService.updateLocation(number, locationData);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update location');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateShipmentStatus = useCallback(async (number, statusData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentService.updateStatus(number, statusData);
      setShipment(response.data || response); // Update local state with new data
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRouteDistance = useCallback(async (number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentService.getRouteDistance(number);
      
      // Handle different response formats
      let distanceData;
      if (response.success && response.data) {
        distanceData = response.data;
      } else if (response.data) {
        distanceData = response.data;
      } else {
        distanceData = response;
      }
      
      setRouteDistance(distanceData);
      return distanceData;
    } catch (err) {
      setError(err.message || 'Failed to fetch route distance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocationManually = useCallback(async (number, locationData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentService.updateLocationManually(number, locationData);
      
      // Update local state with new data
      if (response.data) {
        setShipment(response.data);
      } else {
        setShipment(response);
      }
      
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update location manually');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a checkpoint to a shipment
  const addCheckpoint = useCallback(async (number, checkpointData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentService.addCheckpoint(number, checkpointData);
      
      // Update local state with new data
      if (response.data) {
        setShipment(response.data);
      } else {
        setShipment(response);
      }
      
      return response;
    } catch (err) {
      setError(err.message || 'Failed to add checkpoint');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a checkpoint
  const updateCheckpoint = useCallback(async (number, checkpointId, checkpointData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentService.updateCheckpoint(number, checkpointId, checkpointData);
      
      // Update local state with new data
      if (response.data) {
        setShipment(response.data);
      } else {
        setShipment(response);
      }
      
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update checkpoint');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a checkpoint
  const deleteCheckpoint = useCallback(async (number, checkpointId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentService.deleteCheckpoint(number, checkpointId);
      
      // Update local state with new data
      if (response.data) {
        setShipment(response.data);
      } else {
        setShipment(response);
      }
      
      return response;
    } catch (err) {
      setError(err.message || 'Failed to delete checkpoint');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createShipment = useCallback(async (shipmentData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentService.createShipment(shipmentData);
      
      // Handle different response formats
      let createdShipment;
      if (response.success && response.data) {
        // New API format: { success: true, data: {...} }
        createdShipment = response.data;
      } else if (response.data) {
        // Alternative format: { data: {...} }
        createdShipment = response.data;
      } else {
        // Direct data format
        createdShipment = response;
      }
      
      setShipment(createdShipment);
      
      // Make sure we have a tracking number
      if (createdShipment.trackingNumber) {
        setTrackingNumber(createdShipment.trackingNumber);
      }
      
      return response; // Return the full response for the component to handle
    } catch (err) {
      setError(err.message || 'Failed to create shipment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearShipment = useCallback(() => {
    setShipment(null);
    setTrackingNumber('');
    setError(null);
    setRouteDistance(null);
  }, []);

  return (
    <ShipmentContext.Provider value={{
      trackingNumber,
      setTrackingNumber,
      shipment,
      loading,
      error,
      routeDistance,
      trackShipment,
      getShipment,
      updateShipmentLocation,
      updateShipmentStatus,
      getRouteDistance,
      updateLocationManually,
      addCheckpoint,
      updateCheckpoint,
      deleteCheckpoint,
      createShipment,
      clearShipment
    }}>
      {children}
    </ShipmentContext.Provider>
  );
};

export const useShipment = () => {
  const context = useContext(ShipmentContext);
  if (!context) {
    throw new Error('useShipment must be used within a ShipmentProvider');
  }
  return context;
};
