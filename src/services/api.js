import axios from 'axios';

// Use environment variable if available, otherwise use a relative URL that works in both development and production
const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => {
    // For successful responses, return the response directly
    return response;
  },
  error => {
    // For errors, add more context
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      
      const errorData = error.response.data;
      
      // Extract the most useful error message
      if (errorData.details && process.env.NODE_ENV === 'development') {
        // Use detailed error in development
        error.message = errorData.details;
      } else if (errorData.error) {
        error.message = errorData.error;
      } else if (errorData.message) {
        error.message = errorData.message;
      } else if (typeof errorData === 'string') {
        error.message = errorData;
      } else {
        error.message = `Server error (${error.response.status})`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
      error.message = 'No response from server. Please check your connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Error:', error.message);
      if (!error.message) {
        error.message = 'Request failed. Please try again.';
      }
    }
    return Promise.reject(error);
  }
);

export const shipmentService = {
  // Get all shipments
  getAllShipments: async (filters = {}) => {
    try {
      const response = await api.get('/shipments', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching shipments:', error);
      throw error;
    }
  },

  // Get shipment by tracking number
  getShipment: async (trackingNumber) => {
    try {
      const response = await api.get(`/shipments/${trackingNumber}`);
      
      // Check if the response has the expected format
      if (!response.data) {
        throw new Error('Invalid response from server');
      }
      
      // If the response has a data property, return that, otherwise return the whole response
      return response.data.data ? response.data : response.data;
    } catch (error) {
      console.error(`Error fetching shipment ${trackingNumber}:`, error);
      
      // Enhance error message
      if (error.response && error.response.status === 404) {
        error.message = `Shipment with tracking number ${trackingNumber} not found`;
      } else if (!error.message) {
        error.message = `Failed to fetch shipment details for ${trackingNumber}`;
      }
      
      throw error;
    }
  },

  // Create new shipment
  createShipment: async (shipmentData) => {
    try {
      const response = await api.post('/shipments', shipmentData);
      
      // Check if the response has the expected format
      if (!response.data) {
        throw new Error('Invalid response from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating shipment:', error);
      
      // Enhance error message
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        // If the server returned validation errors, format them nicely
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(err => err.msg || err.message).join(', ');
          error.message = `Validation error: ${errorMessages}`;
        } else if (errorData.error) {
          error.message = errorData.error;
        } else if (errorData.message) {
          error.message = errorData.message;
        }
      } else if (!error.message) {
        error.message = 'Failed to create shipment. Please try again later.';
      }
      
      throw error;
    }
  },

  // Update shipment location
  updateLocation: async (trackingNumber, locationData) => {
    try {
      const response = await api.patch(`/shipments/${trackingNumber}/location`, locationData);
      return response.data;
    } catch (error) {
      console.error(`Error updating location for shipment ${trackingNumber}:`, error);
      throw error;
    }
  },

  // Update shipment status
  updateStatus: async (trackingNumber, statusData) => {
    try {
      const response = await api.patch(`/shipments/${trackingNumber}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error(`Error updating status for shipment ${trackingNumber}:`, error);
      throw error;
    }
  },

  // Get shipment ETA
  getETA: async (trackingNumber) => {
    try {
      const response = await api.get(`/shipments/${trackingNumber}/eta`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ETA for shipment ${trackingNumber}:`, error);
      throw error;
    }
  },

  // Get shipment history
  getHistory: async (trackingNumber) => {
    try {
      const response = await api.get(`/shipments/${trackingNumber}/history`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching history for shipment ${trackingNumber}:`, error);
      throw error;
    }
  },

  // Get shipment route distance
  getRouteDistance: async (trackingNumber) => {
    try {
      const response = await api.get(`/shipments/${trackingNumber}/distance`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching route distance for shipment ${trackingNumber}:`, error);
      throw error;
    }
  },

  // Update shipment location manually
  updateLocationManually: async (trackingNumber, locationData) => {
    try {
      const response = await api.patch(`/shipments/${trackingNumber}/location/manual`, locationData);
      return response.data;
    } catch (error) {
      console.error(`Error updating location manually for shipment ${trackingNumber}:`, error);
      throw error;
    }
  },

  // Add a checkpoint to a shipment
  addCheckpoint: async (trackingNumber, checkpointData) => {
    try {
      const response = await api.post(`/shipments/${trackingNumber}/checkpoints`, checkpointData);
      return response.data;
    } catch (error) {
      console.error(`Error adding checkpoint to shipment ${trackingNumber}:`, error);
      throw error;
    }
  },

  // Update a checkpoint
  updateCheckpoint: async (trackingNumber, checkpointId, checkpointData) => {
    try {
      const response = await api.patch(`/shipments/${trackingNumber}/checkpoints/${checkpointId}`, checkpointData);
      return response.data;
    } catch (error) {
      console.error(`Error updating checkpoint ${checkpointId} for shipment ${trackingNumber}:`, error);
      throw error;
    }
  },

  // Delete a checkpoint
  deleteCheckpoint: async (trackingNumber, checkpointId) => {
    try {
      const response = await api.delete(`/shipments/${trackingNumber}/checkpoints/${checkpointId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting checkpoint ${checkpointId} for shipment ${trackingNumber}:`, error);
      throw error;
    }
  },

  // Seed database with sample data (development only)
  seedDatabase: async () => {
    try {
      const response = await api.post('/shipments/seed');
      return response.data;
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  },

  // Seed database with Indian shipment data
  seedIndianData: async (count = 15) => {
    try {
      const response = await api.post(`/shipments/seed/india?count=${count}`);
      return response.data;
    } catch (error) {
      console.error('Error seeding Indian data:', error);
      throw error;
    }
  }
};

export default api; 