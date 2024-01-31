import { yupResolver } from '@hookform/resolvers/yup';
import LoopIcon from '@mui/icons-material/Loop';
import { Paper } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
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
import TextInput from '../Form/TextInput';
import CompDialog from './AdmDialog';

const schema = Yup.object().shape({
  field: Yup.string().required('Escolha o tipo de consulta'),
  value: Yup.string().required('Digite a consulta'),
});

export default function AdminDrawer({ isOpen, closeDrawer, fill, toggleSaveOrEdit, isEdit, snackbar }) {
  const { tokens } = useContext(AuthContext);

  const [searchData, setSearchData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function toggleIsDialogOpen() {
    setIsDialogOpen((previousValue) => !previousValue);
  }

  async function save(users) {
    setSearchData(users);
  }

  async function handleSearch(data) {
    const { field, value } = data;

    setLoading(true);
    const users = await api.post(
      'users/search',
      { field, value },
      {
        headers: {
          'x-access-token': tokens?.accessToken,
        },
      },
    );

    await save(users.data);

    setLoading(false);
  }

  return (
    <>
      <CompDialog isOpen={isDialogOpen} closeDialog={toggleIsDialogOpen} snackbar={snackbar} />

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
              mb: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography component="h2" variant="h5">
                  Pesquisar
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ mb: 1 }} />
              </Grid>
              <Grid item xs={12}>
                <Select
                  options={[
                    { text: 'Nome', value: 'name' },
                    { text: 'Login', value: 'username' },
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
            {searchData.map(({ roles, permissions, ...result }) => (
              <Grid container key={result.id} display="flex" sx={{ my: 1 }}>
                <Grid container textAlign="center">
                  <Grid item xs={12}>
                    <Typography variant="h5">{result.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <InputLabel>Login</InputLabel>
                    <Typography>{result.username}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <InputLabel>Telefone</InputLabel>
                    <Typography>{result.phone}</Typography>
                  </Grid>
                </Grid>

                <Grid container textAlign="center">
                  {roles.map((role, index) => (
                    <Grid item xs={6} sm={4} md={4} key={role.id}>
                      <InputLabel>Cargo {String(index + 1).padStart(2, '0')}</InputLabel>
                      <Typography fontSize={15}>{roles[index].name}</Typography>
                      <Typography fontSize={15}>
                        {permissions[index].action === 'edit' ? 'Editar' : 'Pesquisar'}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size="medium"
                    fullWidth
                    onClick={() => {
                      fill(result, roles, permissions);
                      toggleSaveOrEdit('edit');
                      reset();
                    }}
                  >
                    Editar
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>
              </Grid>
            ))}
          </Paper>
        </Box>
      </Drawer>
    </>
  );
}
