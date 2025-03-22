import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Container } from '@mui/material';
import facebookLogo from '../../assets/homeAssets/facebookLogo.png';
import instagramLogo from '../../assets/homeAssets/InstagramLogo2.png';
import twitterLogo from '../../assets/homeAssets/twitterLogo.png';

export default function HomeFooter() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#4976CB', mt: 'auto', py: 4 }}>
      <Box sx={{ px: { xs: 2, sm: 4, md: 8 } }}>
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: '1fr',
            sm: '1fr 1fr 1fr',
          }}
          gap={4}
          alignItems="flex-start"
        >
          {/* Left Column */}
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h6" color="inherit" gutterBottom>
              Información de Contacto
            </Typography>
            <Typography variant="body2" color="inherit">
              <strong>Teléfono:</strong> 8329-7111<br />
              <strong>Correo:</strong> leonardo.loria@ucr.ac.cr
            </Typography>
          </Box>

          {/* Middle Column */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="inherit" gutterBottom>
              Preguntas Frecuentes
            </Typography>
            <Typography variant="body2" color="inherit">
              <a href="#servicios" style={{ color: '#ffffff', textDecoration: 'none' }}>
                ¿Qué servicios ofrecen?
              </a>
              <br />
              <a href="#sedes" style={{ color: '#ffffff', textDecoration: 'none' }}>
                ¿Dónde están ubicados?
              </a>
            </Typography>
          </Box>
          {/* Right Column */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="inherit" gutterBottom>
              Síganos en Redes Sociales
            </Typography>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={2}
              mt={1}
            >
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={facebookLogo}
                  alt="Facebook"
                  style={{ width: 32, height: 32 }}
                />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={instagramLogo}
                  alt="Instagram"
                  style={{ width: 32, height: 32 }}
                />
              </a>
              <a
                href="https://www.twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={twitterLogo}
                  alt="Twitter"
                  style={{ width: 32, height: 32 }}
                />
              </a>
            </Box>
          </Box>
        </Box>
        <Box mt={4}>
          <Typography variant="body2" color="inherit" align="center">
            &copy; {new Date().getFullYear()} Veterinaria El Bigote. Todos los derechos reservados.
          </Typography>
        </Box>
      </Box>
    </AppBar>
  );
}
