import React from 'react';
import { Backdrop } from '@mui/material';
import LechonSpinner from './LechonSpinner';

const LoadingOverlay = ({ open, message }) => {
  return (
    <Backdrop
      sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.drawer + 9999, // Extremely high z-index to sit on top of everything
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // White-ish overlay so the Lechon pops
        backdropFilter: 'blur(4px)' // Blur the background content
      }}
      open={open}
    >
      <LechonSpinner message={message} />
    </Backdrop>
  );
};

export default LoadingOverlay;