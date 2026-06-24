import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import { theme } from '../theme';

// Define the rotation animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// A bobbing animation for text
const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const LechonSpinner = ({ message = "Loading..." }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* The Container for the Image */}
      <Box
        sx={{
          position: 'relative',
          width: 120,
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Add a circular dashed border background
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `4px dashed ${theme.palette.primary.main}`, // Brand Orange border
            animation: `${spin} 8s linear infinite`, // Border spins slowly
            opacity: 0.5,
          }
        }}
      >
        {/* The Logo Image */}
        <Box
          component="img"
          src="/logo.svg"
          alt="Loading..."
          sx={{
            width: '70%', // Slightly reduced size to fit nicely within the spinning border
            height: 'auto',
            animation: `${spin} 3s linear infinite`, // The logo spins
            filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))'
          }}
        />
      </Box>

      {/* Loading Text */}
      <Typography
        variant="h6"
        sx={{
          mt: 3,
          color: theme.palette.primary.main, // Brand Orange
          fontWeight: 'bold',
          animation: `${pulse} 1.5s ease-in-out infinite`,
          letterSpacing: 1
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LechonSpinner;

