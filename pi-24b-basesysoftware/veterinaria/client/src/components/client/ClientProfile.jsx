import { React, useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import SideMenu from './SideMenu';
import Header from './Header';
import {
  Modal, Box, Typography, IconButton, CircularProgress,
  TextField, FormGroup, Button, InputAdornment
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Close } from '@mui/icons-material';
import SuccessAlert from '../alerts/SuccessAlert';
import ErrorAlert from '../alerts/ErrorAlert';
import Cargando from '../general/loadingScreen'; 

const inputPropsStyle = {
  shrink: true, // Ensures the label stays on top
}

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

export default function ClientProfile() {

  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [visible, setVisible] = useState(false);
  const [errores, setErrores] = useState({});
  const [userPassword, setUserPassword] = useState({
    ID: localStorage.getItem('userId'),
    CONTRASENA_ACTUAL: "",
    CONTRASENA_NUEVA: "",
    CONTRASENA_CONFIRMADA: "",
    HASH: ""
  })   
  const [userData, setUserData] = useState({})   
  const [successBanner, setSuccessBanner] = useState(false)
  const [errorBanner, setErrorBanner] = useState(false)

  // handle closing alerts
  const handleCloseSuccessBanner = () => {
    setSuccessBanner(false)
  }
  // handle closing alerts
  const handleCloseErrorBanner = () => {
    setErrorBanner(false)
  }

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  // Manage change password modal
  const [openPasswordChange, setOpenPasswordChange] = useState(false);
  const handleOpenPasswordChange = () => {
    setOpenPasswordChange(true);
  };
  const handleClosePasswordChange = () => {
    setOpenPasswordChange(false)
    setErrores('')
    setUserPassword((prev) => ({...prev, CONTRASENA_ACTUAL: ""}))
    setUserPassword((prev) => ({...prev, CONTRASENA_NUEVA: ""}))
    setUserPassword((prev) => ({...prev, CONTRASENA_CONFIRMADA: ""}))
  };

  // Manage edit profile modal
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const handleOpenEditProfile = () => {
    setOpenEditProfile(true);
  };
  const handleCloseEditProfile = () => {
    setOpenEditProfile(false)
    setErrores('')
  };

  // on render
  useEffect(() => {
    fetchInfo();
  }, [refresh]);

  // Get count info to display
  const fetchInfo = async () => {
    try {
      await axiosInstance.get(`http://localhost:8080/clientes/perfil/${localStorage.getItem('userId')}`
    ).then((res) => {
        const dataReformatted = res.data.map(dataArray => ({
          ID: dataArray[0],
          NOMBRE: dataArray[1],
          APELLIDO: dataArray[2],
          CORREO: dataArray[3],
          CONTRASENA: dataArray[4],
          DIRECCION: (dataArray[5] ? dataArray[5] : "")
        }))
        setData(dataReformatted)
        setUserData(dataReformatted[0])
        setUserPassword((prev) => ({...prev, HASH: dataReformatted[0].CONTRASENA}))
        console.log(dataReformatted)
        console.log(userData)
      })
    } catch (err) {
      console.error("Error fetching profile info", err)
    } finally {
      setLoading(false)
    }
  };

  // Handle password change
  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();

    // validating form
    const newErrores = {}
    // Al menos una mayúsucula, una minúscula, un número y un caracter especial
    const contrasenaRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!contrasenaRegex.test(userPassword.CONTRASENA_ACTUAL) || userPassword.CONTRASENA_ACTUAL.length > 50 || userPassword.CONTRASENA_ACTUAL.length <= 8) {
      newErrores.CONTRASENA_ACTUAL = true;
    }
    if (!contrasenaRegex.test(userPassword.CONTRASENA_NUEVA) || userPassword.CONTRASENA_NUEVA.length > 50 || userPassword.CONTRASENA_NUEVA.length <= 8) {
      newErrores.CONTRASENA_NUEVA = true;
    }

    if (userPassword.CONTRASENA_NUEVA != userPassword.CONTRASENA_CONFIRMADA) {
      newErrores.CONTRASENA_CONFIRMADA = true;
    }

    // check that the current password matches its database hash
    await axiosInstance
    .put(`http://localhost:8080/clientes/perfil/contrasena/check/${localStorage.getItem('userId')}`, userPassword)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
      newErrores.CONTRASENA_ACTUAL = true;
    });

    setErrores(newErrores)

    if (Object.keys(newErrores).length > 0) {
      return
    } else {
      await axiosInstance
      .put(`http://localhost:8080/clientes/perfil/contrasena/${localStorage.getItem('userId')}`, userPassword)
      .then((response) => {
        console.log(response);
        setRefresh(prevRefresh => prevRefresh + 1 );
        setErrores("")
        handleClosePasswordChange()
        setSuccessBanner(true)
      })
      .catch((error) => {
        console.log(error);
        handleClosePasswordChange()
        setErrorBanner(true)
      });
    }
    console.log(userPassword)
  };

  const HandleChangePassword = (e) => {
    // actualiza la info del cliente
    setUserPassword((prev) => ({...prev, [e.target.name]: e.target.value}))
    // actualiza si hubieron errores en form
    setErrores((prevErrores) => ({ ...prevErrores, [e.target.name]: false }))
  }

  // Handle userData change
  const HandleChangeData = (e) => {
    // actualiza la info del cliente
    setUserData((prev) => ({...prev, [e.target.name]: e.target.value}))
    // actualiza si hubieron errores en form
    setErrores((prevErrores) => ({ ...prevErrores, [e.target.name]: false }))
  }
  const handleSubmitUserData = async (e) => {
    e.preventDefault();

    // validating form
    const newErrores = {}
    const nombreRegex = /^[A-Za-z]+$/; // Solo letras
    const apellidoRegex = /^[A-Za-z]+$/; // Solo letras
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato de un correo

    if (!nombreRegex.test(userData.NOMBRE) || userData.NOMBRE.length > 50 || userData.NOMBRE.length <= 0) {
      newErrores.NOMBRE = true;
    }

    if (!apellidoRegex.test(userData.APELLIDO) || userData.APELLIDO.length > 50 || userData.APELLIDO.length <= 0) {
        newErrores.APELLIDO = true;
    }

    if (!correoRegex.test(userData.CORREO) || userData.CORREO.length > 50 || userData.CORREO.length <= 0) {
        newErrores.CORREO = true;
    }

    if (userData.DIRECCION.length > 500) {
      newErrores.DIRECCION = true;
    }

    setErrores(newErrores)

    if (Object.keys(newErrores).length > 0) {
      return
    } else {
      await axiosInstance
        .put(`http://localhost:8080/clientes/perfil/datos/${localStorage.getItem('userId')}`, userData)
        .then((response) => {
          console.log(response);
          setRefresh(prevRefresh => prevRefresh + 1 );
          setErrores("")
          localStorage.setItem("name", `${userData.NOMBRE} ${userData.APELLIDO}`)
          handleCloseEditProfile()
          setSuccessBanner(true)
        })
        .catch((error) => {
          console.log(error);
      });
    }
    console.log(userData)
  };
  
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
      {/* Modal to change password */}
      <Modal
        open={openPasswordChange}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClosePasswordChange();
          }
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Cambiar contraseña
            </Typography>
            <IconButton onClick={handleClosePasswordChange}>
              <Close />
            </IconButton>
          </Box>
          <Box data-testid='addForm' component="form" noValidate>
            <FormGroup>

              <TextField required
                label="Contraseña actual"
                name="CONTRASENA_ACTUAL"
                value={userPassword.CONTRASENA_ACTUAL}
                variant="outlined"
                type={showPassword? "text":"password"}
                fullWidth
                margin="normal"
                onChange={HandleChangePassword}
                error={errores.CONTRASENA_ACTUAL}
                helperText = {errores.CONTRASENA_ACTUAL?"Contraseña inválida. No es la contraseña actual.":""}
                // para el toggle de la contraseña
                InputProps={{
                  endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword} 
                    edge="end"
                    >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                  )
                }}
              />

              <TextField required
                label="Contraseña nueva"
                name="CONTRASENA_NUEVA"
                value={userPassword.CONTRASENA_NUEVA}
                variant="outlined"
                type={visible? "text":"password"}
                fullWidth
                margin="normal"
                onChange={HandleChangePassword}
                error={errores.CONTRASENA_NUEVA}
                helperText = {errores.CONTRASENA_NUEVA?"Contraseña inválida. Debe contener al menos 8 caracteres, una letra en mayúscula, una letra en minúscula, un número y un caracter especial.":""}
                InputProps={{
                  endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setVisible(!visible)} 
                    edge="end"
                    >
                    {visible ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                  )
                }}
              />
              <TextField required
                  label="Confirmar contraseña"
                  name="CONTRASENA_CONFIRMADA"
                  value={userPassword.CONTRASENA_CONFIRMADA}
                  variant="outlined"
                  type={visible ? "text":"password"}
                  fullWidth
                  margin="normal"
                  onChange={HandleChangePassword}
                  error={errores.CONTRASENA_CONFIRMADA}
                  helperText = {errores.CONTRASENA_CONFIRMADA? "Las contraseñas deben concordar":""}
                  InputProps={{
                    endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setVisible(!visible)}   
                          
                      edge="end"
                      >
                      {visible ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                    )
                  }}
              />

            </FormGroup>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={handleClosePasswordChange}>Cancelar</Button>
              <Button variant="contained" sx={{ backgroundColor: '#4976CB' }} type="submit" onClick={handleSubmitPasswordChange}>
                Guardar Cambios
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Modal to edit profile */}
      <Modal
        open={openEditProfile}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseEditProfile();
          }
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Editar perfil
            </Typography>
            <IconButton onClick={handleCloseEditProfile}>
              <Close />
            </IconButton>
          </Box>
          <Box data-testid='addForm' component="form" noValidate>
            {data.map((d) => (
              <FormGroup key={d.ID}>
                <TextField required label="Nombre" defaultValue={d.NOMBRE} variant="outlined" fullWidth margin="normal" inputProps={{ maxLength: 50 }}
                  sx={{ maxWidth: '50ch' }}
                  onChange={HandleChangeData}
                  error = {errores.NOMBRE}
                  helperText= {errores.NOMBRE ? "El nombre no puede tener más de 50 letras ni estar vacío. Solo puede usar letras." : ""}
                  name = "NOMBRE"
                />

                <TextField required label="Apellido" defaultValue={d.APELLIDO} variant="outlined" fullWidth margin="normal" inputProps={{ maxLength: 50 }}
                  sx={{ maxWidth: '50ch' }}
                  onChange={HandleChangeData}
                  error = {errores.APELLIDO}
                  helperText= {errores.APELLIDO ? "El apellido no puede tener más de 50 letras ni estar vacío. Solo puede usar letras." : ""}
                  name = "APELLIDO"
                />
                <TextField required label="Correo" defaultValue={d.CORREO} variant="outlined" fullWidth margin="normal" inputProps={{ maxLength: 50 }}
                  sx={{ maxWidth: '50ch' }}
                  onChange={HandleChangeData}
                  error = {errores.CORREO}
                  helperText= {errores.CORREO ? "El correo no puede tener más de 50 letras ni estar vacío. Verifique que siga el formato de un correo." : ""}
                  name = "CORREO"
                />
                <TextField label="Dirección" defaultValue={d.DIRECCION} variant="outlined" fullWidth margin="normal" inputProps={{ maxLength: 500 }}
                  sx={{ maxWidth: '50ch' }}
                  onChange={HandleChangeData}
                  error = {errores.DIRECCION}
                  helperText= {errores.DIRECCION ? "Dirección inválida. No puede pasarse de los 500 caracteres. Tampoco puede tener caracterse especiales." : ""}
                  name = "DIRECCION"
                />
              </FormGroup>
            ))}
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={handleCloseEditProfile}>Cancelar</Button>
              <Button variant="contained" sx={{ backgroundColor: '#4976CB' }} type="submit" onClick={handleSubmitUserData}>
                Guardar Cambios
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      <SuccessAlert message={'La operación se realizó con éxito.'}open={successBanner} onClose={handleCloseSuccessBanner}></SuccessAlert>
      <ErrorAlert message={'Hubo un problema realizando la operación, inténtelo más tarde'}open={errorBanner} onClose={handleCloseErrorBanner}></ErrorAlert>

      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        {/* Main content */}
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Header />

          <Box className='dashSection' sx={{ width: '70%', marginLeft: '35px' }}>
            {/* Profile info */}
            <Typography variant="h4" gutterBottom>Mi Perfil</Typography>  
            
            <Box mt={2} display="flex" sx={{ marginTop: 2, marginBottom: 2}}>
              <Button variant="contained" sx={{ backgroundColor: '#4976CB', marginRight: 2}} onClick={handleOpenEditProfile}>
                Editar perfil
              </Button>
              <Button onClick={handleOpenPasswordChange}>Cambiar contraseña</Button>
            </Box>

            {data.map((d) => (
              <FormGroup key={d.ID}>
                <TextField label="Nombre de usuario" defaultValue={localStorage.getItem('userId')} variant="outlined" fullWidth margin="normal"
                  disabled
                  sx={{ maxWidth: '50ch', 
                    '& .MuiOutlinedInput-root.Mui-disabled': {
                      backgroundColor: 'white', // Change background color
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)', // Change border color
                    },
                    '& .MuiInputBase-input': {
                      WebkitTextFillColor: "black", // Change text color
                    },
                  }, 
                  "& .MuiInputLabel-root.Mui-disabled": {
                    color: "rgba(0, 0, 0, 0.6)", // Darker label color
                  },
                  }}
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                />
                <TextField label="Nombre" variant="outlined" fullWidth margin="normal"
                  disabled
                  sx={{ maxWidth: '50ch', 
                    '& .MuiOutlinedInput-root.Mui-disabled': {
                      backgroundColor: 'white', // Change background color
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)', // Change border color
                    },
                    '& .MuiInputBase-input': {
                      WebkitTextFillColor: "black", // Change text color
                    },
                  }, 
                  "& .MuiInputLabel-root.Mui-disabled": {
                    color: "rgba(0, 0, 0, 0.6)", // Darker label color
                  },
                  }}
                  value={d.NOMBRE}
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                />

                <TextField label="Apellido" variant="outlined" fullWidth margin="normal"
                  disabled
                  sx={{ maxWidth: '50ch', 
                    '& .MuiOutlinedInput-root.Mui-disabled': {
                      backgroundColor: 'white', // Change background color
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)', // Change border color
                    },
                    '& .MuiInputBase-input': {
                      WebkitTextFillColor: "black", // Change text color
                    },
                  }, 
                  "& .MuiInputLabel-root.Mui-disabled": {
                    color: "rgba(0, 0, 0, 0.6)", // Darker label color
                  },
                  }}
                  value={d.APELLIDO}
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                />
                <TextField label="Correo" variant="outlined" fullWidth margin="normal"
                  disabled
                  sx={{ maxWidth: '50ch', 
                    '& .MuiOutlinedInput-root.Mui-disabled': {
                      backgroundColor: 'white', // Change background color
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)', // Change border color
                    },
                    '& .MuiInputBase-input': {
                      WebkitTextFillColor: "black", // Change text color
                    },
                  }, 
                  "& .MuiInputLabel-root.Mui-disabled": {
                    color: "rgba(0, 0, 0, 0.6)", // Darker label color
                  },
                  }}
                  value={d.CORREO}
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                />
                <TextField label="Dirección" variant="outlined" fullWidth margin="normal"
                  disabled
                  sx={{ maxWidth: '50ch', 
                    '& .MuiOutlinedInput-root.Mui-disabled': {
                      backgroundColor: 'white', // Change background color
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)', // Change border color
                    },
                    '& .MuiInputBase-input': {
                      WebkitTextFillColor: "black", // Change text color
                    },
                  }, 
                  "& .MuiInputLabel-root.Mui-disabled": {
                    color: "rgba(0, 0, 0, 0.6)", // Darker label color
                  },
                  }}
                  value={d.DIRECCION}
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                />
              </FormGroup>
            ))}
          </Box>
        </Box>
      </Box>
    </div>
  )
}