import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
} from '@mui/material';
// AccountCircle import removed to fix ESLint warning
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import CloseIcon from '@mui/icons-material/Close';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ArticleIcon from '@mui/icons-material/Article';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactMailIcon from '@mui/icons-material/ContactMail';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { theme } from '../theme';
import { branding } from '../config/branding';

function Navbar() {
  const { userInfo, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  
  // -- State for User Dropdown (Desktop) --
  const [anchorEl, setAnchorEl] = useState(null);
  
  // -- State for Mobile Drawer --
  const [mobileOpen, setMobileOpen] = useState(false);

  // -- State for Dialogs --
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false); 

  // -- Handlers --
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // --- LOGOUT LOGIC ---
  const handleLogoutClick = () => {
    handleMenuClose();
    setMobileOpen(false); 
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    logout();
    // Hard Refresh & Redirect to Home
    window.location.href = '/';
  };

  // --- ADMIN NAV LOGIC ---
  const handleAdminClick = () => {
      handleMenuClose();
      setMobileOpen(false);
      setAdminDialogOpen(true);
  };

  const confirmAdminNav = () => {
      setAdminDialogOpen(false);
      navigate('/admin/dashboard');
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // -- Mobile Drawer Content --
  // Variable name is 'drawer'
  const drawer = (
    <Box sx={{ textAlign: 'left' }}>
      {/* DRAWER HEADER: Logo + Close Button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        p: 2,
        backgroundColor: theme.palette.background.default 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
             <Box
                component="img"
                src="/images/logo.png"
                alt={branding.name}
                sx={{ height: 40, width: 'auto', borderRadius: '50%', mr: 1 }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
             {branding.shortName.toUpperCase()}
            </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      <List onClick={handleDrawerToggle}> 
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/">
            <ListItemIcon><HomeIcon sx={{ color: theme.palette.primary.main }} /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/lechon">
            <ListItemIcon><FastfoodIcon sx={{ color: theme.palette.primary.main }} /></ListItemIcon>
            <ListItemText primary="Lechon" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/menu">
            <ListItemIcon><RestaurantMenuIcon sx={{ color: theme.palette.primary.main }} /></ListItemIcon>
            <ListItemText primary="Menu" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/stories">
            <ListItemIcon><MenuBookIcon sx={{ color: theme.palette.primary.main }} /></ListItemIcon>
            <ListItemText primary="Our Story" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/stores">
            <ListItemIcon><StorefrontIcon sx={{ color: theme.palette.primary.main }} /></ListItemIcon>
            <ListItemText primary="Stores" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/blogs">
            <ListItemIcon><ArticleIcon sx={{ color: theme.palette.primary.main }} /></ListItemIcon>
            <ListItemText primary="Blogs" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/faq">
            <ListItemIcon><HelpOutlineIcon sx={{ color: theme.palette.primary.main }} /></ListItemIcon>
            <ListItemText primary="FAQ" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/contact">
            <ListItemIcon><ContactMailIcon sx={{ color: theme.palette.primary.main }} /></ListItemIcon>
            <ListItemText primary="Contact" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/cart">
            <ListItemIcon>
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCartIcon sx={{ color: theme.palette.primary.main }} />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="My Cart" />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1 }} />

        {userInfo ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/orders">
                <ListItemIcon><RestaurantMenuIcon /></ListItemIcon>
                <ListItemText primary="My Orders" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/profile">
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            
            {/* Mobile Drawer Dashboard Link (With Confirmation) */}
            {(userInfo.role === 'Admin' || userInfo.role === 'Superadmin') && (
               <ListItem disablePadding>
                <ListItemButton onClick={handleAdminClick}>
                  <ListItemIcon><AdminPanelSettingsIcon color="error" /></ListItemIcon>
                  <ListItemText primary="Admin Dashboard" primaryTypographyProps={{ color: 'error', fontWeight: 'bold' }} />
                </ListItemButton>
              </ListItem>
            )}

            <ListItem disablePadding>
              <ListItemButton onClick={(e) => { e.stopPropagation(); handleLogoutClick(); }}>
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/login">
               <ListItemIcon><LoginIcon /></ListItemIcon>
               <ListItemText primary="Log In" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: 'white', color: 'black', borderBottom: `3px solid ${theme.palette.primary.main}` }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            
            {/* --- MOBILE HAMBURGER ICON (Visible xs only) --- */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' }, color: theme.palette.primary.main }}
            >
              <MenuIcon />
            </IconButton>

            {/* --- LOGO SECTION --- */}
            <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexGrow: { xs: 1, md: 0 } }}>
              <Box
                  component="img"
                  src="/images/logo.png"
                  alt={branding.name}
                  sx={{ 
                    height: { xs: 40, sm: 55 }, 
                    width: 'auto', 
                    mr: 1.5,
                    borderRadius: '50%' 
                  }}
              />
            </Box>

            {/* --- DESKTOP LINKS (Hidden on xs/sm) --- */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
              <Button component={RouterLink} to="/" sx={{ fontWeight: 'bold', color: 'text.primary', '&:hover': { color: theme.palette.primary.main } }}>
                Home
              </Button>
              <Button component={RouterLink} to="/lechon" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Lechon
              </Button>
              <Button component={RouterLink} to="/menu" sx={{ fontWeight: 'bold', color: 'text.primary', '&:hover': { color: theme.palette.primary.main } }}>
                Menu
              </Button>
              <Button component={RouterLink} to="/stories" sx={{ fontWeight: 'bold', color: 'text.primary', '&:hover': { color: theme.palette.primary.main } }}>
                Story
              </Button>
              <Button component={RouterLink} to="/stores" sx={{ fontWeight: 'bold', color: 'text.primary', '&:hover': { color: theme.palette.primary.main } }}>
                Stores
              </Button>
              <Button component={RouterLink} to="/blogs" sx={{ fontWeight: 'bold', color: 'text.primary', '&:hover': { color: theme.palette.primary.main } }}>
                Blogs
              </Button>
              <Button component={RouterLink} to="/faq" sx={{ fontWeight: 'bold', color: 'text.primary', '&:hover': { color: theme.palette.primary.main } }}>
                FAQ
              </Button>
              <Button component={RouterLink} to="/contact" sx={{ fontWeight: 'bold', color: 'text.primary', '&:hover': { color: theme.palette.primary.main } }}>
                Contact
              </Button>

              <IconButton component={RouterLink} to="/cart" sx={{ color: theme.palette.primary.main }}>
                <Badge badgeContent={cartItemCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              {userInfo ? (
                <>
                  <Button component={RouterLink} to="/orders" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    My Orders
                  </Button>
                  
                  {/* --- SHOW USERNAME + DROPDOWN --- */}
                  <Button 
                    onClick={handleMenuOpen} 
                    sx={{ textTransform: 'none', color: 'text.primary', fontWeight: 'bold' }}
                    endIcon={<Avatar src={userInfo.role === 'Admin' || userInfo.role === 'Superadmin' ? '/images/admin-avatar.png' : '/images/customer-avatar.png'} sx={{ width: 28, height: 28 }} />}
                  >
                    Hi, {userInfo.name.split(' ')[0]} 
                  </Button>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{ 
                        elevation: 0, 
                        sx: { 
                            overflow: 'visible', 
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))', 
                            mt: 1.5,
                            minWidth: 180 
                        } 
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem onClick={handleMenuClose} component={RouterLink} to="/profile">
                        <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                        Profile
                    </MenuItem>
                    
                    {/* --- ADMIN DASHBOARD LINK (With Confirmation) --- */}
                    {(userInfo.role === 'Admin' || userInfo.role === 'Superadmin') && (
                        <MenuItem 
                            onClick={handleAdminClick} 
                            sx={{ color: '#d32f2f' }} 
                        >
                            <ListItemIcon><DashboardIcon fontSize="small" sx={{ color: '#d32f2f' }} /></ListItemIcon>
                            <Typography variant="inherit" fontWeight="bold">Dashboard</Typography>
                        </MenuItem>
                    )}

                    <Divider />

                    <MenuItem onClick={handleLogoutClick}>
                        <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                        Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button component={RouterLink} to="/login" variant="contained" sx={{ backgroundColor: theme.palette.primary.main, color: 'white', fontWeight: 'bold', '&:hover': { backgroundColor: theme.palette.primary.dark } }}>
                  Log In
                </Button>
              )}
            </Box>
            
            {/* --- MOBILE CART ICON --- */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
               <IconButton component={RouterLink} to="/cart" sx={{ color: theme.palette.primary.main }}>
                  <Badge badgeContent={cartItemCount} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
            </Box>

          </Toolbar>
        </Container>
      </AppBar>

      {/* --- MOBILE DRAWER COMPONENT --- */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 }, 
        }}
      >
        {/* FIX IS HERE: Render 'drawer', not 'drawerContent' */}
        {drawer}
      </Drawer>

      {/* --- LOGOUT CONFIRMATION DIALOG --- */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      >
        <DialogTitle>{`Log out of ${branding.name}?`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out? You will need to sign in again to access your orders.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={confirmLogout} color="error" variant="contained" autoFocus>Log Out</Button>
        </DialogActions>
      </Dialog>

      {/* --- ADMIN NAVIGATION CONFIRMATION DIALOG --- */}
      <Dialog
        open={adminDialogOpen}
        onClose={() => setAdminDialogOpen(false)}
      >
        <DialogTitle>Enter Admin Panel?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to enter the administrative dashboard.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={confirmAdminNav} color="secondary" variant="contained" autoFocus>
            Proceed to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default Navbar;