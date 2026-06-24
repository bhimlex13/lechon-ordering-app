import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Modal, TextField, Checkbox, FormControlLabel, FormControl, InputLabel, Select, MenuItem, Chip, TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Icon for 24h
// axios import removed to fix ESLint warning
import api from '../../api';

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 500, maxHeight: '90vh', overflowY: 'auto', bgcolor: 'background.paper',
  border: '2px solid #000', boxShadow: 24, p: 4, display: 'flex', flexDirection: 'column', gap: 2,
};

const initialFormState = {
  _id: null, 
  name: '', 
  description: '', 
  price: 0, 
  category: '', 
  imageUrl: '', 
  availability: true,
  requires24Hours: false // Item #18
};

function MenuListPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(initialFormState);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [menuRes, catRes] = await Promise.all([api.get('/api/menu'), api.get('/api/categories')]);
        setMenuItems(menuRes.data.filter(item => item.category !== 'Lechon'));
        setCategories(catRes.data.filter(cat => cat.name !== 'Lechon'));
      } catch (err) { setError(err.message); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleOpenCreate = () => { setCurrentItem(initialFormState); setIsEditing(false); setModalOpen(true); };
  const handleOpenEdit = (item) => { setCurrentItem(item); setIsEditing(true); setModalOpen(true); };
  const handleCloseModal = () => setModalOpen(false);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    if (type === 'number' || name === 'price') {
        if (newValue.length > 1 && newValue.startsWith('0') && newValue[1] !== '.') {
            newValue = newValue.replace(/^0+/, ''); 
        }
    }

    setCurrentItem((prev) => ({ ...prev, [name]: newValue }));
  };

  const uploadFileHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        setCurrentItem((prev) => ({ ...prev, imageUrl: reader.result }));
        setUploading(false);
    };
    reader.onerror = () => {
        setError('Image conversion failed');
        setUploading(false);
    };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (Number(currentItem.price) < 0) {
        alert("Price cannot be negative.");
        return;
    }

    try {
      if (isEditing) {
        const { data } = await api.put(`/api/menu/${currentItem._id}`, currentItem);
        setMenuItems(prev => prev.map(item => item._id === data._id ? data : item));
      } else {
        const { _id, ...payload } = currentItem;
        const { data } = await api.post('/api/menu', payload);
        setMenuItems(prev => [...prev, data]);
      }
      handleCloseModal();
    } catch (err) { setError(err.response?.data?.message || err.message); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete item?')) {
      try {
        await api.delete(`/api/menu/${id}`);
        setMenuItems(prev => prev.filter(item => item._id !== id));
      } catch (err) { setError(err.message); }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">General Menu Management</Typography>
        <Button variant="contained" onClick={handleOpenCreate}>Add Item</Button>
      </Box>

      {/* --- Filters & Search --- */}
      <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField 
                label="Search Menu Name..." 
                variant="outlined" 
                size="small" 
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                }}
                sx={{ minWidth: 250 }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Filter Category</InputLabel>
                  <Select
                      value={filterCategory}
                      label="Filter Category"
                      onChange={(e) => {
                          setFilterCategory(e.target.value);
                          setPage(0);
                      }}
                  >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map(cat => <MenuItem key={cat._id} value={cat.name}>{cat.name}</MenuItem>)}
                  </Select>
              </FormControl>
          </Box>
      </Paper>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead><TableRow><TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell><TableCell>Image</TableCell><TableCell>Name</TableCell><TableCell>Category</TableCell><TableCell>Price</TableCell><TableCell>24h Notice</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {menuItems
                .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter(item => filterCategory ? item.category === filterCategory : true)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(item => (
                <TableRow key={item._id}>
                  <TableCell>{item._id.substring(item._id.length - 6).toUpperCase()}</TableCell>
                  <TableCell><Box component="img" src={item.imageUrl} sx={{ width: 50, height: 50, borderRadius: 1 }} /></TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>₱{item.price}</TableCell>
                  <TableCell>
                      {item.requires24Hours && <Chip icon={<AccessTimeIcon />} label="Required" size="small" color="warning" />}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenEdit(item)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(item._id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).filter(item => filterCategory ? item.category === filterCategory : true).length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
            }}
          />
        </TableContainer>
      )}

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle} component="form" onSubmit={handleFormSubmit}>
          <Typography variant="h5">{isEditing ? 'Edit Item' : 'New Item'}</Typography>
          <TextField name="name" label="Name" value={currentItem.name} onChange={handleFormChange} fullWidth required />
          <FormControl fullWidth required>
             <InputLabel>Category</InputLabel>
             <Select name="category" value={currentItem.category} label="Category" onChange={handleFormChange}>
               {categories.map(cat => <MenuItem key={cat._id} value={cat.name}>{cat.name}</MenuItem>)}
             </Select>
          </FormControl>
          <TextField name="price" label="Price" type="number" inputProps={{ min: 0 }} value={currentItem.price} onChange={handleFormChange} fullWidth required />
          <TextField name="description" label="Description" value={currentItem.description} onChange={handleFormChange} fullWidth multiline rows={2} />
          
          <Button variant="outlined" component="label" fullWidth disabled={uploading} startIcon={<UploadFileIcon />}>
            {uploading ? 'Uploading...' : 'Upload Image'} <input type="file" hidden onChange={uploadFileHandler} />
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
              <FormControlLabel control={<Checkbox name="availability" checked={currentItem.availability} onChange={handleFormChange} />} label="Available" />
              {/* ITEM #18 CHECKBOX */}
              <FormControlLabel 
                control={<Checkbox name="requires24Hours" checked={currentItem.requires24Hours} onChange={handleFormChange} color="warning" />} 
                label="Requires 24h Notice" 
              />
          </Box>

          <Button type="submit" variant="contained" disabled={uploading}>Save</Button>
        </Box>
      </Modal>
    </Container>
  );
}
export default MenuListPage;