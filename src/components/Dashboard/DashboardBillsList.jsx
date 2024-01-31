import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportIcon from '@mui/icons-material/Report';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import moment from 'moment';

import MoneyReadOnly from '../Form/MoneyReadOnly';
import ReadOnly from '../Form/ReadOnly';
import Title from '../Form/Title';

export default function DashboardBillsList({ fieldsBills }) {
  return (
    <>
      {fieldsBills.length ? <Title>Pagamentos e Recibos</Title> : null}

      {useMediaQuery('(min-width:900px)') && fieldsBills.length ? (
        <Grid container spacing={1}>
          <Grid item md={0.5} />

          <Grid item md={1.5}>
            <Typography variant="h6" align="center">
              Nº Doc.
            </Typography>
            <Divider />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="h6" align="center">
              Lançamento
            </Typography>
            <Divider />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="h6" align="center">
              Valor
            </Typography>
            <Divider />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="h6" align="center">
              D/C/A
            </Typography>
            <Divider />
          </Grid>

          <Grid item md={5.5}>
            <Typography variant="h6" align="center">
              Destina-se
            </Typography>
            <Divider />
          </Grid>
        </Grid>
      ) : (
        <Grid item xs={12} sm={12} md={12} sx={{ my: 1 }}>
          <Divider />
        </Grid>
      )}
      {fieldsBills.map((field) => (
        <Grid container spacing={1} key={field.id}>
          <Grid item xs={2} sm={1} md={0.5} textAlign="center" alignSelf="center">
            {field.status === 'Compensado' ? (
              <CheckCircleIcon color="success" />
            ) : (
              <Grid>
                {field.status === 'Pendente' ? <WatchLaterIcon color="primary" /> : <ReportIcon color="error" />}
              </Grid>
            )}
          </Grid>

          <Grid item xs={5} sm={2.5} md={1.5}>
            <ReadOnly value={field.doc} />
          </Grid>

          <Grid item xs={5} sm={2.5} md={1.5}>
            <ReadOnly value={moment(field.date).locale('pt').format('DD/MM/YYYY')} />
          </Grid>

          <Grid item xs={6} sm={3} md={1.5}>
            <MoneyReadOnly value={field.value.toFixed(2)} />
          </Grid>

          <Grid item xs={6} sm={3} md={1.5}>
            <ReadOnly value={field.dca} />
          </Grid>

          <Grid item xs={12} sm={12} md={5.5}>
            <ReadOnly value={field.details} />
          </Grid>

          <Grid item xs={12} sm={12} md={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
        </Grid>
      ))}
    </>
  );
}
