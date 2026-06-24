import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

const SkipLink = () => (
  <Box
    component="a"
    href="#main-content"
    sx={{
      position: 'absolute',
      top: '-40px',
      left: 0,
      background: '#000',
      color: '#fff',
      padding: '8px',
      zIndex: 9999,
      transition: 'top 0.2s',
      '&:focus': {
        top: 0,
      },
    }}
  >
    Skip to main content
  </Box>
);

function MainLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SkipLink />
      <Navbar />
      <Box component="main" id="main-content" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
export default MainLayout;