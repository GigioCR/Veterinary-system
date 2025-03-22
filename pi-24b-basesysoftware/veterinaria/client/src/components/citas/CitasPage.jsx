import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  Autocomplete, Table, TableCell, TableContainer, TableHead, TableBody, TableRow, TablePagination, Paper,
  Box, Stack, Typography, Button, Modal, TextField, FormGroup, Menu, MenuItem, IconButton, InputAdornment,
  TableSortLabel, CircularProgress, FormControl, InputLabel, Select, Snackbar, Alert, FormHelperText,
} from '@mui/material';
import Chip from '@mui/material/Chip';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MoreHoriz as MoreHorizIcon, Search, Close } from '@mui/icons-material';
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





export default function CitasPage() {
  // State variables
  const [citas, setCitas] = useState([]);
  const [clientIDs, setClientIDs] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [tipoCitas, setTipoCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [selectedCita, setSelectedCita] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [servicios, setServicios] = useState([]);

  const openMenu = Boolean(anchorEl);
  const [selectedDate, setSelectedDate] = useState(null); 
  const [availableTimes, setAvailableTimes] = useState([]);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [errores, setErrores] = useState({});
  const [changeStateSuccess, setChangeStateSuccess] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const theme = useTheme();
  
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'lg'));


  // Constants for estado values
  const ESTADO_PENDIENTE = 1;
  const ESTADO_CANCELADO = 0;
  const ESTADO_COMPLETADO = 2;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Loading state
  const [loading, setLoading] = useState(true);

  // Modal state
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openToggleConfirm, setOpenToggleConfirm] = useState(false);

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const getCurrentDate = () => new Date().toISOString().split('T')[0];
  const getCurrentHour = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:00`;
  };

  // Form state for creating
  const [formValues, setFormValues] = useState({
    id_mascota: '',
    id_usuario_cli: '',
    fecha: getCurrentDate(), // Default to current date
    tipo_cita: '',
    id_usuario_vet: '',
    hora: '', // Default to current hour
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for editing
  const [editFormValues, setEditFormValues] = useState({
    fecha: null,
    hora: '',
  });
  
  const [editSelectedDate, setEditSelectedDate] = useState(null);
  const [editAvailableTimes, setEditAvailableTimes] = useState([]);
  const [datePickerEditOpen, setDatePickerEditOpen] = useState(false);

  // Sorting state
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('FECHA');

  // Define head cells
  const headCells = [
    { id: 'CLIENTE', label: 'Cliente' },
    { id: 'VETERINARIO', label: 'Veterinario' },
    { id: 'FECHA', label: 'Fecha' },
    { id: 'HORA', label: 'Hora' },
    { id: 'ESPECIE', label: 'Especie' },
    { id: 'ESTADO', label: 'Estado' },
  ];

  const closeChangeStateConfirmAlert = () => {
    setChangeStateSuccess(false);
  };

  // Function to handle modal closing
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCita(null);
    setServicios([]); // Clear servicios when modal closes
  };
  useEffect(() => {
    fetchCitas();
    fetchClientIDs();
    fetchVeterinarians();
    fetchTipoCitas();
    fetchAllServices();
  }, []);
  const fetchAllServices = async () => {
    try {
      const res = await axiosInstance.get('http://localhost:8080/administradores/servicios-for-citas'); // Ensure the correct endpoint
      console.log('Services data fetched:', res.data); // Should be an array of objects
      setAllServices(res.data);
    } catch (err) {
      console.error('Error fetching services', err);
    }
  };
  
  useEffect(() => {
    console.log('Updated available hours:', availableTimes);
  }, [availableTimes]); // Runs every time availableTimes is updated

  useEffect(() => {
    if (selectedDate && formValues.id_usuario_vet) {
      console.log('Fetching available times for:', selectedDate, formValues.id_usuario_vet);
      fetchAvailableTimes(selectedDate, formValues.id_usuario_vet, formValues.id_usuario_cli, formValues.id_mascota);
    }
  }, [selectedDate, formValues.id_usuario_vet]);

  useEffect(() => {
    if (editSelectedDate && selectedCita && selectedCita.ID_USUARIO_VET) {
      fetchEditAvailableTimes(editSelectedDate, selectedCita.ID_USUARIO_VET);
    }
  }, [editSelectedDate, selectedCita]);
  

  // Functions to handle cancelar and completar cita
  const handleCancelar = async (citaId) => {
    try {
      await axiosInstance.put(
        `http://localhost:8080/administradores/citas/estado/${citaId}`,
        { estado: ESTADO_CANCELADO }
      );

      setCitas((prevCitas) =>
        prevCitas.map((cita) =>
          cita.ID_CITA === citaId ? { ...cita, ESTADO: ESTADO_CANCELADO } : cita
        )
      );

      // Optionally, show a success message
      setChangeStateSuccess(true);
      handleMenuClose();
    } catch (error) {
      console.error('Error cancelling cita', error);
      // Optionally, show an error message
    }
  };

  const handleCompletar = async (citaId) => {
    try {
      await axiosInstance.put(
        `http://localhost:8080/administradores/citas/estado/${citaId}`,
        { estado: ESTADO_COMPLETADO }
      );

      setCitas((prevCitas) =>
        prevCitas.map((cita) =>
          cita.ID_CITA === citaId ? { ...cita, ESTADO: ESTADO_COMPLETADO } : cita
        )
      );

      // Optionally, show a success message
      setChangeStateSuccess(true);
      handleMenuClose();
    } catch (error) {
      console.error('Error completing cita', error);
      // Optionally, show an error message
    }
  };

  const fetchCitas = async () => {
    try {
      const res = await axiosInstance.get('http://localhost:8080/administradores/citas');
      console.log('Fetched citas:', res.data);
      setCitas(res.data);
    } catch (err) {
      console.error('Error fetching citas', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch function for client IDs
  const fetchClientIDs = async () => {
    try {
      const res = await axiosInstance.get('http://localhost:8080/administradores/clientes/activos');
      setClientIDs(res.data);
    } catch (err) {
      console.error('Error fetching client IDs', err);
    }
  };

  // Fetch function for veterinarians
  const fetchVeterinarians = async () => {
    try {
      const res = await axiosInstance.get('http://localhost:8080/administradores/veterinarios/activos');
      console.log("Veterinarians data fetched:", res.data); // Log to inspect data structure
      setVeterinarians(res.data || []);
    } catch (err) {
      console.error('Error fetching veterinarians', err);
      setVeterinarians([]);
    }
  };
  

  // Fetch function for tipos de cita
  const fetchTipoCitas = async () => {
    try {
      const res = await axiosInstance.get('http://localhost:8080/administradores/tipos_cita');
      setTipoCitas(res.data);
    } catch (err) {
      console.error('Error fetching tipos de cita', err);
    }
  };

  // Fetch function for mascotas based on selected client
  useEffect(() => {
    if (formValues.id_usuario_cli) {
      fetchMascotas(formValues.id_usuario_cli);
    } else {
      setMascotas([]);
    }
  }, [formValues.id_usuario_cli]);


  useEffect(() => {
    if (selectedDate && formValues.id_usuario_vet) {
      fetchAvailableTimes(selectedDate, formValues.id_usuario_vet, formValues.id_usuario_cli, formValues.id_mascota);
    }
  }, [selectedDate, formValues.id_usuario_vet]);

  const fetchAvailableTimes = async (date, vetId, clientId, petId) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const res = await axiosInstance.get(`http://localhost:8080/administradores/citas/available-times`, {
        params: { date: formattedDate, vetId, clientId, petId },
      });
  
      const unBookedHours = res.data.map((hour) => hour.trim().slice(0, 5));
      
      // Generate all possible hours from 08:00 to 21:00
      const allHours = Array.from({ length: 14 }, (_, i) => `${(8 + i).toString().padStart(2, '0')}:00`);
  
      // If the selected date is today, filter out past hours
      const now = new Date();
      const isToday = formattedDate === now.toISOString().split('T')[0];
      const currentHour = now.getHours();
  
      const availableTimes = allHours
        .filter((hour) => unBookedHours.includes(hour))
        .filter((hour) => {
          if (isToday) {
            const hourInt = parseInt(hour.split(':')[0], 10);
            return hourInt > currentHour;
          }
          return true;
        });
  
      setAvailableTimes(availableTimes);
    } catch (err) {
      console.error('Error fetching available times', err);
    }
  };
  
  
  

  const handleDateChange = (newDate) => {
    if (!newDate || isNaN(newDate)) {
      return;
    }
  
    setSelectedDate(newDate);
    setFormValues((prev) => ({
      ...prev,
      fecha: newDate.toISOString().split('T')[0],
    }));
    setDatePickerOpen(false); // Close the calendar after selecting a date
  
    // Fetch available times if veterinarian is selected
    if (formValues.id_usuario_vet) {
      fetchAvailableTimes(newDate, formValues.id_usuario_vet, formValues.id_usuario_cli, formValues.id_mascota);
    }
  };
  

  const fetchMascotas = async (id_usuario_cli) => {
    try {
      const res = await axiosInstance.get(`http://localhost:8080/administradores/mascotas/${id_usuario_cli}`);
      setMascotas(res.data);
    } catch (err) {
      console.error('Error fetching mascotas', err);
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
  const handleMenuClick = (event, cita) => {
    setSelectedCita(cita);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Modal handlers
  const handleOpenCreate = () => {
    setFormValues({
      id_mascota: '',
      id_usuario_cli: '',
      fecha: getCurrentDate(),
      tipo_cita: '',
      id_usuario_vet: '',
      hora: '',
    });
    setSelectedDate(new Date());
    setAvailableTimes([]);
    setSelectedServices([]); 
    setOpenCreate(true);
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
    setErrores({}); 
  };
  const handleOpenEdit = () => {
    const cita = selectedCita || {};
    const initialDateTime = cita.FECHA && cita.HORA ? new Date(`${cita.FECHA}T${cita.HORA}`) : null;
    setEditSelectedDate(initialDateTime);
    setEditFormValues({
      fecha: cita.FECHA || '',
      hora: cita.HORA || '',
    });
  
    // Fetch available times for the initial date and veterinarian
    if (initialDateTime && cita.ID_USUARIO_VET) {
      fetchEditAvailableTimes(initialDateTime, cita.ID_USUARIO_VET);
    }
    // Fetch services associated with this 'cita'
    fetchCitaServices(cita.ID_CITA);

    setOpenEdit(true);
    handleMenuClose();
  };


  const fetchCitaServices = async (citaId) => {
    try {
      const res = await axiosInstance.get(`http://localhost:8080/administradores/citas/${citaId}/servicios`);
      // Map the data to match the structure of `allServices`
      const services = res.data.map((service) => ({
        ID_SERVICIO: service.ID_SERVICIO || service.id_servicio,
        NOMBRE: service.NOMBRE_SERVICIO || service.nombre_servicio,
        PRECIO: service.PRECIO || service.precio,
      }));
      setSelectedServices(services);
    } catch (err) {
      console.error('Error fetching cita services', err);
    }
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
  
    // Destructure values to get the updated form values
    const { id_usuario_vet, id_usuario_cli, id_mascota } = {
      ...formValues,
      [name]: value, // Update the specific field being changed
    };
  
    // Fetch available times if both veterinarian, client, pet, and date are selected
    if (selectedDate && id_usuario_vet && id_usuario_cli && id_mascota) {
      fetchAvailableTimes(selectedDate, id_usuario_vet, id_usuario_cli, id_mascota);
    }
  };
  
  
  // Form change handler for editing
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Create cita
  const handleCreateCita = async (e) => {
    e.preventDefault();
  
    const newErrores = {};
  
    if (!formValues.id_usuario_cli) newErrores.id_usuario_cli = true;
    if (!formValues.id_mascota) newErrores.id_mascota = true;
    if (!formValues.fecha) newErrores.fecha = true;
    if (!formValues.hora) newErrores.hora = true;
    if (!formValues.tipo_cita) newErrores.tipo_cita = true;
    if (!formValues.id_usuario_vet) newErrores.id_usuario_vet = true;
  
    setErrores(newErrores);
  
    if (Object.keys(newErrores).length > 0) return;
  
    try {
      // Combine date and time
      const formattedFechaHora = `${formValues.fecha} ${formValues.hora}`;
  
      // Prepare the data to send
      const dataToSend = {
        id_mascota: formValues.id_mascota,
        id_usuario_vet: formValues.id_usuario_vet,
        fecha: formattedFechaHora,
        tipo_cita: formValues.tipo_cita,
        id_usuario_cli: formValues.id_usuario_cli,
      };
  
      // Create the cita and get the citaId
      const response = await axiosInstance.post('http://localhost:8080/administradores/citas', dataToSend);
      console.log('¡Cita creada!');
      const citaId = response.data.citaId;
  
      // Create cita_servicio entries for each selected service
      if (selectedServices.length > 0) {
        const promises = selectedServices.map((servicio) =>
          axiosInstance.post(`http://localhost:8080/administradores/citas/servicios`, {
            citaId: citaId,
            servicioId: servicio.ID_SERVICIO,
          })
        );
        await Promise.all(promises);
      }
      console.log('cita_servicios creados!');
  
      setCreateSuccess(true);
      fetchCitas();
      handleCloseCreate();
    } catch (err) {
      console.error('Error creating cita', err);
    }
  };


  //edit date
  const handleEditDateChange = (newDate) => {
    if (!newDate || isNaN(newDate)) {
      return;
    }
  
    setEditSelectedDate(newDate);
    setEditFormValues((prev) => ({
      ...prev,
      fecha: newDate.toISOString().split('T')[0],
    }));
    setDatePickerEditOpen(false);
  
    // Fetch available times if veterinarian is selected
    if (selectedCita && selectedCita.ID_USUARIO_VET) {
      fetchEditAvailableTimes(newDate, selectedCita.ID_USUARIO_VET);
    }
  };  

  // tráigase las horas abaliable times
  const fetchEditAvailableTimes = async (date, vetId) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const res = await axiosInstance.get(`http://localhost:8080/administradores/citas/available-times`, {
        params: { date: formattedDate, vetId },
      });
  
      // Process available times as needed
      const unBookedHours = res.data.map((hour) => hour.trim().slice(0, 5));
      const allHours = Array.from({ length: 14 }, (_, i) => `${(8 + i).toString().padStart(2, '0')}:00`);
      const availableTimes = allHours.filter((hour) => unBookedHours.includes(hour));
  
      setEditAvailableTimes(availableTimes);
    } catch (err) {
      console.error('Error fetching available times', err);
    }
  };

  // Update cita
  const handleEditCita = async (e) => {
    e.preventDefault();
    
    const newErrores = {};
  
    // Validate date and time
    const currentDate = new Date();
    const selectedDate = new Date(editFormValues.fecha);
    const isToday = selectedDate.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0];
    const serviceIds = selectedServices.map((service) => service.ID_SERVICIO);

    // Check if date is not in the past
    if (selectedDate < currentDate.setHours(0, 0, 0, 0)) {
      newErrores.fecha = "La fecha no puede ser en el pasado.";
    }
    
    // Check if hour is valid (not in the past if today)
    if (isToday && editFormValues.hora && parseInt(editFormValues.hora.split(':')[0], 10) <= currentDate.getHours()) {
      newErrores.hora = "La hora debe ser posterior a la hora actual.";
    }
    
    // Check for duplicate appointments
    const existingCita = citas.find(
      (cita) =>
        cita.ID_CITA !== selectedCita.ID_CITA && // Exclude the current appointment
        cita.ID_USUARIO_VET === selectedCita.ID_USUARIO_VET &&
        cita.ID_USUARIO_CLI === selectedCita.ID_USUARIO_CLI &&
        cita.ID_MASCOTA === selectedCita.ID_MASCOTA &&
        cita.FECHA === editFormValues.fecha &&
        cita.HORA === editFormValues.hora
    );
    if (existingCita) {
      newErrores.fecha = "Ya existe una cita programada en esta fecha y hora para el veterinario, cliente, o mascota seleccionados.";
    }
    
    setErrores(newErrores);
    
    if (Object.keys(newErrores).length > 0) return;
  
    try {
      // Combine date and time
      const formattedNewFechaHora = `${editFormValues.fecha} ${editFormValues.hora}`;
      const serviceIds = selectedServices.map((service) => service.ID_SERVICIO);
  
      // Update the cita
      await axiosInstance.put(
        `http://localhost:8080/administradores/citas/${selectedCita.ID_CITA}`,
        {
          fecha: formattedNewFechaHora,
          services: serviceIds,
        }
      );
  
      // Delete existing cita_servicios
      await axiosInstance.delete(
        `http://localhost:8080/administradores/citas/${selectedCita.ID_CITA}/servicios`
      );
  
      // Create new cita_servicios
      for (const serviceId of serviceIds) {
        await axiosInstance.post(
          `http://localhost:8080/administradores/citas/servicios`,
          {
            citaId: selectedCita.ID_CITA,
            servicioId: serviceId,
          }
        );
      }
  
      fetchCitas();
      handleCloseEdit();
      setEditSuccess(true);
    } catch (err) {
      console.error('Error updating cita', err);
    }
  };
  
  

  // Toggle cita's estado
  const handleToggleEstado = async () => {
    try {
      if (!selectedCita || !selectedCita.ID_CITA) {
        console.error('ID_CITA is missing or invalid.');
        return;
      }
  
      const newEstado = selectedCita.ESTADO === 1 ? 0 : 1;
      console.log('new estado = ' + newEstado);
  
      await axiosInstance.put(
        `http://localhost:8080/administradores/citas/estado/${selectedCita.ID_CITA}`,
        { estado: newEstado }
      );
  
      setCitas((prev) =>
        prev.map((cita) =>
          cita.ID_CITA === selectedCita.ID_CITA
            ? { ...cita, ESTADO: newEstado }
            : cita
        )
      );
      handleCloseToggleConfirm();
      setChangeStateSuccess(true); // Add this line to show the alert
    } catch (err) {
      console.error('Error toggling cita estado', err);
    }
  };

  // Function to handle modal opening
  const handleOpenModal = async (citaId) => {
    setModalOpen(true);
    try {
      const res = await axiosInstance.get(`http://localhost:8080/administradores/citas/${citaId}/servicios`);
      setServicios(res.data);
    } catch (err) {
      console.error('Error fetching servicios:', err);
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

  // Filter citas based on search query
  const filteredCitas = citas.filter((cita) => {
    const cliente = cita.CLIENTE ? cita.CLIENTE.toLowerCase() : '';
    const veterinario = cita.VETERINARIO ? cita.VETERINARIO.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    return cliente.includes(query) || veterinario.includes(query);
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
      {/* Success Snackbar for create */}
      <Snackbar open={createSuccess} autoHideDuration={4000} onClose={() => setCreateSuccess(false)}>
        <Alert onClose={() => setCreateSuccess(false)} severity="success" sx={{ width: '100%' }}>
          La cita fue agregada exitosamente.
        </Alert>
      </Snackbar>
  
      {/* Success Snackbar for edit */}
      <Snackbar open={editSuccess} autoHideDuration={4000} onClose={() => setEditSuccess(false)}>
        <Alert onClose={() => setEditSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Se guardaron los cambios exitosamente.
        </Alert>
      </Snackbar>

      {/* Change State Confirmation Alert */}
      <Snackbar
        open={changeStateSuccess}
        autoHideDuration={4000}
        onClose={closeChangeStateConfirmAlert}
      >
        <Alert onClose={closeChangeStateConfirmAlert} severity="success" sx={{ width: '100%' }}>
          Se cambió el estado de la cita exitosamente.
        </Alert>
      </Snackbar>

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
                  <li key={index}>{`${servicio.NOMBRE_SERVICIO} - Precio: ₡${servicio.PRECIO}`}</li>
                ))}
              </ul>
              <Typography variant="h6" gutterBottom>
                Precio total: ₡{servicios.reduce((sum, servicio) => sum + Number(servicio.PRECIO), 0)}
              </Typography>
            </>
          ) : (
            <Typography>Esta cita no tiene servicios asociados.</Typography>
          )}
        </Box>
      </Modal>

      {/* Create Modal */}
      <Modal open={openCreate} 
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleCloseCreate();
        }
      }}
      disablePortal>
      
        <Box sx={modalStyle} role="dialog" aria-modal="true">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Agregar Cita</Typography>
            <IconButton onClick={handleCloseCreate}>
              <Close />
            </IconButton>
          </Box>
          <form onSubmit={handleCreateCita}>
            <FormGroup>
              
              {/* Cliente Dropdown */}
              <FormControl fullWidth margin="normal" error={!!errores.id_usuario_cli}>
                <Autocomplete
                
                  ListboxProps={{
                    style: {
                      maxHeight: '120px',
                      overflowY: 'auto',
                    },
                  }}
                  id="cliente-autocomplete"
                  options={clientIDs.sort((a, b) =>
                    `${a.NOMBRE} ${a.APELLIDO}`.localeCompare(`${b.NOMBRE} ${b.APELLIDO}`)
                  )}
                  getOptionLabel={(option) => `${option.NOMBRE} ${option.APELLIDO}`}
                  value={
                    formValues.id_usuario_cli
                      ? clientIDs.find((client) => client.ID_USUARIO === formValues.id_usuario_cli)
                      : null
                  }
                  onChange={(event, newValue) => {
                    setFormValues((prev) => ({
                      ...prev,
                      id_usuario_cli: newValue ? newValue.ID_USUARIO : "",
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente*"
                      variant="outlined"
                      error={!!errores.id_usuario_cli}
                      helperText={errores.id_usuario_cli ? "Seleccione un cliente." : ""}
                      InputLabelProps={inputPropsStyle}
                    />
                  )}
                />
              </FormControl>

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
                  options={mascotas}
                  getOptionLabel={(option) => `${option.NOMBRE} - ${option.ESPECIE}`}
                  value={
                    formValues.id_mascota
                      ? mascotas.find((mascota) => mascota.ID_MASCOTA === formValues.id_mascota)
                      : null
                  }
                  onChange={(event, newValue) => {
                    setFormValues((prev) => ({
                      ...prev,
                      id_mascota: newValue ? newValue.ID_MASCOTA : "",
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Mascota*"
                      variant="outlined"
                      error={!!errores.id_mascota}
                      helperText={errores.id_mascota ? "Seleccione una mascota." : ""} InputLabelProps={inputPropsStyle}
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
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Veterinario*"
                      variant="outlined"
                      error={!!errores.id_usuario_vet}
                      helperText={errores.id_usuario_vet ? "Seleccione un veterinario." : ""} InputLabelProps={inputPropsStyle}
                    />
                  )}
                />
              </FormControl>

              {/* Tipo de Cita Dropdown */}
              <FormControl fullWidth margin="normal" error={!!errores.tipo_cita}>
                <Autocomplete
                  ListboxProps={{
                    style: {
                      maxHeight: '120px',
                      overflowY: 'auto',
                    },
                  }}
                  id="tipo-cita-autocomplete"
                  options={tipoCitas}
                  getOptionLabel={(option) => option.NOMBRE}
                  value={
                    formValues.tipo_cita
                      ? tipoCitas.find((tipo) => tipo.ID_TIPO === formValues.tipo_cita)
                      : null
                  }
                  onChange={(event, newValue) => {
                    setFormValues((prev) => ({
                      ...prev,
                      tipo_cita: newValue ? newValue.ID_TIPO : "",
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo de Cita*"
                      variant="outlined"
                      error={!!errores.tipo_cita}
                      helperText={errores.tipo_cita ? "Seleccione el tipo de cita." : ""} InputLabelProps={inputPropsStyle}
                    />
                  )}
                />
              </FormControl>

              {/* Add Services Dropdown */}
              <FormControl fullWidth margin="normal">
              <Autocomplete
                multiple
                id="services-autocomplete"
                options={allServices}
                getOptionLabel={(option) => option.NOMBRE || ""} // Safeguard against undefined
                isOptionEqualToValue={(option, value) => option.ID_SERVICIO === value.ID_SERVICIO}
                onChange={(event, newValue) => {
                  setSelectedServices(newValue);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option.NOMBRE} {...getTagProps({ index })} key={option.ID_SERVICIO} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Servicios"
                    placeholder="" InputLabelProps={inputPropsStyle}
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
      <Modal open={openEdit} 
        onClose={(event, reason) => {
      if (reason !== 'backdropClick') {
        handleCloseCreate();
      }
      }}
      disablePortal>
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Editar Fecha y Hora de Cita</Typography>
            <IconButton onClick={handleCloseEdit}>
              <Close />
            </IconButton>
          </Box>
          <form onSubmit={handleEditCita}>
            <FormGroup>

            <FormControl fullWidth margin="normal">
              <Autocomplete
                multiple
                id="services-autocomplete"
                options={allServices}
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
                  label="Fecha"
                  value={editSelectedDate}
                  onChange={handleEditDateChange}
                  minDate={new Date()}
                  open={datePickerEditOpen}
                  onOpen={() => setDatePickerEditOpen(true)}
                  onClose={() => setDatePickerEditOpen(false)}
                  inputFormat=""
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        ...params.InputProps,
                        readOnly: true,
                      }}
                      inputProps={{
                        ...params.inputProps,
                        placeholder: '',
                      }}
                      onClick={() => setDatePickerEditOpen(true)}
                    />
                  )}
                />
              </LocalizationProvider>

              {/* Time Picker */}
              <FormControl
                fullWidth
                margin="normal"
                variant="outlined"
                disabled={!editSelectedDate || editAvailableTimes.length === 0}
              >
                <InputLabel id="edit-time-select-label" shrink>
                  Hora
                </InputLabel>
                <Select
                  labelId="edit-time-select-label"
                  name="hora"
                  value={editFormValues.hora || ''}
                  onChange={handleEditFormChange}
                  required
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected === '') {
                      return <em> </em>;
                    }
                    return selected;
                  }}
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
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={handleCloseEdit}>Cancelar</Button>
              <Button variant="contained" type="submit">
                Guardar Cambios
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>


      {/* Toggle Confirmation Modal */}
      <Modal open={openToggleConfirm} 
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleCloseToggleConfirm();
        }
      }}
      disablePortal
      >


        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Confirmar {selectedCita && selectedCita.ESTADO === 1 ? 'Deshabilitar' : 'Habilitar'}
            </Typography>
            <IconButton onClick={handleCloseToggleConfirm}>
              <Close />
            </IconButton>
          </Box>
          <Typography>
            ¿Está seguro de que desea{' '}
            {selectedCita && selectedCita.ESTADO === 1 ? 'deshabilitar' : 'habilitar'} la cita
            del cliente {selectedCita && selectedCita.CLIENTE}?
          </Typography>
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={handleCloseToggleConfirm} sx={{ mr: 2 }}>Cancelar</Button>
            <Button
              variant="contained"
              color={selectedCita && selectedCita.ESTADO === 1 ? 'primary' : 'primary'}
              onClick={handleToggleEstado}
            >
              {selectedCita && selectedCita.ESTADO === 1 ? 'Deshabilitar' : 'Habilitar'}
            </Button>
          </Box>
        </Box>
      </Modal>
      
      
      <Box sx={{ display: 'flex' }}>
      <SideMenu />
      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Header />
        <Stack spacing={2} sx={{ alignItems: 'center', mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
          <Box
            sx={{
              width: '100%',
              pt:4,
              color: '#000',
              '& > .MuiBox-root > .MuiBox-root': {
                p: 1,
                borderRadius: 2,
                fontSize: '0.875rem',
                fontWeight: '700',
              },
            }}
          >
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
                  Citas
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
                                <Typography variant="h6">{cita.CLIENTE}</Typography>
                                <Typography><strong>Cliente: </strong>{cita.CLIENTE}</Typography>
                                <Typography><strong>Veterinario: </strong>{cita.VETERINARIO}</Typography>
                                <Typography><strong>Fecha: </strong>{cita.FECHA}</Typography>
                                <Typography><strong>Hora: </strong> {cita.HORA}</Typography>
                                <Typography><strong>Mascota: </strong>{cita.MASCOTA}</Typography>
                                <Typography><strong>Especie: </strong>{cita.ESPECIE}</Typography>
                                <Typography>
                                <Chip
                                label={cita.ESTADO === 1 ? 'Pendiente' : ((cita.ESTADO===2)? 'Completada':'Cancelada')}
                                color={cita.ESTADO === 1 ? 'warning' : ((cita.ESTADO===2)? 'success':'error')}
                                variant="outlined"
                                size="small"
                              /></Typography>
                                <br />
                                <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}> 
                                <Button
                          id="basic-button"
                          aria-controls={openMenu ? 'basic-menu' : undefined}
                          aria-haspopup="true"
                          aria-expanded={openMenu ? 'true' : undefined}
                          onClick={(event) => handleMenuClick(event, cita)}
                          aria-label="Actions"
                        >
                          <MoreHorizIcon />
                        </Button>
                                </Box>
                                <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
                disablePortal
              >

                  {selectedCita && selectedCita.ESTADO === ESTADO_PENDIENTE && (
                    <MenuItem onClick={() => handleCancelar(selectedCita.ID_CITA)}>Cancelar</MenuItem>
                  )}
                  {selectedCita && selectedCita.ESTADO === ESTADO_PENDIENTE && (
                    <MenuItem onClick={() => handleCompletar(selectedCita.ID_CITA)}>Completar</MenuItem>
                  )}
                  
                  <MenuItem onClick={() => handleOpenModal(selectedCita.ID_CITA)}>Más información</MenuItem>
                  
                  {selectedCita && selectedCita.ESTADO === ESTADO_PENDIENTE && (
                    <MenuItem onClick={() => handleOpenEdit(selectedCita)}>Editar</MenuItem>
                  )}
                  
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
                {sortedCitas
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((cita) => (
                    <TableRow key={cita.ID_CITA}>
                      <TableCell>{cita.CLIENTE}</TableCell>
                      <TableCell>{cita.VETERINARIO}</TableCell>
                      <TableCell>{cita.FECHA}</TableCell>
                      <TableCell>{cita.HORA}</TableCell>
                      <TableCell>{cita.ESPECIE}</TableCell>
                      <TableCell sx={{ padding: '8px 16px' }}>
                        <Chip
                          label={cita.ESTADO === 1 ? 'Pendiente' : ((cita.ESTADO===2)? 'Completada':'Cancelada')}
                          color={cita.ESTADO === 1 ? 'warning' : ((cita.ESTADO===2)? 'success':'error')}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ padding: '8px 16px' }}>
                        <Button
                          id="basic-button"
                          aria-controls={openMenu ? 'basic-menu' : undefined}
                          aria-haspopup="true"
                          aria-expanded={openMenu ? 'true' : undefined}
                          onClick={(event) => handleMenuClick(event, cita)}
                          aria-label="Actions"
                        >
                          <MoreHorizIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
              </Table>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
                disablePortal
              >

                  {selectedCita && selectedCita.ESTADO === ESTADO_PENDIENTE && (
                    <MenuItem onClick={() => handleCancelar(selectedCita.ID_CITA)}>Cancelar</MenuItem>
                  )}
                  {selectedCita && selectedCita.ESTADO === ESTADO_PENDIENTE && (
                    <MenuItem onClick={() => handleCompletar(selectedCita.ID_CITA)}>Completar</MenuItem>
                  )}
                  
                  <MenuItem onClick={() => handleOpenModal(selectedCita.ID_CITA)}>Más información</MenuItem>
                  
                  {selectedCita && selectedCita.ESTADO === ESTADO_PENDIENTE && (
                    <MenuItem onClick={() => handleOpenEdit(selectedCita)}>Editar</MenuItem>
                  )}
                  
                </Menu>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredCitas.length}
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
