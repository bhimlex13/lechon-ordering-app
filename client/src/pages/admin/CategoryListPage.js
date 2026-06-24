import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Modal,
  TablePagination
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../api'; // <-- 1. IMPORT OUR NEW API FILE
// import { useAuth } from '../context/AuthContext'; // <-- 2. No longer needed for token

// Style for the modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

function AdminCategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  // const { userInfo } = useAuth(); // <-- 3. No longer needed

  // --- 1. (R)ead: Fetch Categories ---
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      // --- 4. USE "api" (no config needed) ---
      const { data } = await api.get('/api/categories');
      setCategories(data);
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // --- 2. (C)reate: New Category ---
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);
    try {
      // --- 5. USE "api" (no config needed) ---
      const { data: newCategory } = await api.post('/api/categories', {
        name: newCategoryName,
      });

      setCategories((prev) => [...prev, newCategory]);
      setNewCategoryName('');
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      setCreateLoading(false);
    }
  };

  // --- 3. (U)pdate: Edit Modal Handlers ---
  const handleOpenEdit = (category) => {
    setCurrentCategory(category);
    setModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentCategory(null);
    setError(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError(null);
    try {
      // --- 6. USE "api" (no config needed) ---
      const { data: updatedCategory } = await api.put(
        `/api/categories/${currentCategory._id}`,
        { name: currentCategory.name }
      );

      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === updatedCategory._id ? updatedCategory : cat
        )
      );
      setEditLoading(false);
      handleCloseModal();
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setEditLoading(false);
    }
  };

  // --- 4. (D)elete: Delete Handler ---
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setError(null);
      try {
        // --- 7. USE "api" (no config needed) ---
        await api.delete(`/api/categories/${id}`);
        setCategories((prev) => prev.filter((cat) => cat._id !== id));
      } catch (err) {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : err.message
        );
      }
    }
  };

  // --- JSX (No changes needed below this line) ---
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Category Management
      </Typography>

      {/* --- Filters & Search --- */}
      <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField 
                label="Search Category Name..." 
                variant="outlined" 
                size="small" 
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                }}
                sx={{ minWidth: 250 }}
              />
          </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 4 }} component="form" onSubmit={handleCreate}>
        <Typography variant="h6">Create New Category</Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            label="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            fullWidth
            required
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={createLoading}
            sx={{ minWidth: 100 }}
          >
            {createLoading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </Box>
      </Paper>

      {error && !modalOpen && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories
                .filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((cat) => (
                <TableRow key={cat._id}>
                  <TableCell>{cat._id.substring(cat._id.length - 6)}</TableCell>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="secondary"
                      onClick={() => handleOpenEdit(cat)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(cat._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={categories.filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase())).length}
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
        <Box sx={modalStyle} component="form" onSubmit={handleUpdate}>
          <Typography variant="h5" component="h2">
            Edit Category
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Category Name"
            value={currentCategory ? currentCategory.name : ''}
            onChange={(e) =>
              setCurrentCategory((prev) => ({ ...prev, name: e.target.value }))
            }
            fullWidth
            required
          />
          <Button
            type="submit"
            variant="contained"
            disabled={editLoading}
            sx={{ mt: 2 }}
          >
            {editLoading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>
      </Modal>
    </Container>
  );
}

export default AdminCategoryListPage;