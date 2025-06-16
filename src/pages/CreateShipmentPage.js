import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShipment } from '../context/ShipmentContext';
import { useSnackbar } from 'notistack';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  FormHelperText,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { throttle } from 'lodash';
import LocationIcon from '@mui/icons-material/LocationOn';
import RouteIcon from '@mui/icons-material/Route';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';

// Use Mapbox for geocoding with environment variable
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// Common country codes for phone numbers
const countryCodes = [
  { code: '+1', country: 'US/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+86', country: 'China' },
  { code: '+81', country: 'Japan' },
  { code: '+7', country: 'Russia' },
  { code: '+55', country: 'Brazil' },
  { code: '+52', country: 'Mexico' },
  { code: '+27', country: 'South Africa' },
  { code: '+971', country: 'UAE' },
  { code: '+65', country: 'Singapore' },
  { code: '+82', country: 'South Korea' },
  { code: '+39', country: 'Italy' },
  { code: '+34', country: 'Spain' },
  { code: '+31', country: 'Netherlands' },
  { code: '+46', country: 'Sweden' },
  { code: '+41', country: 'Switzerland' },
  { code: '+66', country: 'Thailand' },
  { code: '+60', country: 'Malaysia' },
  { code: '+64', country: 'New Zealand' },
  { code: '+92', country: 'Pakistan' },
  { code: '+880', country: 'Bangladesh' },
  { code: '+63', country: 'Philippines' },
  { code: '+84', country: 'Vietnam' },
  { code: '+62', country: 'Indonesia' },
  { code: '+20', country: 'Egypt' },
  { code: '+234', country: 'Nigeria' },
];

// Use Mapbox for geocoding
const searchAddress = async (query) => {
  if (!query || query.length < 3) return [];
  
  try {
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      autocomplete: true,
      country: 'us,in', // Include both US and India
      limit: 8
    });
    
    const response = await fetch(`${endpoint}?${params}`);
    const data = await response.json();
    
    return data.features.map(feature => ({
      id: feature.id,
      place_id: feature.id,
      description: feature.place_name,
      coordinates: feature.center, // [longitude, latitude]
      address: feature.place_name,
      country: feature.context?.find(c => c.id.startsWith('country'))?.text || 'Unknown'
    }));
  } catch (error) {
    console.error('Error searching address:', error);
    return [];
  }
};

const steps = ['Shipment Details', 'Customer Information', 'Items'];

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone validation regex - more flexible for international formats
const phoneRegex = /^[0-9\s\-()]{5,15}$/;

const CreateShipmentPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { createShipment } = useShipment();
  
  const [formData, setFormData] = useState({
    origin: {
      address: '',
      coordinates: [0, 0],
      addressDetails: '', // Additional field for manual address details
    },
    destination: {
      address: '',
      coordinates: [0, 0],
      addressDetails: '', // Additional field for manual address details
    },
    checkpoints: [], // Array to store checkpoints
    customer: {
      name: '',
      email: '',
      phone: '',
      phoneCountryCode: '+1', // Default country code
    },
    items: [
      {
        description: '',
        quantity: 1,
        weight: 0,
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
        },
      },
    ],
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Default 3 days from now
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1); // Start at step 1 instead of 0
  const [originPredictions, setOriginPredictions] = useState([]);
  const [destinationPredictions, setDestinationPredictions] = useState([]);
  const [checkpointPredictions, setCheckpointPredictions] = useState([]);
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState(null);
  
  // Throttled function to fetch place predictions
  const fetchPredictions = useMemo(
    () =>
      throttle(async (query, field) => {
        if (query.length < 3) return;
        
        const predictions = await searchAddress(query);
        
        if (field === 'origin') {
          setOriginPredictions(predictions);
        } else if (field === 'destination') {
          setDestinationPredictions(predictions);
        } else if (field === 'checkpoint') {
          setCheckpointPredictions(predictions);
        }
      }, 300),
    []
  );
  
  // Handle address input change with autocomplete
  const handleAddressChange = (field, value, index = null) => {
    // For checkpoints
    if (field === 'checkpoint' && index !== null) {
      // Update form data for checkpoint
      setFormData(prev => {
        const updatedCheckpoints = [...prev.checkpoints];
        updatedCheckpoints[index] = {
          ...updatedCheckpoints[index],
          location: {
            ...updatedCheckpoints[index].location,
            address: value
          }
        };
        return {
          ...prev,
          checkpoints: updatedCheckpoints
        };
      });
      
      // Set active checkpoint index for predictions
      setActiveCheckpointIndex(index);
      
      // Clear predictions if input is empty
      if (!value.trim()) {
        setCheckpointPredictions([]);
        return;
      }
      
      // Fetch predictions
      fetchPredictions(value, 'checkpoint');
      return;
    }
    
    // For origin and destination
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        address: value
      }
    }));
    
    // Clear predictions if input is empty
    if (!value.trim()) {
      if (field === 'origin') setOriginPredictions([]);
      else if (field === 'destination') setDestinationPredictions([]);
      return;
    }
    
    // Fetch predictions
    fetchPredictions(value, field);
  };
  
  // Handle place selection
  const handlePlaceSelect = (field, place, index = null) => {
    // For checkpoints
    if (field === 'checkpoint' && index !== null) {
      setFormData(prev => {
        const updatedCheckpoints = [...prev.checkpoints];
        updatedCheckpoints[index] = {
          ...updatedCheckpoints[index],
          location: {
            ...updatedCheckpoints[index].location,
            address: place.description,
            coordinates: place.coordinates
          }
        };
        return {
          ...prev,
          checkpoints: updatedCheckpoints
        };
      });
      
      // Clear predictions
      setCheckpointPredictions([]);
      return;
    }
    
    // For origin and destination
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        address: place.description,
        coordinates: place.coordinates
      }
    }));
    
    // Clear predictions
    if (field === 'origin') setOriginPredictions([]);
    else if (field === 'destination') setDestinationPredictions([]);
  };

  // Format address display with country highlighting
  const formatAddressDisplay = (place) => {
    const isIndian = place.country === 'India';
    return (
      <Box>
        <Typography variant="body2" fontWeight={500}>
          {place.description}
        </Typography>
        <Typography 
          variant="caption" 
          color={isIndian ? 'primary.main' : 'text.secondary'}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: isIndian ? 500 : 400
          }}
        >
          {place.country}
        </Typography>
      </Box>
    );
  };

  // Handle country code change
  const handleCountryCodeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        phoneCountryCode: e.target.value
      }
    }));
  };

  // Get full phone number with country code
  const getFullPhoneNumber = () => {
    if (!formData.customer.phone) return '';
    return `${formData.customer.phoneCountryCode} ${formData.customer.phone}`;
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Origin validation
      if (!formData.origin.address) {
        newErrors.origin = 'Origin address is required';
      } else if (formData.origin.coordinates[0] === 0 && formData.origin.coordinates[1] === 0) {
        newErrors.origin = 'Please select a valid origin address from the suggestions';
      }
      
      // Destination validation
      if (!formData.destination.address) {
        newErrors.destination = 'Destination address is required';
      } else if (formData.destination.coordinates[0] === 0 && formData.destination.coordinates[1] === 0) {
        newErrors.destination = 'Please select a valid destination address from the suggestions';
      }
      
      // Checkpoint validation
      const checkpointErrors = [];
      formData.checkpoints.forEach((checkpoint, index) => {
        const cpErrors = {};
        
        if (!checkpoint.name) {
          cpErrors.name = 'Checkpoint name is required';
        }
        
        if (!checkpoint.location.address) {
          cpErrors.address = 'Checkpoint address is required';
        } else if (checkpoint.location.coordinates[0] === 0 && checkpoint.location.coordinates[1] === 0) {
          cpErrors.address = 'Please select a valid checkpoint address from the suggestions';
        }
        
        if (Object.keys(cpErrors).length > 0) {
          checkpointErrors[index] = cpErrors;
        }
      });
      
      if (checkpointErrors.length > 0) {
        newErrors.checkpoints = checkpointErrors;
      }
    } else if (step === 2) {
      if (!formData.customer.name.trim()) {
        newErrors.customerName = 'Customer name is required';
      }
      
      // Enhanced email validation
      if (!formData.customer.email.trim()) {
        newErrors.customerEmail = 'Email is required';
      } else if (!emailRegex.test(formData.customer.email)) {
        newErrors.customerEmail = 'Please enter a valid email address';
      }
      
      // Phone validation (optional but validated if provided)
      if (formData.customer.phone.trim() && !phoneRegex.test(formData.customer.phone)) {
        newErrors.customerPhone = 'Please enter a valid phone number (digits, spaces, and dashes only)';
      }
    } else if (step === 3) {
      if (Array.isArray(formData.items)) {
        formData.items.forEach((item, index) => {
          if (!item.description.trim()) {
            newErrors[`item-${index}-description`] = 'Item description is required';
          }
          if (item.quantity <= 0) {
            newErrors[`item-${index}-quantity`] = 'Quantity must be greater than 0';
          }
        });
      } else {
        newErrors.items = 'Items data is invalid';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      
      // Handle items array specifically
      if (parts[0] === 'items') {
        const index = parseInt(parts[1]);
        const field = parts[2];
        
        // Make a copy of the current items array to avoid mutation issues
        const updatedItems = Array.isArray(formData.items) 
          ? [...formData.items] 
          : [{
              description: '',
              quantity: 1,
              weight: 0,
              dimensions: { length: 0, width: 0, height: 0 },
            }];
        
        // Ensure the item at this index exists
        if (!updatedItems[index]) {
          updatedItems[index] = {
            description: '',
            quantity: 1,
            weight: 0,
            dimensions: { length: 0, width: 0, height: 0 },
          };
        }
        
        // Handle dimensions separately
        if (field === 'dimensions.length' || field === 'dimensions.width' || field === 'dimensions.height') {
          const dimField = field.split('.')[1];
          updatedItems[index].dimensions = {
            ...updatedItems[index].dimensions,
            [dimField]: parseFloat(value) || 0,
          };
        } else {
          // Handle regular fields
          updatedItems[index][field] = field === 'quantity' || field === 'weight' 
            ? parseFloat(value) || 0 
            : value;
        }
        
        // Update the form data with the new items array
        setFormData(prev => ({
          ...prev,
          items: updatedItems,
        }));
        
        return;
      }
      
      // Handle nested objects like customer.name, origin.address, etc.
      const [parent, child] = parts;
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
      
      // Clear validation errors when field is edited
      if (errors[`${parent}${child.charAt(0).toUpperCase() + child.slice(1)}`]) {
        setErrors(prev => ({
          ...prev,
          [`${parent}${child.charAt(0).toUpperCase() + child.slice(1)}`]: ''
        }));
      }
    } else {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Fix the handleAddItem function to ensure it works correctly
  const handleAddItem = () => {
    // Use a safer approach to add items that works even if items is not an array
    setFormData(prev => {
      // Ensure items is an array before adding to it
      const currentItems = Array.isArray(prev.items) ? prev.items : [];
      
      return {
        ...prev,
        items: [
          ...currentItems,
          {
            description: '',
            quantity: 1,
            weight: 0,
            dimensions: {
              length: 0,
              width: 0,
              height: 0,
            },
          },
        ],
      };
    });
    
    // Log for debugging
    console.log('Item added');
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) return;
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Add a checkpoint
  const handleAddCheckpoint = () => {
    setFormData(prev => ({
      ...prev,
      checkpoints: [
        ...prev.checkpoints,
        {
          name: `Checkpoint ${prev.checkpoints.length + 1}`,
          location: {
            address: '',
            coordinates: [0, 0],
            addressDetails: '' // Additional field for manual address details
          },
          estimatedArrival: null,
          notes: ''
        }
      ]
    }));
  };

  // Remove a checkpoint
  const handleRemoveCheckpoint = (index) => {
    setFormData(prev => {
      const updatedCheckpoints = [...prev.checkpoints];
      updatedCheckpoints.splice(index, 1);
      
      // Rename checkpoints
      const renamedCheckpoints = updatedCheckpoints.map((cp, i) => ({
        ...cp,
        name: `Checkpoint ${i + 1}`
      }));
      
      return {
        ...prev,
        checkpoints: renamedCheckpoints
      };
    });
  };

  // Update checkpoint field
  const handleCheckpointChange = (index, field, value) => {
    setFormData(prev => {
      const updatedCheckpoints = [...prev.checkpoints];
      
      if (field === 'name' || field === 'notes') {
        updatedCheckpoints[index] = {
          ...updatedCheckpoints[index],
          [field]: value
        };
      } else if (field === 'estimatedArrival') {
        updatedCheckpoints[index] = {
          ...updatedCheckpoints[index],
          [field]: value
        };
      } else if (field === 'location.addressDetails') {
        updatedCheckpoints[index] = {
          ...updatedCheckpoints[index],
          location: {
            ...updatedCheckpoints[index].location,
            addressDetails: value
          }
        };
      }
      
      return {
        ...prev,
        checkpoints: updatedCheckpoints
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all steps
    let isValid = true;
    for (let step = 1; step <= steps.length; step++) {
      if (!validateStep(step)) {
        isValid = false;
        setCurrentStep(step);
        break;
      }
    }
    
    if (!isValid) {
      enqueueSnackbar('Please correct the errors before submitting', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Format the data for API
      const shipmentData = {
        origin: {
          coordinates: formData.origin.coordinates,
          address: formData.origin.address + (formData.origin.addressDetails ? `, ${formData.origin.addressDetails}` : '')
        },
        destination: {
          coordinates: formData.destination.coordinates,
          address: formData.destination.address + (formData.destination.addressDetails ? `, ${formData.destination.addressDetails}` : '')
        },
        checkpoints: formData.checkpoints.map(checkpoint => ({
          name: checkpoint.name,
          location: {
            coordinates: checkpoint.location.coordinates,
            address: checkpoint.location.address + (checkpoint.location.addressDetails ? `, ${checkpoint.location.addressDetails}` : '')
          },
          estimatedArrival: checkpoint.estimatedArrival,
          notes: checkpoint.notes
        })),
        customer: {
          name: formData.customer.name,
          email: formData.customer.email,
          phone: getFullPhoneNumber()
        },
        items: formData.items.map(item => ({
          description: item.description,
          quantity: parseInt(item.quantity, 10),
          weight: parseFloat(item.weight),
          dimensions: {
            length: parseFloat(item.dimensions.length),
            width: parseFloat(item.dimensions.width),
            height: parseFloat(item.dimensions.height)
          }
        })),
        estimatedDelivery: formData.estimatedDelivery
      };
      
      const response = await createShipment(shipmentData);
      
      enqueueSnackbar('Shipment created successfully!', { variant: 'success' });
      
      // Navigate to tracking page with the new tracking number
      if (response && response.data && response.data.trackingNumber) {
        navigate(`/tracking/${response.data.trackingNumber}`);
      } else if (response && response.trackingNumber) {
        navigate(`/tracking/${response.trackingNumber}`);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      enqueueSnackbar(error.message || 'Failed to create shipment', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  // Customer Information Step
  const renderStep2 = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 'medium' }}>
        Customer Information
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2, borderLeft: '4px solid #2196f3' }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1, color: '#2196f3' }} />
          Contact Details
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Customer Name"
              name="customer.name"
              value={formData.customer.name}
              onChange={handleInputChange}
              error={!!errors.customerName}
              helperText={errors.customerName}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              name="customer.email"
              value={formData.customer.email}
              onChange={handleInputChange}
              error={!!errors.customerEmail}
              helperText={errors.customerEmail}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            {!errors.customerEmail && (
              <FormHelperText>
                Format: example@domain.com
              </FormHelperText>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="flex-start" gap={1}>
              <FormControl sx={{ width: '40%', mt: 2 }}>
                <InputLabel id="country-code-label">Country Code</InputLabel>
                <Select
                  labelId="country-code-label"
                  value={formData.customer.phoneCountryCode}
                  onChange={handleCountryCodeChange}
                  label="Country Code"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  {countryCodes.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.code} ({country.country})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Phone Number"
                name="customer.phone"
                value={formData.customer.phone}
                onChange={handleInputChange}
                error={!!errors.customerPhone}
                helperText={errors.customerPhone || "Enter digits, spaces, and dashes only"}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            {!errors.customerPhone && formData.customer.phone && (
              <FormHelperText>
                Full number: {getFullPhoneNumber()}
              </FormHelperText>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  // Items Step
  const renderStep3 = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 'medium' }}>
        Shipment Items
      </Typography>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <AssignmentIcon sx={{ mr: 1, color: '#f44336' }} />
          Items in Shipment
        </Typography>
        
        <Button 
          variant="outlined" 
          color="error"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
        >
          Add Item
        </Button>
      </Box>
      
      {Array.isArray(formData.items) ? formData.items.map((item, index) => (
        <Paper 
          key={index} 
          elevation={2} 
          sx={{ 
            p: 3, 
            mb: 3, 
            position: 'relative',
            borderRadius: 2,
            borderLeft: '4px solid #f44336'
          }}
        >
          {formData.items.length > 1 && (
            <IconButton
              size="small"
              onClick={() => handleRemoveItem(index)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'error.main',
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          )}
          
          <Typography variant="subtitle2" color="text.secondary" mb={2} sx={{ fontWeight: 'bold' }}>
            Item {index + 1}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name={`items.${index}.description`}
                value={item.description}
                onChange={handleInputChange}
                error={!!errors[`item-${index}-description`]}
                helperText={errors[`item-${index}-description`]}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                name={`items.${index}.quantity`}
                value={item.quantity}
                onChange={handleInputChange}
                error={!!errors[`item-${index}-quantity`]}
                helperText={errors[`item-${index}-quantity`]}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                name={`items.${index}.weight`}
                value={item.weight}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                Dimensions (cm)
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Length"
                    type="number"
                    name={`items.${index}.dimensions.length`}
                    value={item.dimensions.length}
                    onChange={handleInputChange}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
                
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Width"
                    type="number"
                    name={`items.${index}.dimensions.width`}
                    value={item.dimensions.width}
                    onChange={handleInputChange}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
                
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Height"
                    type="number"
                    name={`items.${index}.dimensions.height`}
                    value={item.dimensions.height}
                    onChange={handleInputChange}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      )) : (
        <Typography color="error">
          No items available. Please go back and try again.
        </Typography>
      )}
    </Box>
  );

  const renderStep1 = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 'medium' }}>
        Shipment Route
      </Typography>
      
      {/* Origin Address */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2, borderLeft: '4px solid #3f51b5' }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <LocationIcon sx={{ mr: 1, color: '#3f51b5' }} />
          Origin Address
        </Typography>
        <TextField
          fullWidth
          label="Search for origin address"
          value={formData.origin.address}
          onChange={(e) => handleAddressChange('origin', e.target.value)}
          error={!!errors.origin}
          helperText={errors.origin}
          sx={{ mb: 1 }}
        />
        {originPredictions.length > 0 && (
          <Paper elevation={3} sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
            <List>
              {originPredictions.map((place) => (
                <ListItem
                  button
                  key={place.id}
                  onClick={() => handlePlaceSelect('origin', place)}
                >
                  <ListItemText
                    primary={formatAddressDisplay(place)}
                    secondary={place.country}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
        <TextField
          fullWidth
          label="Additional Address Details (optional)"
          name="origin.addressDetails"
          value={formData.origin.addressDetails}
          onChange={handleInputChange}
          placeholder="Apartment, suite, unit, building, floor, etc."
          margin="normal"
        />
      </Paper>
      
      {/* Checkpoints */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <RouteIcon sx={{ mr: 1, color: '#9c27b0' }} />
            Checkpoints (Optional)
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddCheckpoint}
            variant="outlined"
            color="secondary"
            size="small"
          >
            Add Checkpoint
          </Button>
        </Box>
        
        {formData.checkpoints.map((checkpoint, index) => (
          <Paper key={index} elevation={2} sx={{ p: 3, mb: 2, borderRadius: 2, borderLeft: '4px solid #9c27b0' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Checkpoint {index + 1}
                  </Typography>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleRemoveCheckpoint(index)}
                  >
                    <RemoveIcon />
                  </IconButton>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Checkpoint Name"
                  value={checkpoint.name}
                  onChange={(e) => handleCheckpointChange(index, 'name', e.target.value)}
                  error={!!errors.checkpoints?.[index]?.name}
                  helperText={errors.checkpoints?.[index]?.name}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Estimated Arrival Date"
                  type="date"
                  value={checkpoint.estimatedArrival ? new Date(checkpoint.estimatedArrival).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleCheckpointChange(index, 'estimatedArrival', e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Search for checkpoint address"
                  value={checkpoint.location.address}
                  onChange={(e) => handleAddressChange('checkpoint', e.target.value, index)}
                  error={!!errors.checkpoints?.[index]?.address}
                  helperText={errors.checkpoints?.[index]?.address}
                />
                {activeCheckpointIndex === index && checkpointPredictions.length > 0 && (
                  <Paper elevation={3} sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                    <List>
                      {checkpointPredictions.map((place) => (
                        <ListItem
                          button
                          key={place.id}
                          onClick={() => handlePlaceSelect('checkpoint', place, index)}
                        >
                          <ListItemText
                            primary={formatAddressDisplay(place)}
                            secondary={place.country}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
                <TextField
                  fullWidth
                  label="Additional Address Details (optional)"
                  value={checkpoint.location.addressDetails || ''}
                  onChange={(e) => handleCheckpointChange(index, 'location.addressDetails', e.target.value)}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  value={checkpoint.notes}
                  onChange={(e) => handleCheckpointChange(index, 'notes', e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>
      
      {/* Destination Address */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2, borderLeft: '4px solid #4caf50' }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <LocationIcon sx={{ mr: 1, color: '#4caf50' }} />
          Destination Address
        </Typography>
        <TextField
          fullWidth
          label="Search for destination address"
          value={formData.destination.address}
          onChange={(e) => handleAddressChange('destination', e.target.value)}
          error={!!errors.destination}
          helperText={errors.destination}
          sx={{ mb: 1 }}
        />
        {destinationPredictions.length > 0 && (
          <Paper elevation={3} sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
            <List>
              {destinationPredictions.map((place) => (
                <ListItem
                  button
                  key={place.id}
                  onClick={() => handlePlaceSelect('destination', place)}
                >
                  <ListItemText
                    primary={formatAddressDisplay(place)}
                    secondary={place.country}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
        <TextField
          fullWidth
          label="Additional Address Details (optional)"
          name="destination.addressDetails"
          value={formData.destination.addressDetails}
          onChange={handleInputChange}
          placeholder="Apartment, suite, unit, building, floor, etc."
          margin="normal"
        />
      </Paper>
      
      {/* Estimated Delivery Date */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2, borderLeft: '4px solid #ff9800' }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <CalendarIcon sx={{ mr: 1, color: '#ff9800' }} />
          Estimated Delivery Date
        </Typography>
        <TextField
          fullWidth
          type="date"
          value={formData.estimatedDelivery ? new Date(formData.estimatedDelivery).toISOString().split('T')[0] : ''}
          onChange={(e) => handleInputChange({
            target: {
              name: 'estimatedDelivery',
              value: e.target.value ? new Date(e.target.value) : null
            }
          })}
          InputLabelProps={{ shrink: true }}
          error={!!errors.estimatedDelivery}
          helperText={errors.estimatedDelivery}
        />
      </Paper>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <Box mb={4} display="flex" alignItems="center">
          <Button
            onClick={() => navigate('/')}
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'medium' }}>
            Create New Shipment
          </Typography>
        </Box>

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={currentStep - 1} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Step Content */}
          <Box sx={{ minHeight: '50vh' }}>
            {renderStep()}
          </Box>

          {/* Navigation Buttons */}
          <Box mt={4} display="flex" justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            <Box>
              {currentStep < steps.length ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={loading}
                  endIcon={<ArrowForwardIcon />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                >
                  {loading ? 'Creating...' : 'Create Shipment'}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateShipmentPage;
