import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance.js';
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import './styles.css'; 
import HomeHeader from '../home/HomeHeader';
import HomeFooter from '../home/HomeFooter.jsx';
import {
  Card, CardContent, CardMedia, Button, Box, Typography, Container,
  TextField, FormGroup
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import logo from '../../assets/homeAssets/gatilloAzulillo.png';

export default function Login() {
  const [credentials, setCredentials] = useState({
    id_usuario: "",
    contrasena: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const inputPropsStyle = {
    shrink: true, // Ensures the label stays on top
  }

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp > currentTime) {
          const userType = localStorage.getItem('userType');
          const redirectPath = userType === 'administrador' ? '/administradores' :
                               userType === 'veterinario' ? '/veterinarios' : '/clientes';
          navigate(redirectPath);
        }
      } catch (error) {
        console.error("Token decoding failed", error);
        localStorage.clear();
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    const { id_usuario, contrasena } = credentials;

    // Reset errors
    setErrors({});

    let newErrors = {};

    // Validate required fields
    if (!id_usuario.trim()) {
      newErrors.id_usuario = 'El nombre de usuario es obligatorio.';
    }
    if (!contrasena.trim()) {
      newErrors.contrasena = 'La contraseña es obligatoria.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axiosInstance.post('http://localhost:8080/login', {
        username: id_usuario,
        password: contrasena,
      });

      if (response.data.access_token && response.data.refresh_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);

        const decodedToken = jwtDecode(response.data.access_token);
        localStorage.setItem('userId', decodedToken.userId);
        localStorage.setItem('userType', decodedToken.userType);
        localStorage.setItem('name', decodedToken.name);

        const redirectPath = response.data.redirectRoute || 
                             (decodedToken.userType === 'administrador' ? '/administradores' : 
                              decodedToken.userType === 'veterinario' ? '/veterinarios' : '/clientes');
        navigate(redirectPath);
      } else {
        setErrors({ general: "Usuario o contraseña incorrecto." });
      }
    } catch (err) {
      console.log("Error al iniciar sesión", err);
      setErrors({ general: "Usuario o contraseña incorrecto." });
    }
  };

  return (
    <div>
      <HomeHeader/>
      <Container maxWidth={false} disableGutters align='center'>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
        >
          <Card sx={{ maxWidth: 680, width: '100%' }}>         
            <Grid container spacing={{ xs: 0, md: 0 }} columns={{ xs: 1, md: 4 }}>
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
              <Grid size={2} className='rightLogInSection'>
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h4"
                    component="div"
                    sx={{ textAlign: 'left', marginLeft: '8px' }}
                  >
                    Iniciar Sesión
                  </Typography>
                  <Box component="form" noValidate onSubmit={handleClick}>
                    <FormGroup>
                      <TextField 
                        label="Nombre de Usuario" 
                        InputLabelProps={inputPropsStyle}
                        variant="outlined" 
                        fullWidth 
                        margin="normal"
                        value={credentials.id_usuario}
                        onChange={handleChange}
                        required
                        name="id_usuario"
                        error={!!errors.id_usuario}
                        helperText={errors.id_usuario}
                      />
                      <TextField 
                        label="Contraseña" 
                        variant="outlined" 
                        InputLabelProps={inputPropsStyle}
                        fullWidth 
                        margin="normal"
                        value={credentials.contrasena}
                        onChange={handleChange}
                        required
                        name="contrasena"
                        type="password"
                        error={!!errors.contrasena}
                        helperText={errors.contrasena}
                      />
                      {errors.general && (
                        <Typography color="error" sx={{ mt: 1 }}>
                          {errors.general}
                        </Typography>
                      )}
                      <Button variant="contained" sx={{ backgroundColor: '#4976CB', mt: 2 }} type="submit" fullWidth>
                        Ingresar
                      </Button>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                        <Link to="/recuperar-contrasena" style={{ textDecoration: 'underline', color: '#4976CB' }}>
                          Recuperar contraseña
                        </Link>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                        <Link to="/register" style={{ textDecoration: 'underline', color: '#4976CB' }}>
                          Registrar nueva cuenta
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




// import { jwtDecode } from "jwt-decode";
