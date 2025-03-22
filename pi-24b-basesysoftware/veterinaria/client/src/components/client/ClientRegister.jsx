import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance.js';
import './styles.css'; 
import HomeHeader from '../home/HomeHeader';
import HomeFooter from '../home/HomeFooter.jsx';
import {
  Card, CardContent, CardMedia, Button, Box, Typography, Container,
  TextField, FormGroup
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import logo from '../../assets/homeAssets/gatilloAzulillo.png';


const inputPropsStyle = {
  shrink: true, // Ensures the label stays on top
}
// Password validation function
const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8 || password.length > 50) {
    errors.push("Debe tener entre 8 y 50 caracteres.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Debe contener al menos una letra mayúscula.");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Debe contener al menos una letra minúscula.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Debe contener al menos un número.");
  }
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    errors.push("Debe contener al menos un caracter especial.");
  }
  return errors;
};

// Email validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex for valid email format
  return emailRegex.test(email);
};

export default function ClientRegister() {
  const [formData, setFormData] = useState({
    userId: '',
    contrasena: '',
    confirmarContrasena: '',
    nombre: '',
    apellido: '',
    correo: '',
    direccion: '',
  });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    const { userId, contrasena, confirmarContrasena, correo } = formData;

    // Reset errors
    setErrors({});
    setPasswordErrors([]);

    let newErrors = {};

    // Validate required fields
    if (!userId.trim()) {
      newErrors.userId = 'El nombre de usuario es obligatorio.';
    }

    if (!correo.trim()) {
      newErrors.correo = 'El correo electrónico es obligatorio.';
    } else if (!validateEmail(correo)) {
      newErrors.correo = 'El correo electrónico no tiene un formato válido.';
    }

    // Validate passwords
    const validationErrors = validatePassword(contrasena);
    if (validationErrors.length > 0) {
      setPasswordErrors(validationErrors);
    }

    if (contrasena !== confirmarContrasena) {
      newErrors.confirmarContrasena = 'Las contraseñas no coinciden';
    }

    // Validate username and email availability (Optional)
    /*
    if (Object.keys(newErrors).length === 0 && validationErrors.length === 0) {
      try {
        const response = await axiosInstance.post('/check-availability', {
          userId,
          correo,
        });
        if (!response.data.userIdAvailable) {
          newErrors.userId = 'El nombre de usuario ya está en uso.';
        }
        if (!response.data.correoAvailable) {
          newErrors.correo = 'El correo electrónico ya está en uso.';
        }
      } catch (error) {
        console.error('Error checking availability:', error);
      }
    }
    */

    if (Object.keys(newErrors).length > 0 || validationErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Proceed to next step if validation passes
    setErrors({});
    setPasswordErrors([]);
    setCurrentStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { userId, contrasena, nombre, apellido, correo, direccion } = formData;

    // Reset errors
    setErrors({});

    let newErrors = {};

    // Validate required fields
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio.';
    }

    if (!apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axiosInstance.post('/register', {
        userId,
        nombre,
        apellido,
        correo,
        contrasena,
        direccion,
      });

      if (response.status === 201) {
        navigate('/login'); // Redirect to login after successful registration
      } else {
        setErrors({ submit: response.data.message || 'Error al registrar' });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error desconocido';

      if (errorMessage.toLowerCase().includes('usuario')) {
        setCurrentStep(1);
        setErrors({ userId: errorMessage });
      } else if (errorMessage.toLowerCase().includes('correo')) {
        setCurrentStep(1);
        setErrors({ correo: errorMessage });
      } else {
        setErrors({ submit: errorMessage });
      }
    }
  };

  return (
    <div>
      <HomeHeader />
      <Container maxWidth={false} disableGutters align='center'>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="flex-start"
          sx={{ minHeight: '80vh', py: 2 }}
        >
          <Card sx={{ maxWidth: 680, width: '100%' }}>
            <Grid container spacing={{ xs: 0, md: 0 }} columns={{ xs: 1, md: 4 }}>
              {/* Left side */}
              <Grid size={2} alignContent='center' className='leftLogInSection'>
                <CardContent>
                  <Box>
                    <CardMedia
                      sx={{ height: 168, width: 180, marginBottom: 2 }}
                      image={logo}
                      title="Logo de la veterinaria"
                    />
                    <Typography gutterBottom variant="h4" component="div">
                      Veterinaria El Bigote
                    </Typography>
                  </Box>
                </CardContent>
              </Grid>

              {/* Right side */}
              <Grid size={2} className='rightLogInSection' sx={{ overflowY: 'auto' }}>
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h4"
                    component="div"
                    sx={{ textAlign: 'left', marginLeft: '8px' }}
                  >
                    Registrarse
                  </Typography>
                  <Box
                    component="form"
                    noValidate
                    onSubmit={currentStep === 1 ? handleNextStep : handleSubmit}
                  >
                    <FormGroup>
                      {/* Step 1 Fields */}
                      {currentStep === 1 && (
                        <>
                          <TextField
                            label="Nombre de Usuario"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            InputLabelProps={inputPropsStyle}
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}
                            required
                            error={!!errors.userId}
                            helperText={errors.userId}
                          />
                          <TextField
                            label="Correo"
                            variant="outlined"
                            fullWidth
                            InputLabelProps={inputPropsStyle}
                            margin="normal"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            type="email"
                            required
                            error={!!errors.correo}
                            helperText={errors.correo}
                          />
                          <TextField
                            label="Contraseña"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            InputLabelProps={inputPropsStyle}
                            name="contrasena"
                            value={formData.contrasena}
                            onChange={handleChange}
                            type="password"
                            required
                            error={passwordErrors.length > 0}
                            helperText={passwordErrors.join(' ')}
                          />
                          <TextField
                            label="Confirmar Contraseña"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            InputLabelProps={inputPropsStyle}
                            name="confirmarContrasena"
                            value={formData.confirmarContrasena}
                            onChange={handleChange}
                            type="password"
                            required
                            error={!!errors.confirmarContrasena}
                            helperText={errors.confirmarContrasena}
                          />
                          {/* Next Button */}
                          <Button
                            variant="contained"
                            sx={{ backgroundColor: '#4976CB', mt: 2 }}
                            type="submit"
                            fullWidth
                          >
                            Siguiente
                          </Button>
                        </>
                      )}

                      {/* Step 2 Fields */}
                      {currentStep === 2 && (
                        <>
                          <TextField
                            label="Nombre"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            InputLabelProps={inputPropsStyle}
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            error={!!errors.nombre}
                            helperText={errors.nombre}
                          />
                          <TextField
                            label="Apellido"
                            variant="outlined"
                            fullWidth
                            InputLabelProps={inputPropsStyle}
                            margin="normal"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                            error={!!errors.apellido}
                            helperText={errors.apellido}
                          />
                          <TextField
                            label="Dirección"
                            variant="outlined"
                            fullWidth
                            InputLabelProps={inputPropsStyle}
                            margin="normal"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                          />
                          {/* Submission Error */}
                          {errors.submit && (
                            <Typography color="error" sx={{ mt: 1 }}>
                              {errors.submit}
                            </Typography>
                          )}
                          {/* Submit Button */}
                          <Button
                            variant="contained"
                            sx={{ backgroundColor: '#4976CB', mt: 2 }}
                            type="submit"
                            fullWidth
                          >
                            Registrarse
                          </Button>
                          {/* Back Button */}
                          <Button
                            variant="text"
                            sx={{ mt: 1 }}
                            onClick={() => {
                              setCurrentStep(1);
                              setErrors({});
                              setPasswordErrors([]);
                            }}
                          >
                            Regresar
                          </Button>
                        </>
                      )}
                      {/* Link to Login */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                        <Link to="/login" style={{ textDecoration: 'underline', color: '#4976CB' }}>
                          Volver al inicio de sesión
                        </Link>
                      </Box>
                    </FormGroup>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Box>
      </Container>
      <HomeFooter />
    </div>
  );
}
