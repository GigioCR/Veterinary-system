import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios
import axiosInstance from '../../api/axiosInstance';
import Modal from "./ModalDeleteMascot";
import ModalUpdate from "./ModalUpdateMascot"
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
import AddMascotWithClient from './AddMascotWithClient';
import AddMascotModal from "./AddMascot"
import InputAdornment from '@mui/material/InputAdornment'; 
import SearchIcon from '@mui/icons-material/Search'; 
import { visuallyHidden } from '@mui/utils';
import TableSortLabel from '@mui/material/TableSortLabel';
import { useLocation } from 'react-router-dom';
import SuccessAlert from '../alerts/SuccessAlert';
import ErrorAlert from '../alerts/ErrorAlert';
import { CircularProgress } from '@mui/material';
import Cargando from '../general/loadingScreen';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';


function ViewMascots() {
    const [mascots, setMascots] = useState([]);
    const [deleteIsOpen, setDeleteIsOpen] = useState(false);
    const [updateIsOpen, setUpdateIsOpen] = useState(false);
    const [addMascotIsOpen, setAddMascotIsOpen] = useState(false);
    const [addMascotWithClientOpen, setAddMascotWithClientOpen] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [selectedMascot, setSelectedMascot] = useState(null)
    const [anchorEl, setAnchorEl] = useState(null);
    const [successBanner, setSuccessBanner] = useState(false)
    const [errorBanner, setErrorBanner] = useState(false)
    const [removedFilter, setRemoveFilter] = useState(false)
    
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    // Loading state
    const [loading, setLoading] = useState(true);
    const [clientFilter, setClientFilter] = useState('')
    // para poder agarrar al client en caso de que se llegue a acá desde clientes
    const location = useLocation();

    // Sorting state
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('NOMBRE_MASCOTA'); // Default sorting

  const theme = useTheme();
  
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  // Define head cells with IDs for sorting
  const headCells = [
    { id: 'DUEÑO', label: 'Dueño' },
    { id: 'NOMBRE_MASCOTA', label: 'Nombre' },
    { id: 'SPECIES', label: 'Especie' },
    { id: 'BREED', label: 'Raza' },
    { id: 'AGE', label: 'Edad' },
    { id: 'WEIGHT', label: 'Peso' },
    { id: 'ESTADO', label: 'Estado' },
  ];

  useEffect(() => {
    //console.log("fetch en view mascotas")
    //console.log("mi cliente es: " + client.USER_ID)
    const fetchMascots = async () => {
      try {
        // si se ingresó desde un cliente asigna el filtro
        if (location.state?.client && !removedFilter) {
          setClientFilter(location.state.client);
        }
        const response = await axiosInstance.get("http://localhost:8080/administradores/mascotas");

        const mascotsData = response.data;

        const mascotsFormatted = mascotsData.map(mascotsArray => ({
          USER_ID: mascotsArray[0],
          NOMBRE_CLIENTE: mascotsArray[1],
          APELLIDO_CLIENTE: mascotsArray[2],
          ID_MASCOTA: mascotsArray[3],
          NOMBRE_MASCOTA: mascotsArray[4],
          SPECIES: mascotsArray[5],
          BREED: mascotsArray[6],
          WEIGHT: mascotsArray[7],
          AGE: mascotsArray[8],
          ESTADO: mascotsArray[9]
        }));

        setMascots(mascotsFormatted);
      } catch (error) {
        console.error('Error fetching mascots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMascots();
  }, [refresh]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
};

const handleClearClient = () => {
  setClientFilter(null);
  setRemoveFilter(true)
};

// Custom handler to prevent modal from closing on backdrop click
const handleModalClose = (event, reason, closeAction) => {
  if ( reason !== 'backdropClick') {
      closeAction();
  }
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

// Filter mascots based on search query
const filteredMascots = mascots.filter((mascot) => {
  const matchesClient = !clientFilter || mascot.USER_ID === clientFilter.USER_ID; 
  const owner =  `${mascot.NOMBRE_CLIENTE} ${mascot.APELLIDO_CLIENTE}`.toLowerCase();
  const name = `${mascot.NOMBRE_MASCOTA}`.toLowerCase();
  const breed = mascot.BREED.toLowerCase(); 
  const species = mascot.SPECIES.toLowerCase();
  const search = searchQuery.toLowerCase();
  return matchesClient && (name.includes(search) || owner.includes(search) || breed.includes(search) || species.includes(search));
});

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleClickMenu = (event, mascot_p) => {
    setAnchorEl(event.currentTarget);
    setSelectedMascot(mascot_p)
  };

  const handleClickAdd = () => {
    if (clientFilter) {
      setAddMascotWithClientOpen(true)
    } else {
      console.log("NO hay un cliente activo")
      setAddMascotIsOpen(true)
    }
  }
  const handleCloseAdd = () => {
    setAddMascotIsOpen(false)
    setAddMascotWithClientOpen(false)
  }

  const handleCloseUpdate = () => 
  {
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

  const handleCloseDelete = () => 
    {
      setDeleteIsOpen(false)
    }

  const handleModificationSuccess = (success) => {
    handleClose()
    {deleteIsOpen?handleCloseDelete():""}
    {updateIsOpen?handleCloseUpdate():""}
    {addMascotIsOpen?handleCloseAdd():""}
    if (success) {
      setRefresh(prevRefresh => prevRefresh + 1 )
      setSuccessBanner(true)
    } else {
      setErrorBanner(true)
    }
  }

  const handleCloseErrorBanner = () => {
    setErrorBanner(false)
  }

  const handleCloseSuccessBanner = () => {
    setSuccessBanner(false)
  }

  const filteredMascotsWithOwner = filteredMascots.map((mascot) => ({
    ...mascot,
    DUEÑO: `${mascot.NOMBRE_CLIENTE} ${mascot.APELLIDO_CLIENTE}`,
  }));

  // Sort data before rendering
  const sortedMascots = stableSort(
    filteredMascotsWithOwner,
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
      <Box component="main" sx={(theme) => ({ flexGrow: 1, overflow: 'auto' })}>
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
                <ErrorAlert message={'Hubo un problema realizando la operación, inténtelo más tarde'}open={errorBanner} onClose={handleCloseErrorBanner}></ErrorAlert>
                <SuccessAlert message={'La operación se realizó con éxito'}open={successBanner} onClose={handleCloseSuccessBanner}></SuccessAlert>
                <Typography variant="h4" gutterBottom>
                  {!clientFilter ? "Mascotas" : `Mascotas de: ${clientFilter.NOMBRE} ${clientFilter.APELLIDO}`}
                  {clientFilter ? (
                    <Button variant="outlined" size='small' onClick={() => handleClearClient()}>
                      X
                    </Button>
                  ) : ""}
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
              {filteredMascots.length <= 0 
              ? "No hay mascotas disponibles o que cumplan con ese criterio de búsqueda" 
              : ""}
                    <Box sx={{ display: 'grid', gridTemplateColumns: {xs: 'repeat(1, 1fr)', sm:'repeat(3, 3fr)',  md:'repeat(3, 3fr)'}, gap: {xs: 2, sm: 4, md: 4} }}>
                        {filteredMascots.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((mascot) => (
                            <Box key={mascot.ID_MASCOTA} sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 2, position: 'relative' }}>
                                <Typography variant="h6">{mascot.NOMBRE_MASCOTA}</Typography>
                                <Typography><strong>Dueño: </strong>{mascot.NOMBRE_CLIENTE} {mascot.APELLIDO_CLIENTE}</Typography>
                                <Typography><strong>Especie: </strong>{mascot.SPECIES}</Typography>
                                <Typography><strong>Raza: </strong> {mascot.BREED}</Typography>
                                <Typography><strong>Edad: </strong>{mascot.AGE} años</Typography>
                                <Typography><strong>Peso: </strong>{mascot.WEIGHT} kg</Typography>
                                <Chip
                                  label={mascot.ESTADO === 1 ? 'Habilitada' : 'Deshabilitada'}
                                  color={mascot.ESTADO === 1 ? 'success' : 'error'}
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
                                        mascot) }}
                                    >
                                      <MoreHorizIcon />
                                    </Button>
                                </Box>
                                  {selectedMascot && selectedMascot.ID_MASCOTA == mascot.ID_MASCOTA ? <Menu
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    MenuListProps={{ 'aria-labelledby': 'basic-button'}}
                                  >
                                    <MenuItem onClick={() => handleClickUpdate()}>Editar</MenuItem>
                                    <MenuItem onClick={() => handleClickDelete()}>
                                      {selectedMascot && selectedMascot.ESTADO === 1 ? 'Deshabilitar' : 'Habilitar'}
                                    </MenuItem>
                                  </Menu>: ""}
                            </Box>
                            
                        ))}
                                                {addMascotIsOpen && (
                            <AddMascotModal
                                open={addMascotIsOpen}
                                onClose={(event, reason) => handleModalClose(event, reason, handleCloseAdd)}
                                handleModificationSuccess={handleModificationSuccess}
                            />
                        )}
                        {clientFilter && (
                            <AddMascotWithClient
                                open={addMascotWithClientOpen}
                                onClose={(event, reason) => handleModalClose(event, reason, handleCloseAdd)}
                                handleModificationSuccess={handleModificationSuccess}
                                p_client={clientFilter}
                            />
                        )}
                        {deleteIsOpen && selectedMascot && (
                            <Modal
                                open={deleteIsOpen}
                                onClose={(event, reason) => handleModalClose(event, reason, handleCloseDelete)}
                                mascot_p={selectedMascot}
                                handleModificationSuccess={handleModificationSuccess}
                            />
                        )}

                        
                        {updateIsOpen && selectedMascot && (
                            <ModalUpdate
                                open={updateIsOpen}
                                onClose={(event, reason) => handleModalClose(event, reason, handleCloseUpdate)}
                                mascot_p={selectedMascot}
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
                    count={filteredMascots.length}
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
                                  onClick={(event) => handleRequestSort(event,   
                                            headCell.id)}
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
                        {filteredMascots.length<=0?<TableRow><TableCell colSpan={headCells.length + 1}> 
            {filteredMascots.length <= 0 
              ? "No hay mascotas disponibles o que cumplan con ese criterio de búsqueda" 
              : ""}
          </TableCell></TableRow>:""}
                          {sortedMascots
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((currentMascota) => (
                              <TableRow key={currentMascota.ID_MASCOTA}>
                                <TableCell>{currentMascota.DUEÑO}</TableCell>
                                <TableCell>{currentMascota.NOMBRE_MASCOTA}</TableCell>
                                <TableCell>{currentMascota.SPECIES}</TableCell>
                                <TableCell>{currentMascota.BREED}</TableCell>
                                <TableCell>{currentMascota.AGE} años</TableCell>
                                <TableCell>{currentMascota.WEIGHT} kg</TableCell>
                                <TableCell>
                                <Chip
                                  label={currentMascota.ESTADO === 1 ? 'Habilitada' : 'Deshabilitada'}
                                  color={currentMascota.ESTADO === 1 ? 'success' : 'error'}
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

                                    onClick={(event) => { handleClickMenu(event,
                                      currentMascota) }}
                                  >
                                    <MoreHorizIcon />
                                  </Button>
                                  <Menu
                                    id="basic-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    MenuListProps={{ 'aria-labelledby': 'basic-button'}}
                                  >
                                    <MenuItem onClick={() => handleClickUpdate()}>Editar</MenuItem>
                                    <MenuItem onClick={() => handleClickDelete()}>
                                      {selectedMascot && selectedMascot.ESTADO === 1 ? 'Deshabilitar' : 'Habilitar'}
                                    </MenuItem>
                                  </Menu>
                                </TableCell>
                              </TableRow>
                            ))
                          }
                          </TableBody>
                        {addMascotIsOpen && (
                            <AddMascotModal
                                open={addMascotIsOpen}
                                onClose={(event, reason) => handleModalClose(event, reason, handleCloseAdd)}
                                handleModificationSuccess={handleModificationSuccess}
                            />
                        )}
                        {clientFilter && (
                            <AddMascotWithClient
                                open={addMascotWithClientOpen}
                                onClose={(event, reason) => handleModalClose(event, reason, handleCloseAdd)}
                                handleModificationSuccess={handleModificationSuccess}
                                p_client={clientFilter}
                            />
                        )}
                        {deleteIsOpen && selectedMascot && (
                            <Modal
                                open={deleteIsOpen}
                                onClose={(event, reason) => handleModalClose(event, reason, handleCloseDelete)}
                                mascot_p={selectedMascot}
                                handleModificationSuccess={handleModificationSuccess}
                            />
                        )}

                        
                        {updateIsOpen && selectedMascot && (
                            <ModalUpdate
                                open={updateIsOpen}
                                onClose={(event, reason) => handleModalClose(event, reason, handleCloseUpdate)}
                                mascot_p={selectedMascot}
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
                      count={filteredMascots.length}
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

export default ViewMascots;
