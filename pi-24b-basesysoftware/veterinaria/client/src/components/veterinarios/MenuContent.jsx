import * as React from 'react';
import { useLocation, Link } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';

const mainListItems = [
  { text: 'Inicio', link: '/administradores/' },
  { text: 'Veterinarios', link: '/administradores/veterinarios' },
  { text: 'Clientes', link: '/administradores/clientes' },
  { text: 'Mascotas', link: '/administradores/mascotas' },
  { text: 'Servicios', link: '/administradores/servicios' },
  { text: 'Citas', link: '/citas' },
];

export default function MenuContent() {
  const location = useLocation();

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to={item.link}
              selected={location.pathname === item.link}
            >
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
