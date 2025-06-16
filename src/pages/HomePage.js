import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShipment } from '../context/ShipmentContext';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Stack,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import MapIcon from '@mui/icons-material/Map';
import ShipmentList from '../components/ShipmentList';

// Create styled components for the hero section with a background image
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/images/hero-bg.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: theme.palette.common.white,
  padding: theme.spacing(8, 2),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(6),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: theme.shadows[4],
}));

// Animated gradient overlay
const GradientOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.dark}99 0%, 
    transparent 30%, 
    ${theme.palette.primary.main}80 70%, 
    transparent 100%)`,
  zIndex: 0,
  animation: 'gradientMove 15s ease infinite',
  '@keyframes gradientMove': {
    '0%': {
      backgroundPosition: '0% 50%',
    },
    '50%': {
      backgroundPosition: '100% 50%',
    },
    '100%': {
      backgroundPosition: '0% 50%',
    },
  },
}));

// Feature card with hover effect
const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

// Feature icon styling
const FeatureIcon = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: '50%',
  padding: theme.spacing(2),
  display: 'inline-flex',
  marginBottom: theme.spacing(2),
}));

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { error, clearShipment } = useShipment();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingError, setTrackingError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate tracking number
    if (!trackingNumber || trackingNumber.trim() === '') {
      setTrackingError('Please enter a valid tracking number');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setTrackingError(null);
      clearShipment(); // Clear any previous shipment data
      
      // Navigate to tracking page with the tracking number
      navigate(`/tracking/${trackingNumber.trim()}`);
    } catch (err) {
      setTrackingError(err.message || 'An error occurred while tracking the shipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Features data
  const features = [
    {
      title: 'Real-time Tracking',
      description: 'Track your shipments in real-time with accurate location data and status updates.',
      icon: <MapIcon fontSize="large" />,
      image: '/images/feature-tracking.jpg'
    },
    {
      title: 'Nationwide Delivery',
      description: 'Our extensive network ensures your packages reach their destination quickly and safely.',
      icon: <LocalShippingIcon fontSize="large" />,
      image: '/images/feature-delivery.jpg'
    },
    {
      title: 'Secure Packaging',
      description: 'Your items are handled with care and packaged securely for safe transit.',
      icon: <InventoryIcon fontSize="large" />,
      image: '/images/feature-packaging.jpg'
    },
  ];

  return (
    <Box sx={{ pb: 8 }}>
      <HeroSection>
        <GradientOverlay />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in={true} timeout={1000}>
            <Box>
          <DeliveryDiningIcon sx={{ 
            fontSize: 60, 
            mb: 2,
            color: theme.palette.primary.main,
            filter: `drop-shadow(0 0 8px ${theme.palette.primary.main})`,
          }} />
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                  Track Your <Box component="span" sx={{ color: theme.palette.primary.main }}>Shipment</Box>
              </Typography>
              <Typography variant="h6" component="p" paragraph sx={{ maxWidth: '700px', mx: 'auto', mb: 4 }}>
            Enter your tracking number to get real-time updates on your shipment's status and location.
          </Typography>
          
          <Paper 
            component="form" 
                onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 1,
                  p: 1.5,
                  maxWidth: 600,
              mx: 'auto',
                  mt: 3,
                  background: 'rgba(30, 41, 59, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme.palette.primary.dark}40`,
                  boxShadow: `0 0 20px ${theme.palette.primary.main}30`,
            }}
                elevation={4}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
              InputProps={{
                sx: { 
                  bgcolor: 'background.paper',
                  '& fieldset': { border: 'none' },
                  borderRadius: 1,
                  '&:focus-within': {
                    boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
                  },
                }
              }}
              required
                  disabled={isSubmitting}
                  error={!!trackingError}
                  helperText={trackingError}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
                  disabled={isSubmitting}
              sx={{
                minWidth: 160,
                height: 56,
                whiteSpace: 'nowrap',
                fontWeight: 'bold',
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                },
              }}
            >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Track Shipment'}
            </Button>
          </Paper>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, maxWidth: 700, mx: 'auto' }}>
              {error}
            </Alert>
          )}
            </Box>
          </Fade>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
            Our Services
          </Typography>
          <Divider sx={{ width: '80px', mx: 'auto', mb: 4, borderColor: theme.palette.primary.main, borderWidth: 2 }} />
        </Box>
        
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Fade in={true} timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                <FeatureCard elevation={3}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={feature.image}
                    alt={feature.title}
                  />
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <FeatureIcon>
                      {feature.icon}
                    </FeatureIcon>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box 
        sx={{ 
          py: 8, 
          background: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/images/cta-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          mb: 8
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography variant="h4" component="h2" color="common.white" fontWeight="bold">
          Need to ship something?
        </Typography>
            <Typography variant="body1" color="common.white" sx={{ maxWidth: '600px' }}>
          Create a new shipment and track it in real-time with our advanced tracking system.
              Our reliable delivery network ensures your package arrives safely and on time.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/create')}
              sx={{ mt: 2, px: 4, py: 1.5 }}
        >
          Create New Shipment
        </Button>
          </Stack>
        </Container>
      </Box>

      {/* Shipment List Section */}
      <Container maxWidth="lg">
        <ShipmentList />
    </Container>
    </Box>
  );
};

export default HomePage;
