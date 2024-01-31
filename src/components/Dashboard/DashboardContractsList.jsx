import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { useEffect, useState } from 'react';

import ReadOnly from '../Form/ReadOnly';
import Title from '../Form/Title';

export default function DashboardContractsList({ contracts, billingPriorities }) {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    const teste = [];

    billingPriorities.forEach((priority) => {
      const field = {
        name: priority.name,
      };

      const list = [];
      let amount = 0;

      contracts.forEach((contract) => {
        if (priority.value === contract.billingPriorities.value) {
          list.push(contract);
          amount += contract.value;
          field.priority = priority.value;
        }
      });

      field.contracts = list;
      field.amount = amount;
      teste.push(field);
    });

    setFields(teste);
  }, [contracts, billingPriorities]);

  return (
    <>
      {fields.length ? <Title>CONVÊNIOS</Title> : null}

      {fields.map((field) => (
        <Grid container key={field.name}>
          {field.contracts.length !== 0 ? (
            <Grid container>
              <Grid item xs={12} sm={12} md={12}>
                <Divider textAlign="left">
                  <Typography component="h2" variant="h6" textAlign="left">
                    {`${field.priority} - ${field.name}`}
                  </Typography>
                </Divider>
              </Grid>

              {field.contracts.map((contract) => (
                <Grid container columnSpacing={1} key={contract.id}>
                  <Grid item xs={12} sm={6} md={6}>
                    <ReadOnly value={contract.beneficiaryName} />
                  </Grid>

                  <Grid item xs={6} sm={3} md={3}>
                    <ReadOnly value={contract.date ? moment(contract.date).format('DD/MM/YYYY') : 'Sem data'} />
                  </Grid>

                  <Grid item xs={6} sm={3} md={3}>
                    <ReadOnly value={`R$${contract.value.toFixed(2)}`} />
                  </Grid>
                </Grid>
              ))}
              <Grid container spacing={1}>
                <Grid item xs={12} sm={9} md={9} />

                <Grid item xs={12} sm={3} md={3}>
                  <ReadOnly value={`Total R$${field.amount.toFixed(2)}`} />
                </Grid>
              </Grid>
            </Grid>
          ) : null}
        </Grid>
      ))}
    </>
  );
}
