import React from 'react';
import { Box, Typography } from '@mui/material';

const PlaceholderImage = ({ name = 'Item', category = 'Menu', width = '100%', height = '100%', sx }) => {
  // Simple deterministic color based on name length
  const colors = ['#B45309', '#92400E', '#1F2937', '#DC2626', '#D97706'];
  const bgColor = colors[name.length % colors.length];

  return (
    <Box
      sx={{
        width,
        height,
        backgroundColor: bgColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        p: 2,
        textAlign: 'center',
        ...sx
      }}
      aria-hidden="true"
    >
      <Typography variant="h4" fontWeight="bold" sx={{ opacity: 0.8, mb: 1 }}>
        {name.charAt(0).toUpperCase()}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.6 }}>
        {category}
      </Typography>
    </Box>
  );
};

export default PlaceholderImage;
