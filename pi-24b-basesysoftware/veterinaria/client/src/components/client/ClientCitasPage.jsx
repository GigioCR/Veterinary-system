// src/components/client/clientCitasPage.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  Autocomplete, Table,TextField, FormGroup, FormControl, InputLabel, TableCell, Select, FormHelperText, TableContainer, TableHead, TableBody, TableRow, Paper,
  Box, Stack, Typography, CircularProgress, TableSortLabel, Chip, Modal, Button, IconButton, TablePagination, Menu, MenuItem, Snackbar, Alert, InputAdornment, 
  Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import { Info as InfoIcon, MoreHoriz as MoreHorizIcon, Close, Search } from '@mui/icons-material'; // This line is needed
import { visuallyHidden } from '@mui/utils';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SideMenu from './SideMenu'; 
import Header from './Header';     
import Cargando from '../general/loadingScreen';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { format } from 'date-fns';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40%',
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const inputPropsStyle = {
  shrink: true, // Ensures the label stays on top
}

export default function ClientCitasPage() {
  const speciesMapping = {
    '01': 'Perro',
    '02': 'Gato',
    // Add more mappings as needed
  };
  const [citas, setCitas] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('FECHA');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [servicios, setServicios] = useState([]); // Add if needed to display services
  const [anchorEl, setAnchorEl] = useState({});

  const theme = useTheme();
  
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  const ESTADO_PENDIENTE = 1;
  const ESTADO_CANCELADO = 0;
  const ESTADO_COMPLETADO = 2;
  const [openCreate, setOpenCreate] = useState(false);
  const [formValues, setFormValues] = useState({
    id_mascota: null,
    fecha: '',
    hora: '',
    tipo_cita: '',
    id_usuario_vet: null,
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [tipoCitas, setTipoCitas] = useState([]);
  const [errores, setErrores] = useState({});
  const [createSuccess, setCreateSuccess] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const [editSelectedDate, setEditSelectedDate] = useState(null);
  const [editAvailableTimes, setEditAvailableTimes] = useState([]);
  const [editFormValues, setEditFormValues] = useState({
    fecha: '',
    hora: '',
  });
  const [servicesList, setServicesList] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [editSelectedServices, setEditSelectedServices] = useState([]);
  const [editSuccess, setEditSuccess] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelCitaId, setCancelCitaId] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  


  // Function to handle opening the edit modal
  const handleOpenEditModal = (cita) => {
    const formattedHora = cita.HORA.slice(0, 5);
    setEditFormValues({
      fecha: cita.FECHA,
      hora: formattedHora, // Set the current hora of the cita
      ID_CITA: cita.ID_CITA,
      ID_VET: cita.ID_VET,
      ID_CLIENTE: cita.ID_CLIENTE,
      ID_MASCOTA: cita.ID_MASCOTA,
    });
  
    // Create a Date object using both date and time to avoid time zone issues
    const dateTimeString = `${cita.FECHA}T${cita.HORA}`;
    const date = new Date(dateTimeString);
  
    setEditSelectedDate(date);
  
    // Fetch available times for editing
    fetchAvailableTimes(
      date,
      cita.ID_VET,
      cita.ID_CLIENTE,
      cita.ID_MASCOTA,
      setEditAvailableTimes,
      formattedHora // Pass the current hora as an argument to ensure it's included in available times
    );
  
    fetchCitaServicios(cita.ID_CITA);
    setEditModalOpen(true);
  };
  

  // Function to handle closing the edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditFormValues({
      fecha: '',
      hora: '',
    });
    setEditAvailableTimes([]);
    setEditSelectedDate(null);
  };

  // Function to handle editing a cita
  const handleEditCita = async (e) => {
    console.log('llamo a handleEditCita');
    e.preventDefault();
  
    // Validate required fields
    const newErrores = {};
    if (!editFormValues.fecha) newErrores.fecha = true;
    if (!editFormValues.hora) newErrores.hora = true;
    setErrores(newErrores);
    if (Object.keys(newErrores).length > 0) return;
    console.log('el id de la cita que me llegó es: ', editFormValues.ID_CITA)
    try {
      const formattedFechaHora = `${editFormValues.fecha} ${editFormValues.hora}`;
  
      // Update the cita
      await axiosInstance.put(`clientes/citas/${editFormValues.ID_CITA}`, {
        fecha: formattedFechaHora,
      });
  
      // Delete existing cita_servicios
      await axiosInstance.delete(`clientes/cita_servicios/${editFormValues.ID_CITA}`);
  
      // Create new cita_servicios
      if (editSelectedServices.length > 0) {
        const promises = editSelectedServices.map((servicio) =>
          axiosInstance.post('clientes/cita_servicios', {
            citaId: editFormValues.ID_CITA,
            servicioId: servicio.ID_SERVICIO,
          })
        );
        await Promise.all(promises);
      }
  
      setEditSuccess(true);
      fetchCitas(); // Refresh the citas list
      handleCloseEditModal();
    } catch (err) {
      console.error('Error updating cita', err);
    }
  };
  
  


  const fetchMascotas = async () => {
    console.log('llamo a fetchMascotas');
    try {
      const userId = localStorage.getItem('userId');
      const res = await axiosInstance.get(`/clientes/mascotas/${userId}`);
      console.log('hice el fetch de mascotas');
      console.log('Mascotas data received:', res.data);
      setMascotas(res.data);
      console.log('Updated mascotas state:', res.data);
    } catch (err) {
      console.error('Error fetching mascotas', err);
    }
  };
  const fetchVeterinarians = async () => {
    try {
      const res = await axiosInstance.get('/clientes/veterinarios/activos');
      setVeterinarians(res.data || []);
    } catch (err) {
      console.error('Error fetching veterinarians', err);
      setVeterinarians([]);
    }
  };

  const fetchTipoCitas = async () => {
    try {
      const res = await axiosInstance.get('/clientes/tipos_cita');
      setTipoCitas(res.data);
    } catch (err) {
      console.error('Error fetching tipos de cita', err);
    }
  };

  const fetchAvailableTimes = async (date, vetId, clientId, petId, setTimes, currentHora = null) => {
    if (!date || !vetId || !clientId || !petId) return;
  
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const res = await axiosInstance.get(`/clientes/citas/available-times`, {
        params: { date: formattedDate, vetId, clientId, petId },
      });
  
      let availableTimes = res.data;
  
      console.log('Available times before adding currentHora:', availableTimes);
      console.log('Current Hora:', currentHora);
  
      // Format currentHora to "HH:mm"
      if (currentHora) {
        const formattedCurrentHora = currentHora.slice(0, 5);
        if (!availableTimes.includes(formattedCurrentHora)) {
          availableTimes.push(formattedCurrentHora);
          availableTimes.sort();
        }
      }
  
      console.log('Available times after adding currentHora:', availableTimes);
  
      setTimes(availableTimes);
    } catch (err) {
      console.error('Error fetching available times', err);
    }
  };
  
  
  const fetchServices = async () => {
    try {
      const res = await axiosInstance.get('/clientes/servicios');
      
      setServicesList(res.data);
    } catch (err) {
      console.error('Error fetching services', err);
    }
  };
  // Use this function when `formValues.id_mascota` and `localStorage.getItem('userId')` are available
  if (formValues.id_mascota && formValues.id_usuario_vet) {
    fetchAvailableTimes(selectedDate, formValues.id_usuario_vet, localStorage.getItem('userId'), formValues.id_mascota, setAvailableTimes);
  }
  
  const fetchCitaServicios = async (citaId) => {
    try {
      const res = await axiosInstance.get(`/clientes/cita_servicios/${citaId}`);
      console.log('Fetched cita servicios:', res.data);
      
      // Map the data to match the structure of `servicesList`
      const services = res.data.map((service) => ({
        ID_SERVICIO: service.ID_SERVICIO || service.id_servicio,
        NOMBRE: service.NOMBRE_SERVICIO || service.nombre_servicio,
        PRECIO_ACTUAL: service.PRECIO || service.precio,
      }));
  
      setEditSelectedServices(services);
    } catch (err) {
      console.error('Error fetching cita servicios', err);
    }
  };
  

  const handleClickMenu = (event, citaId) => {
    setAnchorEl({ ...anchorEl, [citaId]: event.currentTarget });
  };
  
  const handleCloseMenu = (citaId) => {
    setAnchorEl({ ...anchorEl, [citaId]: null });
  };
  
  const handleCancelar = (citaId) => {
    handleCloseMenu(citaId);
    setCancelCitaId(citaId);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!cancelCitaId) return;
    try {
      await axiosInstance.put(`/clientes/citas/${cancelCitaId}/estado`, { estado: 0 });
      setCancelSuccess(true);
      fetchCitas(); // Refresh the citas list
    } catch (err) {
      console.error('Error cancelling cita:', err);
    } finally {
      setCancelModalOpen(false);
      setCancelCitaId(null);
    }
  };
  
  const handleCompletar = async (citaId) => {
    handleCloseMenu(citaId);
    try {
      await axiosInstance.put(`/clientes/citas/${citaId}/estado`, { estado: 2 });
      fetchCitas();
    } catch (err) {
      console.error('Error completing cita:', err);
    }
  };

  // Function to handle modal opening
  const handleOpenModal = async (citaId) => {
    console.log("Abri el modal")
    setSelectedCita(citaId);
    setModalOpen(true);
    try {
      const res = await axiosInstance.get(`/clientes/servicios/${citaId}`);
      console.log('busqué los servicios de ', citaId);
      console.log('y encontre ', res.data);
      setServicios(res.data);
      console.log('Fetched servicios:', res.data);
    } catch (err) {
      console.error('Error fetching servicios:', err);
    } finally {
      setLoading(false); // Stop loading after fetching
    }
  };

  // Function to handle modal closing
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCita(null);
    setServicios([]); // Clear servicios when modal closes
  };
  
  const handleOpenCreate = () => {
    setFormValues({
      id_mascota: '',
      fecha: '',
      hora: '',
      tipo_cita: 'VA',
      id_usuario_vet: '',
    });
    setSelectedDate(null);
    setAvailableTimes([]);
    setOpenCreate(true);
  };
  
  const handleCloseCreate = () => {
    setOpenCreate(false);
    setErrores({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    if (name === 'id_usuario_vet' && selectedDate && formValues.id_mascota) {
      fetchAvailableTimes(selectedDate, value, localStorage.getItem('userId'), formValues.id_mascota, setAvailableTimes);
    }
  };


  const handleDateChange = (newDate) => {
    console.log('Create modal - selected date:', newDate); 
    if (!newDate || isNaN(newDate)) {
      return;
    }

    setSelectedDate(newDate);
    setFormValues((prev) => ({
      ...prev,
      fecha: newDate.toISOString().split('T')[0],
    }));

    if (formValues.id_usuario_vet && formValues.id_mascota) {
      fetchAvailableTimes(newDate, formValues.id_usuario_vet, localStorage.getItem('userId'), formValues.id_mascota, setAvailableTimes);
    }
  };


  const handleCreateCita = async (e) => {
    e.preventDefault();
  
    const newErrores = {};
    if (!formValues.id_mascota) newErrores.id_mascota = true;
    if (!formValues.fecha) newErrores.fecha = true;
    if (!formValues.hora) newErrores.hora = true;
    // if (!formValues.tipo_cita) newErrores.tipo_cita = true;
    if (!formValues.id_usuario_vet) newErrores.id_usuario_vet = true;
  
    setErrores(newErrores);
  
    if (Object.keys(newErrores).length > 0) return;
  
    try {
      const userId = localStorage.getItem('userId');
      const formattedFechaHora = `${formValues.fecha} ${formValues.hora}`;
  
      // Create the cita and get the citaId
      const response = await axiosInstance.post('/clientes/citas', {
        ...formValues,
        fecha: formattedFechaHora,
        id_usuario_cli: userId,
      });
  
      const citaId = response.data.citaId;
  
      // Create cita_servicio entries for each selected service
      if (selectedServices.length > 0) {
        const promises = selectedServices.map((servicio) =>
          axiosInstance.post('/clientes/cita_servicios', {
            citaId: citaId,
            servicioId: servicio.ID_SERVICIO,
          })
        );
        await Promise.all(promises);
      }
  
      setCreateSuccess(true);
      fetchCitas(); // Refresh the citas list
      console.log("cree la cita, we move")
      handleCloseCreate();
    } catch (err) {
      console.error('Error creating cita', err);
    }
  };
  

  const headCells = [
    { id: 'VETERINARIO', label: 'Veterinario' },
    { id: 'FECHA', label: 'Fecha' },
    { id: 'HORA', label: 'Hora' },
    { id: 'ESPECIE', label: 'Especie' },
    { id: 'ESTADO', label: 'Estado' },
    { id: 'ACCIONES', label: 'Acciones' } // New column for actions
  ];

  const fetchCitas = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID is missing');
        setLoading(false);
        return;
      }

      const res = await axiosInstance.get(`/clientes/citas`, {
        params: { id: userId },
      });

      console.log('el response recibido del res fue:', res.data);

      const citasReformatted = res.data.map((cita) => ({
        ID_CITA: cita[0], 
        ID_VET: cita[1],
        VETERINARIO: cita[2],
        ID_CLIENTE: cita[3],
        CLIENTE: cita[4],
        ID_MASCOTA: cita[5],
        ESPECIE: cita[6],
        FECHA: cita[7],
        HORA: cita[8],
        ESTADO: cita[9],
        TIPO_CITA_NOMBRE: cita[10] 
      }));

      setCitas(citasReformatted);
      console.log('Fetched citas reformatted:', citasReformatted);
    } catch (err) {
      console.error('Error fetching citas', err);
    } finally {
      setLoading(false);
    }
  };
  // Fetch client 'citas' when component mounts
  useEffect(() => {

    fetchCitas();
    fetchMascotas();
    fetchVeterinarians();
    fetchTipoCitas();
    fetchServices();
    
  }, []);

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

  // Filter citas based on search query
  const filteredCitas = citas.filter((cita) => {
    const veterinario = cita.VETERINARIO ? cita.VETERINARIO.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    return veterinario.includes(query);
  });

  // Sort data before rendering
  const sortedCitas = stableSort(filteredCitas, getComparator(order, orderBy));

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
      {/* success snackbar for edit */}
      <Snackbar
        open={editSuccess}
        autoHideDuration={4000}
        onClose={() => setEditSuccess(false)}
      >
        <Alert
          onClose={() => setEditSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          La cita fue actualizada exitosamente.
        </Alert>
      </Snackbar>

      {/* success snackbar for cancelar */}
      <Snackbar
        open={cancelSuccess}
        autoHideDuration={4000}
        onClose={() => setCancelSuccess(false)}
      >
        <Alert
          onClose={() => setCancelSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          La cita fue cancelada exitosamente.
        </Alert>
      </Snackbar>
      {/* Success Snackbar for create */}
      <Snackbar open={createSuccess} autoHideDuration={4000} onClose={() => setCreateSuccess(false)}>
        <Alert onClose={() => setCreateSuccess(false)} severity="success" sx={{ width: '100%' }}>
          La cita fue agregada exitosamente.
        </Alert>
      </Snackbar>
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
                    Mis Citas
                  </Typography>
                </Box>

                <Box
                  sx={{
                    gridArea: 'sidebar',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                    gap: 1,
                    mt: { xs: 2, md: 0 },
                  }}
                >
                  <Button
                    variant="contained"
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
            {isSmallScreen ||  isMediumScreen ? (
            <Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: {xs: 'repeat(1, 1fr)', sm:'repeat(3, 3fr)',  md:'repeat(3, 3fr)'}, gap: {xs: 2, sm: 4, md: 4}}}>
                    {sortedCitas.length <= 0 
              ? "No hay mascotas disponibles o que cumplan con ese criterio de búsqueda" 
              : ""}
                        {sortedCitas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cita) => (
                            <Box key={cita.ID_CITA} sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 2, position: 'relative' }}>
                                <Typography variant="h6">{cita.VETERINARIO}</Typography>
                                <Typography><strong>Fecha: </strong>{cita.FECHA}</Typography>
                                <Typography><strong>Hora: </strong> {cita.HORA}</Typography>
                                <Typography><strong>Especie: </strong>{cita.ESPECIE  === '01'? 'Perro' : (cita.ESPECIE === '02' ? 'Gato' : 'Conejo')}</Typography>
                                <Typography><Chip
                              label={cita.ESTADO === 1 ? 'Pendiente' : ((cita.ESTADO===2)? 'Completada':'Cancelada')}
                              color={cita.ESTADO === 1 ? 'warning' : ((cita.ESTADO===2)? 'success':'error')}
                              variant="outlined"
                              size="small"
                              /></Typography>
                                <br />
                                <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}> 
                                <Button
                                  aria-label="more"
                                  aria-controls={`long-menu-${cita.ID_CITA}`}
                                  aria-haspopup="true"
                                  onClick={(event) => handleClickMenu(event, cita.ID_CITA)}
                                >
                                  <MoreHorizIcon />
                                </Button>
                                </Box>
                                <Menu
                            id={`long-menu-${cita.ID_CITA}`}
                            anchorEl={anchorEl[cita.ID_CITA]}
                            keepMounted
                            open={Boolean(anchorEl[cita.ID_CITA])}
                            onClose={() => handleCloseMenu(cita.ID_CITA)}
                          >
                            {cita.ESTADO === ESTADO_PENDIENTE && (
                              <MenuItem onClick={() => handleCancelar(cita.ID_CITA)}>Cancelar</MenuItem>
                            )}
                            <MenuItem onClick={() => handleOpenModal(cita.ID_CITA)}>Más información</MenuItem>
                            {cita.ESTADO === ESTADO_PENDIENTE && (
                              <MenuItem onClick={() => handleOpenEditModal(cita)}>Editar</MenuItem>
                            )}
                          </Menu>
                            </Box>
                            
                        ))}
                        {/* Modal for "Más información" */}
                        <Dialog
                          open={modalOpen}
                          onClose={(event, reason) => {
                            if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                              // Do nothing
                            } else {
                              handleCloseModal();
                            }
                          }}
                          aria-labelledby="mas-informacion-title"
                        >
                          <DialogTitle id="mas-informacion-title">
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              Servicios de la cita
                              <IconButton onClick={handleCloseModal}>
                                <Close />
                              </IconButton>
                            </Box>
                          </DialogTitle>
                          <DialogContent dividers>
                            {servicios.length > 0 ? (
                              <>
                                <ul>
                                  {servicios.map((servicio, index) => (
                                    <li key={index}>{`${servicio[1]} - Precio: ₡${servicio[0]}`}</li>
                                  ))}
                                </ul>
                                <Typography variant="h6" gutterBottom>
                                  Precio total: ₡
                                  {servicios.reduce((sum, servicio) => sum + Number(servicio[0]), 0)}
                                </Typography>
                              </>
                            ) : (
                              <Typography>Esta cita no tiene servicios asociados.</Typography>
                            )}
                          </DialogContent>
                        </Dialog>
                  <Modal
                    open={cancelModalOpen}
                    onClose={() => setCancelModalOpen(false)}
                    aria-labelledby="confirm-cancelation-title"
                    aria-describedby="confirm-cancelation-description"
                  >
                    <Box sx={modalStyle}>
                      <Typography id="confirm-cancelation-title" variant="h6">
                        Confirmar cancelación
                      </Typography>
                      <Typography id="confirm-cancelation-description" sx={{ mt: 2 }}>
                        ¿Está seguro de que desea cancelar esta cita?
                      </Typography>
                      <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button onClick={() => setCancelModalOpen(false)}>No</Button>
                        <Button variant="contained" color="primary" onClick={confirmCancel}>
                          Cancelar
                        </Button>
                      </Box>
                    </Box>
                  </Modal>

                  {/* Create Modal */}
                  <Modal
                    open={openCreate}
                    onClose={(event, reason) => {
                      if (reason !== 'backdropClick') {
                        handleCloseCreate();
                      }
                    }}
                    disablePortal
                  >
                    <Box sx={modalStyle} role="dialog" aria-modal="true">
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Agregar Cita</Typography>
                        <IconButton onClick={handleCloseCreate}>
                          <Close />
                        </IconButton>
                      </Box>
                      <form onSubmit={handleCreateCita}>
                        <FormGroup>
                          {/* Mascota Dropdown */}
                          <FormControl fullWidth margin="normal" error={!!errores.id_mascota}>
                          <Autocomplete
                            ListboxProps={{
                              style: {
                                maxHeight: '120px',
                                overflowY: 'auto',
                              },
                            }}
                            id="mascota-autocomplete"
                            options={mascotas || []}
                            getOptionLabel={(option) => {
                              if (!option) return '';
                              const speciesName = option.ESPECIE || 'Desconocido';
                              return `${option.NOMBRE} - ${speciesName}`;
                            }}
                            isOptionEqualToValue={(option, value) => option.ID_MASCOTA === value.ID_MASCOTA}
                            value={
                              formValues.id_mascota
                                ? mascotas.find((mascota) => mascota.ID_MASCOTA === formValues.id_mascota)
                                : null
                            }
                            onChange={(event, newValue) => {
                              setFormValues((prev) => ({
                                ...prev,
                                id_mascota: newValue ? newValue.ID_MASCOTA : null,
                              }));
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Mascota*"
                                variant="outlined"
                                error={!!errores.id_mascota}
                                helperText={errores.id_mascota ? "Seleccione una mascota." : ""}
                                InputLabelProps={inputPropsStyle}
                              />
                            )}
                          />
                          </FormControl>

                          {/* Veterinario Dropdown */}
                          <FormControl fullWidth margin="normal" error={!!errores.id_usuario_vet}>
                            <Autocomplete
                              ListboxProps={{
                                style: {
                                  maxHeight: '120px',
                                  overflowY: 'auto',
                                },
                              }}
                              id="veterinario-autocomplete"
                              options={veterinarians}
                              getOptionLabel={(option) => `${option.NOMBRE} ${option.APELLIDO}`}
                              value={
                                formValues.id_usuario_vet
                                  ? veterinarians.find((vet) => vet.ID_USUARIO === formValues.id_usuario_vet)
                                  : null
                              }
                              onChange={(event, newValue) => {
                                setFormValues((prev) => ({
                                  ...prev,
                                  id_usuario_vet: newValue ? newValue.ID_USUARIO : "",
                                }));

                                // When date, vetId, clientId, and petId are available
                                if (selectedDate && formValues.id_usuario_vet && formValues.id_mascota) {
                                  fetchAvailableTimes(
                                    selectedDate,
                                    formValues.id_usuario_vet,
                                    localStorage.getItem('userId'),
                                    formValues.id_mascota,
                                    setAvailableTimes
                                  );
                                }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Veterinario*"
                                  variant="outlined"
                                  error={!!errores.id_usuario_vet}
                                  helperText={errores.id_usuario_vet ? "Seleccione un veterinario." : ""}
                                  InputLabelProps={inputPropsStyle}
                                />
                              )}
                            />
                          </FormControl>
                            {/* Servicios Dropdown */}
                            <FormControl fullWidth margin="normal">
                              <Autocomplete
                                ListboxProps={{
                                  style: {
                                    maxHeight: '120px',
                                    overflowY: 'auto',
                                  },
                                }}
                                multiple
                                id="services-autocomplete"
                                options={servicesList}
                                getOptionLabel={(option) => option.NOMBRE}
                                value={selectedServices}
                                onChange={(event, newValue) => {
                                  setSelectedServices(newValue);
                                }}
                                renderTags={(value, getTagProps) =>
                                  value.map((option, index) => (
                                    <Chip label={option.NOMBRE} {...getTagProps({ index })} />
                                  ))
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Servicios"
                                    placeholder=""
                                    InputLabelProps={inputPropsStyle}
                                  />
                                )}
                              />
                            </FormControl>

                          {/* Date Picker */}
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              label="Fecha*"
                              value={selectedDate}
                              onChange={handleDateChange}
                              minDate={new Date()}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  margin: 'normal',
                                  variant: 'outlined',
                                  error: !!errores.fecha,
                                  helperText: errores.fecha ? "Seleccione una fecha." : "",
                                },
                              }}
                            />
                          </LocalizationProvider>

                          {/* Time Picker */}
                          <FormControl fullWidth margin="normal">
                            <InputLabel id="edit-time-select-label" shrink>Hora</InputLabel>
                            <Select
                              labelId="edit-time-select-label"
                              name="hora"
                              value={editFormValues.hora || ""}
                              onChange={(e) =>
                                setEditFormValues((prev) => ({
                                  ...prev,
                                  hora: e.target.value,
                                }))
                              }
                              label="Hora"
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 48 * 3.5 + 8,
                                  },
                                },
                              }}
                            >
                              {editAvailableTimes.length > 0 ? (
                                editAvailableTimes.map((time) => (
                                  <MenuItem key={time} value={time}>
                                    {time}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem disabled>No hay horarios disponibles</MenuItem>
                              )}
                            </Select>
                          </FormControl>
                        </FormGroup>



                        {/* Action Buttons */}
                        <Box mt={2} display="flex" justifyContent="flex-end">
                          <Button onClick={handleCloseCreate}>Cancelar</Button>
                          <Button variant="contained" type="submit">
                            Agregar
                          </Button>
                        </Box>
                      </form>
                    </Box>
                  </Modal>

                  {/* Edit Modal */}
                  <Modal
                    open={editModalOpen}
                    onClose={handleCloseEditModal}
                  >
                    <Box sx={modalStyle}>
                    
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Editar Cita</Typography>
                        <IconButton onClick={handleCloseEditModal}>
                          <Close />
                        </IconButton>
                      </Box>
                      <form onSubmit={handleEditCita}>
                        <FormGroup>
                          {/* Date Picker */}
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Fecha"
                            value={editSelectedDate}
                            onChange={(newDate) => {
                              if (!newDate || isNaN(newDate)) return;
                              console.log('Selected new date for editing:', newDate);
                              setEditSelectedDate(newDate);
                              setEditFormValues((prev) => ({
                                ...prev,
                                fecha: newDate.toISOString().split('T')[0],
                              }));
                              // Fetch available times for the new date
                              fetchAvailableTimes(
                                newDate,
                                editFormValues.ID_VET,
                                editFormValues.ID_CLIENTE,
                                editFormValues.ID_MASCOTA,
                                setEditAvailableTimes // Use the correct setter
                              );
                            }}
                            minDate={new Date()}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                margin: 'normal',
                                variant: 'outlined',
                              },
                            }}
                          />
                          </LocalizationProvider>

                          {/* Time Picker */}
                          <FormControl fullWidth margin="normal">
                            <InputLabel id="edit-time-select-label" shrink>Hora</InputLabel>
                            <Select
                              labelId="edit-time-select-label"
                              name="hora"
                              value={editFormValues.hora || ""}
                              onChange={(e) =>
                                setEditFormValues((prev) => ({
                                  ...prev,
                                  hora: e.target.value,
                                }))
                              }
                              label="Hora"
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 48 * 3.5 + 8, // Limit to 3 items
                                  },
                                },
                              }}
                            >
                              {editAvailableTimes.length > 0 ? (
                                editAvailableTimes.map((time) => (
                                  <MenuItem key={time} value={time}>
                                    {time}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem disabled>No hay horarios disponibles</MenuItem>
                              )}
                            </Select>
                          </FormControl>

                        </FormGroup>
                        {/* Servicios Dropdown */}
                        <FormControl fullWidth margin="normal">
                          <Autocomplete
                            ListboxProps={{
                              style: {
                                maxHeight: '120px',
                                overflowY: 'auto',
                              },
                            }}
                            multiple
                            id="edit-services-autocomplete"
                            options={servicesList}
                            getOptionLabel={(option) => option.NOMBRE}
                            value={editSelectedServices}
                            onChange={(event, newValue) => {
                              setEditSelectedServices(newValue);
                            }}
                            isOptionEqualToValue={(option, value) => option.ID_SERVICIO === value.ID_SERVICIO}
                            renderTags={(value, getTagProps) =>
                              value.map((option, index) => {
                                // Destructure key and exclude it from being spread
                                const { key, ...tagProps } = getTagProps({ index });
                                return (
                                  <Chip
                                    key={option.ID_SERVICIO} // Use a unique key
                                    label={option.NOMBRE}
                                    {...tagProps} // Spread the remaining tag props
                                  />
                                );
                              })
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                label="Servicios"
                                placeholder=""
                                InputLabelProps={inputPropsStyle}
                              />
                            )}
                          />
                        </FormControl>



                        {/* Action Buttons */}
                        <Box mt={2} display="flex" justifyContent="flex-end">
                          <Button onClick={handleCloseEditModal}>Cancelar</Button>
                          <Button variant="contained" type="submit">
                            Guardar Cambios
                          </Button>
                        </Box>
                      </form>
                    </Box>
                  </Modal>
                        
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
                          count={sortedCitas.length}
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
                <Table aria-label="citas table">
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
                                {order === 'desc' ? 'ordenado descendente' : 'ordenado ascendente'}
                              </Box>
                            ) : null}
                          </TableSortLabel>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                  {sortedCitas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cita) => {
                    //console.log('Cita:', cita); // Check if ID_CITA is present
                    return (
                      <TableRow key={cita.ID_CITA}>
                        <TableCell>{cita.VETERINARIO}</TableCell>
                        <TableCell>{cita.FECHA}</TableCell>
                        <TableCell>{cita.HORA}</TableCell>
                        <TableCell>{cita.ESPECIE  === '01'? 'Perro' : (cita.ESPECIE === '02' ? 'Gato' : 'Conejo')}</TableCell>
                        <TableCell sx={{ padding: '8px 16px' }}>
                          <Chip
                            label={cita.ESTADO === 1 ? 'Pendiente' : ((cita.ESTADO===2)? 'Completada':'Cancelada')}
                            color={cita.ESTADO === 1 ? 'warning' : ((cita.ESTADO===2)? 'success':'success')}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            aria-label="more"
                            aria-controls={`long-menu-${cita.ID_CITA}`}
                            aria-haspopup="true"
                            onClick={(event) => handleClickMenu(event, cita.ID_CITA)}
                          >
                            <MoreHorizIcon />
                          </Button>
                          <Menu
                            id={`long-menu-${cita.ID_CITA}`}
                            anchorEl={anchorEl[cita.ID_CITA]}
                            keepMounted
                            open={Boolean(anchorEl[cita.ID_CITA])}
                            onClose={() => handleCloseMenu(cita.ID_CITA)}
                          >
                            {cita.ESTADO === ESTADO_PENDIENTE && (
                              <MenuItem onClick={() => handleCancelar(cita.ID_CITA)}>Cancelar</MenuItem>
                            )}
                            {/* {cita.ESTADO === ESTADO_PENDIENTE && (
                              <MenuItem onClick={() => handleCompletar(cita.ID_CITA)}>Completar</MenuItem>
                            )} */}
                            <MenuItem onClick={() => handleOpenModal(cita.ID_CITA)}>Más información</MenuItem>
                            {cita.ESTADO === ESTADO_PENDIENTE && (
                              <MenuItem onClick={() => handleOpenEditModal(cita)}>Editar</MenuItem>
                            )}
                          </Menu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  </TableBody>

                  {/* Modal for "Más información" */}
                  <Modal open={modalOpen} onClose={handleCloseModal}>
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        p: 4, 
                        bgcolor: 'background.paper', 
                        borderRadius: 2, 
                        boxShadow: 24,
                        maxWidth: 500,
                        width: '90%',
                      }}
                    >
                      <Typography variant="h6" gutterBottom>Servicios de la cita</Typography>
                      {servicios.length > 0 ? (
                        <>
                          <ul>
                            {servicios.map((servicio, index) => (
                              <li key={index}>{`${servicio[1]} - Precio: ₡${servicio[0]}`}</li>
                            ))}
                          </ul>
                          <Typography variant="h6" gutterBottom>
                            Precio total: ₡{servicios.reduce((sum, servicio) => sum + Number(servicio[0]), 0)}
                            
                          </Typography>
                        </>
                      ) : (
                        <Typography>Esta cita no tiene servicios asociados.</Typography>
                      )}
                    </Box>
                  </Modal>


                  {/* Create Modal */}
                  <Modal
                    open={openCreate}
                    onClose={(event, reason) => {
                      if (reason !== 'backdropClick') {
                        handleCloseCreate();
                      }
                    }}
                    disablePortal
                  >
                    <Box sx={modalStyle} role="dialog" aria-modal="true">
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Agregar Cita</Typography>
                        <IconButton onClick={handleCloseCreate}>
                          <Close />
                        </IconButton>
                      </Box>
                      <form onSubmit={handleCreateCita}>
                        <FormGroup>
                          {/* Mascota Dropdown */}
                          <FormControl fullWidth margin="normal" error={!!errores.id_mascota}>
                          <Autocomplete
                            ListboxProps={{
                              style: {
                                maxHeight: '120px',
                                overflowY: 'auto',
                              },
                            }}
                            id="mascota-autocomplete"
                            options={mascotas || []}
                            getOptionLabel={(option) => {
                              if (!option) return '';
                              const speciesName = option.ESPECIE || 'Desconocido';
                              return `${option.NOMBRE} - ${speciesName}`;
                            }}
                            isOptionEqualToValue={(option, value) => option.ID_MASCOTA === value.ID_MASCOTA}
                            value={
                              formValues.id_mascota
                                ? mascotas.find((mascota) => mascota.ID_MASCOTA === formValues.id_mascota)
                                : null
                            }
                            onChange={(event, newValue) => {
                              setFormValues((prev) => ({
                                ...prev,
                                id_mascota: newValue ? newValue.ID_MASCOTA : null,
                              }));
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Mascota*"
                                variant="outlined"
                                error={!!errores.id_mascota}
                                helperText={errores.id_mascota ? "Seleccione una mascota." : ""}
                                InputLabelProps={inputPropsStyle}
                              />
                            )}
                          />
                          </FormControl>

                          {/* Veterinario Dropdown */}
                          <FormControl fullWidth margin="normal" error={!!errores.id_usuario_vet}>
                            <Autocomplete
                              ListboxProps={{
                                style: {
                                  maxHeight: '120px',
                                  overflowY: 'auto',
                                },
                              }}
                              id="veterinario-autocomplete"
                              options={veterinarians}
                              getOptionLabel={(option) => `${option.NOMBRE} ${option.APELLIDO}`}
                              value={
                                formValues.id_usuario_vet
                                  ? veterinarians.find((vet) => vet.ID_USUARIO === formValues.id_usuario_vet)
                                  : null
                              }
                              onChange={(event, newValue) => {
                                setFormValues((prev) => ({
                                  ...prev,
                                  id_usuario_vet: newValue ? newValue.ID_USUARIO : "",
                                }));

                                // When date, vetId, clientId, and petId are available
                                if (selectedDate && formValues.id_usuario_vet && formValues.id_mascota) {
                                  fetchAvailableTimes(
                                    selectedDate,
                                    formValues.id_usuario_vet,
                                    localStorage.getItem('userId'),
                                    formValues.id_mascota,
                                    setAvailableTimes
                                  );
                                }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Veterinario*"
                                  variant="outlined"
                                  error={!!errores.id_usuario_vet}
                                  helperText={errores.id_usuario_vet ? "Seleccione un veterinario." : ""}
                                  InputLabelProps={inputPropsStyle}
                                />
                              )}
                            />
                          </FormControl>
                            {/* Servicios Dropdown */}
                          {/* </FormControl> */}
                            <FormControl fullWidth margin="normal">
                              <Autocomplete
                                ListboxProps={{
                                  style: {
                                    maxHeight: '120px',
                                    overflowY: 'auto',
                                  },
                                }}
                                multiple
                                id="services-autocomplete"
                                options={servicesList}
                                getOptionLabel={(option) => option.NOMBRE}
                                value={selectedServices}
                                onChange={(event, newValue) => {
                                  setSelectedServices(newValue);
                                }}
                                renderTags={(value, getTagProps) =>
                                  value.map((option, index) => (
                                    <Chip label={option.NOMBRE} {...getTagProps({ index })} />
                                  ))
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Servicios"
                                    placeholder=""
                                    InputLabelProps={inputPropsStyle}
                                  />
                                )}
                              />
                            </FormControl>

                          {/* Date Picker */}
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              label="Fecha*"
                              value={selectedDate}
                              onChange={handleDateChange}
                              minDate={new Date()}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  margin: 'normal',
                                  variant: 'outlined',
                                  error: !!errores.fecha,
                                  helperText: errores.fecha ? "Seleccione una fecha." : "",
                                },
                              }}
                            />
                          </LocalizationProvider>

                          {/* Time Picker */}
                          <FormControl fullWidth margin="normal" error={!!errores.hora} variant="outlined">
                            <InputLabel id="time-select-label" shrink>Hora*</InputLabel>
                            <Select
                              labelId="time-select-label"
                              name="hora"
                              value={formValues.hora || ""}
                              onChange={handleFormChange}
                              label="Hora"
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: '120px',
                                    overflowY: 'auto',
                                  },
                                },
                              }}
                            >
                              {availableTimes.length > 0 ? (
                                availableTimes.map((time) => (
                                  <MenuItem key={time} value={time}>
                                    {time}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem disabled>No hay horarios disponibles</MenuItem>
                              )}
                            </Select>
                            <FormHelperText>{errores.hora ? "Seleccione una hora." : ""}</FormHelperText>
                          </FormControl>
                        </FormGroup>



                        {/* Action Buttons */}
                        <Box mt={2} display="flex" justifyContent="flex-end">
                          <Button onClick={handleCloseCreate}>Cancelar</Button>
                          <Button variant="contained" type="submit">
                            Agregar
                          </Button>
                        </Box>
                      </form>
                    </Box>
                  </Modal>

                  {/* Edit Modal */}
                  <Modal
                    open={editModalOpen}
                    onClose={handleCloseEditModal}
                  >
                    <Box sx={modalStyle}>
                    
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Editar Cita</Typography>
                        <IconButton onClick={handleCloseEditModal}>
                          <Close />
                        </IconButton>
                      </Box>
                      <form onSubmit={handleEditCita}>
                        <FormGroup>
                          {/* Date Picker */}
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Fecha"
                            value={editSelectedDate}
                            onChange={(newDate) => {
                              if (!newDate || isNaN(newDate)) return;
                              console.log('Selected new date for editing:', newDate);
                              setEditSelectedDate(newDate);
                              setEditFormValues((prev) => ({
                                ...prev,
                                fecha: newDate.toISOString().split('T')[0],
                              }));
                              // Fetch available times for the new date
                              fetchAvailableTimes(
                                newDate,
                                editFormValues.ID_VET,
                                editFormValues.ID_CLIENTE,
                                editFormValues.ID_MASCOTA,
                                setEditAvailableTimes // Use the correct setter
                              );
                            }}
                            minDate={new Date()}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                margin: 'normal',
                                variant: 'outlined',
                              },
                            }}
                          />
                          </LocalizationProvider>

                          {/* Time Picker */}
                          <FormControl fullWidth margin="normal">
                            <InputLabel id="edit-time-select-label" shrink>Hora</InputLabel>
                            <Select
                              labelId="edit-time-select-label"
                              name="hora"
                              value={editFormValues.hora || ""}
                              onChange={(e) =>
                                setEditFormValues((prev) => ({
                                  ...prev,
                                  hora: e.target.value,
                                }))
                              }
                              label="Hora"
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 48 * 3.5 + 8, // Limit to 3 items
                                  },
                                },
                              }}
                            >
                              {editAvailableTimes.length > 0 ? (
                                editAvailableTimes.map((time) => (
                                  <MenuItem key={time} value={time}>
                                    {time}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem disabled>No hay horarios disponibles</MenuItem>
                              )}
                            </Select>
                          </FormControl>

                        </FormGroup>
                        {/* Servicios Dropdown */}
                        <FormControl fullWidth margin="normal">
                          <Autocomplete
                            ListboxProps={{
                              style: {
                                maxHeight: '120px',
                                overflowY: 'auto',
                              },
                            }}
                            multiple
                            id="edit-services-autocomplete"
                            options={servicesList}
                            getOptionLabel={(option) => option.NOMBRE}
                            value={editSelectedServices}
                            onChange={(event, newValue) => {
                              setEditSelectedServices(newValue);
                            }}
                            isOptionEqualToValue={(option, value) => option.ID_SERVICIO === value.ID_SERVICIO}
                            renderTags={(value, getTagProps) =>
                              value.map((option, index) => {
                                // Destructure key and exclude it from being spread
                                const { key, ...tagProps } = getTagProps({ index });
                                return (
                                  <Chip
                                    key={option.ID_SERVICIO} // Use a unique key
                                    label={option.NOMBRE}
                                    {...tagProps} // Spread the remaining tag props
                                  />
                                );
                              })
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                label="Servicios"
                                placeholder=""
                                InputLabelProps={{ shrink: true }}
                              />
                            )}
                          />
                        </FormControl>



                        {/* Action Buttons */}
                        <Box mt={2} display="flex" justifyContent="flex-end">
                          <Button onClick={handleCloseEditModal}>Cancelar</Button>
                          <Button variant="contained" type="submit">
                            Guardar Cambios
                          </Button>
                        </Box>
                      </form>
                    </Box>
                  </Modal>


                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={citas.length}
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
