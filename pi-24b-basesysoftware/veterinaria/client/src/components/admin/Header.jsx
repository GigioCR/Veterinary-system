import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton } from '@mui/material';
import MenuContent from './MenuContent';
import { styled } from '@mui/material/styles';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import logo from '../../assets/homeAssets/gatilloAzulillo.png'

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

// * Not sure where this one is ued
export default function Header() {

  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.clear();

    // Redirect
    navigate('/');
  };

  const [open, setOpen] = useState(null);
  const openMenu = Boolean(open);

  const handleMenuClick = () => {
    setOpen(!open);
  };

  return (
    <div>
      {/* Header */}
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: '#4976CB' }}>
          <Toolbar>
            <Box sx={{display:{xs:'flex', md:'none'}}}>
              <IconButton size='large' edge='start' color='inherit' onClick={handleMenuClick}>
                <MenuIcon />
              </IconButton>
            </Box>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}></Typography>
            <Button color="inherit" href='http://localhost:5173/administradores/perfil'>{localStorage.getItem('name')}</Button>
            <Button color="inherit" onClick={handleLogout}>Cerrar Sesión</Button>
          </Toolbar>
        </AppBar>
        
      </Box>

      {/* Responsive drawer */}
      <Drawer
        variant="temporary"
        open={openMenu}
        onClose={handleMenuClick}
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .${drawerClasses.paper}`]: {
            backgroundColor: 'background.paper',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            mt: 'calc(var(--template-frame-height, 0px) + 4px)',
            p: 1.5,
          }}
        >
        </Box>
        <img id='sidebarLogo' src={logo} alt='Logo de la veterinaria'/>
        <MenuContent />
      </Drawer>
    </div>
  );
}
