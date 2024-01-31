import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { useEffect, useState } from 'react';

import DayCard from './DayCard';

export default function MonthCard({ month, currentYear, popUp, reservations }) {
  const [value, setValue] = useState(moment().locale('pt').month(month).year(currentYear));

  const [calendar, setCalendar] = useState([]);
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

  useEffect(() => {
    setValue((previousValue) => previousValue.year(currentYear).month(month));

    const startDay = value.clone().startOf('month').startOf('week');
    const endDay = value.clone().endOf('month').endOf('week');

    const day = startDay.clone().subtract(1, 'day');

    const cb = [];

    while (day.isBefore(endDay, 'day')) {
      cb.push(
        Array(7)
          .fill(0)
          .map(() => day.add(1, 'day').clone()),
      );
    }

    setCalendar(cb);
  }, [value, month, currentYear]);

  function findReservation(day) {
    let find = null;

    reservations.forEach((reservation) => {
      if (reservation.date === `${day.format('YYYY-MM-DD')}`) {
        find = reservation;
      }
    });

    return find;
  }

  return (
    <>
      <Grid container justifyContent="center">
        {weekDays.map((week) => (
          <Grid item xs={1.7} sm={1.7} md={1.7} my={2} key={week}>
            <Divider>
              <Typography>{week[0]}</Typography>
            </Divider>
          </Grid>
        ))}
      </Grid>

      {calendar.map((week) => (
        <Grid container key={week} justifyContent="center" spacing={2}>
          {week.map((day) => (
            // eslint-disable-next-line no-underscore-dangle
            <Grid item xs={1.7} sm={1.7} md={1.7} key={day._d.getTime() + month} mb={1} textAlign="center">
              <DayCard
                day={day}
                month={value.format('MM')}
                year={value.format('YYYY')}
                popUp={popUp}
                reservation={reservations ? findReservation(day) : null}
              />
            </Grid>
          ))}
        </Grid>
      ))}
    </>
  );
}
