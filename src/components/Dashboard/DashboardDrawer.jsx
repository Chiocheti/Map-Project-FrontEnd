import { yupResolver } from '@hookform/resolvers/yup';
import LoopIcon from '@mui/icons-material/Loop';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import moment from 'moment';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import Button from '../Form/Button';
import CompDialog from '../Form/Dialog';
import NavigationBar from '../Form/NavigationBar';
import Select from '../Form/Select';
import TextInput from '../Form/TextInput';

const searchSchema = Yup.object().shape({
  field: Yup.string().required('Campo obrigatório'),
  value: Yup.string().required('Campo obrigatório'),
});

export default function DashboardDrawer({ isOpen, closeDrawer, fill, toggleSaveOrEdit, isEdit, setSnackbarState }) {
  const { tokens } = useContext(AuthContext);

  const [searchData, setSearchData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    resetField,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(searchSchema),
  });

  function toggleIsDialogOpen() {
    setIsDialogOpen((previousValue) => !previousValue);
  }

  async function save(clients) {
    setSearchData(() => clients);
  }

  async function handleSearch(data) {
    try {
      const { field, value } = data;

      setLoading(true);
      const clients = await api.post(
        'clients/search',
        { field, value },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      await save(clients.data);

      setLoading(false);
    } catch (error) {
      setSnackbarState({
        open: true,
        message: 'Houve um erro interno',
        severity: 'error',
      });
    }
  }

  async function findBills(client) {
    try {
      const start = moment().date('1').subtract(1, 'month').format('YYYY-MM-DD');

      const {
        data: { bills, refunds, otherRefunds },
      } = await api.post(
        'bills/getClientBills',
        { clientId: client.id, start },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      const contracts = await api.post(
        'contracts/findOne',
        { clientId: client.id },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      fill(client, bills, refunds, otherRefunds, contracts.data);
    } catch (error) {
      setSnackbarState({
        open: true,
        message: 'Houve um erro interno',
        severity: 'error',
      });
    }
  }

  return (
    <>
      <CompDialog isOpen={isDialogOpen} closeDialog={toggleIsDialogOpen} setSnackbarState={setSnackbarState} />

      <Drawer
        anchor="left"
        open={isOpen}
        onClose={() => {
          closeDrawer();
          setSearchData([]);
          resetField('value');
        }}
        PaperProps={{
          sx: {
            bgcolor: 'background.default',
            backgroundImage: 'none',
          },
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(handleSearch)}
          display="flex"
          flexDirection="column"
          padding={2}
          sx={{
            width: useMediaQuery('(min-width:900px)') ? '35vw' : '65vw',
            maxWidth: '32rem',
            minWidth: '18rem',
          }}
          overflow="hidden"
        >
          <NavigationBar toggleIsDialogOpen={toggleIsDialogOpen} isEdit={isEdit} />

          <Paper
            sx={{
              p: 2,
              mb: 1,
              bgcolor: 'background.paper',
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Select
                  options={[
                    { text: 'Nome', value: 'name' },
                    { text: 'CPF', value: 'cpf_number' },
                    { text: 'Código Sindicato', value: 'company_code' },
                  ]}
                  control={control}
                  label="Campo"
                  errors={errors?.field}
                  {...register('field')}
                  register={register}
                  name="field"
                />
              </Grid>

              <Grid item xs={12}>
                <TextInput watch={watch} register={register} label="Buscar" errors={errors?.value} name="value" />
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" type="submit" value="Buscar" fullWidth disabled={loading}>
                  {!loading ? (
                    <span>Buscar</span>
                  ) : (
                    <LoopIcon
                      sx={{
                        animation: 'spin 2s linear infinite',
                        '@keyframes spin': {
                          '0%': {
                            transform: 'rotate(360deg)',
                          },
                          '100%': {
                            transform: 'rotate(0deg)',
                          },
                        },
                      }}
                    />
                  )}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Paper
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              overflow: 'auto',
              visibility: searchData.length ? '' : 'hidden',
            }}
          >
            <Grid container spacing={1}>
              {searchData.map((result) => (
                <Grid item xs={12} sm={12} md={12} key={result.id}>
                  <Button
                    variant="contained"
                    size="medium"
                    fullWidth
                    onClick={() => {
                      findBills(result);
                      toggleSaveOrEdit('edit');
                      resetField('value');
                      closeDrawer();
                      setSearchData([]);
                    }}
                  >
                    {result.name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      </Drawer>
    </>
  );
}
