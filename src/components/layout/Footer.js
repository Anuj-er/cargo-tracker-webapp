import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Link,
  Typography,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalShippingIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" color="text.primary" fontWeight="bold">
                SHIPMENT<Box component="span" sx={{ color: 'primary.main' }}>TRACKER</Box>
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Track your shipments in real-time with our advanced tracking system.
              We provide reliable and fast shipping services worldwide.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="primary" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="primary" aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton color="primary" aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
              <IconButton color="primary" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom fontWeight="medium">
              Navigation
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {['Home', 'Track', 'Create Shipment'].map((item) => (
                <Box component="li" key={item} sx={{ py: 0.5 }}>
                  <Link
                    component={RouterLink}
                    to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                    color="text.secondary"
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    {item}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom fontWeight="medium">
              Company
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {['About', 'Contact', 'Careers', 'Blog'].map((item) => (
                <Box component="li" key={item} sx={{ py: 0.5 }}>
                  <Link
                    component={RouterLink}
                    to={`/${item.toLowerCase()}`}
                    color="text.secondary"
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    {item}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom fontWeight="medium">
              Legal
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {['Privacy', 'Terms', 'Cookies', 'FAQ'].map((item) => (
                <Box component="li" key={item} sx={{ py: 0.5 }}>
                  <Link
                    component={RouterLink}
                    to={`/${item.toLowerCase()}`}
                    color="text.secondary"
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    {item}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom fontWeight="medium">
              Support
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {['Help Center', 'Contact Support', 'Report Issue'].map((item) => (
                <Box component="li" key={item} sx={{ py: 0.5 }}>
                  <Link
                    component={RouterLink}
                    to="/contact"
                    color="text.secondary"
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    {item}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} ShipmentTracker. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
            <Link component={RouterLink} to="/privacy" color="text.secondary" sx={{ textDecoration: 'none' }}>
              Privacy
            </Link>
            <Link component={RouterLink} to="/terms" color="text.secondary" sx={{ textDecoration: 'none' }}>
              Terms
            </Link>
            <Link component={RouterLink} to="/cookies" color="text.secondary" sx={{ textDecoration: 'none' }}>
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
