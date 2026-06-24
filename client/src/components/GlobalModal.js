import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box 
} from '@mui/material';
import { 
  CheckCircleOutline, 
  ErrorOutline, 
  InfoOutlined, 
  WarningAmber 
} from '@mui/icons-material';
import { useModal } from '../context/ModalContext';
import { theme } from '../theme';

const GlobalModal = () => {
  const { modalState, hideModal } = useModal();
  const { isOpen, title, message, type, onConfirm, confirmText } = modalState;

  // Choose icon and color based on type
  const getConfig = () => {
    switch (type) {
      case 'success':
        return { icon: <CheckCircleOutline sx={{ fontSize: 60, color: theme.palette.success.main }} />, color: theme.palette.success.main };
      case 'error':
        return { icon: <ErrorOutline sx={{ fontSize: 60, color: theme.palette.error.main }} />, color: theme.palette.error.main };
      case 'warning':
        return { icon: <WarningAmber sx={{ fontSize: 60, color: theme.palette.warning.main }} />, color: theme.palette.warning.main };
      default:
        return { icon: <InfoOutlined sx={{ fontSize: 60, color: theme.palette.primary.main }} />, color: theme.palette.primary.main };
    }
  };

  const { icon } = getConfig();

  const handleClose = () => {
    hideModal();
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={hideModal} // Clicking outside closes it without triggering action (optional)
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 2,
          minWidth: { xs: '300px', sm: '400px' },
          textAlign: 'center'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        {icon}
      </Box>
      
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', pt: 1 }}>
        {title}
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button 
          onClick={handleClose} 
          variant="contained" 
          size="large"
          sx={{ minWidth: 120, borderRadius: 2 }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GlobalModal;