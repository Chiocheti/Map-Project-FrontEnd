import 'dayjs/locale/pt-br';
import { yupResolver } from '@hookform/resolvers/yup';
import MenuIcon from '@mui/icons-material/Menu';
import MuiAlert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import { forwardRef, useContext, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import DashboardBillsList from '../components/Dashboard/DashboardBillsList';
import AppBar from '../components/Form/AppBar';
import Button from '../components/Form/Button';
import MaskInput from '../components/Form/MaskInput';
import PhoneMaskInput from '../components/Form/PhoneMaskInput';
import Select from '../components/Form/Select';
import TextInput from '../components/Form/TextInput';
import Title from '../components/Form/Title';
import ServiceDrawer from '../components/Service/ServiceDrawer';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

const schemaService = Yup.object({
  company: Yup.string().required('Campo obrigatório'),
  service: Yup.string().required('Campo obrigatório'),
  cnpj: Yup.string(),
  mail: Yup.string(),
  phone01: Yup.string(),
  phone02: Yup.string(),
  phone03: Yup.string(),
});

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

function Form() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [saveOrEdit, setSaveOrEdit] = useState('save');
  const [serviceId, setServiceId] = useState();
  const [serviceBills, setServiceBills] = useState([]);

  const canEdit = useRef(false);

  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: null,
    severity: null,
  });

  const { tokens, user } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(schemaService),
    defaultValues: {
      company: '',
      service: '',
      cnpj: '',
      mail: '',
      phone01: '',
      phone02: '',
      phone03: '',
    },
  });

  useEffect(() => {
    function fetchData() {
      if (user) {
        user.permissions.forEach((permission) => {
          if (permission.resource === 'Setor de Serviços' && permission.action === 'edit') {
            canEdit.current = true;
          }
        });
      }
    }
    fetchData();
  }, [user]);

  function toggleIsDrawerOpen() {
    setIsDrawerOpen((previousValue) => !previousValue);
  }

  function handleCloseSnackbar(event, reason) {
    if (reason === 'clickaway') return;

    setSnackbarState({
      open: false,
      message: null,
    });
  }

  let isEdit = false;

  function verifyIsEdit() {
    if (watch('company') !== '') {
      isEdit = true;
    }
    if (watch('service') !== '') {
      isEdit = true;
    }
    if (watch('cnpj') !== '') {
      isEdit = true;
    }
    if (watch('mail') !== '') {
      isEdit = true;
    }
    if (watch('phone01') !== '') {
      isEdit = true;
    }
    if (watch('phone02') !== '') {
      isEdit = true;
    }
    if (watch('phone03') !== '') {
      isEdit = true;
    }
  }

  verifyIsEdit();

  async function fillFields(data, bills) {
    setValue('company', data.company);
    setValue('service', data.service);
    setValue('cnpj', data.cnpj);
    setValue('mail', data.mail);
    setValue('phone01', data.phone01);
    setValue('phone02', data.phone02);
    setValue('phone03', data.phone03);

    setServiceId(data.id);

    setServiceBills(bills.data);
  }

  async function saveService(data) {
    try {
      if (!canEdit.current) {
        setSnackbarState({
          open: true,
          message: 'Você não tem permissão de cadastrar um serviço',
          severity: 'error',
        });
      } else {
        let canPass = true;
        for (let i = 0; i < data.company.length; i += 1) {
          if (data.company[i] === '-') {
            canPass = false;
          }
        }

        if (!canPass) {
          setSnackbarState({
            open: true,
            message: 'Proibido nome com digito [ - ] ',
            severity: 'warning',
          });
          return 0;
        }

        const res = await api.post(
          'services/create',
          { service: data, userId: user.id },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );

        if (res.status === 200) {
          setSnackbarState({
            open: true,
            message: 'Cadastro feito com sucesso',
            severity: 'success',
          });

          reset();
        }

        if (res.status === 201) {
          setSnackbarState({
            open: true,
            message: 'Nome do serviço já em uso',
            severity: 'warning',
          });
        }
      }
      return true;
    } catch (error) {
      setSnackbarState({
        open: true,
        message: 'Houve um erro interno',
        severity: 'error',
      });
      return 0;
    }
  }

  async function updateService(data) {
    try {
      if (!canEdit.current) {
        setSnackbarState({
          open: true,
          message: 'Você não tem permissão para editar um serviço',
          severity: 'error',
        });
      } else {
        const res = await api.post(
          'services/update',
          { id: serviceId, service: data, userId: user.id },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );

        if (res.status === 200) {
          setSnackbarState({
            open: true,
            message: 'Edição feita com sucesso',
            severity: 'success',
          });
        }

        if (res.status === 201) {
          setSnackbarState({
            open: true,
            message: 'Nome do serviço já em uso',
            severity: 'warning',
          });
        }
      }
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
      <ServiceDrawer
        fill={fillFields}
        isOpen={isDrawerOpen}
        closeDrawer={toggleIsDrawerOpen}
        toggleSaveOrEdit={setSaveOrEdit}
        isEdit={isEdit}
        canEdit={canEdit.current}
      />

      <AppBar>
        <Grid container justifyContent="space-between">
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" onClick={toggleIsDrawerOpen}>
            <MenuIcon />
          </IconButton>

          <Stack direction="row" spacing={1}>
            {saveOrEdit === 'save' ? (
              <Button variant="contained" color="success" onClick={handleSubmit(saveService)}>
                Cadastrar
              </Button>
            ) : (
              <Button variant="contained" color="warning" onClick={handleSubmit(updateService)}>
                Salvar
              </Button>
            )}
          </Stack>
        </Grid>
      </AppBar>

      <Container component="form" sx={{ mt: 1, mb: 4, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Title>Cadastro de prestador de serviços</Title>

        <Grid container spacing={1}>
          <Grid item xs={12} sm={12} md={12}>
            <TextInput watch={watch} register={register} label="Nome Empresa" errors={errors?.company} name="company" />
          </Grid>

          <Grid item xs={6} sm={4} md={4}>
            <MaskInput
              watch={watch}
              control={control}
              name="cnpj"
              mask="99.999.999/9999-99"
              label="CNPJ"
              errors={errors?.cnpj}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={4}>
            <TextInput type="email" watch={watch} register={register} label="Email" errors={errors?.mail} name="mail" />
          </Grid>

          <Grid item xs={6} sm={4} md={4}>
            <Select
              options={[
                { text: 'Médico', value: 'Médico' },
                { text: 'Outro serviço', value: 'Outro serviço' },
              ]}
              control={control}
              label="Tipo de Serviço"
              errors={errors?.service}
              {...register('service')}
              register={register}
              name="service"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={4}>
            <PhoneMaskInput
              watch={watch}
              control={control}
              name="phone01"
              label="Telefone/Celular"
              errors={errors?.phone01}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={4}>
            <PhoneMaskInput
              watch={watch}
              control={control}
              name="phone02"
              label="Telefone/Celular"
              errors={errors?.phone02}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={4}>
            <PhoneMaskInput
              watch={watch}
              control={control}
              name="phone03"
              label="Telefone/Celular"
              errors={errors?.phone03}
            />
          </Grid>
        </Grid>

        <Grid>
          <DashboardBillsList fieldsBills={serviceBills} />
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

export default Form;
