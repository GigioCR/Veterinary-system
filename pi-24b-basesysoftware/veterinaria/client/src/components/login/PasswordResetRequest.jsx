import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance.js';
import {
  Container, Box, TextField, Button, Typography,
  Card, CardContent, CardMedia, FormGroup
} from '@mui/material';
import { Link } from 'react-router-dom';
import HomeHeader from '../home/HomeHeader.jsx';
import HomeFooter from '../home/HomeFooter.jsx';
import Grid from '@mui/material/Grid2';
import logo from '../../assets/homeAssets/gatilloAzulillo.png';

export default function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const inputPropsStyle = {
    shrink: true, // Ensures the label stays on top
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    let newErrors = {};

    if (!email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio.";
    } else if (!validateEmail(email)) {
      newErrors.email = "Debe ingresar un correo válido.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await axiosInstance.post('http://localhost:8080/request-password-reset', { email });
      setMessage("Se ha enviado un enlace para restablecer tu contraseña.");
    } catch (err) {
      setErrors({ general: "Error al enviar la solicitud. Por favor, intenta de nuevo." });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div>
      <HomeHeader />
      <Container maxWidth={false} disableGutters align="center">
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
                    Recuperar contraseña
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ textAlign: 'left', color: 'textSecondary', marginLeft: '8px', marginBottom: 3 }}
                  >
                    Ingrese el correo asociado a su cuenta y le enviaremos un enlace para restablecer su contraseña.
                  </Typography>
                  <Box component="form" noValidate onSubmit={handleSubmit}>
                    <FormGroup>
                      <TextField
                        label="Correo electrónico"
                        variant="outlined"
                        InputLabelProps={inputPropsStyle}
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        type="email"
                        margin="normal"
                        name="email"
                        error={!!errors.email}
                        helperText={errors.email}
                      />
                      {errors.general && (
                        <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'left' }}>
                          {errors.general}
                        </Typography>
                      )}
                      {message && (
                        <Typography color="primary" variant="body2" sx={{ mt: 1, textAlign: 'left' }}>
                          {message}
                        </Typography>
                      )}
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: '#4976CB', mt: 2 }}
                        type="submit"
                        fullWidth
                      >
                        Enviar
                      </Button>
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
