import BlockIcon from '@mui/icons-material/Block';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import UseMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useState } from 'react';

export default function DayCard({ day, month, year, popUp, reservation }) {
  const [styleButton, setStyleButton] = useState();
  const [styleInput, setStyleInput] = useState('#000');
  const today = day._d; //eslint-disable-line

  useEffect(() => {
    const currentMonth = new Date(`${month},01,${year}`);

    if (today.getMonth() !== currentMonth.getMonth()) {
      setStyleInput('#808080');
    } else {
      setStyleInput('#000');
    }

    if (reservation) {
      if (reservation.payStyle === 'BLOQUEADO') {
        setStyleButton('#bf842c');
      } else {
        setStyleButton('#66bb6a');
      }
    } else {
      setStyleButton('#e3e3e3');
    }
  }, [today, day, month, year, reservation]);

  function controlledPopUp() {
    if (styleInput === '#000') {
      popUp(day, reservation);
    }
  }

  function mouseEnter() {
    if (styleInput === '#000') {
      if (reservation) {
        if (reservation.payStyle === 'BLOQUEADO') {
          setStyleButton('#fa9702');
        } else {
          setStyleButton('#05f510');
        }
      } else {
        setStyleButton('#1172d9');
      }
    }
  }

  function mouseLeave() {
    if (reservation) {
      if (reservation.payStyle === 'BLOQUEADO') {
        setStyleButton('#bf842c');
      } else {
        setStyleButton('#66bb6a');
      }
    } else {
      setStyleButton('#e3e3e3');
    }
  }

  return (
    <Paper
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
      onClick={controlledPopUp}
      sx={{
        backgroundColor: '#e3e3e3',
        border: 2,
        borderColor: styleButton,
        height: 70,
      }}
    >
      <Typography variant="button" color={styleInput}>
        {day.format('DD').toString()}
      </Typography>

      {UseMediaQuery('(min-width:800px)') ? (
        <Grid container>
          <Grid item md={12}>
            <Typography variant="subtitle2">
              {reservation?.clients?.name.split(' ', 1) || reservation?.name.split(' ', 1)}
            </Typography>
          </Grid>

          <Grid item md={12}>
            <Typography variant="subtitle2">
              {reservation?.description ? reservation?.description.split(' ', 1) : ''}
            </Typography>
          </Grid>
        </Grid>
      ) : (
        <Grid mt={1}>
          {reservation?.clients?.name || reservation?.name ? (
            <Grid>
              {reservation?.name === 'BLOQUEADO' ? <BlockIcon color="warning" /> : <PersonAddIcon color="success" />}
            </Grid>
          ) : null}
        </Grid>
      )}
    </Paper>
  );
}
