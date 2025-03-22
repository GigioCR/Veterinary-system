import { React, useState, useEffect } from 'react';
import './ServicioPage.css';
import axiosInstance from '../../api/axiosInstance';
import SideMenu from '../admin/SideMenu';
import Header from '../admin/Header';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  Table, TableCell, TableContainer, TableHead, TableBody, TableRow, TablePagination,
  InputAdornment, IconButton, CircularProgress, TableSortLabel, Paper, Box, Stack,
  Typography, Button, Menu, MenuItem, Modal, TextField, FormGroup, 
  FormControl, Alert, Snackbar, Autocomplete
} from '@mui/material';
import Chip from '@mui/material/Chip';
import { Search, Close } from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import Cargando from '../general/loadingScreen';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

const listBoxStyle = {
  maxHeight: 120
};

// Style for modals
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const inputPropsStyle = {
  shrink: true, // Ensures the label stays on top
}

export default function ServicioPage() {
  const [errores, setErrores] = useState({});

  // Manage create modal
  const [openCreate, setOpenCreate] = useState(false);
  const handleOpenCreate = () => {
    setOpenCreate(true);
  };
  const handleCloseCreate = () => {
    setOpenCreate(false)
    setServicio((prev) => ({ ...prev, NOMBRE: "" }));
    setServicio((prev) => ({ ...prev, DESCRIPCION: "" }));
    setServicio((prev) => ({ ...prev, PRECIO: "" }));
    setErrores('')
  };

  // Manage edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const handleOpenEdit = () => {
    setOpenEdit(true);
    setSelectedTipo({
      ID_TIPO: tableRecord.TIPO,
      NOMBRE: tableRecord.TIPO_NOMBRE,
    })
    console.log(selectedTipo)
  };
  const handleCloseEdit = () => setOpenEdit(false);
  const [tableRecord, setTableRecord] = useState({});

  // Store array of services in database
  const [services, setServices] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const theme = useTheme();
  
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const [servicio, setServicio] = useState({
    ID_SERVICIO: "",
    NOMBRE: "",
    TIPO: "",
    TRATAMIENTO: "",
    DESCRIPCION: "",
    PRECIO: "",
    ESTADO: ""
  })

  // Handle create form submit
  const handleSubmitCreate = async (e) => {
    e.preventDefault();

    // validating form
    const newErrores = {}
    const numbersRegex = /^\d+$/;
    if (servicio.NOMBRE.length <= 0) {
      newErrores.NOMBRE = true
    }
    if (servicio.TIPO.length <= 0) {
      newErrores.TIPO = true
    }
    if (servicio.DESCRIPCION.length <= 0) {
      newErrores.DESCRIPCION = true
    }
    if (!numbersRegex.test(servicio.PRECIO) || servicio.PRECIO.length <= 0) {
      newErrores.PRECIO = true
    }

    setErrores(newErrores)

    if (Object.keys(newErrores).length > 0) {
      return
    } else {
      // const service = { nombre, tipo, descripcion, precio };
      console.log(servicio)
      await axiosInstance
        .post('http://localhost:8080/administradores/servicios', servicio)
        .then((response) => {
          console.log(servicio);
          console.log(response);
          handleCloseCreate();
          setRefresh(prevRefresh => prevRefresh + 1 );
          setCreateHappened(true)
        })
        .catch((error) => {
          console.log(error);
        })
    }
  };

  // manage live form validation
  const handleChange = (e, newValue) => {
    // actualiza la info de la mascota
    setServicio((prev) => ({...prev, [e.target.name]: e.target.value}))
    // actualiza si hubieron errores en form
    setErrores((prevErrores) => ({ ...prevErrores, [e.target.name]: false }))


    if (e.target.name) {
      setServicio((prev) => ({...prev, [e.target.name]: e.target.value}))
      
    } else {
      if (newValue) {
          if (newValue.ID_TIPO) {
            setServicio((prev) => ({ ...prev, TIPO: newValue.ID_TIPO }));
          }
          if (newValue.ID_TRATAMIENTO) {
            setServicio((prev) => ({ ...prev, TRATAMIENTO: newValue.ID_TRATAMIENTO }));
          }
      } else {
        setServicio((prev) => ({ ...prev, TIPO: "" }));
        setServicio((prev) => ({ ...prev, ID_TRATAMIENTO: "" }));
      }
    }
    setErrores((prevErrores) => ({ ...prevErrores, [e.target.name]: false }));
  }

  // Handle update form submit
  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    // validating form
    const newErrores = {}
    const numbersRegex = /^\d+$/;
    if (servicio.NOMBRE.length <= 0) {
      newErrores.NOMBRE = true
    }
    if (servicio.TIPO.length <= 0) {
      newErrores.TIPO = true
    }
    if (servicio.DESCRIPCION.length <= 0) {
      newErrores.DESCRIPCION = true
    }
    if (!numbersRegex.test(servicio.PRECIO) || servicio.PRECIO.length <= 0) {
      newErrores.PRECIO = true
    }

    setErrores(newErrores)

    if (Object.keys(newErrores).length > 0) {
      return
    } else {
      // const service = { nombre, tipo, descripcion, precio, id: tableRecord.ID_SERVICIO };

      await axiosInstance
        .put('http://localhost:8080/administradores/servicios', servicio)
        .then((response) => {
          console.log(response);
          handleCloseEdit();
          setRefresh(prevRefresh => prevRefresh + 1 );
          setEditHappened(true)
        })
        .catch((error) => {
          console.log(error);
      });
    }
    console.log(servicio)
  };

  const [refresh, setRefresh] = useState(0);

  // on render
  useEffect(() => {
    fetchServicios();
    fetchTipos();
    fetchTratamientos();
    setErrores('');
  }, [refresh]);

  // Get services to display them
  const fetchServicios = async () => {
    try {
      const response = await axiosInstance.get("http://localhost:8080/administradores/servicios");

      const serviciosData = response.data;

      const serviciosFormatted = serviciosData.map(serviciosArray => ({
        ID_SERVICIO: serviciosArray[0],
        NOMBRE: serviciosArray[1],
        TIPO: serviciosArray[2],
        TIPO_NOMBRE: serviciosArray[3],
        DESCRIPCION: serviciosArray[4],
        PRECIO: serviciosArray[5],
        ESTADO: serviciosArray[6],
        TRATAMIENTO: (serviciosArray[7] ? serviciosArray[7] : "")
      }));

      setServices(serviciosFormatted);
      console.log(serviciosFormatted)
    } catch (err) {
      console.error('Error fetching servicios', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTratamientos = async () => {
    try {
      await axiosInstance.get(`http://localhost:8080/administradores/tratamientos`
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

  // Fetch function for tipos de cita
  const fetchTipos = async () => {
    try {
      const res = await axiosInstance.get('http://localhost:8080/administradores/tipos_cita');
      setTipos(res.data);
      console.log(res.data)
    } catch (err) {
      console.error('Error fetching tipos de servicios', err);
    }
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

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Search handler
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setTableRecord(row);
    setServicio(row);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setServicio((prev) => ({ ...prev, NOMBRE: "" }));
    setServicio((prev) => ({ ...prev, DESCRIPCION: "" }));
    setServicio((prev) => ({ ...prev, PRECIO: "" }));
  };

  const [openToggleConfirm, setOpenToggleConfirm] = useState(false);

  // Toggle Confirmation Modal handlers
  const handleOpenToggleConfirm = () => {
    setOpenToggleConfirm(true);
    handleClose();
  };

  const handleCloseToggleConfirm = () => setOpenToggleConfirm(false);

  // Toggle service state
  const handleToggleEstado = async () => {
    try {
      const newEstado = tableRecord.ESTADO == 1 ? 0 : 1;
      await axiosInstance.put('http://localhost:8080/administradores/servicios/estado/:id', {
        estado: newEstado,
        id: tableRecord.ID_SERVICIO,
      });
      handleCloseToggleConfirm();
      setRefresh(prevRefresh => prevRefresh + 1 );
      setChangeStateHappened(true)
    } catch (err) {
      console.error('Error toggling service state', err);
    }
  };

  // state variables and methods for confirmation alerts
  const [createHappened, setCreateHappened ] = useState(false);
  const closeCreateConfirmAlert = () => {
    setCreateHappened(false)
  };

  const [editHappened, setEditHappened ] = useState(false);
  const closeEditConfirmAlert = () => {
    setEditHappened(false)
  };

  const [changeStateHappened, setChangeStateHappened ] = useState(false);
  const closeChangeStateConfirmAlert = () => {
    setChangeStateHappened(false)
  };

  // Sorting state
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('NOMBRE');

  // Define head cells
  const headCells = [
    { id: 'NOMBRE', label: 'Nombre' },
    { id: 'TIPO', label: 'Tipo' },
    { id: 'TRATAMIENTO', label: 'Tratamiento' },
    { id: 'DESCRIPCION', label: 'Descripción' },
    { id: 'PRECIO', label: 'Precio' },
    { id: 'ESTADO', label: 'Estado' },
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
  
  // Filter services based on name search query
  const filteredServices = services.filter((service) => {
    const nombre = service.NOMBRE.toLowerCase();
    const tipo = service.TIPO.toLowerCase();
    const descripcion = service.DESCRIPCION.toLowerCase();
    const tratamiento = service.TRATAMIENTO.toLowerCase();
    const search = searchQuery.toLowerCase();
    return nombre.includes(search) || tipo.includes(search) || tratamiento.includes(search) || descripcion.includes(search);
  });
  // Sort data before rendering
  const sortedServices = stableSort(
    filteredServices,
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
      {/* Modal to create a new service */}
      <Modal
        open={openCreate}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseCreate();
          }
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Agregar servicio
            </Typography>
            <IconButton onClick={handleCloseCreate}>
              <Close />
            </IconButton>
          </Box>
          <Box data-testid='addForm' component="form" noValidate onSubmit={handleSubmitCreate}>
            <FormGroup>
              <TextField label='Nombre' variant="outlined" fullWidth margin="normal"
                inputProps={{ maxLength: 50, "data-testid": "name-input" }}
                InputLabelProps={inputPropsStyle}
                value={servicio.NOMBRE}
                onChange={handleChange}
                error = {errores.NOMBRE}
                helperText= {errores.NOMBRE ? "Por favor escriba el nombre del servicio." : ""}
                required
                name = "NOMBRE"
              />

              {/* Tipos Dropdown */}
              <FormControl fullWidth margin="normal" variant="outlined">
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  ListboxProps={{ style: listBoxStyle }}
                  
                  margin="normal"
                  fullWidth
                  options={tipos}
                    getOptionLabel={(option) => `${option.NOMBRE}`}
                  onChange={handleChange}
                  renderInput={(params) => <TextField required {...params} label="Tipo" name='TIPO' error = {errores.TIPO}
                  helperText = {errores.TIPO? "Por favor seleccione un tipo.":""} value={servicio.TIPO} InputLabelProps={inputPropsStyle} />}
                />
              </FormControl>

              {/* Tratamiento Dropdown */}
              <FormControl fullWidth margin="normal" variant="outlined">
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  ListboxProps={{ style: listBoxStyle }}
                  
                  margin="normal"
                  fullWidth
                  options={tratamientos}
                    getOptionLabel={(option) => `${option.ID_TRATAMIENTO}: ${option.NOMBRE_TRATAMIENTO}`}
                  onChange={handleChange}
                  renderInput={(params) => <TextField {...params} label="Tratamiento" name='TRATAMIENTO' value={servicio.TRATAMIENTO} InputLabelProps={inputPropsStyle} />}
                />
              </FormControl>

              <TextField required label="Descripción" variant="outlined" fullWidth margin="normal"
                inputProps={{ maxLength: 500, "data-testid": "addDescripcion" }}
                value={servicio.DESCRIPCION}
                InputLabelProps={inputPropsStyle}
                onChange={handleChange}
                error = {errores.DESCRIPCION}
                helperText = {errores.DESCRIPCION ? "Por favor escriba una descripción del servicio." : ""}
                name='DESCRIPCION'
              />
              <TextField required data-testid="addPrecio" label="Precio" type="number" variant="outlined" fullWidth margin="normal"
                value={servicio.PRECIO}
                onChange={handleChange}
                InputLabelProps={inputPropsStyle}
                error = {errores.PRECIO}
                helperText = {errores.PRECIO ? "Por favor ingrese un precio válido. Solo se aceptan caracteres númericos." : ""}
                name='PRECIO'
                // InputProps={{
                //   startAdornment: (<InputAdornment focused={inputState}>₡</InputAdornment>),
                // }}
              />


            </FormGroup>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={handleCloseCreate}>Cancelar</Button>
              <Button aria-label='confirmAddButton' variant="contained" sx={{ backgroundColor: '#4976CB' }} type="submit">
                Agregar
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Modal to edit a service */}
      <Modal
        open={openEdit}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseEdit();
          }
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Editar servicio
            </Typography>
            <IconButton onClick={handleCloseEdit}>
              <Close />
            </IconButton>
          </Box>
          <form onSubmit={handleSubmitEdit} noValidate>
            <FormGroup>
              <TextField required label="Nombre" defaultValue={tableRecord.NOMBRE} variant="outlined" fullWidth margin="normal" inputProps={{ maxLength: 50 }}
                onChange={handleChange}
                InputLabelProps={inputPropsStyle}
                error = {errores.NOMBRE}
                helperText= {errores.NOMBRE ? "Por favor escriba el nombre del servicio." : ""}
                name = "NOMBRE"
              />

              {/* Tipos Dropdown */}
              <FormControl fullWidth margin="normal" variant="outlined">
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  ListboxProps={{ style: listBoxStyle }}
                  margin="normal"
                  fullWidth
                  defaultValue={selectedTipo}
                  options={tipos}
                  getOptionLabel={(option) => `${option.NOMBRE}`}
                  onChange={handleChange}
                  renderInput={(params) => <TextField required {...params} label="Tipo" name='TIPO' error = {errores.TIPO}
                  helperText = {errores.TIPO? "Por favor seleccione un tipo.":""} value={tableRecord.TIPO} InputLabelProps={inputPropsStyle} />}
                />
              </FormControl>
              
              <TextField required label="Descripción" defaultValue={tableRecord.DESCRIPCION} variant="outlined" fullWidth margin="normal" inputProps={{ maxLength: 500 }}
                onChange={handleChange}
                InputLabelProps={inputPropsStyle}
                error = {errores.DESCRIPCION}
                helperText = {errores.DESCRIPCION ? "Por favor escriba una descripción del servicio." : ""}
                name='DESCRIPCION'
              />
              <TextField required label="Precio" defaultValue={tableRecord.PRECIO} type="number" variant="outlined" fullWidth margin="normal"
                onChange={handleChange}
                InputLabelProps={inputPropsStyle}
                error = {errores.PRECIO}
                helperText = {errores.PRECIO ? "Por favor ingrese un precio válido. Solo se aceptan caracteres númericos." : ""}
                name='PRECIO'
                // InputProps={{
                //   startAdornment: (
                //     <InputAdornment position="start">₡</InputAdornment>
                //   )
                // }}
              />
            </FormGroup>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={handleCloseEdit}>Cancelar</Button>
              <Button aria-label='confirmEditButton' variant="contained" color="primary" type="submit">
                Guardar Cambios
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Modal to toggle service state */}
      <Modal
        open={openToggleConfirm}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseToggleConfirm();
          }
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="h2">
              Confirmar {tableRecord.ESTADO == 1 ? 'Deshabilitar' : 'Habilitar'}
            </Typography>
            <IconButton onClick={handleCloseToggleConfirm}>
              <Close />
            </IconButton>
          </Box>
          <Typography>
            ¿Está seguro de que desea {tableRecord.ESTADO == 1 ? 'deshabilitar' : 'habilitar'} el servicio {tableRecord.NOMBRE}?
          </Typography>


          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={handleCloseToggleConfirm} sx={{ mr: 2 }}>Cancelar</Button>
            <Button
              variant="contained"
              color={tableRecord.ESTADO === 1 ? 'primary' : 'primary'}
              onClick={handleToggleEstado}
            >
              {tableRecord.ESTADO === 1 ? 'Deshabilitar' : 'Habilitar'}
            </Button>
          </Box>

        </Box>
      </Modal>

      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        {/* Main content */}
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Header />
          <Stack sx={{ alignItems: 'center', mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
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
                    Servicios
                  </Typography>
                </Box>
                <Box sx={{ gridArea: 'sidebar', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                  <Button aria-label='addButton' variant="contained" sx={{ backgroundColor: '#4976CB' }} onClick={handleOpenCreate}>
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

            {/* create confirmation alert */}
            <Snackbar open={createHappened} autoHideDuration={4000} onClose={closeCreateConfirmAlert}>
              <Alert
                onClose={closeCreateConfirmAlert}
                severity="success"
                sx={{ width: '100%' }}
              >
                El servicio fue agregado exitosamente.
              </Alert>
            </Snackbar>

            {/* edit confirmation alert */}
            <Snackbar open={editHappened} autoHideDuration={4000} onClose={closeEditConfirmAlert}>
              <Alert
                onClose={closeEditConfirmAlert}
                severity="success"
                sx={{ width: '100%' }}
              >
                Se guardaron los cambios exitosamente.
              </Alert>
            </Snackbar>

            {/* change state confirmation alert */}
            <Snackbar open={changeStateHappened} autoHideDuration={4000} onClose={closeChangeStateConfirmAlert}>
              <Alert
                onClose={closeChangeStateConfirmAlert}
                severity="success"
                sx={{ width: '100%' }}
              >
                Se cambió el estado del servicio exitosamente.
              </Alert>
            </Snackbar>
            {isSmallScreen ||  isMediumScreen ? (
            <Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: {xs: 'repeat(1, 1fr)', sm:'repeat(3, 3fr)',  md:'repeat(3, 3fr)'}, gap: {xs: 2, sm: 4, md: 4} }}>
                    {sortedServices.length <= 0 
              ? "No hay servicios disponibles o que cumplan con ese criterio de búsqueda" 
              : ""}
                        {sortedServices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((service) => (
                            <Box key={service.ID_SERVICIO} sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 2, position:'relative' }}>
                                <Typography variant="h6">{service.NOMBRE}</Typography>
                                <Typography><strong>Nombre: </strong>{service.NOMBRE}</Typography>
                                <Typography><strong>Tipo: </strong>{service.TIPO}</Typography>
                                <Typography><strong>Tratamiento: </strong>{service.TRATAMIENTO}</Typography>
                                <Typography><strong>Descripción: </strong>{service.DESCRIPCION}</Typography>
                                <Typography><strong>Precio: </strong>₡{service.PRECIO}</Typography>
                          <Chip
                          label={service.ESTADO === 1 ? 'Habilitado' : 'Deshabilitado'}
                          color={service.ESTADO === 1 ? 'success' : 'error'}
                          variant="outlined"
                          sx={{
                            
                            borderWidth: 1,
                          }}
                        />
                        <br />
                        <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                          <Button id="basic-button" aria-label='actions' aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={(event) => { handleClick(event, service); }}>
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
                          <MenuItem role='button' aria-label='editButton' onClick={handleOpenEdit}>Editar</MenuItem>
                          <MenuItem role='button' aria-label='changeStateButton' onClick={handleOpenToggleConfirm}>
                            {tableRecord.ESTADO == 1 ? 'Deshabilitar' : 'Habilitar'}
                          </MenuItem>
                        </Menu>
                            </Box>
                            
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                    <TablePagination
                    sx={{}}
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    labelRowsPerPage="Número de filas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    count={sortedServices.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                    </Box>
                    </Box>
                  ) :
            <Box sx={{ width: '100%' , pt: 2}}>
              <TableContainer component={Paper} sx={{pt:4}}>
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
                    {sortedServices
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((service) => (
                      <TableRow key={service.ID_SERVICIO}>
                        <TableCell>{service.NOMBRE}</TableCell>
                        <TableCell>{service.TIPO}</TableCell>
                        <TableCell>{service.TRATAMIENTO}</TableCell>
                        <TableCell>{service.DESCRIPCION}</TableCell>
                        <TableCell>₡{service.PRECIO}</TableCell>
                        <TableCell>
                        <Chip
                          label={service.ESTADO === 1 ? 'Habilitado' : 'Deshabilitado'}
                          color={service.ESTADO === 1 ? 'success' : 'error'}
                          variant="outlined"
                          sx={{
                            
                            borderWidth: 1,
                          }}
                        />
                        </TableCell>
                        <TableCell>
                          <Button id="basic-button" aria-label='actions' aria-controls={open ? 'basic-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={(event) => { handleClick(event, service); }}>
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
                          <MenuItem role='button' aria-label='editButton' onClick={handleOpenEdit}>Editar</MenuItem>
                          <MenuItem role='button' aria-label='changeStateButton' onClick={handleOpenToggleConfirm}>
                            {tableRecord.ESTADO == 1 ? 'Deshabilitar' : 'Habilitar'}
                          </MenuItem>
                        </Menu>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredServices.length}
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
            </Box>}
          </Stack>
        </Box>
      </Box>
    </div>
  );


}