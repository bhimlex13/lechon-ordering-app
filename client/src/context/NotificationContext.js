import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../theme'; // <--- Import your theme to access Brand Colors

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Function to add a new notification
  const showNotification = useCallback((message, severity = 'success') => {
    const id = Date.now() + Math.random(); 
    
    setNotifications((prev) => [
      { id, message, severity },
      ...prev,
    ]);

    setTimeout(() => {
      removeNotification(id);
    }, 4000);
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      <Box
        sx={{
          position: 'fixed',
          top: 80, 
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          maxWidth: '400px',
          width: '100%',
          pointerEvents: 'none', 
        }}
      >
        <AnimatePresence initial={false}>
          {notifications.map((note) => (
            <motion.div
              key={note.id}
              layout 
              initial={{ opacity: 0, y: -50, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} 
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{ pointerEvents: 'auto' }} 
            >
              <Alert
                severity={note.severity}
                variant="filled"
                elevation={6}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => removeNotification(note.id)}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                sx={{
                  width: '100%',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  
                  // --- CUSTOM BRAND COLOR LOGIC ---
                  // If severity is 'success', force the Brand Orange color.
                  // Otherwise (error, warning), use the default Material UI colors.
                  ...(note.severity === 'success' && {
                    backgroundColor: theme.palette.primary.main, // #ed6c02 (Orange)
                    color: theme.palette.primary.contrastText,   // White
                    '& .MuiAlert-icon': {
                        color: theme.palette.primary.contrastText // Make the checkmark white
                    }
                  })
                }}
              >
                {note.message}
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>
    </NotificationContext.Provider>
  );
};