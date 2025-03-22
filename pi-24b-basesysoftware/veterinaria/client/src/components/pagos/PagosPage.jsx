import { React, useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import SideMenu from '../admin/SideMenu';
import Header from '../admin/Header';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import {
  Table, TableCell, TableContainer, TableHead, TableBody, TableRow, TablePagination,
  InputAdornment, IconButton, CircularProgress, TableSortLabel, Paper, Box, Stack,
  Typography, Button, Menu, MenuItem, Modal, TextField, FormGroup, 
  FormControl, Alert, Snackbar, Autocomplete, Tab
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import Cargando from '../general/loadingScreen';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

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

export default function AdminPagosPage () {

  const [pagosPendientes, setPagosPendientes] = useState([]);
  const [pagosPasados, setPagosPasados] = useState([]);
  const [citasServicios, setCitasServicios] = useState([]);
  const [selectedPago, setSelectedPago] = useState([])
  const [refresh, setRefresh] = useState(0);
  const [tabValue, setTabValue] = useState("1");
  const navigate = useNavigate();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // on render
  useEffect(() => {
    fetchPagos();
    fetchCitasServicios();
  }, [refresh]);

  // Get pagos to display them
  const fetchPagos = async () => {
    try {
      const response = await axiosInstance.get(`http://localhost:8080/administradores/pagos/`);

      const pagosData = response.data;

      const pagosFormatted = pagosData.map(pagosArray => ({
        ID_PAGO: pagosArray[0],
        ID_CITA: pagosArray[1],
        MASCOTA: pagosArray[2],
        VETERINARIO: pagosArray[3],
        FECHA: pagosArray[4],
        HORA: pagosArray[5],
        MONTO: pagosArray[6],
        ESTADO: pagosArray[7],
        FECHA_PAGO: pagosArray[8],
        METODO_PAGO: pagosArray[9],
        CLIENTE: pagosArray[10]
      }));

      const pagosPendientes = pagosFormatted.filter( pago =>
        pago.ESTADO == 1
      )

      const pagosPasados = pagosFormatted.filter( pago =>
        pago.ESTADO == 0
      )

      setPagosPendientes(pagosPendientes);
      setPagosPasados(pagosPasados)
      console.log(pagosFormatted)
      console.log(response)
    } catch (err) {
      console.error('Error fetching pagos', err);
    } finally {
      setLoading(false);
    }
  };

  // Get citas servicios to display them
  const fetchCitasServicios = async () => {
    try {
      const response = await axiosInstance.get(`http://localhost:8080/administradores/pagos/servicios/`);

      const serviciosData = response.data;

      const serviciosFormatted = serviciosData.map(serviciosArray => ({
        ID_CITA: serviciosArray[0],
        ID_SERVICIO: serviciosArray[1],
        NOMBRE: serviciosArray[2],
        PRECIO: serviciosArray[3]
      }));

      setCitasServicios(serviciosFormatted);
      console.log(serviciosFormatted)
      console.log(response)
    } catch (err) {
      console.error('Error fetching servicios', err);
    } finally {
      setLoading(false);
    }
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (event, row) => {
    console.log(row)
    setSelectedPago(row);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Manage view modal pagos
  const [openPagoVer, setOpenPagoVer] = useState(false);
  const handleOpenPagoVer = () => {
    setOpenPagoVer(true);
  };
  const handleClosePagoVer = () => {
    setOpenPagoVer(false)
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
  const headCells = [
    { id: 'CLIENTE', label: 'Cliente' },
    { id: 'MASCOTA', label: 'Mascota' },
    { id: 'VETERINARIO', label: 'Veterinario' },
    { id: 'FECHA', label: 'Fecha de la cita' },
    { id: 'MONTO', label: 'Monto' },
  ];

    // Define head cells
    const headCellsPagosPasados = [
      { id: 'CLIENTE', label: 'Cliente' },
      { id: 'MASCOTA', label: 'Mascota' },
      { id: 'VETERINARIO', label: 'Veterinario' },
      { id: 'FECHA', label: 'Fecha de la cita' },
      { id: 'MONTO', label: 'Monto' },
      { id: 'FECHA_PAGO', label: 'Fecha del pago' },
      { id: 'METODO_PAGO', label: 'Método de pago' },
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

  // Filter pagos based on search query
  const filteredPagosPendientes = pagosPendientes.filter((p) => {
    const fecha =  p.FECHA.toLowerCase();
    const hora =  p.HORA.toLowerCase();
    const mascota = p.MASCOTA.toLowerCase();
    const veterinario = p.VETERINARIO.toLowerCase(); 
    const cliente = p.CLIENTE.toLowerCase(); 
    //  const monto = p.MONTO;
    const search = searchQuery.toLowerCase();
    return fecha.includes(search) || hora.includes(search) || mascota.includes(search) || veterinario.includes(search) || cliente.includes(search);
  });
 

 // Sort data before rendering
 const sortedPagosPendientes = stableSort(
   filteredPagosPendientes,
   getComparator(order, orderBy)
 );

  // Filter pagos based on search query
  const filteredPagosPasados = pagosPasados.filter((p) => {
  const fecha =  p.FECHA.toLowerCase();
  const hora =  p.HORA.toLowerCase();
  const mascota = p.MASCOTA.toLowerCase();
  const veterinario = p.VETERINARIO.toLowerCase(); 
  const cliente = p.CLIENTE.toLowerCase(); 
  //  const monto = p.MONTO;
  const search = searchQuery.toLowerCase();
  return fecha.includes(search) || hora.includes(search) || mascota.includes(search) || veterinario.includes(search) || cliente.includes(search);
});


// Sort data before rendering
const sortedPagosPasados = stableSort(
  filteredPagosPasados,
  getComparator(order, orderBy)
);

  // Loading state
  const [loading, setLoading] = useState(true);

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
      {/* Modal to view cita details */}
      <Modal
        open={openPagoVer}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClosePagoVer();
          }
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Detalles del pago
            </Typography>
            <IconButton onClick={handleClosePagoVer}>
              <Close />
            </IconButton>
          </Box>
          <Box component="form">
            <Typography variant='p'><strong>Mascota:</strong> {selectedPago.MASCOTA}</Typography><br/>
            <Typography variant='p'><strong>Veterinario:</strong> {selectedPago.VETERINARIO}</Typography><br/>
            <Typography variant='p'><strong>Fecha de la cita:</strong> {selectedPago.FECHA}</Typography><br/>
            <Typography variant='p'><strong>Hora de la cita:</strong> {selectedPago.HORA}</Typography><br/>
            <Typography variant='p'><strong>Servicios:</strong></Typography><br/>
            <ul>
            { selectedPago ? 
              citasServicios.map(servicio => {
                
                if (selectedPago.ID_CITA == servicio.ID_CITA) {
                    
                  return (
                    <li key={servicio.ID_CITA + servicio.ID_SERVICIO}>
                      <Typography>{servicio.NOMBRE} (₡{servicio.PRECIO})</Typography>
                    </li>
                  )
                } else {
                  return null
                }
              })
              : null
            }
            </ul>
            <Typography variant='p'><strong>Monto total:</strong> ₡{selectedPago.MONTO}</Typography><br/>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={handleClosePagoVer}>Cerrar</Button>
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
            '.MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel': { marginTop: '1em', marginBottom:   
            '1em' }
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
                  <Typography variant="h4" >
                    Pagos
                  </Typography>
                </Box>
                <Box sx={{ gridArea: 'sidebar',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: {xs: 'flex-center', sm:'flex-center', md:'flex-end', lg:'flex-end'},
                  gap: 1, }}>
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
          </Stack>
          {/* Pagos table */}
          <Box sx={{ width: '100%', typography: 'body1' }}>
          
            <TabContext value={tabValue}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleTabChange} aria-label="lab API tabs example">
                  <Tab label="Pendientes" value="1" />
                  <Tab label="Pasados" value="2" />
                </TabList>
              </Box>
              {/* pagos pendientes */}
              {isSmallScreen && tabValue ==="1" ||  isMediumScreen && tabValue === "1" ? (
                <Box>
                  {pagosPendientes.length <= 0 
                  ? <Typography marginTop={2} marginLeft={1}>No hay pagos pendientes.</Typography> 
                  : <div>
                      <Box sx={{ display: 'grid', paddingLeft:{xs: 0, sm: 3, md: 3, lg: 3},  gridTemplateColumns: {xs: 'repeat(1, 1fr)', sm:'repeat(3, 3fr)',  md:'repeat(3, 3fr)'}, gap: {xs: 2, sm: 4, md: 4}, marginTop: 2 }}>
                          {pagosPendientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((pago) => (
                              <Box key={pago.ID_PAGO} sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 2, position:'relative' }}>
                                  <Typography><strong>Cliente: </strong> {pago.CLIENTE}</Typography>
                                  <Typography><strong>Mascota: </strong> {pago.MASCOTA}</Typography>
                                  <Typography><strong>Veterinario: </strong> {pago.VETERINARIO}</Typography>
                                  <Typography><strong>Fecha de la cita: </strong> {pago.FECHA}</Typography>
                                  <Typography><strong>Monto: </strong> ₡{pago.MONTO}</Typography>
                                  <br />
                                  <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                                    <Button id="basic-button" aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={(event) => handleMenuClick(event, pago)}>
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
                                    <MenuItem onClick={handleOpenPagoVer}>Ver Detalles</MenuItem>
                                  </Menu>
                              </Box>
                              
                          ))}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                        <TablePagination
                          rowsPerPageOptions={[5, 10, 25]}
                          component="div"
                          labelRowsPerPage="Número de filas"
                          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                          count={pagosPendientes.length}
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
                    </div>}
                </Box>
              ) :
                <TabPanel value="1">
                  {(pagosPendientes.length > 0)
                  ? (  
                      <Box sx={{ width: '100%' }}>
                        <TableContainer component={Paper}>
                          <Table aria-label="simple table">
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
                              {sortedPagosPendientes
                              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                              .map((pago) => (
                                <TableRow key={pago.ID_PAGO}>
                                  <TableCell>{pago.CLIENTE}</TableCell>
                                  <TableCell>{pago.MASCOTA}</TableCell>
                                  <TableCell>{pago.VETERINARIO}</TableCell>
                                  <TableCell>{pago.FECHA}</TableCell>
                                  <TableCell>₡{pago.MONTO}</TableCell>
                                  <TableCell>
                                    <Button id="basic-button" aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={(event) => handleMenuClick(event, pago)}>
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
                                    <MenuItem onClick={handleOpenPagoVer}>Ver Detalles</MenuItem>
                                  </Menu>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <TablePagination
                          rowsPerPageOptions={[5, 10, 25]}
                          component="div"
                          count={pagosPendientes.length}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          onPageChange={handleChangePage}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                          labelRowsPerPage="Número de filas"
                          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                          sx={{
                            '& .MuiTablePagination-toolbar': {
                              alignItems: 'baseline', // or 'center'
                            },
                          }}
                        />
                      </Box>
                    )
                  : // render in case of no data to display
                    (<Typography>No hay pagos pendientes.</Typography>)
                  }
                </TabPanel>
              }

              {/* pagos pasados */}
              {isSmallScreen && tabValue ==="2" ||  isMediumScreen && tabValue === "2"  ? (
                <Box>
                  {pagosPasados.length <= 0 
                  ? <Typography marginTop={2} marginLeft={1}>No hay pagos pasados.</Typography> 
                  : <div>
                      <Box sx={{ display: 'grid', paddingLeft:{xs: 0, sm: 3, md: 3, lg: 3},  gridTemplateColumns: {xs: 'repeat(1, 1fr)', sm:'repeat(3, 3fr)',  md:'repeat(3, 3fr)'}, gap: {xs: 2, sm: 4, md: 4}, marginTop: 2 }}>
                          {pagosPasados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((pago) => (
                            <Box key={pago.ID_PAGO} sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 2, position:'relative' }}>
                              <Typography><strong>Cliente: </strong> {pago.CLIENTE}</Typography>
                              <Typography><strong>Mascota: </strong> {pago.MASCOTA}</Typography>
                              <Typography><strong>Veterinario: </strong> {pago.VETERINARIO}</Typography>
                              <Typography><strong>Fecha de la cita: </strong> {pago.FECHA}</Typography>
                              <Typography><strong>Monto: </strong> ₡{pago.MONTO}</Typography>
                              <Typography><strong>Fecha del pago: </strong> {pago.FECHA_PAGO}</Typography>
                              <Typography><strong>Método de pago: </strong> {pago.METODO_PAGO}</Typography>
                              <br />
                              <Box sx={{ position: 'absolute', bottom: 0}}>
                                {/* "Ver factura" Button */}
                                <Button
                                  onClick={async () => {
                                    try {
                                      const response = await axiosInstance.get(
                                        `http://localhost:8080/pagos/recibo/${pago.ID_PAGO}`,
                                        { responseType: 'blob' }
                                      );
                                      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                                      window.open(url, '_blank');
                                    } catch (error) {
                                      console.error('Error fetching PDF:', error);
                                    }
                                  }}
                                >
                                  Ver factura
                                </Button>
                              </Box>
                            </Box>  
                          ))}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                        <TablePagination
                          rowsPerPageOptions={[5, 10, 25]}
                          component="div"
                          labelRowsPerPage="Número de filas"
                          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                          count={pagosPasados.length}
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
                    </div>
                  }
                </Box>
              ) :
                <TabPanel value="2">
                  {(pagosPasados.length > 0) ? (
                    <Box sx={{ width: '100%' }}>
                      <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                          <TableHead>
                            <TableRow>
                              {headCellsPagosPasados.map((headCell) => (
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
                            {sortedPagosPasados
                              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                              .map((pago) => (
                                <TableRow key={pago.ID_PAGO}>
                                  <TableCell>{pago.CLIENTE}</TableCell>
                                  <TableCell>{pago.MASCOTA}</TableCell>
                                  <TableCell>{pago.VETERINARIO}</TableCell>
                                  <TableCell>{pago.FECHA}</TableCell>
                                  <TableCell>₡{pago.MONTO}</TableCell>
                                  <TableCell>{pago.FECHA_PAGO}</TableCell>
                                  <TableCell>{pago.METODO_PAGO}</TableCell>
                                  <TableCell>
                                    {/* "Ver factura" Button */}
                                    <Button
                                    onClick={async () => {
                                      try {
                                        const response = await axiosInstance.get(
                                          `http://localhost:8080/pagos/recibo/${pago.ID_PAGO}`,
                                          { responseType: 'blob' }
                                        );
                                        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                                        window.open(url, '_blank');
                                      } catch (error) {
                                        console.error('Error fetching PDF:', error);
                                      }
                                    }}
                                  >
                                    Ver factura
                                  </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={pagosPasados.length}
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
                    </Box>
                  ) : (
                    <Typography>No hay pagos pasados.</Typography>
                  )}
                </TabPanel>
              }
            </TabContext>
          </Box>
        </Box>
      </Box>
    </div>
  )

}