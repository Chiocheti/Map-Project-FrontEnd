import { yupResolver } from '@hookform/resolvers/yup';
import LoopIcon from '@mui/icons-material/Loop';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import Button from '../Form/Button';
import NavigationBar from '../Form/NavigationBar';
import Select from '../Form/Select';
import ServiceDialog from './ServiceDialog';

const searchSchema = Yup.object().shape({
  field: Yup.string().required('Campo obrigatório'),
  value: Yup.string().required('Campo obrigatório'),
});

export default function DashboardDrawer({ isOpen, closeDrawer, fill, toggleSaveOrEdit, isEdit, canEdit }) {
  const { tokens } = useContext(AuthContext);

  const [searchData, setSearchData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(searchSchema),
  });

  function toggleIsDialogOpen() {
    setIsDialogOpen((previousValue) => !previousValue);
  }

  async function save(services) {
    setSearchData(() => services);
  }

  async function handleSearch(data) {
    const { field, value } = data;

    setLoading(true);
    const services = await api.post(
      'services/search',
      { field, value },
      {
        headers: {
          'x-access-token': tokens?.accessToken,
        },
      },
    );

    await save(services.data);

    setLoading(false);
  }

  async function findBills(service) {
    try {
      const bills = await api.post(
        'bills/getServiceBills',
        { clientName: service.company },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      fill(service, bills);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={() => {
        closeDrawer();
        setSearchData([]);
        reset();
      }}
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
          backgroundImage: 'none',
        },
      }}
    >
      <ServiceDialog isOpen={isDialogOpen} closeDialog={toggleIsDialogOpen} canEdit={canEdit} />

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
              <Typography component="h2" variant="h6">
                Pesquisar
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ mb: 1 }} />
            </Grid>
            <Grid item xs={12}>
              <Select
                options={[
                  { text: 'Nome', value: 'company' },
                  { text: 'CNPJ', value: 'cnpj' },
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
              <TextField
                label="Buscar"
                variant="outlined"
                size="small"
                fullWidth
                {...register('value')}
                error={!!errors?.value}
                helperText={errors?.value?.message}
              />
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
          {searchData.map((result) => (
            <Grid container key={result.id} spacing={1}>
              <Grid item xs={12} sm={12} md={12}>
                <Typography variant="h6">{result.company}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <InputLabel>Serviço</InputLabel>
                <Typography>{result.service}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <InputLabel>cnpj</InputLabel>
                <Typography>{result.cnpj}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <InputLabel>Email</InputLabel>
                <Typography>{result.mail}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <InputLabel>Telefone/Celular</InputLabel>
                <Typography>{result.phone01}</Typography>
              </Grid>

              <Grid item xs={12} sm={12} md={12}>
                <Button
                  variant="contained"
                  size="medium"
                  fullWidth
                  onClick={() => {
                    findBills(result);
                    toggleSaveOrEdit('edit');
                    reset();
                  }}
                >
                  Editar
                </Button>
              </Grid>

              <Grid item xs={12} py={1}>
                <Divider />
              </Grid>
            </Grid>
          ))}
        </Paper>
      </Box>
    </Drawer>
  );
}
