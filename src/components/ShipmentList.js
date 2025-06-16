import React, { useEffect, useState } from 'react';
import { shipmentService } from '../services/api';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper, 
  Button,
  Pagination,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ShipmentMapAll from './ShipmentMapAll';

const ITEMS_PER_PAGE = 6; // Number of shipments per page

const ShipmentList = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await shipmentService.getAllShipments();
      console.log('API response:', response); // Debug log
      
      // Handle different response formats
      let allShipments = [];
      if (Array.isArray(response)) {
        allShipments = response;
      } else if (response && Array.isArray(response.data)) {
        allShipments = response.data;
      } else if (response && typeof response === 'object') {
        // If it's an object but not an array, check for nested data
        allShipments = Array.isArray(response.data) ? response.data : [];
      } else {
        // Fallback to empty array if response format is unexpected
        console.error('Unexpected API response format:', response);
        allShipments = [];
      }
      
      setShipments(allShipments);
      setTotalPages(Math.ceil(allShipments.length / ITEMS_PER_PAGE));
      setPage(1); // Reset to first page when new data is loaded
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError(err.message || 'Failed to fetch shipments');
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Get current page shipments
  const getCurrentPageShipments = () => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return shipments.slice(startIndex, endIndex);
  };

  const handleSeedData = async () => {
    try {
      setSeedLoading(true);
      setSeedSuccess(false);
      await shipmentService.seedDatabase();
      setSeedSuccess(true);
      // Refresh shipments list
      await fetchShipments();
    } catch (err) {
      setError('Failed to seed database: ' + (err.message || 'Unknown error'));
    } finally {
      setSeedLoading(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;
  
  if (error) {
    return (
      <Box my={4}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => fetchShipments()}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (!shipments || shipments.length === 0) {
    return (
      <Box my={4} textAlign="center">
        <Alert severity="info" sx={{ mb: 4 }}>No shipments found in the database.</Alert>
        <Typography variant="h6" gutterBottom>
          Would you like to add sample shipments to the database?
        </Typography>
        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSeedData}
            disabled={seedLoading}
          >
            {seedLoading ? <CircularProgress size={24} /> : 'Add Sample Shipments'}
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/create')}
          >
            Create New Shipment
          </Button>
        </Box>
        {seedSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Sample shipments added successfully!
          </Alert>
        )}
      </Box>
    );
  }

  const currentShipments = getCurrentPageShipments();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">All Shipments</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/create')}
        >
          Create New Shipment
        </Button>
      </Box>
      <Grid container spacing={3}>
        {/* Map takes more space now - 5/12 instead of 4/12 */}
        <Grid item xs={12} md={5} order={{ xs: 2, md: 2 }}>
          <Paper elevation={3} sx={{ height: 500, p: 1 }}>
            <ShipmentMapAll shipments={shipments} />
          </Paper>
        </Grid>
        {/* Shipment list takes less space - 7/12 instead of 8/12 */}
        <Grid item xs={12} md={7} order={{ xs: 1, md: 1 }}>
          <Grid container spacing={2}>
            {currentShipments.map((shipment) => (
              <Grid item xs={12} sm={6} key={shipment.trackingNumber || shipment._id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => navigate(`/tracking/${shipment.trackingNumber}`)}
                >
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">Tracking Number</Typography>
                    <Typography variant="h6" fontWeight="bold">{shipment.trackingNumber}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Status: <b>{(shipment.status || '').replace(/_/g, ' ')}</b>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Origin: {shipment.origin?.address}
                    </Typography>
                    <Typography variant="body2">
                      Destination: {shipment.destination?.address}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                      Est. Delivery: {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {shipments.length > ITEMS_PER_PAGE && (
            <Stack spacing={2} sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                showFirstButton 
                showLastButton
              />
              <Typography variant="body2" color="textSecondary">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, shipments.length)} of {shipments.length} shipments
              </Typography>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShipmentList; 