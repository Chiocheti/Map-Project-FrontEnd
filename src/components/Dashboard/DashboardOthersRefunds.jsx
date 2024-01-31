import { Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import moment from 'moment';

import ReadOnly from '../Form/ReadOnly';

export default function DashboardOthersRefunds({ refunds, clientName }) {
  return (
    <Grid container>
      {refunds.map((refund) => (
        <Grid container key={refund.id} spacing={1}>
          <Grid item xs={12} sm={6} md={5}>
            <ReadOnly disabled label="Usuário" value={refund.dependents?.name ? refund.dependents.name : clientName} />
          </Grid>

          <Grid item xs={12} sm={6} md={5}>
            <ReadOnly disabled label="Especialidade" value={refund.specialties.skill} />
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <ReadOnly disabled label="Nº Recibo" value={`${refund.order}`} />
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <ReadOnly disabled label="Data" value={moment(refund.invoiceReceived).add(1, 'day').format('DD/MM/YYYY')} />
          </Grid>

          <Grid item xs={4} sm={4} md={3}>
            <ReadOnly disabled label="Valor Pedido" value={`R$ ${refund.invoiceValue}`} />
          </Grid>

          <Grid item xs={4} sm={4} md={3}>
            <ReadOnly disabled label="Valor Reembolsado" value={`R$ ${refund.refundValue}`} />
          </Grid>

          <Grid item xs={4} sm={4} md={3}>
            <ReadOnly disabled label="%" value={`${(refund.refundValue / refund.invoiceValue) * 100}%`} />
          </Grid>

          <Grid item xs={12} sm={12} md={12}>
            <Divider variant="middle" sx={{ mb: 2, mt: 1 }} />
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
}
