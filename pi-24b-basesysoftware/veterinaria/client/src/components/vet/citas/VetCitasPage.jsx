import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import {
  Table, TableCell, TableContainer, TableHead, TableBody, TableRow, TablePagination, Paper,
  Box, Stack, Typography, TextField, Menu, MenuItem, IconButton, InputAdornment,
  TableSortLabel, CircularProgress,Modal,Button,Snackbar,Alert,Chip,
} from '@mui/material';
import { MoreHoriz as MoreHorizIcon, Search, Close} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import SideMenu from '../SideMenu';
import Header from '../Header';
import Cargando from '../../general/loadingScreen';
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

export default function VetCitasPage() {
  // State variables
  const [citas, setCitas] = useState([]);
  const [selectedCita, setSelectedCita] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Loading state
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  // Sorting state
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('FECHA');

  // Modals and notifications
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  // Define head cells
  const headCells = [
    { id: 'CLIENTE', label: 'Cliente' },
    { id: 'MASCOTA', label: 'Mascota' },
    { id: 'FECHA', label: 'Fecha' },
    { id: 'HORA', label: 'Hora' },
    { id: 'ESPECIE', label: 'Especie' },
    { id: 'ESTADO', label: 'Estado' },
  ];
  useEffect(() => {
    fetchCitas();
  }, []);

  const fetchCitas = async () => {
    try {
      const res = await axiosInstance.get(`http://localhost:8080/veterinarios/citas/${localStorage.getItem('userId')}`);
      const citasReformatted = res.data.map(citasArray => ({
        ID_CITA: citasArray[0],
        ID_MASCOTA: citasArray[1],
        ID_USUARIO_CLI: citasArray[2],
        ID_USUARIO_VET: citasArray[3],
        FECHA: citasArray[4],
        HORA: citasArray[5],
        ESTADO: citasArray[6],
        ESPECIE: citasArray[7],
        CLIENTE: citasArray[8],
        VETERINARIO: citasArray[9],
        TIPO_CITA_NOMBRE: citasArray[10],
        MASCOTA: citasArray[11],
      }));
      setCitas(citasReformatted);
    } catch (err) {
      console.error('Error fetching citas', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletar = async () => {
    try {
      await axiosInstance.put(`http://localhost:8080/veterinarios/citas/${selectedCita.ID_CITA}/estado`, {
        estado: 2, // 2 for completed
      });
      // Update the citas state
      setCitas(prevCitas =>
        prevCitas.map(cita =>
          cita.ID_CITA === selectedCita.ID_CITA ? { ...cita, ESTADO: 2 } : cita
        )
      );
      setSuccessMessage('Cita completada exitosamente.');
    } catch (err) {
      console.error('Error completing cita', err);
      setErrorMessage('Error al completar la cita.');
    }
    handleCloseConfirmModal();
  };

  

  const handleCancelar = async () => {
    try {
      await axiosInstance.put(`http://localhost:8080/veterinarios/citas/${selectedCita.ID_CITA}/estado`, {
        estado: 0, // 0 for canceled
      });
      // Update the citas state
      setCitas(prevCitas =>
        prevCitas.map(cita =>
          cita.ID_CITA === selectedCita.ID_CITA ? { ...cita, ESTADO: 0 } : cita
        )
      );
      setSuccessMessage('Cita cancelada exitosamente.');
    } catch (err) {
      console.error('Error canceling cita', err);
      setErrorMessage('Error al cancelar la cita.');
    }
    handleCloseConfirmModal();
  };

  const handleOpenInfoModal = async () => {
    try {
      console.log('Fetching details for Cita ID:', selectedCita.ID_CITA);
      const res = await axiosInstance.get(
        `http://localhost:8080/veterinarios/citas/${selectedCita.ID_CITA}/detalles`
      );
      console.log('Response data:', res.data);
  
      // Use the data directly without mapping
      const servicios = res.data;
  
      const appointmentDetails = {
        CLIENTE: selectedCita.CLIENTE,
        MASCOTA: selectedCita.MASCOTA,
        FECHA: selectedCita.FECHA,
        HORA: selectedCita.HORA,
        SERVICIOS: servicios,
      };
      setAppointmentDetails(appointmentDetails);
      setOpenInfoModal(true);
    } catch (err) {
      console.error('Error fetching appointment details', err);
      setErrorMessage('Error al obtener los detalles de la cita.');
    }
    handleMenuClose();
  };
  
  

  const handleOpenConfirmModal = (action) => {
    setConfirmAction(action);
    setOpenConfirmModal(true);
    handleMenuClose();
  };
  
  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false);
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
    console.log('Filtering cita:', cita); 
    return cita.CLIENTE.toLowerCase().includes(searchQuery.toLowerCase());
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
      {/* Confirmation modal */}
      <Modal open={openConfirmModal} onClose={handleCloseConfirmModal}>
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Confirmar {confirmAction === 'completar' ? 'Completar' : 'Cancelar'} Cita
            </Typography>
            <IconButton onClick={handleCloseConfirmModal}>
              <Close />
            </IconButton>
          </Box>
          <Typography>
            ¿Está seguro de que desea{' '}
            {confirmAction === 'completar' ? 'completar' : 'cancelar'} la cita con el
            cliente {selectedCita?.CLIENTE}?
          </Typography>
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={handleCloseConfirmModal} sx={{ mr: 2 }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color={confirmAction === 'completar' ? 'primary' : 'primary'}
              onClick={confirmAction === 'completar' ? handleCompletar : handleCancelar}
            >
              {confirmAction === 'completar' ? 'Completar' : 'Cancelar'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Info Modal */}
      <Modal open={openInfoModal} onClose={() => setOpenInfoModal(false)}>
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Detalles de la Cita</Typography>
            <IconButton onClick={() => setOpenInfoModal(false)}>
              <Close />
            </IconButton>
          </Box>
          {appointmentDetails ? (
            <>
              <Typography><strong>Cliente:</strong> {appointmentDetails.CLIENTE}</Typography>
              <Typography><strong>Mascota:</strong> {appointmentDetails.MASCOTA}</Typography>
              <Typography><strong>Fecha:</strong> {appointmentDetails.FECHA}</Typography>
              <Typography><strong>Hora:</strong> {appointmentDetails.HORA}</Typography>
              <Typography><strong>Servicios:</strong></Typography>
              {appointmentDetails.SERVICIOS && appointmentDetails.SERVICIOS.length > 0 ? (
                <ul>
                  {appointmentDetails.SERVICIOS.map((servicio) => (
                    <li key={servicio.ID_SERVICIO}>
                      {servicio.NOMBRE_SERVICIO} - ₡{servicio.PRECIO}
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography>No hay servicios asociados.</Typography>
              )}
              <Typography variant="h6">
                Precio Total: ₡
                {appointmentDetails.SERVICIOS && appointmentDetails.SERVICIOS.length > 0
                  ? appointmentDetails.SERVICIOS.reduce((total, servicio) => total + servicio.PRECIO, 0)
                  : 0}
              </Typography>
            </>
          ) : (
            <Typography>Cargando detalles...</Typography>
          )}
        </Box>
      </Modal>
      {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage('')}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={4000}
          onClose={() => setErrorMessage('')}
        >
          <Alert onClose={() => setErrorMessage('')} severity="error">
            {errorMessage}
          </Alert>
        </Snackbar>

      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Header />
          <Stack spacing={2} sx={{ mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
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
                    Citas
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
                                <Typography><strong>Fecha: </strong>{cita.FECHA}</Typography>
                                <Typography><strong>Hora: </strong> {cita.HORA}</Typography>
                                <Typography><strong>Mascota: </strong>{cita.MASCOTA}</Typography>
                                <Typography><strong>Especie: </strong>{cita.ESPECIE  === '01'? 'Perro' : (cita.ESPECIE === '02' ? 'Gato' : 'Conejo')}</Typography>
                                <Typography>
                                <Chip
                                label={
                                  cita.ESTADO === 1
                                    ? 'Pendiente'
                                    : cita.ESTADO === 2
                                    ? 'Completada'
                                    : 'Cancelada'
                                }
                                color={
                                  cita.ESTADO === 1
                                    ? 'warning'
                                    : cita.ESTADO === 2
                                    ? 'success'
                                    : 'error'
                                }
                                variant="outlined"
                                size="small"
                              /></Typography>
                                <br />
                                <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}> 
                                <Button onClick={(event) => handleMenuClick(event, cita)}>
                                <MoreHorizIcon />
                              </Button>
                                </Box>
                                <Menu
                                  anchorEl={anchorEl}
                                  open={openMenu}
                                  onClose={handleMenuClose}
                                >
                                  {selectedCita && selectedCita.ESTADO === 1 && (
                                    <>
                                      <MenuItem onClick={() => handleOpenConfirmModal('completar')}>Completar</MenuItem>
                                      <MenuItem onClick={() => handleOpenConfirmModal('cancelar')}>Cancelar</MenuItem>
                                    </>
                                  )}
                                  <MenuItem onClick={handleOpenInfoModal}>Más información</MenuItem>
                                
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
                            <TableCell>{cita.MASCOTA}</TableCell>
                            <TableCell>{cita.FECHA}</TableCell>
                            <TableCell>{cita.HORA}</TableCell>
                            <TableCell>{cita.ESPECIE  === '01'? 'Perro' : (cita.ESPECIE === '02' ? 'Gato' : 'Conejo')}</TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  cita.ESTADO === 1
                                    ? 'Pendiente'
                                    : cita.ESTADO === 2
                                    ? 'Completada'
                                    : 'Cancelada'
                                }
                                color={
                                  cita.ESTADO === 1
                                    ? 'warning'
                                    : cita.ESTADO === 2
                                    ? 'success'
                                    : 'error'
                                }
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button onClick={(event) => handleMenuClick(event, cita)}>
                                <MoreHorizIcon />
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
                >
                  {selectedCita && selectedCita.ESTADO === 1 && (
                    <>
                      <MenuItem onClick={() => handleOpenConfirmModal('completar')}>Completar</MenuItem>
                      <MenuItem onClick={() => handleOpenConfirmModal('cancelar')}>Cancelar</MenuItem>
                    </>
                  )}
                  <MenuItem onClick={handleOpenInfoModal}>Más información</MenuItem>
                
                </Menu>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={sortedCitas.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                labelRowsPerPage="Número de filas"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                onRowsPerPageChange={handleChangeRowsPerPage}
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