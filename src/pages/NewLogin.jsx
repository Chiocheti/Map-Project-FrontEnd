import { yupResolver } from '@hookform/resolvers/yup';
import MuiAlert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import { forwardRef, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import Button from '../components/Form/Button';
import MaskInputText from '../components/Form/MaskInput';
import TextInput from '../components/Form/TextInput';
import { AuthContext } from '../contexts/AuthContext';

const schema = Yup.object({
  name: Yup.string().required('Campo Obrigatório'),
  cpf: Yup.string().required('Campo Obrigatório'),
});

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

export default function NewLogin() {
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: null,
    severity: null,
  });

  const { clientLogin } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function handleCloseSnackbar(event, reason) {
    if (reason === 'clickaway') return;

    setSnackbarState({
      open: false,
      message: null,
    });
  }

  function validateCpf(cpf) {
    let clearCpf = '';
    for (let i = 0; i < cpf.length; i += 1) {
      if (cpf[i] !== '.' && cpf[i] !== '-') {
        clearCpf = `${clearCpf}${cpf[i]}`;
      }
    }

    if (clearCpf.length !== 11 || clearCpf === '00000000000') {
      return false;
    }

    let soma = 0;
    for (let i = 0; i < 9; i += 1) {
      soma += parseInt(clearCpf.charAt(i), 10) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    const digitoVerificador1 = resto === 10 || resto === 11 ? 0 : resto;

    soma = 0;
    for (let i = 0; i < 10; i += 1) {
      soma += parseInt(clearCpf.charAt(i), 10) * (11 - i);
    }
    resto = 11 - (soma % 11);
    const digitoVerificador2 = resto === 10 || resto === 11 ? 0 : resto;

    if (
      parseInt(clearCpf.charAt(9), 10) !== digitoVerificador1 ||
      parseInt(clearCpf.charAt(10), 10) !== digitoVerificador2
    ) {
      return false;
    }

    return true;
  }

  function singin({ name, cpf }) {
    if (!validateCpf(cpf)) {
      setSnackbarState({
        open: true,
        message: 'Digite um CPF valido',
        severity: 'error',
      });

      return false;
    }

    return clientLogin(name, cpf);
  }

  return (
    <>
      <Container sx={{ mt: 20 }} maxWidth="xs">
        <Paper
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'background.paper',
            p: 5,
            borderRadius: 15,
          }}
        >
          <Grid container spacing={1} sx={{}}>
            <Grid item xs={12} sm={12} md={12}>
              <Typography fontSize={20} textAlign="start">
                NOME COMPLETO
              </Typography>
              <TextInput watch={watch} register={register} errors={errors?.name} name="name" />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <Typography fontSize={20} textAlign="start">
                CPF
              </Typography>
              <MaskInputText watch={watch} control={control} name="cpf" mask="999.999.999-99" errors={errors?.cpf} />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <Button variant="contained" value="Buscar" fullWidth onClick={handleSubmit(singin)}>
                Buscar
              </Button>
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <Button variant="contained" value="Buscar" color="warning" fullWidth>
                entrar como servidor
              </Button>
            </Grid>
          </Grid>
        </Paper>
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
