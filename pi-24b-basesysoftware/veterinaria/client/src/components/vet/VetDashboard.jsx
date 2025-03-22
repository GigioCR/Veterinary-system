import { React, useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './VetDashboard.css';
import SideMenu from './SideMenu';
import Header from './Header';
import Grid from '@mui/material/Grid2';
import { experimentalStyled as styled } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { Close } from '@mui/icons-material';
import Cargando from '../general/loadingScreen';
import {
  Modal, Box, Typography, CardContent, Card, Paper, IconButton, CircularProgress
} from '@mui/material';

// Style for modals
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  alignContent: 'center',
  // border: 'solid',
  // borderColor: '#DAE0EC',
  // boxShadow: 'none',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: 'black',
  }),
}));

const HighlightedDay = styled(PickersDay)(({ theme }) => ({
  "&.Mui-selected": {
    backgroundColor: '#4976CB',
    color: theme.palette.primary.contrastText,
  },
}));

export default function VetDashboard() {

  //higlight the dates in highlightedDays arra
  const ServerDay = (props) => {
    const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

    const isSelected =
      !props.outsideCurrentMonth &&
      highlightedDays.includes(day.format("YYYY-MM-DD"));

    return (
      <HighlightedDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        selected={isSelected}
        onClick={handleOpenCitas}
        value={day.format("YYYY-MM-DD")}
      />
    );
  };

  const [highlightedDays, setHighlightedDays] = useState([]);

  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState([]);
  const [citas, setCitas] = useState([])
  const [selectedDate, setSelectedDate] = useState('')

  // on render
  useEffect(() => {
    fetchInfo();
  }, [refresh]);

  // Get count info to display
  const fetchInfo = async () => {
    try {
      await axiosInstance.get(`http://localhost:8080/veterinarios/stats/${localStorage.getItem('userId')}`
    ).then((res) => {
        const dataReformatted = res.data.map(dataArray => ({
          CITAS: dataArray[0],
          MASCOTAS: dataArray[1]
        }))
        setData(dataReformatted)
        console.log(dataReformatted)
      })
      await axiosInstance.get(`http://localhost:8080/veterinarios/calendario/${localStorage.getItem('userId')}`
      ).then((res) => {
        const citasReformatted = res.data.map(citasArray => ({
          FECHA: citasArray[0],
          HORA: citasArray[1],
          TIPO: citasArray[2],
          VET: citasArray[3],
          ESPECIE: citasArray[4],
          RAZA: citasArray[5],
          CLIENTE: citasArray[6],
          ESTADO: citasArray[7],
          ID_CITA: citasArray[8],
        }))

        setCitas(citasReformatted)
        console.log(citasReformatted)

        const newDates = citasReformatted.map(element => element.FECHA)
        setHighlightedDays(newDates)
        console.log(highlightedDays)
      })
    } catch (err) {
      console.error("Error fetching info", err)
    } finally {
      setLoading(false)
    }
  };

  // Manage citas modal
  const [openCitas, setOpenCitas] = useState(false);
  const handleOpenCitas = (e) => {
    setSelectedDate(e.target.value)
    if (highlightedDays.includes(e.target.value)) {
      setOpenCitas(true);
    }
  };

  const handleCloseCitas = () => {
    setOpenCitas(false)
    setSelectedDate('')
  };

  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Show loading screen while data is being fetched
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
        <Box sx={{ mt: 2 }}>
          <Cargando />
        </Box>
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        {/* Main content */}
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Header />

          <Box className='dashSection' sx={{ width: '70%', marginLeft: '35px' }}>
            {/* Veterinary stats */}
            <Typography variant="h4" gutterBottom>Veterinaria El Bigote</Typography>  
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 1, md: 2 }} alignContent='start'>
              <Grid size={1}>
                <Item>      
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div" align='center' color='black'>
                      {data.length != 0 ? data[0].MASCOTAS : ""} Mascotas
                    </Typography>
                  </CardContent>
                </Item>
              </Grid>
              <Grid size={1}>
                <Item>      
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div" align='center' color='black'>
                      {data.length != 0 ? data[0].CITAS : ""} {data[0].CITAS ==='1' ? "Cita Futura" : "Citas Futuras"}
                    </Typography>
                  </CardContent>
                </Item>
              </Grid>
            </Grid>
          </Box>

          <Modal
            open={openCitas}
            onClose={(event, reason) => {
              if (reason !== 'backdropClick') {
                handleCloseCitas();
              }
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Citas
                </Typography>
                <IconButton onClick={handleCloseCitas}>
                  <Close />
                </IconButton>
              </Box>
              {citas.map((cita) => (
                (cita.FECHA === selectedDate) && (cita.ESTADO === 1)
                  ? 
                    (<Box key={cita.ID_CITA} sx={{ minWidth: 275, marginBottom:'15px', marginTop:'15px' }}>
                      <CardContent>
                        <Typography variant="body1">
                          <strong>Hora:</strong> {cita.HORA} <br/>
                          <strong>Cliente:</strong> {cita.CLIENTE} <br/>
                          {/* <strong>Veterinario:</strong> {cita.VET} <br/> */}
                          <strong>Especie de Mascota:</strong> {cita.ESPECIE} <br/>
                          <strong>Raza de Mascota:</strong> {cita.RAZA} <br/>
                          {/* <strong>Tipo de Cita:</strong> {cita.TIPO} <br/> */}
                        </Typography>
                      </CardContent>
                    </Box>)
                  : null
              ))}
            </Box>
          </Modal>

          <Box className='dashSection' sx={{ width: '70%', marginLeft: '35px' }}>
            {/* Appointments calendar */}
            <Typography variant="h4" gutterBottom>Calendario</Typography> 
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              
              <DateCalendar align='left' sx={{ marginLeft: '0px' }}
                slots={{
                  day: ServerDay,
                }}
                slotProps={{
                  day: {
                    highlightedDays,
                  },
                }}
              /> 

            </LocalizationProvider>
          </Box>
        </Box>
      </Box>
    </div>
  )
}
