import React from 'react';
import { Container, Typography, Box, Grid, Paper, Card, CardContent, Avatar, CardMedia } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const AboutPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About Our Shipment Tracking Service
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          We provide real-time tracking and logistics solutions for businesses and individuals worldwide.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="body1" paragraph>
              Our mission is to simplify logistics and provide transparency in the shipping process. 
              We believe that everyone deserves to know exactly where their packages are at all times.
            </Typography>
            <Typography variant="body1" paragraph>
              Founded in 2023, our tracking platform has quickly become a trusted solution for businesses 
              and individuals who need reliable shipment tracking services.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: '100%',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <CardMedia
              component="img"
              height="300"
              image="/images/mission-image.jpg"
              alt="Logistics mission"
              sx={{
                objectFit: 'cover',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                padding: 2,
              }}
            >
              <Typography variant="h5" component="p" align="center" fontWeight="medium">
                "Delivering visibility and peace of mind with every shipment tracked."
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
        Why Choose Our Service
      </Typography>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image="/images/global-coverage.jpg"
              alt="Global Coverage"
            />
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                <LocalShippingIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" component="h3" gutterBottom>
                Global Coverage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track shipments anywhere in the world with our comprehensive global network.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image="/images/real-time.jpg"
              alt="Real-Time Updates"
            />
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                <TrackChangesIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" component="h3" gutterBottom>
                Real-Time Updates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get instant notifications and real-time location data for all your shipments.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image="/images/security.jpg"
              alt="Secure Platform"
            />
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                <SecurityIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" component="h3" gutterBottom>
                Secure Platform
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your data is protected with enterprise-grade security and encryption.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image="/images/support.jpg"
              alt="24/7 Support"
            />
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                <SupportAgentIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" component="h3" gutterBottom>
                24/7 Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our customer support team is available around the clock to assist you.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 6 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h2" gutterBottom>
              Our Technology
            </Typography>
            <Typography variant="body1" paragraph>
              We use cutting-edge technology to provide the most accurate and reliable tracking information. 
              Our platform is built on a modern tech stack including React, Node.js, and MongoDB, with 
              real-time mapping powered by Mapbox.
            </Typography>
            <Typography variant="body1">
              The system is designed to handle millions of tracking requests daily while maintaining 
              fast response times and high availability. We continuously improve our algorithms to 
              provide better ETAs and more detailed shipment information.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ overflow: 'hidden' }}>
              <CardMedia
                component="img"
                height="300"
                image="/images/technology.jpg"
                alt="Advanced Technology"
                sx={{
                  objectFit: 'cover',
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AboutPage; 