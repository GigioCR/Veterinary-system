import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  Table, TableCell, TableContainer, TableHead, TableBody, TableRow, TablePagination, Paper,
  Box, Stack, Typography, Button, Modal, TextField, FormGroup, Menu, MenuItem, IconButton, InputAdornment,
  TableSortLabel, CircularProgress, Snackbar, Alert, FormHelperText, 
} from '@mui/material';
import { MoreHoriz, Search, Close } from '@mui/icons-material';
import Chip from '@mui/material/Chip';
import { visuallyHidden } from '@mui/utils';
import SideMenu from '../admin/SideMenu';
import Header from '../admin/Header';
import Cargando from '../general/loadingScreen';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

// Style for modals
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const inputPropsStyle = {
  shrink: true, // Ensures the label stays on top
}

export default function SeeVet() {
  // State variables
  const [veterinarios, setVeterinarios] = useState([]);
  const [selectedVet, setSelectedVet] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Loading state
  const [loading, setLoading] = useState(true);

  // Modal state
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openToggleConfirm, setOpenToggleConfirm] = useState(false);

  const theme = useTheme();
  
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  // Form state for creating
  const [formValues, setFormValues] = useState({
    id_usuario: '',
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    salario: '',
    especialidad: '',
    rol: 'veterinario',
  });

  // Form state for editing
  const [editFormValues, setEditFormValues] = useState({
    id_usuario: '',
    nombre: '',
    apellido: '',
    correo: '',
    salario: '',
    especialidad: '',
    rol: 'veterinario',
  });

  // Error state
  const [errores, setErrores] = useState({});

  // Confirmation alerts state
  const [createHappened, setCreateHappened] = useState(false);
  const closeCreateConfirmAlert = () => {
    setCreateHappened(false);
  };

  const [editHappened, setEditHappened] = useState(false);
  const closeEditConfirmAlert = () => {
    setEditHappened(false);
  };

  const [changeStateHappened, setChangeStateHappened] = useState(false);
  const closeChangeStateConfirmAlert = () => {
    setChangeStateHappened(false);
  };

  // Sorting state
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('ID_USUARIO');

  // Define head cells
  const headCells = [
    { id: 'ID_USUARIO', label: 'ID Usuario' },
    { id: 'NOMBRE_COMPLETO', label: 'Nombre' },
    { id: 'CORREO', label: 'Correo' },
    { id: 'ESPECIALIDAD', label: 'Especialidad' },
    { id: 'SALARIO', label: 'Salario' },
    { id: 'ESTADO', label: 'Estado' },
  ];

  useEffect(() => {
    fetchVeterinarios();
  }, []);

  const fetchVeterinarios = async () => {
    try {
      const res = await axiosInstance.get('http://localhost:8080/administradores/veterinarios');
      const dataWithFullName = res.data.map((vet) => ({
        ...vet,
        NOMBRE_COMPLETO: `${vet.NOMBRE} ${vet.APELLIDO}`,
      }));
      setVeterinarios(dataWithFullName);
    } catch (err) {
      console.error('Error fetching veterinarios', err);
    } finally {
      setLoading(false);
    }
  };

  // Search handler
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when search query changes
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Menu handlers
  const handleMenuClick = (event, vet) => {
    setSelectedVet(vet);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Modal handlers
  const handleOpenCreate = () => {
    setFormValues({
      id_usuario: '',
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      salario: '',
      especialidad: '',
      rol: 'veterinario',
    });
    setErrores({});
    setOpenCreate(true);
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
    setErrores({});
  };

  const handleOpenEdit = () => {
    const vet = selectedVet || {};
    setEditFormValues({
      id_usuario: vet.ID_USUARIO ?? '',
      nombre: vet.NOMBRE ?? '',
      apellido: vet.APELLIDO ?? '',
      correo: vet.CORREO ?? '',
      salario: vet.SALARIO ?? '',
      especialidad: vet.ESPECIALIDAD ?? '',
      rol: 'veterinario',
    });
    setErrores({});
    setOpenEdit(true);
    handleMenuClose();
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setErrores({});
  };

  // Toggle Confirmation Modal handlers
  const handleOpenToggleConfirm = () => {
    setOpenToggleConfirm(true);
    handleMenuClose();
  };

  const handleCloseToggleConfirm = () => {
    setOpenToggleConfirm(false);
  };

  // Form change handler for creating
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: '' }));
  };

  // Form change handler for editing
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormValues((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: '' }));
  };

  // Create veterinarian
  const handleCreateVet = async (e) => {
    e.preventDefault();
  
    // Regular expressions for validation
    const nameRegex = /^[A-Za-z\s]{1,50}$/;  // Allows only alphabetic characters and spaces, up to 50 characters
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{1,50}$/;
  
    const newErrores = {};
  
    // Validate each field
    if (!formValues.id_usuario.trim()||formValues.id_usuario.length>50) {
      newErrores.id_usuario = 'El ID de usuario es no vacío y de hasta 50 caracteres.';
    }
    if (!formValues.nombre.trim() || !nameRegex.test(formValues.nombre)||(formValues.nombre.length>50)) {
      newErrores.nombre = 'Nombre debe ser alfabético, no vacío y de hasta 50 caracteres.';
    }
    if (!formValues.apellido.trim() || !nameRegex.test(formValues.apellido)||(formValues.apellido.length>50)) {
      newErrores.apellido = 'Apellido debe ser alfabético, no vacío y de hasta 50 caracteres.';
    }
    if (!formValues.correo.trim()) {
      newErrores.correo = 'El correo es obligatorio.';
    } else if (!emailRegex.test(formValues.correo)) {
      newErrores.correo = 'El correo no es válido.';
    }
    if (!formValues.contrasena) {
      newErrores.contrasena = 'La contraseña es obligatoria.';
    } else if (!passwordRegex.test(formValues.contrasena) ||formValues.contrasena.length>50) {
      newErrores.contrasena =
        'La contraseña debe tener al menos una letra mayúscula, una letra minúscula, un dígito, un carácter especial y no debe exceder los 50 caracteres.';
    }
    if (!formValues.salario) {
      newErrores.salario = 'El salario es obligatorio.';
    } else if (isNaN(formValues.salario) || formValues.salario <= 0) {
      newErrores.salario = 'El salario debe ser un número positivo.';
    }
    if (!formValues.especialidad.trim()) {
      newErrores.especialidad = 'La especialidad es obligatoria.';
    }
  
    setErrores(newErrores);
  
    if (Object.keys(newErrores).length > 0) {
      return;  // Stop submission if there are errors
    }
  
    try {
      await axiosInstance.post('http://localhost:8080/administradores/veterinarios', formValues);
      fetchVeterinarios();
      handleCloseCreate();
      setCreateHappened(true);
    } catch (err) {
      console.error('Error creating veterinarian', err);
    }
  };
  

  // Update veterinarian
  const handleEditVet = async (e) => {
    e.preventDefault();
    
    // Regular expressions for validation
    const nameRegex = /^[A-Za-z\s]{1,50}$/;  // Allows only alphabetic characters and spaces, up to 50 characters
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    const newErrores = {};
  
    // Validate each field (except id_usuario)
    if (!editFormValues.nombre.trim() || !nameRegex.test(editFormValues.nombre)) {
      newErrores.nombre = 'Nombre debe ser alfabético, no vacío y de hasta 50 caracteres.';
    }
    if (!editFormValues.apellido.trim() || !nameRegex.test(editFormValues.apellido)) {
      newErrores.apellido = 'Apellido debe ser alfabético, no vacío y de hasta 50 caracteres.';
    }
    if (!editFormValues.correo.trim()) {
      newErrores.correo = 'El correo es obligatorio.';
    } else if (!emailRegex.test(editFormValues.correo)) {
      newErrores.correo = 'El correo no es válido.';
    }
    if (!editFormValues.salario) {
      newErrores.salario = 'El salario es obligatorio.';
    } else if (isNaN(editFormValues.salario) || editFormValues.salario <= 0) {
      newErrores.salario = 'El salario debe ser un número positivo.';
    }
    if (!editFormValues.especialidad.trim()) {
      newErrores.especialidad = 'La especialidad es obligatoria.';
    }
  
    setErrores(newErrores);
  
    if (Object.keys(newErrores).length > 0) {
      // There are errors, do not proceed
      return;
    }
  
    try {
      await axiosInstance.put(
        `http://localhost:8080/administradores/veterinarios/${editFormValues.id_usuario}`,
        editFormValues
      );
      fetchVeterinarios();
      handleCloseEdit();
      setEditHappened(true);
    } catch (err) {
      console.error('Error updating veterinarian', err);
    }
  };

  // Toggle veterinarian's estado
  const handleToggleEstado = async () => {
    try {
      const newEstado = selectedVet.ESTADO == 1 ? 0 : 1;
      await axiosInstance.put(
        `http://localhost:8080/administradores/veterinarios/estado/${selectedVet.ID_USUARIO}`,
        { estado: newEstado }
      );
      setVeterinarios((prev) =>
        prev.map((vet) =>
          vet.ID_USUARIO === selectedVet.ID_USUARIO ? { ...vet, ESTADO: newEstado } : vet
        )
      );
      handleCloseToggleConfirm();
      setChangeStateHappened(true);
    } catch (err) {
      console.error('Error toggling veterinarian estado', err);
    }
  };

  // Sorting functions
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  function descendingComparator(a, b, orderBy) {
    if (typeof a[orderBy] === 'string') {
      return b[orderBy].localeCompare(a[orderBy]);
    }
    return b[orderBy] - a[orderBy];
  }

  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const orderComp = comparator(a[0], b[0]);
      if (orderComp !== 0) return orderComp;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  // Filter veterinarians based on search query
  const filteredVeterinarios = veterinarios.filter((vet) => {
    const fullName = vet.NOMBRE_COMPLETO.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Sort data before rendering
  const sortedVeterinarios = stableSort(
    filteredVeterinarios,
    getComparator(order, orderBy)
  );

  // Show loading screen while data is being fetched
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
        <Box sx={{ mt: 2 }}>
          <Cargando />
        </Box>
      </Box>
    );
  }

  return (
    <div>
      {/* Create Confirmation Alert */}
      <Snackbar open={createHappened} autoHideDuration={4000} onClose={closeCreateConfirmAlert}>
        <Alert onClose={closeCreateConfirmAlert} severity="success" sx={{ width: '100%' }}>
          El veterinario fue agregado exitosamente.
        </Alert>
      </Snackbar>

      {/* Edit Confirmation Alert */}
      <Snackbar open={editHappened} autoHideDuration={4000} onClose={closeEditConfirmAlert}>
        <Alert onClose={closeEditConfirmAlert} severity="success" sx={{ width: '100%' }}>
          Se guardaron los cambios exitosamente.
        </Alert>
      </Snackbar>

      {/* Change State Confirmation Alert */}
      <Snackbar
        open={changeStateHappened}
        autoHideDuration={4000}
        onClose={closeChangeStateConfirmAlert}
      >
        <Alert onClose={closeChangeStateConfirmAlert} severity="success" sx={{ width: '100%' }}>
          Se cambió el estado del veterinario exitosamente.
        </Alert>
      </Snackbar>

      {/* Create Modal */}
      <Modal
        open={openCreate}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseCreate();
          }
        }}
      >
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Agregar Veterinario</Typography>
            <IconButton onClick={handleCloseCreate}>
              <Close />
            </IconButton>
          </Box>
          <form onSubmit={handleCreateVet} noValidate>
            <FormGroup>
              <TextField
                required
                InputLabelProps={inputPropsStyle}
                label="ID Usuario"
                name="id_usuario"
                value={formValues.id_usuario}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 200 }}
                error={!!errores.id_usuario}
                helperText={errores.id_usuario}
              />
              <TextField
                required
                label="Nombre"
                InputLabelProps={inputPropsStyle}
                name="nombre"
                value={formValues.nombre}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 200 }}
                error={!!errores.nombre}
                helperText={errores.nombre}
              />
              <TextField
                required
                label="Apellido"
                InputLabelProps={inputPropsStyle}
                name="apellido"
                value={formValues.apellido}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 200 }}
                error={!!errores.apellido}
                helperText={errores.apellido}
              />
              <TextField
                required
                label="Correo"
                name="correo"
                InputLabelProps={inputPropsStyle}
                type="email"
                value={formValues.correo}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 200 }}
                error={!!errores.correo}
                helperText={errores.correo}
              />
              <TextField
                required
                label="Contraseña"
                name="contrasena"
                InputLabelProps={inputPropsStyle}
                type="password"
                value={formValues.contrasena}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 200 }}
                error={!!errores.contrasena}
                helperText={errores.contrasena}
              />
              <TextField
                required
                label="Salario"
                name="salario"
                type="number"
                InputLabelProps={inputPropsStyle}
                value={formValues.salario}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                inputProps={{ min: 0 }}
                error={!!errores.salario}
                helperText={errores.salario}
              />
              <TextField
                required
                label="Especialidad"
                name="especialidad"
                InputLabelProps={inputPropsStyle}
                value={formValues.especialidad}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 200 }}
                error={!!errores.especialidad}
                helperText={errores.especialidad}
              />
            </FormGroup>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={handleCloseCreate}>Cancelar</Button>
              <Button variant="contained" sx={{ backgroundColor: '#4976CB' }} type="submit">
                Agregar
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={openEdit}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseEdit();
          }
        }}
      >
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Editar Veterinario</Typography>
            <IconButton onClick={handleCloseEdit}>
              <Close />
            </IconButton>
          </Box>
          <form onSubmit={handleEditVet} noValidate>
            <FormGroup>
              <TextField
                required
                label="ID Usuario"
                InputLabelProps={inputPropsStyle}
                name="id_usuario"
                value={editFormValues.id_usuario}
                onChange={handleEditFormChange}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                required
                label="Nombre"
                InputLabelProps={inputPropsStyle}
                name="nombre"
                value={editFormValues.nombre}
                onChange={handleEditFormChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 200 }}
                error={!!errores.nombre}
                helperText={errores.nombre}
              />
              <TextField
                required
                label="Apellido"
                InputLabelProps={inputPropsStyle}
                name="apellido"
                value={editFormValues.apellido}
                onChange={handleEditFormChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 200 }}
                error={!!errores.apellido}
                helperText={errores.apellido}
              />
              <TextField
                required
                label="Correo"
                InputLabelProps={inputPropsStyle}
                name="correo"
                type="email"
                value={editFormValues.correo}
                onChange={handleEditFormChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 200 }}
                error={!!errores.correo}
                helperText={errores.correo}
              />
              <TextField
                required
                label="Salario"
                name="salario"
                InputLabelProps={inputPropsStyle}
                type="number"
                value={editFormValues.salario}
                onChange={handleEditFormChange}
                fullWidth
                margin="normal"
                inputProps={{ min: 0 }}
                error={!!errores.salario}
                helperText={errores.salario}
              />
              <TextField
                required
                label="Especialidad"
                name="especialidad"
                InputLabelProps={inputPropsStyle}
                value={editFormValues.especialidad}
                onChange={handleEditFormChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 200 }}
                error={!!errores.especialidad}
                helperText={errores.especialidad}
              />
            </FormGroup>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={handleCloseEdit}>Cancelar</Button>
              <Button variant="contained" color="primary" type="submit">
                Guardar Cambios
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Toggle Confirmation Modal */}
      <Modal
        open={openToggleConfirm}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseToggleConfirm();
          }
        }}
      >
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="h2">
              Confirmar {selectedVet && selectedVet.ESTADO === 1 ? 'Deshabilitar' : 'Habilitar'}
            </Typography>
            <IconButton onClick={handleCloseToggleConfirm}>
              <Close />
            </IconButton>
          </Box>
          <Typography>
            ¿Está seguro de que desea{' '}
            {selectedVet && selectedVet.ESTADO === 1 ? 'deshabilitar' : 'habilitar'} al
            veterinario {selectedVet && selectedVet.NOMBRE_COMPLETO}?
          </Typography>
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={handleCloseToggleConfirm} sx={{ mr: 2 }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color={selectedVet && selectedVet.ESTADO === 1 ? 'primary' : 'primary'}
              onClick={handleToggleEstado}
            >
              {selectedVet && selectedVet.ESTADO === 1 ? 'Deshabilitar' : 'Habilitar'}
            </Button>
          </Box>
        </Box>
      </Modal>


      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Header />
          <Stack spacing={2} sx={{ alignItems: 'center', mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
          <Box sx={{
            width: '100%',
            pt: {xs: 0, sm: 0, md: 4, lg: 4},
            color: '#000',
            '& > .MuiBox-root > .MuiBox-root': {
              p: 1,
              borderRadius: 2,
              fontSize: '0.875rem',
              fontWeight: '700'
            }
          }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { 
                xs: 'repeat(1, 1fr)', 
                sm: 'repeat(1, 1fr)',
              }, 
              gap: 1, 
              gridTemplateRows: { xs: 'auto auto', sm: 'auto' }, 
              gridTemplateAreas: {
                xs: `"main"
                     "sidebar"`,
                sm: `"main main . sidebar"` 
              }
            }}>
                <Box sx={{ gridArea: 'main' }}>
                  <Typography variant="h4" gutterBottom>
                    Veterinarios
                  </Typography>
                </Box>
                <Box
                  sx={{
                    gridArea: 'sidebar',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    size="medium"
                    sx={{ backgroundColor: '#4976CB' }}
                    onClick={handleOpenCreate}
                  >
                    Agregar
                  </Button>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Buscar"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
            </Box>
                    {/* Conditional rendering based on screen size */}
          {isSmallScreen ||  isMediumScreen ? (
            <Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: {xs: 'repeat(1, 1fr)', sm:'repeat(3, 3fr)',  md:'repeat(3, 3fr)'}, gap: {xs: 2, sm: 4, md: 4} }}>
                    {filteredVeterinarios.length <= 0 
              ? "No hay veterinarios disponibles o que cumplan con ese criterio de búsqueda" 
              : ""}
                        {sortedVeterinarios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((vet) => (
                          <Box key={vet.ID_USUARIO} sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 2, position: 'relative' }}>
                          <Typography variant="h6">{vet.NOMBRE_COMPLETO}</Typography>
                          <Typography><strong>Usuario: </strong>{vet.ID_USUARIO}</Typography>
                          <Typography><strong>Correo: </strong>{vet.CORREO}</Typography>
                          <Typography><strong>Especialidad: </strong>{vet.ESPECIALIDAD}</Typography>
                          <Typography><strong>Salario: </strong>₡{vet.SALARIO}</Typography>
                            <Chip
                            label={vet.ESTADO === 1 ? 'Habilitado' : 'Deshabilitado'}
                            color={vet.ESTADO === 1 ? 'success' : 'error'}
                            variant="outlined"
                            sx={{
                              borderWidth: 1,
                            }}
                          />
                          <br />
                           <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                            <Button
                                id="basic-button"
                                aria-controls={openMenu ? 'basic-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={openMenu ? 'true' : undefined}
                                onClick={(event) => handleMenuClick(event, vet)}
                              >
                                <MoreHoriz />
                              </Button>
                            </Box>
                            <Menu
                              anchorEl={anchorEl}
                              open={openMenu}
                              onClose={handleMenuClose}
                              MenuListProps={{
                                'aria-labelledby': 'basic-button',
                              }}
                            >
                              <MenuItem onClick={handleOpenEdit}>Editar</MenuItem>
                              <MenuItem onClick={handleOpenToggleConfirm}>
                                {selectedVet && selectedVet.ESTADO == 1 ? 'Deshabilitar' : 'Habilitar'}
                              </MenuItem>
                            </Menu>
                            </Box>
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-center', marginTop: 2 }}>
                    <TablePagination
                    sx={{
                      '& .MuiTablePagination-toolbar, & .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': {
                        alignItems: 'baseline',
                        fontSize: {xs: '11px', sm: '13px'},
                      },
                    }}
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    labelRowsPerPage="Número de filas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    count={sortedVeterinarios.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                    </Box>
                    </Box>
                  ) :
            <Box sx={{ width: '100%' }}>
              <TableContainer component={Paper}>
                <Table aria-label="veterinarios table">
                  <TableHead>
                    <TableRow>
                      {headCells.map((headCell) => (
                        <TableCell
                          key={headCell.id}
                          sortDirection={orderBy === headCell.id ? order : false}
                        >
                          <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={(event) => handleRequestSort(event, headCell.id)}
                          >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                              <Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                              </Box>
                            ) : null}
                          </TableSortLabel>
                        </TableCell>
                      ))}
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedVeterinarios
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((vet) => (
                        <TableRow key={vet.ID_USUARIO}>
                          <TableCell>{vet.ID_USUARIO}</TableCell>
                          <TableCell>{vet.NOMBRE_COMPLETO}</TableCell>
                          <TableCell>{vet.CORREO}</TableCell>
                          <TableCell>{vet.ESPECIALIDAD}</TableCell>
                          <TableCell>₡{vet.SALARIO}</TableCell>
                          <TableCell>
                            <Chip
                            label={vet.ESTADO === 1 ? 'Habilitado' : 'Deshabilitado'}
                            color={vet.ESTADO === 1 ? 'success' : 'error'}
                            variant="outlined"
                            sx={{
                              
                              borderWidth: 1,
                            }}
                          />
                          </TableCell>
                          <TableCell>
                            <Button
                              id="basic-button"
                              aria-controls={openMenu ? 'basic-menu' : undefined}
                              aria-haspopup="true"
                              aria-expanded={openMenu ? 'true' : undefined}
                              onClick={(event) => handleMenuClick(event, vet)}
                            >
                              <MoreHoriz />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <Menu
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={handleMenuClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                >
                  <MenuItem onClick={handleOpenEdit}>Editar</MenuItem>
                  <MenuItem onClick={handleOpenToggleConfirm}>
                    {selectedVet && selectedVet.ESTADO == 1 ? 'Deshabilitar' : 'Habilitar'}
                  </MenuItem>
                </Menu>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredVeterinarios.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Número de filas"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    alignItems: 'baseline',
                  },
                }}
              />
            </Box>}
          </Stack>
        </Box>
      </Box>
    </div>
  );
}
