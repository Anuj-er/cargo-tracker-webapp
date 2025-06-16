import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Paper,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  CardMedia,
  useTheme
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SendIcon from '@mui/icons-material/Send';
import BusinessIcon from '@mui/icons-material/Business';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const contactReasons = [
  'General Inquiry',
  'Shipment Issue',
  'Technical Support',
  'Billing Question',
  'Partnership Opportunity',
  'Other'
];

const ContactPage = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.reason) {
      newErrors.reason = 'Please select a reason for contact';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message is too short (minimum 10 characters)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSnackbar({
        open: true,
        message: 'Your message has been sent successfully! We will get back to you soon.',
        severity: 'success'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        reason: '',
        message: ''
      });
    }, 1500);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        padding: 0,
        position: 'relative',
        bgcolor: theme.palette.background.default
      }}
    >
      {/* Hero section with background image */}
      <Box
        sx={{
          height: '300px',
          width: '100%',
          backgroundImage: 'url("/images/contact-background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
              Contact Us
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: 800, mx: 'auto' }}>
              Have questions or need assistance? Our team is here to help you.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main content */}
      <Container maxWidth="lg" sx={{ mt: -5, mb: 8, position: 'relative', zIndex: 3 }}>
        <Grid container spacing={4}>
          {/* Contact form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={4} sx={{ 
              p: 4, 
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              height: '100%'
            }}>
              <Typography variant="h5" component="h2" gutterBottom color="primary">
                Send Us a Message
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Please fill out the form below and we'll get back to you as soon as possible.
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number (Optional)"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Reason for Contact"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      error={!!errors.reason}
                      helperText={errors.reason}
                      required
                      variant="outlined"
                    >
                      {contactReasons.map((reason) => (
                        <MenuItem key={reason} value={reason}>
                          {reason}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      label="Your Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      error={!!errors.message}
                      helperText={errors.message}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={isSubmitting}
                      endIcon={<SendIcon />}
                      sx={{ px: 4, py: 1.2, borderRadius: 2 }}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
          
          {/* Contact info */}
          <Grid item xs={12} md={4}>
            <Paper elevation={4} sx={{ 
              p: 4, 
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography variant="h5" component="h2" gutterBottom color="primary">
                Get In Touch
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                We're always happy to hear from you. Reach out to us using any of these channels:
              </Typography>
              
              <Box sx={{ mt: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <IconButton color="primary" sx={{ mr: 2, bgcolor: 'rgba(25, 118, 210, 0.1)' }}>
                    <EmailIcon />
                  </IconButton>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email Us
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      support@shipmenttracker.com
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <IconButton color="primary" sx={{ mr: 2, bgcolor: 'rgba(25, 118, 210, 0.1)' }}>
                    <PhoneIcon />
                  </IconButton>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Call Us
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      +1 (555) 123-4567
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <IconButton color="primary" sx={{ mr: 2, bgcolor: 'rgba(25, 118, 210, 0.1)' }}>
                    <SupportAgentIcon />
                  </IconButton>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Customer Support
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      24/7 Live Support Available
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <IconButton color="primary" sx={{ mr: 2, mt: 0.5, bgcolor: 'rgba(25, 118, 210, 0.1)' }}>
                    <BusinessIcon />
                  </IconButton>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Visit Our Office
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      123 Shipping Lane<br />
                      San Francisco, CA 94107<br />
                      United States
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ mt: 'auto' }}>
                <CardMedia
                  component="img"
                  height="180"
                  image="/images/office-location.jpg"
                  alt="Our Office"
                  sx={{ borderRadius: 1, mb: 2 }}
                />
                <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                  Our headquarters in San Francisco
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactPage; 