import React, { useState } from 'react';
import { Outlet, Navigate, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  useMediaQuery,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
// AccountCircleIcon import removed to fix ESLint warning

// Widths
const drawerWidth = 260;
const closedDrawerWidth = 72; // Width when collapsed (icon only)

function AdminLayout() {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Desktop Drawer State (Open/Collapsed)
  const [openDesktop, setOpenDesktop] = useState(true);
  
  // Mobile Drawer State (Visible/Hidden)
  const [mobileOpen, setMobileOpen] = useState(false);

  // User Dropdown Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // --- Confirmation Dialog State ---
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!userInfo) return <Navigate to="/login" />;
  if (userInfo.role !== 'Admin' && userInfo.role !== 'Superadmin') return <Navigate to="/" />;

  const adminLinks = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Orders', icon: <ShoppingCartIcon />, path: '/admin/orders' },
    { text: 'Lechon List', icon: <RestaurantIcon />, path: '/admin/lechon' },
    { text: 'General Menu', icon: <MenuBookIcon />, path: '/admin/menu' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/admin/categories' }, 
    { text: 'Reports', icon: <BarChartIcon />, path: '/admin/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  // Helper function for Category Icon
  function CategoryIcon() { return <MenuBookIcon/> }

  const superAdminLinks = [
    { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
  ];

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleDesktopToggle = () => setOpenDesktop(!openDesktop);

  // --- UPDATED LOGOUT HANDLER ---
  const logoutHandler = () => { 
      logout(); 
      handleMenuClose();
      // Force Hard Refresh and Redirect to Home
      window.location.href = '/'; 
  };

  // --- Navigation Handlers ---
  const handleBackToStoreClick = () => {
      setConfirmOpen(true);
      handleMenuClose(); // Close dropdown if open
  };

  const confirmNavigation = () => {
      setConfirmOpen(false);
      navigate('/');
  };

  // --- DRAWER CONTENT ---
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#1a1a1a', color: 'white' }}>
        
        {/* --- SIDEBAR HEADER (Logo + Toggle) --- */}
        <Box 
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: openDesktop ? 'space-between' : 'center', 
                p: 2,
                minHeight: 64, 
                borderBottom: '1px solid #333'
            }}
        >
            {/* When Open: Show Logo + Title */}
            {openDesktop && (
                <Box 
                    component="div" 
                    onClick={handleBackToStoreClick} // Click logo to confirm exit
                    sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', overflow:'hidden', cursor: 'pointer' }}
                >
                    <Box
                        component="img"
                        src="/images/logo.png"
                        alt="Logo"
                        sx={{ height: 35, width: 35, borderRadius: '50%', border: `1px solid ${theme.palette.primary.main}`, mr: 1.5 }}
                    />
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>Admin</Typography>
                </Box>
            )}

            {/* Toggle Button */}
            {!isMobile && (
                <IconButton onClick={handleDesktopToggle} sx={{ color: '#aaa', '&:hover': { color: 'white' } }}>
                    {openDesktop ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            )}
        </Box>
        
        {/* LINKS */}
        <List sx={{ flexGrow: 1, py: 2 }}>
          {[...adminLinks, ...(userInfo.role === 'Superadmin' ? superAdminLinks : [])].map((link) => (
            <ListItem key={link.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={RouterLink}
                to={link.path}
                sx={{
                  minHeight: 48,
                  justifyContent: openDesktop ? 'initial' : 'center',
                  px: 2.5,
                  color: 'white',
                  '&:hover': { backgroundColor: theme.palette.primary.dark }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: openDesktop ? 3 : 'auto',
                    justifyContent: 'center',
                    color: theme.palette.primary.light
                  }}
                >
                  {link.icon}
                </ListItemIcon>
                <ListItemText primary={link.text} sx={{ opacity: openDesktop ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ bgcolor: '#333' }} />
        
        {/* BACK TO STORE LINK (With Confirmation) */}
        <List>
            <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton 
                    onClick={handleBackToStoreClick} 
                    sx={{
                        minHeight: 48,
                        justifyContent: openDesktop ? 'initial' : 'center',
                        px: 2.5,
                        color: '#aaa',
                        '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: openDesktop ? 3 : 'auto',
                            justifyContent: 'center',
                            color: '#aaa'
                        }}
                    >
                        <StorefrontIcon />
                    </ListItemIcon>
                    <ListItemText primary="Back to Store" sx={{ opacity: openDesktop ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
        </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* --- APP BAR --- */}
      <AppBar 
        position="fixed" 
        sx={{ 
            width: { sm: `calc(100% - ${openDesktop ? drawerWidth : closedDrawerWidth}px)` },
            ml: { sm: `${openDesktop ? drawerWidth : closedDrawerWidth}px` },
            backgroundColor: 'white',
            color: '#333',
            borderBottom: '1px solid #eee',
            boxShadow: 'none',
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: theme.palette.primary.main }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: theme.palette.primary.main }}>
            Admin Panel
          </Typography>

          <Box>
            <Button 
                onClick={handleMenuClick} 
                startIcon={<Avatar src="/images/admin-avatar.png" sx={{ width: 32, height: 32 }} />}
                sx={{ color: '#333', fontWeight: 'bold', textTransform: 'none' }}
            >
              {userInfo.name}
            </Button>
            <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
              {/* BACK TO STORE IN DROPDOWN (With Confirmation) */}
              <MenuItem onClick={handleBackToStoreClick}>Back to Store</MenuItem>
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* --- DRAWER (NAV) --- */}
      <Box
        component="nav"
        sx={{ width: { sm: openDesktop ? drawerWidth : closedDrawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.3s' }}
      >
        {/* Mobile Drawer (Temporary) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} 
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#1a1a1a' },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer (Permanent / Mini) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: openDesktop ? drawerWidth : closedDrawerWidth, 
                backgroundColor: '#1a1a1a',
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* --- MAIN CONTENT AREA --- */}
      <Box 
        component="main" 
        sx={{ 
            flexGrow: 1, 
            p: 3, 
            minHeight: '100vh',
            width: { sm: `calc(100% - ${openDesktop ? drawerWidth : closedDrawerWidth}px)` },
            mt: 8, // Offset for AppBar
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Outlet />
      </Box>

      {/* --- CONFIRMATION DIALOG --- */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle>Exit Admin Panel?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to return to the public store.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmNavigation} variant="contained" color="primary">
            Go to Store
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminLayout;