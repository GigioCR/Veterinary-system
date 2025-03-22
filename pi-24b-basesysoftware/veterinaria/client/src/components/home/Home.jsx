import React from 'react';
import bannerImage from '../../assets/homeAssets/homeImage.jpg'
import aboutUs from '../../assets/homeAssets/aboutUs.jpg'
import consulta from '../../assets/homeAssets/consulta.jpg'
import desparasitacion from '../../assets/homeAssets/desparasitacion.jpg'
import grooming from '../../assets/homeAssets/grooming.jpg'
import seguimiento from '../../assets/homeAssets/seguimiento.jpg'
import vacunacion from '../../assets/homeAssets/vacunacion.jpg'
import xray from '../../assets/homeAssets/xray.jpg'
import sede1 from '../../assets/homeAssets/sede1.jpg'
import './Home.css';
import HomeHeader from './HomeHeader';
import HomeFooter from './HomeFooter';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { experimentalStyled as styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import './HomeHeader.css'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  alignContent: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: 'black',
  }),
}));

export default function Home() {
  return (
    <div>
      {/* HEADER */}
      <HomeHeader />

      {/* SOBRE NOSOTROS */}
      <Container maxWidth={false} disableGutters>
          <Box
              component="img"
              sx={{
              height: '10%',
              width: '100%',
              }}
              alt="Your logo."
              src={bannerImage}
          />
      </Container>
      <Typography variant="h2" align='center'>
        Veterinaria El Bigote
      </Typography>

      <Container className='homeSection' align='center'>
        <Typography className='sectionTitle' variant="h2" align='center'>
          Sobre Nosotros
        </Typography>
        <Grid container spacing={1} columns={{ xs: 1, sm: 2, md: 2 }} alignItems="center">
          <Grid size={1}>
            <Box 
            component="img" 
            sx={{ 
              gridArea: 'image',
              height: '100%',
              width: '50%'
            }} alt="Un perro blanco sentado sobre una mesa de la clinica siendo tratado por dos veterinarios."
                  src={aboutUs}>
            </Box>
          </Grid>
          <Grid size={1}>
            <Typography variant='body1'>
              El Bigote es una clínica veterinaria con más de 10 años de experiencia en el área. Contamos con las tecnologías más avanzadas y el personal profesional capacitado para ofrecer un servicio clínico de alta calidad a todo tipo de mascotas.
            </Typography>
          </Grid>
        </Grid>
      </Container>

      {/* SERVICIOS */}
      <Container id="servicios" className='homeSection' align='center'>
        <Typography className='sectionTitle' variant="h2" align='center'>
          Servicios
        </Typography>
        <Box
          sx={{
            flexGrow: 1,
          }}
        >
          <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 1, sm: 2, md: 3 }}>
            <Grid size={1}>
              <Item>      
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div" align='center'>
                    Vacunación
                  </Typography>
                  <CardMedia
                    sx={{ height: 200, width: 300 }}
                    image={vacunacion}
                    title="vacunacion"
                  />
                </CardContent>
              </Item>
            </Grid>
            <Grid size={1}>
              <Item>
              <CardContent>
                  <Typography gutterBottom variant="h5" component="div" align='center'>
                    Consulta
                  </Typography>
                  <CardMedia
                    sx={{ height: 200, width: 300 }}
                    image={consulta}
                    title="consulta"
                  />
                </CardContent>
              </Item>
            </Grid>
            <Grid size={1}>
              <Item>
              <CardContent>
                  <Typography gutterBottom variant="h5" component="div" align='center'>
                    Rayos-X
                  </Typography>
                  <CardMedia
                    sx={{ height: 200, width: 300 }}
                    image={xray}
                    title="rayos-x"
                  />
                </CardContent>
              </Item>
            </Grid>
            <Grid size={1}>
              <Item>      
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div" align='center'>
                    Seguimiento
                  </Typography>
                  <CardMedia
                    sx={{ height: 200, width: 300 }}
                    image={seguimiento}
                    title="seguimiento"
                  />
                </CardContent>
              </Item>
            </Grid>
            <Grid size={1}>
            <Item>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div" align='center'>
                  Desparasitación
                </Typography>
                <CardMedia
                  sx={{ height: 200, width: 300 }}
                  image={desparasitacion}
                  title="desparasitacion"
                />
              </CardContent>
            </Item>
            </Grid>
            <Grid size={1}>
              <Item>
              <CardContent>
                  <Typography gutterBottom variant="h5" component="div" align='center'>
                    Grooming
                  </Typography>
                  <CardMedia
                    sx={{ height: 200, width: 300 }}
                    image={grooming}
                    title="grooming"
                  />
                </CardContent>
              </Item>
            </Grid>
          </Grid>
        </Box>
      </Container>
      

      {/* SEDES */}
      <Container id="sedes" className='homeSection' align='center'>
        <Typography className='sectionTitle' variant="h2" align='center'>
          Sedes
        </Typography>
        <Grid container spacing={1} columns={{ xs: 1, sm: 2, md: 2 }} direction="row" justifyContent="flex-end" alignItems="center">
          <Grid size={1}>
            <Box 
            component="img" 
            sx={{ 
              gridArea: 'image',
              height: '100%',
              width: '50%'
            }} alt="Imagen de la sede en San José."
                  src={sede1}>
            </Box>
          </Grid>
          <Grid size={1} >
            <Typography variant="h5">
              Sede San José
            </Typography>
            <Typography variant='body1'>
              <strong>Dirección:</strong> Avenida Central, San José, Costa Rica<br></br>
              <strong>Horario:</strong> Lunes a Viernes 8:00 AM - 6:00 PM<br></br>
              <strong>Teléfono:</strong> +506 1234-5678
            </Typography>
          </Grid>
        </Grid>
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.673779355536!2d-84.08385508472695!3d9.92806959290386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0e30a2bd5e6c7%3A0x9e5fb16134c720d9!2sAvenida%20Central%2C%20San%20Jos%C3%A9!5e0!3m2!1sen!2scr!4v1694029011104!5m2!1sen!2scr"
          title="Mapa a la sede de la veterinaria en San José."
          width='75%' height="300" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade">
        </iframe> 
      </Container>

      {/* FOOTER */}
      <HomeFooter />
    </div>
  )
}
