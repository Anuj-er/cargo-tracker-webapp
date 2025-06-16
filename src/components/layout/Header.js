import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  useTheme,
  Avatar,
  Tooltip,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import { styled } from '@mui/material/styles';

const pages = [
  { name: 'Home', path: '/', icon: <HomeIcon fontSize="small" /> },
  { name: 'Create Shipment', path: '/create', icon: <AddIcon fontSize="small" /> },
  { name: 'About', path: '/about', icon: <InfoIcon fontSize="small" /> },
  { name: 'Contact', path: '/contact', icon: <ContactSupportIcon fontSize="small" /> },
];

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2),
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '&:hover': {
    opacity: 0.8,
  },
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  margin: theme.spacing(0, 0.5),
  fontWeight: active ? 600 : 400,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&::after': active ? {
    content: '""',
    position: 'absolute',
    width: '60%',
    height: '3px',
    bottom: '6px',
    left: '20%',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px',
  } : {},
}));

const Header = () => {
  const theme = useTheme();
  const location = useLocation();
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar 
      position="sticky" 
      color="transparent" 
      elevation={1} 
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <Container maxWidth="xl">
        <StyledToolbar disableGutters>
          {/* Logo for desktop */}
          <LogoContainer component={RouterLink} to="/" sx={{ textDecoration: 'none', display: { xs: 'none', md: 'flex' } }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.primary.main, 
              width: 40, 
              height: 40,
              mr: 1,
              boxShadow: 2
            }}>
              <LocalShippingIcon />
            </Avatar>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'text.primary',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              SHIPMENT<Box component="span" sx={{ color: 'primary.main', ml: 0.5 }}>TRACKER</Box>
            </Typography>
          </LogoContainer>

          {/* Mobile menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
              onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
              anchorEl={anchorElNav}
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                horizontal: 'left',
                }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
              >
              {pages.map((page) => (
                  <MenuItem 
                  key={page.name} 
                  onClick={handleCloseNavMenu}
                    component={RouterLink} 
                  to={page.path}
                  selected={location.pathname === page.path}
                  >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {page.icon}
                    <Typography textAlign="center">{page.name}</Typography>
                  </Box>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

          {/* Logo for mobile */}
          <LogoContainer component={RouterLink} to="/" sx={{ textDecoration: 'none', display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.primary.main, 
              width: 32, 
              height: 32,
              mr: 1 
            }}>
              <LocalShippingIcon fontSize="small" />
            </Avatar>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                letterSpacing: '.05rem',
                color: 'text.primary',
                textDecoration: 'none',
              }}
            >
              TRACKER
            </Typography>
          </LogoContainer>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {pages.map((page) => (
              <NavButton
                key={page.name}
                  component={RouterLink}
                to={page.path}
                active={location.pathname === page.path ? 1 : 0}
                onClick={handleCloseNavMenu}
                startIcon={page.icon}
                >
                {page.name}
              </NavButton>
              ))}
            </Box>

          {/* Right side - could add user profile, etc. here */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Track a shipment">
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/"
                startIcon={<SearchIcon />}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                Track
              </Button>
            </Tooltip>
          </Box>
        </StyledToolbar>
      </Container>
      <Divider />
    </AppBar>
  );
};

export default Header;
