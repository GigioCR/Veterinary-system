import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { json, useLocation } from "react-router-dom"
import {
  Box, CircularProgress, Card, CardContent, Typography, Tab,
  Table, TableCell, TableContainer, TableHead, TableBody, TableRow, TablePagination,
  Paper, Button, Menu, MenuItem, Modal, IconButton, FormGroup, TextField, 
  InputAdornment, TableSortLabel, Stack, FormControl, Autocomplete
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { visuallyHidden } from '@mui/utils';
import SideMenu from './SideMenu';
import Header from './Header';
import SuccessAlert from '../alerts/SuccessAlert';
import ErrorAlert from '../alerts/ErrorAlert';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

const inputPropsStyle = {
  shrink: true, // Ensures the label stays on top
}

const listBoxStyle = {
  maxHeight: 120
};

// style for modals
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  overflowY:'auto',
  maxHeight: '90vh',
  p: 4,
};

export default function MedHistory() {

  const mascot = useLocation().state.mascot
  const [refresh, setRefresh] = useState(0);
  // Loading state
  const [loading, setLoading] = useState(true);
  const [padecimientos, setPadecimientos] = useState([])
  const [diagnosticos, setDiagnosticos] = useState([])
  const [tratamientos, setTratamientos] = useState([])
  const [editSelectedServices, setEditSelectedServices] = useState([]);
  const [citas, setCitas] = useState([])
  const [tabValue, setTabValue] = useState("1");
  const [addPadecimientoIsOpen, setAddPadecimientoIsOpen] = useState(false);
  const [editPadecimientoIsOpen, setEditPadecimientoIsOpen] = useState(false);
  const [selectedPadecimiento, setSelectedPadecimiento] = useState([])
  const [selectedCita, setSelectedCita] = useState([])
  const [selectedDiagnostico, setSelectedDiagnostico] = useState([])
  const [selectedTratamiento, setSelectedTratamiento] = useState([])
  const [successBanner, setSuccessBanner] = useState(false)
  const [errorBanner, setErrorBanner] = useState(false)
  const theme = useTheme();
  
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  // handle closing alerts
  const handleCloseSuccessBanner = () => {
    setSuccessBanner(false)
  }
  const handleCloseErrorBanner = () => {
    setErrorBanner(false)
  }

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Manage view modal padecimientos
  const [openPadecimientoVer, setOpenPadecimientoVer] = useState(false);
  const handleOpenPadecimientoVer = () => {
    setOpenPadecimientoVer(true);
  };
  const handleClosePadecimientoVer = () => {
    setOpenPadecimientoVer(false)
  };

  // Manage view modal citas
  const [openCitaVer, setOpenCitaVer] = useState(false);
  const handleOpenCitaVer = (cita) => {
    console.log("Voy a abrir cita : " + cita)
    fetchCitaServicios(cita).then(() => { 
      setOpenCitaVer(true); 
    })
  };
  const handleCloseCitaVer = () => {
    setOpenCitaVer(false)
  };

  useEffect(() => {
    try {
      fetchPadecimientos()
      fetchDiagnosticos()
      fetchTratamientos()
      fetchCitas()
    } catch (error) {
      console.log(error)
    } 
    console.log(mascot)
  }, [refresh]);

  const fetchPadecimientos = async () => {
    try {
      console.log("voy a buscar los padecimientos de: " + mascot.ID_MASCOTA)
      await axiosInstance.get(`http://localhost:8080/clientes/mascotas/padecimientos/${mascot.ID_MASCOTA}`
      ).then((res) => {
        const dataReformatted = res.data.map(dataArray => ({
          FECHA: dataArray[0],
          HORA: dataArray[1],
          ID_DIAGNOSTICO: dataArray[2],
          NOMBRE_DIAGNOSTICO: dataArray[3],
          DESC_DIAGNOSTICO: dataArray[4],
          ID_TRATAMIENTO: dataArray[5],
          NOMBRE_TRATAMIENTO: dataArray[6],
          DESC_TRATAMIENTO: dataArray[7],
          DESCRIPCION: dataArray[8]
        }))
        setPadecimientos(dataReformatted)
      })
    } catch (error) {
      console.error('Error fetching padecimientos:', error);
    } finally {
      setLoading(false)
    }
  }


  const fetchCitaServicios = async (citaId) => {
    console.log("estoy buscando los servicios de esta cita: " + citaId)
    try {
      const res = await axiosInstance.get(`/clientes/cita_serviciosCli/${citaId}`);
      //console.log('Fetched cita servicios:', res.data);
      
      // Map the data to match the structure of `servicesList`
      const services = res.data.map((service) => ({ // Use service instead of serviceArray
        ID_SERVICIO: service.ID_SERVICIO,
        NOMBRE: service.NOMBRE_SERVICIO,
        PRECIO_ACTUAL: service.PRECIO 
      }));
  
      setEditSelectedServices(services);
      //console.log("estos son los servicios: " + JSON.stringify(services))
    } catch (err) {
      console.error('Error fetching cita servicios', err);
    }
  };

  const fetchDiagnosticos = async () => {
    try {
      await axiosInstance.get(`http://localhost:8080/clientes/diagnosticos`
      ).then((res) => {
        const dataReformatted = res.data.map(dataArray => ({
          ID_DIAGNOSTICO: dataArray[0],
          NOMBRE_DIAGNOSTICO: dataArray[1],
          DESC_DIAGNOSTICO: dataArray[2]
        }))
        setDiagnosticos(dataReformatted)
        console.log(dataReformatted)
      })
    } catch (error) {
      console.error('Error fetching diagnosticos:', error);
    }
  }

  const fetchTratamientos = async () => {
    try {
      await axiosInstance.get(`http://localhost:8080/clientes/tratamientos`
      ).then((res) => {
        const dataReformatted = res.data.map(dataArray => ({
          ID_TRATAMIENTO: dataArray[0],
          NOMBRE_TRATAMIENTO: dataArray[1],
          DESC_TRATAMIENTO: dataArray[2]
        }))
        setTratamientos(dataReformatted)
        console.log(dataReformatted)
      })
    } catch (error) {
      console.error('Error fetching tratamientos:', error);
    }
  }

  const fetchCitas = async () => {
    try {
      //console.log("voy a buscar las citas de: " + mascot.ID_MASCOTA)
      await axiosInstance.get(`http://localhost:8080/clientes/mascotas/citas/${mascot.ID_MASCOTA}`
      ).then((res) => {
        const citasReformatted = res.data.map(citasArray => ({
          ID_CITA: citasArray[0],
          ID_MASCOTA: citasArray[1],
          ID_CLIENTE: citasArray[2],
          ID_VET: citasArray[3],
          FECHA: citasArray[4],
          HORA: citasArray[5],
          ESTADO: citasArray[6],
          ESPECIE: citasArray[7],
          CLIENTE: citasArray[8],
          VET: citasArray[9],
          TIPO: citasArray[10]
        }))
  
        setCitas(citasReformatted)
      })
    } catch (error) {
      console.error('Error fetching historial citas:', error);
    }
  }

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedPadecimiento(row)
    setPadecimiento({
      FECHA: row.FECHA,
      HORA: row.HORA,
      ID_MASCOTA: mascot.ID_MASCOTA,
      ID_DIAGNOSTICO: row.ID_DIAGNOSTICO,
      ID_TRATAMIENTO: row.ID_TRATAMIENTO,
      DESCRIPCION: row.DESCRIPCION,
      ID_USUARIO: mascot.USER_ID
    });
    console.log(padecimiento)
    setSelectedCita({
      ID_CITA: row.ID_CITA,
      FECHA: row.FECHA,
      HORA: row.HORA,
      TIPO: row.TIPO,
      VET: row.VET
    })
  };

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sorting state
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('FECHA');

  // Define head cells
  const headCellsPadecimientos = [
    { id: 'FECHA', label: 'Fecha' },
    { id: 'NOMBRE_DIAGNOSTICO', label: 'Diagnóstico' },
    { id: 'NOMBRE_TRATAMIENTO', label: 'Tratamiento' },
  ];

  // Define head cells
  const headCellsCitas = [
    { id: 'FECHA', label: 'Fecha' },
    { id: 'VET', label: 'Veterinario Atendiente' },
  ];

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

  const handleSearchChange = (event) => {
     setSearchQuery(event.target.value);
     setPage(0); // Reset to first page when search query changes
   };

  // Filter padecimientos based on search query
  const filteredPadecimientos = padecimientos.filter((p) => {
    const fecha =  p.FECHA.toLowerCase();
    const diagnostico = p.NOMBRE_DIAGNOSTICO.toLowerCase();
    const tratamiento = p.NOMBRE_TRATAMIENTO.toLowerCase(); 
    const descripcion = p.DESCRIPCION.toLowerCase();
    const search = searchQuery.toLowerCase();
    return fecha.includes(search) || diagnostico.includes(search) || tratamiento.includes(search) || descripcion.includes(search);
  });
  

  // Sort data before rendering
  const sortedPadecimientos = stableSort(
    filteredPadecimientos,
    getComparator(order, orderBy)
  );

  const handleClose = () => {
    setAnchorEl(null);
    setPadecimiento((prev) => ({ ...prev, ID_DIAGNOSTICO: "" }));
    setPadecimiento((prev) => ({ ...prev, ID_TRATAMIENTO: "" }));
    setPadecimiento((prev) => ({ ...prev, DESCRIPCION: "" }));
    setPadecimiento((prev) => ({ ...prev, FECHA: "" }));
    setPadecimiento((prev) => ({ ...prev, HORA: "" }));
    //setErrores("")
  };

  // Filter padecimientos based on search query
  const filteredCitas = citas.filter((cita) => {
    const fecha =  cita.FECHA.toLowerCase();
    const tipo = cita.TIPO.toLowerCase();
    const vet = cita.VET.toLowerCase(); 
    const search = searchQuery.toLowerCase();
    return fecha.includes(search) || tipo.includes(search) || vet.includes(search);
  });

  // Sort citas before rendering
  const sortedCitas = stableSort(
    filteredCitas,
    getComparator(order, orderBy)
  );

  const [padecimiento, setPadecimiento] = useState({
    FECHA: "",
    HORA: "",
    ID_MASCOTA: mascot.ID_MASCOTA,
    ID_DIAGNOSTICO: "",
    ID_TRATAMIENTO: "",
    DESCRIPCION: "",
    ID_USUARIO: mascot.USER_ID
  })

  

  // Show loading screen while data is being fetched
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div>
       {/* Modal to view padecimiento details */}
       <Modal
        open={openPadecimientoVer}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClosePadecimientoVer();
          }
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Detalles del padecimiento
            </Typography>
            <IconButton onClick={handleClosePadecimientoVer}>
              <Close />
            </IconButton>
          </Box>
          <Box component="form">
            <Typography><strong>Fecha: </strong>{selectedPadecimiento.FECHA}</Typography>
            <Typography><strong>Hora: </strong>{selectedPadecimiento.HORA}</Typography>
            <Typography><strong>Diagnóstico: </strong>{selectedPadecimiento.NOMBRE_DIAGNOSTICO}</Typography>
            <Typography><strong>Tratamiento: </strong>{selectedPadecimiento.NOMBRE_TRATAMIENTO}</Typography>
            <Typography><strong>Descripción: </strong>{selectedPadecimiento.DESCRIPCION}</Typography>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={handleClosePadecimientoVer}>Cerrar</Button>
            </Box>
          </Box>
        </Box>
      </Modal>

        {/* Modal to view cita details */}
      <Modal
        open={openCitaVer}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseCitaVer();
          }
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Detalles de la cita
            </Typography>
            <IconButton onClick={handleCloseCitaVer}>
              <Close />
            </IconButton>
          </Box>
          <Box component="form">
          <Typography><strong>Fecha: </strong>{selectedCita.FECHA}</Typography>
          <Typography><strong>Hora: </strong>{selectedCita.HORA}</Typography>
          <Typography><strong>Veterinario Atendiente: </strong>{selectedCita.VET}</Typography>
            <Typography variant="h6">Servicios</Typography>
            <ul>
              {editSelectedServices.map((servicio) => (
                <li key={servicio.ID_SERVICIO}>
                  <Typography>{servicio.NOMBRE}</Typography>
                </li>
              ))}
            </ul>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={handleCloseCitaVer}>Cerrar</Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        {/* Main content */}
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Header />
          <Stack spacing={2} sx={{
          alignItems: 'center', mx: 3, pb: 5, mt: { xs: 8, md: 0 },
          '.MuiTablePagination-displayedRows': { marginTop: '1em', marginBottom: '1em' },
          '.MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel': { marginTop: '1em', marginBottom: '1em' }
        }}>
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
                  Historial Médico
                </Typography>
              </Box>
              <Box
                sx={{
                  gridArea: 'sidebar',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: {xs: 'flex-center', sm:'flex-center', md:'flex-end', lg:'flex-end'},
                  gap: 1,
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
            <Card sx={{ minWidth: 275, maxWidth: 275, marginBottom:'15px', marginTop:'15px' }}>
                  <CardContent>
                    <Typography variant='h5'>{mascot.NOMBRE_MASCOTA}</Typography><br/>
                    <Typography variant="body1">
                      <strong>Especie:</strong> {mascot.SPECIES} <br/>
                      <strong>Raza:</strong> {mascot.BREED} <br/>
                      <strong>Edad:</strong> {mascot.AGE} años <br/>
                      <strong>Peso:</strong> {mascot.WEIGHT} kg <br/>
                    </Typography>
                  </CardContent>
                </Card>
          </Box>
          
          </Stack>
          <ErrorAlert message={'Hubo un problema realizando la operación, inténtelo más tarde.'}open={errorBanner} onClose={handleCloseErrorBanner}></ErrorAlert>
          <SuccessAlert message={'La operación se realizó con éxito.'}open={successBanner} onClose={handleCloseSuccessBanner}></SuccessAlert>
          {/* Padecimientos table */}
          <Box sx={{ width: '100%', typography: 'body1', marginTop: { xs: 20, md: 15 } }}>
            <TabContext value={tabValue}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleTabChange} aria-label="lab API tabs example">
                  <Tab label="Padecimientos" value="1" />
                  <Tab label="Historial de Citas" value="2" />
                </TabList>
              </Box>
               {/* padecimientos */}
               {isSmallScreen && tabValue ==="1" ||  isMediumScreen && tabValue === "1" ? (
            <Box>
              {sortedPadecimientos.length <= 0 
              ? "Esta mascota no tiene padecimientos disponibles o que cumplan con ese criterio de búsqueda" 
              : ""}
                    <Box sx={{ display: 'grid', paddingLeft:{xs: 0, sm: 3, md: 3, lg: 3},  gridTemplateColumns: {xs: 'repeat(1, 1fr)', sm:'repeat(3, 3fr)',  md:'repeat(3, 3fr)'}, gap: {xs: 2, sm: 4, md: 4} }}>
                        {sortedPadecimientos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((padecimiento) => (
                            <Box key={padecimiento.FECHA + padecimiento.HORA} sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 2, position:'relative' }}>
                                <Typography variant="h6">{padecimiento.NOMBRE_DIAGNOSTICO}</Typography>
                                <Typography><strong>Fecha: </strong> {padecimiento.FECHA}</Typography>
                                <Typography><strong>Tratamiento: </strong> {padecimiento.NOMBRE_TRATAMIENTO}</Typography>
                                <br />
                                <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                                  <Button id="basic-button" aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={(event) => handleMenuClick(event, padecimiento)}>
                                    <MoreHorizIcon />
                                  </Button>
                                </Box>
                                <Menu
                                  id="basic-menu"
                                  anchorEl={anchorEl}
                                  open={open}
                                  onClose={handleClose}
                                  MenuListProps={{
                                    'aria-labelledby': 'basic-button',
                                  }}
                                >
                                  <MenuItem onClick={handleOpenPadecimientoVer}>Ver Detalles</MenuItem>
                                </Menu>
                            </Box>
                            
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-center', marginTop: 2 }}>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        labelRowsPerPage="Número de filas"
                        count={padecimientos.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                          '& .MuiTablePagination-toolbar': {
                            alignItems: 'baseline',
                          },
                        }}
                      />
                    </Box>
                    </Box>
                  ) :
              <TabPanel value="1">
                {(sortedPadecimientos.length > 0)
                ? (  
                    <Box sx={{ width: '100%' }}>
                      <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                          <TableHead>
                            <TableRow>
                              {headCellsPadecimientos.map((headCell) => (
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
                            {sortedPadecimientos
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((padecimiento) => (
                              <TableRow key={padecimiento.FECHA + padecimiento.HORA}>
                                <TableCell>{padecimiento.FECHA}</TableCell>
                                <TableCell>{padecimiento.NOMBRE_DIAGNOSTICO}</TableCell>
                                <TableCell>{padecimiento.NOMBRE_TRATAMIENTO}</TableCell>
                                <TableCell>
                                  <Button id="basic-button" aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={(event) => handleMenuClick(event, padecimiento)}>
                                    <MoreHorizIcon />
                                  </Button>
                                </TableCell>
                                <Menu
                                  id="basic-menu"
                                  anchorEl={anchorEl}
                                  open={open}
                                  onClose={handleClose}
                                  MenuListProps={{
                                    'aria-labelledby': 'basic-button',
                                  }}
                                >
                                  <MenuItem onClick={handleOpenPadecimientoVer}>Ver Detalles</MenuItem>
                                </Menu>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        labelRowsPerPage="Número de filas"
                        count={padecimientos.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                          '& .MuiTablePagination-toolbar': {
                            alignItems: 'baseline', // or 'center'
                          },
                        }}
                      />
                    </Box>
                  )
                : // render in case of no data to display
                  (<Typography>Esta mascota no tiene padecimientos disponibles o que cumplan con ese criterio de búsqueda.</Typography>)
                }
              </TabPanel>}

              {/* citas */}
              {isSmallScreen && tabValue ==="2" ||  isMediumScreen && tabValue === "2"  ? (
            <Box>
              {sortedCitas.length <= 0 
              ? "Esta mascota no tiene historial de citas disponibles o que cumplan con ese criterio de búsqueda" 
              : ""}
                    <Box sx={{ display: 'grid', paddingLeft:{xs: 0, sm: 3, md: 3, lg: 3},  gridTemplateColumns: {xs: 'repeat(1, 1fr)', sm:'repeat(3, 3fr)',  md:'repeat(3, 3fr)'}, gap: {xs: 2, sm: 4, md: 4} }}>
                        {sortedCitas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cita) => (
                            <Box key={cita.FECHA + cita.HORA} sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 2, position:'relative' }}>
                                <Typography variant="h6">{padecimiento.NOMBRE_DIAGNOSTICO}</Typography>
                                <Typography><strong>Fecha: </strong> {cita.FECHA}</Typography>
                                <Typography><strong>Veterinario Atendiente: </strong> {cita.VET}</Typography>
                                <br />
                                <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                                  <Button id="basic-button" aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={(event) => { handleMenuClick(event, cita); }}>
                                    <MoreHorizIcon />
                                  </Button>
                                </Box>
                                <Menu
                                  id="basic-menu"
                                  anchorEl={anchorEl}
                                  open={open}
                                  onClose={handleClose}
                                  MenuListProps={{
                                    'aria-labelledby': 'basic-button',
                                  }}
                                >
                                  <MenuItem onClick={() => handleOpenCitaVer(cita.ID_CITA)}>Ver Detalles</MenuItem>
                                </Menu>
                            </Box>
                            
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-center', marginTop: 2 }}>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        labelRowsPerPage="Número de filas"
                        component="div"
                        count={padecimientos.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                          '& .MuiTablePagination-toolbar': {
                            alignItems: 'baseline',
                          },
                        }}
                      />
                    </Box>
                    </Box>
                  ) :
              <TabPanel value="2">
                {(sortedCitas.length > 0)
                ? (
                    <Box sx={{ width: '100%' }}>
                      <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                          <TableHead>
                            <TableRow>
                              {headCellsCitas.map((headCell) => (
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
                              <TableRow key={cita.FECHA + cita.HORA}>
                                <TableCell>{cita.FECHA}</TableCell>
                                <TableCell>{cita.VET}</TableCell>
                                <TableCell>
                                  <Button id="basic-button" aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={(event) => { handleMenuClick(event, cita); }}>
                                    <MoreHorizIcon />
                                  </Button>
                                </TableCell>
                                <Menu
                                  id="basic-menu"
                                  anchorEl={anchorEl}
                                  open={open}
                                  onClose={handleClose}
                                  MenuListProps={{
                                    'aria-labelledby': 'basic-button',
                                  }}
                                >
                                  <MenuItem onClick={()=>handleOpenCitaVer(cita.ID_CITA)}>Ver Detalles</MenuItem>
                                </Menu>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        labelRowsPerPage="Número de filas"
                        component="div"
                        count={padecimientos.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                          '& .MuiTablePagination-toolbar': {
                            alignItems: 'baseline',
                          },
                        }}
                      />
                    </Box>
                  )
                : 
                  // render in case of no data to display
                  (<Typography>Esta mascota no tiene historial de citas disponible o que cumplan con el criterio de búsqueda.</Typography>)
                }
              </TabPanel>}
            </TabContext>
          </Box>
        </Box>
      </Box>
    </div>
  )
}