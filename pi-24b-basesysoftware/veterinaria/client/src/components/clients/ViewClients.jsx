import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios
import Modal from "./ModalDelete";
import axiosInstance from '../../api/axiosInstance';
import ModalUpdate from "./ModalUpdate"
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import SideMenu from '../admin/SideMenu';
import Header from '../admin/Header';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import AddClientModal from "./AddClient"
import InputAdornment from '@mui/material/InputAdornment'; 
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { visuallyHidden } from '@mui/utils';
import TableSortLabel from '@mui/material/TableSortLabel';
import SuccessAlert from '../alerts/SuccessAlert';
import { CircularProgress } from '@mui/material';
import ErrorAlert from '../alerts/ErrorAlert';
import Cargando from '../general/loadingScreen'; 
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

function ViewClients() {
  const [clientes, setClientes] = useState([]);
  const [deleteIsOpen, setDeleteIsOpen] = useState(false);
  const [updateIsOpen, setUpdateIsOpen] = useState(false);
  const [addClientIsOpen, setAddClientIsOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [successBanner, setSuccessBanner] = useState(false)
  const [errorBanner, setErrorBanner] = useState(false)
  const navigate = useNavigate();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Loading state
  const [loading, setLoading] = useState(true);

  // Sorting state
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('USER_ID');

  // check different screen sizes
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  // Define head cells with IDs for sorting
  const headCells = [
    { id: 'USER_ID', label: 'ID' },
    { id: 'NOMBRE_COMPLETO', label: 'Nombre' },
    { id: 'CORREO', label: 'Correo' },
    { id: 'DIRECCION', label: 'Dirección' },
    { id: 'ESTADO', label: 'Estado' },
  ];

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axiosInstance.get("http://localhost:8080/administradores/clientes");

        const clientesData = response.data;

        const clientesFormatted = clientesData.map(clienteArray => ({
          USER_ID: clienteArray[0],
          NOMBRE: clienteArray[1],
          APELLIDO: clienteArray[2],
          CORREO: clienteArray[3],
          CONTRASENA: clienteArray[4],
          ESTADO: clienteArray[5],
          DIRECCION: clienteArray[6]
        }));

        setClientes(clientesFormatted);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [refresh]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearchChange
 = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when search query changes
  };

  // Filter clients based on search query
  const filteredClientes = clientes.filter((cliente) => {
    const fullName = `${cliente.NOMBRE} ${cliente.APELLIDO}`.toLowerCase();
    const email = cliente.CORREO.toLowerCase(); 
    const usrId = cliente.USER_ID.toLowerCase();
    const search = searchQuery.toLowerCase();
    return fullName.includes(search) || email.includes(search) || usrId.includes(search);
  });

  // Add NOMBRE_COMPLETO to filteredClientes for sorting
  const filteredClientesWithFullName = filteredClientes.map((cliente) => ({
    ...cliente,
    NOMBRE_COMPLETO: `${cliente.NOMBRE} ${cliente.APELLIDO}`,
  }));


  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClose = () => {
    setAnchorEl(null);

  };

  const open = Boolean(anchorEl);

  const handleClickMenu = (event, client_p) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client_p)
    //setClientToUpdate(client_p)
    //setClientToSeeMascots(client_p)
  };

  const handleClickAdd = () => setAddClientIsOpen(true);

  const handleCloseAdd = () => {
    setAddClientIsOpen(false)
  }

  const handleCloseUpdate = () =>  {
    setUpdateIsOpen(false)
  }

  const handleClickUpdate = async () => {
    try {
      setUpdateIsOpen(true);
    } catch (error) {
    }
  }

  const handleClickDelete = () => {
    setDeleteIsOpen(true);
  };

  const handleCloseDelete = () =>  {
    setDeleteIsOpen(false)
  }

  const handleModalClose = (event, reason, closeAction) => {
    if (reason !== 'backdropClick') {
      closeAction();
    }
  };

  const handleClickMascotas = () => {
    navigate('/administradores/mascotas', { state: { client: selectedClient } }); 
  }

  const handleModificationSuccess = (success) => {
    handleClose()
    {deleteIsOpen?handleCloseDelete():""}
    {updateIsOpen?handleCloseUpdate():""}
    {addClientIsOpen?handleCloseAdd():""}
    if (success) {
      setRefresh(prevRefresh => prevRefresh + 1 )
      setSuccessBanner(true)
    } else {
      setErrorBanner(true)
    }
  }

  const handleCloseSuccessBanner = () => {
    setSuccessBanner(false)
  }

  const handleCloseErrorBanner = () => {
    setErrorBanner(false)
  }

  // Sorting functions
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  function descendingComparator(a, b, orderBy) {
    if
 (orderBy === 'ESTADO') { 
      return b[orderBy] - a[orderBy]; 
    }
    if (typeof a[orderBy] === 'string') {
      return b[orderBy].localeCompare(a[orderBy]);
    }
    return b[orderBy] - a[orderBy];
  }

  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a,   
 b, orderBy);
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

  // Sort data before rendering
  const sortedClientes = stableSort(
    filteredClientesWithFullName, 
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
    <Box sx={{ display: 'flex' }}>
      <SideMenu />
      <Box component="main" sx={(theme) => ({ flexGrow: 1, overflow: 'auto'})}>
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
              <SuccessAlert message={'La operación se realizó con éxito'}open={successBanner} onClose={handleCloseSuccessBanner}></SuccessAlert>
              <ErrorAlert message={'Hubo un problema realizando la operación, inténtelo más tarde'}open={errorBanner} onClose={handleCloseErrorBanner}></ErrorAlert>
                <Typography variant="h4" gutterBottom>
                  Clientes
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
                <Button variant="contained" size='medium' sx={{ backgroundColor: '#4976CB' }} onClick={handleClickAdd}>
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
                        <SearchIcon />
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
              {filteredClientes.length <= 0 
                  ? "No hay clientes disponibles o que cumplan con ese criterio de búsqueda" 
                  : ""}
                    <Box sx={{ display: 'grid', gridTemplateColumns: {xs: 'repeat(1, 1fr)', sm:'repeat(3, 3fr)',  md:'repeat(3, 3fr)'}, gap: {xs: 2, sm: 4, md: 4} }}>
                        {filteredClientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((currentCliente) => (
                            <Box key={currentCliente.USER_ID} sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 2, position: 'relative' }}>
                                <Typography variant="h6">{currentCliente.NOMBRE} {currentCliente.APELLIDO}</Typography>
                                <Typography><strong>Usuario: </strong>{currentCliente.USER_ID}</Typography>
                                <Typography><strong>Correo: </strong>{currentCliente.CORREO}</Typography>
                                <Typography><strong>Dirección: </strong>{currentCliente.DIRECCION}</Typography>
                                <Chip
                                  label={currentCliente.ESTADO === 1 ? 'Habilitado' : 'Deshabilitado'}
                                  color={currentCliente.ESTADO === 1 ? 'success' : 'error'}
                                  variant="outlined"
                                  sx={{
                                    
                                    borderWidth: 1,
                                  }}
                                />
                                <br />
                                <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                                  <Button
                                      id="basic-button"
                                      aria-controls={open ? 'basic-menu' : undefined}
                                      aria-haspopup="true"
                                      aria-expanded={open ? 'true' : undefined}

                                      onClick={(event) => { handleClickMenu(event,
                                        currentCliente) }}
                                    >
                                      <MoreHorizIcon />
                                    </Button>
                                </Box>
                                  {selectedClient && selectedClient.USER_ID == currentCliente.USER_ID ? <Menu
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    MenuListProps={{ 'aria-labelledby': 'basic-button'}}
                                  >
                                    <MenuItem onClick={() => handleClickUpdate()}>Editar</MenuItem>
                                    <MenuItem onClick={() => handleClickDelete()}>
                                      {currentCliente && currentCliente.ESTADO === 1 ? 'Deshabilitar' : 'Habilitar'}
                                    </MenuItem>
                                  </Menu>: ""}
                            </Box>
                            
                        ))}
                                                {/* Add Client Modal */}
                  <AddClientModal
                    open={addClientIsOpen}
                    onClose={(event, reason) => handleModalClose(event, reason, handleCloseAdd)}
                    handleModificationSuccess={handleModificationSuccess}
                  />
                {/* Delete Modal */}
                {deleteIsOpen && selectedClient && (
                  <Modal
                    open={deleteIsOpen}
                    onClose={(event, reason) => handleModalClose(event, reason, handleCloseDelete)}
                    client_p={selectedClient}
                    handleModificationSuccess={handleModificationSuccess}
                  />
                )}
                
                {/* Update Modal */}
                {updateIsOpen && selectedClient && (
                  <ModalUpdate
                    open={updateIsOpen}
                    onClose={(event, reason) => handleModalClose(event, reason, handleCloseUpdate)}
                    client_p={selectedClient}
                    handleModificationSuccess={handleModificationSuccess}
                  />
                )}
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
                    count={filteredClientes.length}
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
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    {headCells.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        sortDirection={orderBy === headCell.id ? order : false}
                      >
                        <TableSortLabel
                          active={orderBy === headCell.id}
                          direction={orderBy === headCell.id
 ? order : 'asc'}
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
                {filteredClientes.length<=0?<TableRow><TableCell colSpan={headCells.length + 1}> 
                {filteredClientes.length <= 0 
                  ? "No hay clientes disponibles o que cumplan con ese criterio de búsqueda" 
                  : ""}
  </TableCell></TableRow>:""}
                  {sortedClientes 
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((currentCliente) => (
                      <TableRow key={currentCliente.USER_ID}>
                        <TableCell>{currentCliente.USER_ID}</TableCell>
                        <TableCell>{currentCliente.NOMBRE_COMPLETO}</TableCell>
                        <TableCell>{currentCliente.CORREO}</TableCell>
                        <TableCell>{currentCliente.DIRECCION}</TableCell>
                        <TableCell>

                        <Chip
                          label={currentCliente.ESTADO === 1 ? 'Habilitado' : 'Deshabilitado'}
                          color={currentCliente.ESTADO === 1 ? 'success' : 'error'}
                          variant="outlined"
                          sx={{
                            
                            borderWidth: 1,
                          }}
                        />
                        </TableCell>
                        <TableCell>
                          <Button 
                            id="basic-button" 
                            aria-controls={open ? 'basic-menu' : undefined} 
                            aria-haspopup="true" 
                            aria-expanded={open ? 'true' : undefined}   
 
                            onClick={(event ) => {handleClickMenu(event,
 currentCliente) }}
                          >
                            <MoreHorizIcon />
                          </Button>
                          <Menu 
                            id="basic-menu"
                            anchorEl={anchorEl}
                            open={open} 
                            onClose={handleClose} 
                            MenuListProps={{ 'aria-labelledby': 'basic-button'   
 }}
                          >
                            <MenuItem   
 onClick={()=>handleClickUpdate()}>Editar</MenuItem>
                            <MenuItem onClick={()=>handleClickMascotas()} >Mascotas</MenuItem>
                            <MenuItem onClick={() => handleClickDelete()}>
                              {selectedClient && selectedClient.ESTADO === 1 ? 'Deshabilitar' : 'Habilitar'} 
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow> 
                    ))
                  }
                  {/* Add Client Modal */}
                  <AddClientModal
                    open={addClientIsOpen}
                    onClose={(event, reason) => handleModalClose(event, reason, handleCloseAdd)}
                    handleModificationSuccess={handleModificationSuccess}
                  />
                </TableBody>
                {/* Delete Modal */}
                {deleteIsOpen && selectedClient && (
                  <Modal
                    open={deleteIsOpen}
                    onClose={(event, reason) => handleModalClose(event, reason, handleCloseDelete)}
                    client_p={selectedClient}
                    handleModificationSuccess={handleModificationSuccess}
                  />
                )}
                
                {/* Update Modal */}
                {updateIsOpen && selectedClient && (
                  <ModalUpdate
                    open={updateIsOpen}
                    onClose={(event, reason) => handleModalClose(event, reason, handleCloseUpdate)}
                    client_p={selectedClient}
                    handleModificationSuccess={handleModificationSuccess}
                  />
                )}
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              labelRowsPerPage="Número de filas"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              count={filteredClientes.length} 
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>}
        </Stack>
      </Box>
    </Box>
  </div>
  
  );
}

export default ViewClients;
