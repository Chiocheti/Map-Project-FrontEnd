import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import MenuIcon from '@mui/icons-material/Menu';
import { Typography } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import moment from 'moment';
import { forwardRef, useEffect, useState, useContext, useRef } from 'react';

import CalendarDrawer from '../components/CalendarRemake/CalendarDrawer';
import CalendarPopUp from '../components/CalendarRemake/CalendarPopUp';
import MonthCard from '../components/CalendarRemake/MonthCard';
import AppBar from '../components/Form/AppBar';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

export default function CalendarRemake() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [saveDay, setSaveDay] = useState(0);
  const [reserv, setReserv] = useState();
  const [reservations, setReservations] = useState();

  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: null,
    severity: null,
  });

  const idList = useRef([]);
  const canEdit = useRef(false);

  const { tokens, user } = useContext(AuthContext);

  const month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  moment.updateLocale('pt', {
    months: [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
  });

  useEffect(() => {
    async function fetchData() {
      if (tokens) {
        try {
          user.permissions.forEach((permission) => {
            if (permission.resource === 'Calendario' && permission.action === 'edit') {
              canEdit.current = true;
            }
          });

          const {
            data: { clients },
          } = await api.get('/clients/clientList', {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          });

          const clientArray = [];

          await clients.forEach((element) => {
            clientArray.push(`[${element.cpfNumber}] - ${element.name}`);
          });

          setClientList(clientArray);
          idList.current = clients;

          const { data } = await api.get('/reservations', {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          });

          await data.forEach((element) => {
            element.date = element.date.slice(0, 10); //eslint-disable-line
          });

          setReservations(data);
        } catch (error) {
          setSnackbarState({
            open: true,
            message: 'Houve um erro interno',
            severity: 'error',
          });
        }
      }
    }

    fetchData();
  }, [user, tokens, snackbarState]);

  function toggleIsDrawerOpen() {
    setIsDrawerOpen((previousValue) => !previousValue);
  }

  function toggleIsPopUpOpen(day, reservation) {
    setSaveDay(day);
    setReserv(reservation);
    setIsPopUpOpen((previousValue) => !previousValue);
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((previousValue) => previousValue + 1);
    } else {
      setCurrentMonth((previousValue) => previousValue + 1);
    }
  }

  function lastMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((previousValue) => previousValue - 1);
    } else {
      setCurrentMonth((previousValue) => previousValue - 1);
    }
  }

  function handleCloseSnackbar(event, reason) {
    if (reason === 'clickaway') return;

    setSnackbarState({
      open: false,
      message: null,
    });
  }

  return (
    <>
      <CalendarPopUp
        day={saveDay}
        isOpen={isPopUpOpen}
        close={toggleIsPopUpOpen}
        clients={clientList}
        clientsId={idList}
        reserv={reserv}
        snackbar={setSnackbarState}
        canEdit={canEdit.current}
      />

      <CalendarDrawer isOpen={isDrawerOpen} closeDrawer={toggleIsDrawerOpen} isEdit={false} />

      <AppBar>
        <Grid container justifyContent="space-between">
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" onClick={toggleIsDrawerOpen}>
            <MenuIcon />
          </IconButton>
        </Grid>
      </AppBar>

      <Container component="form" sx={{ mt: 1, mb: 4, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Grid container display="flex" justifyContent="center" alignItems="center">
          <IconButton size="large" color="inherit" onClick={lastMonth}>
            <KeyboardDoubleArrowLeftIcon />
          </IconButton>

          <Typography component="h2" variant="h5" textAlign="center">
            {moment().locale('pt').month(month[currentMonth]).year(currentYear).format('MMMM - YYYY')}
          </Typography>

          <IconButton size="large" color="inherit" onClick={nextMonth}>
            <KeyboardDoubleArrowRightIcon />
          </IconButton>
        </Grid>

        <Grid>
          <MonthCard
            month={currentMonth}
            currentYear={currentYear}
            popUp={toggleIsPopUpOpen}
            reservations={reservations}
          />
        </Grid>
      </Container>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={snackbarState.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarState.severity}>
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </>
  );
}
