import { yupResolver } from '@hookform/resolvers/yup';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import moment from 'moment';
import { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';
import * as Yup from 'yup';

import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import Button from '../Form/Button';
import DateInput from '../Form/DateInput';

const schema = Yup.object().shape({
  start: Yup.string(),
  end: Yup.string(),
  client: Yup.string().nullable(),
});

export default function ReportAllAssociationHistory({ setSnackbarState, canEdit }) {
  const { tokens } = useContext(AuthContext);

  const [clientList, setClientList] = useState([]);
  const [options, setOptions] = useState([]);
  const [autocompleteValue, setAutocompleteValue] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
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

        setOptions(clientArray);
        setClientList(clients);
      } catch (error) {
        setSnackbarState({
          open: true,
          message: error.response.data.message,
          severity: 'error',
        });
      }
    }

    fetchData();
  }, [tokens, setSnackbarState]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleAutocompleteChange = (event, newValue) => {
    setValue('client', newValue);
    setAutocompleteValue(newValue);
  };

  function writeWorkBook(array, name, date) {
    let header = 'Relatório de Histórico';

    if (name) {
      header = `${header} - ${name}`;
    }

    if (date) {
      header = `${header} - ${date}`;
    }

    const workBook = XLSX.utils.book_new();

    const workSheetPg1 = XLSX.utils.aoa_to_sheet([[header], [''], ...array]);

    workSheetPg1['!merges'] = [];
    workSheetPg1['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });

    XLSX.utils.book_append_sheet(workBook, workSheetPg1, 'Relatório de Histórico');

    XLSX.writeFile(workBook, 'Relatório_de_Convênios.xlsx', { bookType: 'xlsx', type: 'binary' });
  }

  async function createReport({ start, end, client }) {
    if (!canEdit) {
      setSnackbarState({
        open: true,
        message: 'Você não tem permissão de gerar um relatório',
        severity: 'error',
      });

      return false;
    }

    let clientId = null;

    let search = '';

    if (client) {
      search = client.split(' - ');
      clientId = clientList.find((each) => each.name === search[1] && each.cpfNumber === search[0].slice(1, 15)).id;
    }

    const { data } = await api.post(
      '/clients/findClientsAssociationHistory',
      {
        start: start || false,
        end: end || false,
        clientId,
      },
      {
        headers: {
          'x-access-token': tokens?.accessToken,
        },
      },
    );

    const array = [['DATA', 'NOME', 'SITUAÇÃO', 'STATUS']];

    data.forEach((element) => {
      array.push([
        moment(element.createdAt).format('DD/MM/YYYY'),
        element.clients.name,
        element.associate,
        element.associateState,
      ]);
    });

    let date = '';

    if (start && end) {
      date = `De: ${moment(start).format('DD/MM/YYYY')} - Até: ${moment(end).format('DD/MM/YYYY')}`;
    } else if (start) {
      date = `${moment(start).format('DD/MM/YYYY')}}`;
    } else if (end) {
      date = `${moment(end).format('DD/MM/YYYY')}}`;
    }

    writeWorkBook(array, client ? search[1] : null, date);
    return true;
  }

  return (
    <Paper
      sx={{
        p: 2,
        mb: 1,
        bgcolor: 'background.paper',
      }}
    >
      <Grid container spacing={1}>
        <Grid item xs={12} sm={12} md={12}>
          <Button fullWidth variant="contained" onClick={handleSubmit(createReport)}>
            Gerar Histórico de Associado
          </Button>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <DateInput label="De" register={register} errors={errors?.start} name="start" />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <DateInput label="Até" register={register} errors={errors?.end} name="end" />
        </Grid>

        <Grid item xs={12} sm={12} md={12}>
          <Autocomplete
            value={autocompleteValue}
            onChange={handleAutocompleteChange}
            options={options || []}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cliente"
                variant="outlined"
                size="small"
                fullWidth
                error={!!errors?.client}
                helperText={errors?.client?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
