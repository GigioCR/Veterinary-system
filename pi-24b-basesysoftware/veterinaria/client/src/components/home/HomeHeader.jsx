import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import logo from '../../assets/homeAssets/gatilloBlanquillo.png'
import MenuIcon from '@mui/icons-material/Menu';
import {Menu, MenuItem, IconButton } from '@mui/material';

export default function HomeHeader() {

  const [anchorNav, setAnchorNav] = useState(null);
  const openMenu = Boolean(anchorNav);
  const closeMenu = () => {
    setAnchorNav(null)
  };

  const handleMenuClick = (event) => {
    setAnchorNav(event.currentTarget);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#4976CB' }}>
        <Toolbar>
          <Box
              component="img"
              sx={{
              height: 64,
              display:{xs:'flex', md:'flex'}
              }}
              alt="Your logo."
              src={logo}
          />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}></Typography>
          <Box sx={{display:{xs:'none', md:'flex'}}}>
            <Button color="inherit" href='/'>Inicio</Button>
            <Button color="inherit" href="/#servicios">Servicios</Button>
            <Button color="inherit" href="/#sedes">Sedes</Button>
            <Button color="inherit" href="/#contacto">Contáctenos</Button>
            <Button color="inherit" href='/login'>Iniciar Sesión</Button>
          </Box>
          <Box sx={{display:{xs:'flex', md:'none'}}}>
            <IconButton size='large' edge='start' color='inherit' onClick={handleMenuClick}>
              <MenuIcon />
            </IconButton>
            <Menu
              id="basic-menu"
              anchorEl={anchorNav}
              open={openMenu}
              onClose={closeMenu}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem component='a' href='/'>Inicio</MenuItem>
              <MenuItem component='a' href='/#servicios'>Servicios</MenuItem>
              <MenuItem component='a' href='/#sedes'>Sedes</MenuItem>
              <MenuItem component='a' href='/#contacto'>Contáctenos</MenuItem>
              <MenuItem component='a' href='/login'>Iniciar Sesión</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
