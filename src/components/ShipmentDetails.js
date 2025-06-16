import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Divider,
  Grid,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  LocalShipping as TruckIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Route as RouteIcon,
  MyLocation as MyLocationIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useShipment } from '../context/ShipmentContext';
import axios from 'axios';

const statusIcons = {
  pending: <ScheduleIcon color="disabled" />,
  in_transit: <TruckIcon color="info" />,
  out_for_delivery: <TruckIcon color="warning" />,
  delivered: <CheckCircleIcon color="success" />,
  exception: <ErrorIcon color="error" />,
};

const statusColors = {
  pending: 'default',
  in_transit: 'info',
  out_for_delivery: 'warning',
  delivered: 'success',
  exception: 'error',
};

const formatStatus = (status) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ShipmentDetails = ({ shipment, onUpdateLocation, updatingLocation, locationError }) => {
  const theme = useTheme();
  const { 
    updateShipmentStatus, 
    getRouteDistance, 
    updateLocationManually 
  } = useShipment();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusDescription, setStatusDescription] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);
  
  // New states for route distance and manual location
  const [routeDistanceData, setRouteDistanceData] = useState(null);
  const [loadingDistance, setLoadingDistance] = useState(false);
  const [distanceError, setDistanceError] = useState(null);
  
  const [manualLocationDialogOpen, setManualLocationDialogOpen] = useState(false);
  const [manualLocationData, setManualLocationData] = useState({
    coordinates: [0, 0],
    address: '',
    addressDetails: '',
    status: '',
    description: ''
  });
  const [updatingManualLocation, setUpdatingManualLocation] = useState(false);
  const [manualLocationError, setManualLocationError] = useState(null);
  
  // New states for address autocomplete
  const [addressInput, setAddressInput] = useState('');
  const [addressOptions, setAddressOptions] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // Geocoding API key - in a real app, use environment variables
  const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
  
  // Fetch route distance
  const fetchRouteDistance = async (trackingNumber) => {
    try {
      setLoadingDistance(true);
      setDistanceError(null);
      const data = await getRouteDistance(trackingNumber);
      setRouteDistanceData(data);
    } catch (error) {
      console.error('Error fetching route distance:', error);
      setDistanceError(error.message);
    } finally {
      setLoadingDistance(false);
    }
  };

  // Fetch address suggestions from Mapbox Geocoding API
  const fetchAddressSuggestions = async (query) => {
    if (!query || query.length < 3 || !MAPBOX_TOKEN) return;
    
    try {
      setLoadingAddresses(true);
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
        {
          params: {
            access_token: MAPBOX_TOKEN,
            autocomplete: true,
            limit: 5,
          }
        }
      );
      
      if (response.data && response.data.features) {
        const suggestions = response.data.features.map(feature => ({
          place_name: feature.place_name,
          center: feature.center, // [longitude, latitude]
        }));
        setAddressOptions(suggestions);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Debounce function for address search
  const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };
  
  // Fixed inline function for useCallback to avoid dependency warnings
  const debouncedFetchAddresses = useCallback((query) => {
    const delayedFetch = debounce((q) => fetchAddressSuggestions(q), 300);
    delayedFetch(query);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Fetch route distance on component mount
  useEffect(() => {
    if (shipment && shipment.trackingNumber) {
      fetchRouteDistance(shipment.trackingNumber);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipment]);
  
  if (!shipment) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Loading shipment details...</Typography>
      </Box>
    );
  }

  const {
    trackingNumber,
    status,
    origin,
    destination,
    currentLocation,
    estimatedDelivery,
    items = [],
    history = [],
    // We'll keep this even though it's unused to maintain compatibility with the rest of the code
    // eslint-disable-next-line no-unused-vars
    checkpoints = [],
  } = shipment;

  const { customer } = shipment;

  // Calculate delivery progress (0-100%)
  const getDeliveryProgress = () => {
    if (status === 'delivered') return 100;
    
    const totalDistance = getDistance(
      origin.coordinates[1],
      origin.coordinates[0],
      destination.coordinates[1],
      destination.coordinates[0]
    );
    
    const distanceTraveled = getDistance(
      origin.coordinates[1],
      origin.coordinates[0],
      currentLocation.coordinates[1],
      currentLocation.coordinates[0]
    );
    
    return Math.min(Math.round((distanceTraveled / totalDistance) * 100), 95);
  };

  // Helper function to calculate distance between two points using Haversine formula
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const progress = getDeliveryProgress();
  const isDelivered = status === 'delivered';
  const isInTransit = status === 'in_transit' || status === 'out_for_delivery';

  // Handle address select
  const handleAddressSelect = (event, value) => {
    if (value && typeof value !== 'string') {
      // Extract main address and preserve any existing additional details
      const mainAddress = value.place_name;
      
      // Update the location data with the selected address
      setManualLocationData({
        ...manualLocationData,
        coordinates: value.center, // [longitude, latitude]
        address: mainAddress
        // Keep existing addressDetails
      });
      
      // Update the input field
      setAddressInput(mainAddress);
    }
    
    // Clear predictions
    setAddressOptions([]);
  };
  
  // Handle address input change
  const handleAddressInputChange = (event, value) => {
    setAddressInput(value);
    debouncedFetchAddresses(value);
  };

  // Handle manual location update
  const handleManualLocationUpdate = async () => {
    try {
      setUpdatingManualLocation(true);
      setManualLocationError(null);
      
      // Validate coordinates
      if (!manualLocationData.coordinates || 
          !Array.isArray(manualLocationData.coordinates) || 
          manualLocationData.coordinates.length !== 2) {
        throw new Error('Invalid coordinates format. Please enter valid longitude and latitude.');
      }
      
      // Validate longitude and latitude
      const [longitude, latitude] = manualLocationData.coordinates;
      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        throw new Error('Invalid longitude. Must be between -180 and 180.');
      }
      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        throw new Error('Invalid latitude. Must be between -90 and 90.');
      }
      
      // Validate address
      if (!manualLocationData.address) {
        throw new Error('Address is required.');
      }
      
      // Combine address with additional details if provided
      const fullAddress = manualLocationData.address + 
        (manualLocationData.addressDetails ? `, ${manualLocationData.addressDetails}` : '');
      
      // Update location with combined address
      await updateLocationManually(shipment.trackingNumber, {
        ...manualLocationData,
        address: fullAddress
      });
      
      // Close dialog
      setManualLocationDialogOpen(false);
      
      // Refresh route distance
      fetchRouteDistance(shipment.trackingNumber);
      
    } catch (error) {
      console.error('Error updating location manually:', error);
      setManualLocationError(error.message);
    } finally {
      setUpdatingManualLocation(false);
    }
  };

  // Open manual location dialog
  const openManualLocationDialog = () => {
    // Initialize with current location if available
    if (shipment && shipment.currentLocation) {
      // Extract address details if present (assuming address might contain additional details after a comma)
      let address = shipment.currentLocation.address;
      let addressDetails = '';
      
      const commaIndex = address.indexOf(',');
      if (commaIndex > -1) {
        // Try to separate main address from details
        const mainAddress = address.substring(0, commaIndex).trim();
        addressDetails = address.substring(commaIndex + 1).trim();
        address = mainAddress;
      }
      
      setManualLocationData({
        coordinates: shipment.currentLocation.coordinates,
        address: address,
        addressDetails: addressDetails,
        status: shipment.status,
        description: 'Location updated manually'
      });
      setAddressInput(address);
    } else {
      setManualLocationData({
        coordinates: [0, 0],
        address: '',
        addressDetails: '',
        status: '',
        description: 'Location updated manually'
      });
      setAddressInput('');
    }
    setManualLocationError(null);
    setAddressOptions([]);
    setManualLocationDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    
    setUpdatingStatus(true);
    setStatusError(null);
    
    try {
      await updateShipmentStatus(shipment.trackingNumber, {
        status: newStatus,
        description: statusDescription || `Status updated to ${formatStatus(newStatus)}`
      });
      
      setStatusDialogOpen(false);
      // The shipment context will update the shipment data
    } catch (error) {
      setStatusError(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openStatusDialog = () => {
    setNewStatus(shipment.status);
    setStatusDescription('');
    setStatusDialogOpen(true);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="overline" color="textSecondary">Tracking Number</Typography>
          <Typography variant="h6" fontWeight="bold">{trackingNumber}</Typography>
        </Box>
        <Box display="flex" alignItems="center">
        <Chip
          icon={statusIcons[status] || <InfoIcon />}
          label={formatStatus(status)}
          color={statusColors[status] || 'default'}
          variant="outlined"
          size="medium"
            sx={{ textTransform: 'capitalize', px: 1, mr: 1 }}
        />
          <IconButton
            size="small"
            onClick={openStatusDialog}
            color="primary"
            sx={{ ml: 1 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Delivery Progress */}
      {isInTransit && (
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="textSecondary">
              {isDelivered ? 'Delivered' : 'In Transit'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {progress}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            color={isDelivered ? "success" : "primary"}
            sx={{ height: 8, borderRadius: 4 }}
          />
          {!isDelivered && (
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="caption" color="textSecondary">
                {new Date().toLocaleDateString()}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Est. Delivery: {new Date(estimatedDelivery).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Route Distance Information */}
      <Box mb={4}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          <RouteIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Route Distance
        </Typography>
        
        {loadingDistance ? (
          <LinearProgress sx={{ my: 2 }} />
        ) : distanceError ? (
          <Typography color="error" variant="body2">{distanceError}</Typography>
        ) : routeDistanceData ? (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <Typography variant="body2" color="textSecondary">Total</Typography>
              <Typography variant="body1">{routeDistanceData.totalDistance} km</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="textSecondary">Traveled</Typography>
              <Typography variant="body1">{routeDistanceData.distanceTraveled} km</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="textSecondary">Remaining</Typography>
              <Typography variant="body1">{routeDistanceData.remainingDistance} km</Typography>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="textSecondary">Distance data not available</Typography>
        )}
      </Box>

      {/* Checkpoints Section */}
      {shipment && shipment.checkpoints && shipment.checkpoints.length > 0 && (
        <Box mb={4}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            <LocationIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Checkpoints
          </Typography>
          
          <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1 }}>
            {shipment.checkpoints.map((checkpoint, index) => (
              <ListItem 
                key={index}
                sx={{
                  borderLeft: `4px solid ${checkpoint.reached ? theme.palette.success.main : theme.palette.grey[400]}`,
                  mb: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1
                }}
              >
                <ListItemIcon>
                  {checkpoint.reached ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <LocationIcon color="action" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={checkpoint.name}
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" component="span" color="text.primary">
                        {checkpoint.location?.address}
                      </Typography>
                      {checkpoint.estimatedArrival && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Estimated arrival: {new Date(checkpoint.estimatedArrival).toLocaleDateString()}
                        </Typography>
                      )}
                      {checkpoint.notes && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {checkpoint.notes}
                        </Typography>
                      )}
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Location Information */}
      <Box mb={4}>
        <Typography variant="subtitle1" fontWeight="bold" mb={2}>
          Shipment Details
        </Typography>
        <List disablePadding>
          <ListItem disableGutters>
            <ListItemIcon>
              <LocationIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Current Location"
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    {currentLocation?.address || 'N/A'}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {currentLocation?.timestamp 
                      ? new Date(currentLocation.timestamp).toLocaleString() 
                      : ''}
                  </Typography>
                </>
              }
            />
          </ListItem>
          
          <ListItem disableGutters>
            <ListItemIcon>
              <AssignmentIcon color="action" />
            </ListItemIcon>
            <ListItemText 
              primary="Status"
              secondary={
                <Chip 
                  label={formatStatus(status)} 
                  size="small" 
                  color={statusColors[status] || 'default'}
                  variant="outlined"
                />
              }
            />
          </ListItem>
          
          <ListItem disableGutters>
            <ListItemIcon>
              <CalendarIcon color="action" />
            </ListItemIcon>
            <ListItemText 
              primary="Estimated Delivery"
              secondary={
                <Typography variant="body2" color="text.primary">
                  {new Date(estimatedDelivery).toLocaleString()}
                </Typography>
              }
            />
          </ListItem>
          
          <ListItem disableGutters>
            <ListItemIcon>
              <TruckIcon color="action" />
            </ListItemIcon>
            <ListItemText 
              primary="Items"
              secondary={`${items.length} item${items.length !== 1 ? 's' : ''}`}
            />
          </ListItem>
        </List>
      </Box>

      {/* Customer Information */}
      {customer && (
        <Box mb={4}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Customer Information
          </Typography>
          <List disablePadding>
            <ListItem disableGutters>
              <ListItemIcon>
                <PersonIcon color="action" />
              </ListItemIcon>
              <ListItemText 
                primary="Name"
                secondary={customer.name || 'N/A'}
              />
            </ListItem>
            
            {customer.email && (
              <ListItem disableGutters>
                <ListItemIcon>
                  <EmailIcon color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email"
                  secondary={customer.email}
                />
              </ListItem>
            )}
            
            {customer.phone && (
              <ListItem disableGutters>
                <ListItemIcon>
                  <PhoneIcon color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary="Phone"
                  secondary={customer.phone}
                />
              </ListItem>
            )}
          </List>
        </Box>
      )}

      {/* Location Update Buttons */}
      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        <Button
          variant="outlined"
          color="primary"
          onClick={onUpdateLocation}
          disabled={updatingLocation || isDelivered}
          startIcon={<MyLocationIcon />}
          fullWidth
        >
          {updatingLocation ? 'Updating...' : 'Update to Current Location'}
        </Button>
        
        <Button
          variant="outlined"
          color="secondary"
          onClick={openManualLocationDialog}
          disabled={isDelivered}
          startIcon={<EditIcon />}
          fullWidth
        >
          Update Location Manually
        </Button>
        
        {locationError && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {locationError}
          </Typography>
        )}
      </Box>

      {/* Shipment History */}
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" mb={2}>
          Shipment History
        </Typography>
        <List disablePadding>
          {history.length > 0 ? (
            history.map((event, index) => (
              <React.Fragment key={index}>
                <ListItem disableGutters alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      {index === history.length - 1 ? (
                        <LocationIcon fontSize="small" />
                      ) : (
                        <CheckCircleIcon fontSize="small" />
                      )}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="medium">
                        {event.description || 'Status updated'}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.primary">
                          {event.location?.address || 'Location not specified'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(event.timestamp).toLocaleString()}
                        </Typography>
                      </>
                    }
                    sx={{ my: 0 }}
                  />
                </ListItem>
                {index < history.length - 1 && (
                  <Box sx={{ ml: '28px', my: 0, height: 24, borderLeft: `2px solid ${theme.palette.divider}` }} />
                )}
              </React.Fragment>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              No history available
            </Typography>
          )}
        </List>
      </Box>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Shipment Status</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 300, mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_transit">In Transit</MenuItem>
                <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="exception">Exception</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Description (optional)"
              value={statusDescription}
              onChange={(e) => setStatusDescription(e.target.value)}
              placeholder="Enter a description for this status update"
              multiline
              rows={2}
            />
            
            {statusError && (
              <Typography color="error" variant="body2" mt={1}>
                {statusError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained" 
            color="primary"
            disabled={updatingStatus || !newStatus}
          >
            {updatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Location Update Dialog */}
      <Dialog 
        open={manualLocationDialogOpen} 
        onClose={() => setManualLocationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Location Manually</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Address Autocomplete */}
            <Autocomplete
              fullWidth
              freeSolo
              options={addressOptions}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.place_name}
              value={addressInput}
              onChange={handleAddressSelect}
              onInputChange={handleAddressInputChange}
              loading={loadingAddresses}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Address"
                  margin="normal"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon color="action" />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {loadingAddresses ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <LocationIcon sx={{ mr: 1 }} />
                  {option.place_name}
                </li>
              )}
            />

            <TextField
              fullWidth
              label="Additional Address Details (optional)"
              value={manualLocationData.addressDetails}
              onChange={(e) => setManualLocationData({
                ...manualLocationData,
                addressDetails: e.target.value
              })}
              placeholder="Apartment, suite, unit, building, floor, etc."
              margin="normal"
            />

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Coordinates</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Longitude"
                  type="number"
                  fullWidth
                  value={manualLocationData.coordinates[0]}
                  onChange={(e) => setManualLocationData({
                    ...manualLocationData,
                    coordinates: [parseFloat(e.target.value), manualLocationData.coordinates[1]]
                  })}
                  InputProps={{
                    inputProps: { 
                      min: -180, 
                      max: 180,
                      step: 0.000001
                    }
                  }}
                  helperText="Range: -180 to 180"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Latitude"
                  type="number"
                  fullWidth
                  value={manualLocationData.coordinates[1]}
                  onChange={(e) => setManualLocationData({
                    ...manualLocationData,
                    coordinates: [manualLocationData.coordinates[0], parseFloat(e.target.value)]
                  })}
                  InputProps={{
                    inputProps: { 
                      min: -90, 
                      max: 90,
                      step: 0.000001
                    }
                  }}
                  helperText="Range: -90 to 90"
                  margin="normal"
                />
              </Grid>
            </Grid>

            <TextField
              label="Address"
              fullWidth
              value={manualLocationData.address}
              onChange={(e) => setManualLocationData({
                ...manualLocationData,
                address: e.target.value
              })}
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Status (Optional)</InputLabel>
              <Select
                value={manualLocationData.status}
                onChange={(e) => setManualLocationData({
                  ...manualLocationData,
                  status: e.target.value
                })}
                label="Status (Optional)"
              >
                <MenuItem value="">
                  <em>No change</em>
                </MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_transit">In Transit</MenuItem>
                <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="exception">Exception</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description (Optional)"
              fullWidth
              value={manualLocationData.description}
              onChange={(e) => setManualLocationData({
                ...manualLocationData,
                description: e.target.value
              })}
              margin="normal"
            />

            {manualLocationError && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {manualLocationError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setManualLocationDialogOpen(false)} 
            disabled={updatingManualLocation}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleManualLocationUpdate} 
            variant="contained" 
            color="primary"
            disabled={updatingManualLocation}
          >
            {updatingManualLocation ? 'Updating...' : 'Update Location'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ShipmentDetails;
