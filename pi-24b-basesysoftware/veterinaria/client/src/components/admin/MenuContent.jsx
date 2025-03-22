import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';

const mainListItems = [
  { text: 'Inicio', url: 'http://localhost:5173/administradores'},
  { text: 'Veterinarios', url: 'http://localhost:5173/administradores/veterinarios'},
  { text: 'Clientes', url: 'http://localhost:5173/administradores/clientes'},
  { text: 'Mascotas', url: 'http://localhost:5173/administradores/mascotas'},
  { text: 'Servicios', url: 'http://localhost:5173/administradores/servicios'},
  { text: 'Citas', url: 'http://localhost:5173/administradores/citas'},
  { text: 'Pagos', url: 'http://localhost:5173/administradores/pagos'},
];

export default function MenuContent() {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton href={item.url}>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}