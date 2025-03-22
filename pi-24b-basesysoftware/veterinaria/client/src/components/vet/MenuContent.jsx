import * as React from 'react';
import {
  List, ListItem, ListItemButton, ListItemText, Stack
} from '@mui/material';

const mainListItems = [
  { text: 'Inicio', url: 'http://localhost:5173/veterinarios'},
  { text: 'Mascotas', url: 'http://localhost:5173/veterinarios/mascotas'},
  { text: 'Citas', url: 'http://localhost:5173/veterinarios/citas'},
];

export default function VetMenuContent() {
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