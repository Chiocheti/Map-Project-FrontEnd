import { yupResolver } from '@hookform/resolvers/yup';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MuiAlert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Cookies from 'js-cookie';
import { forwardRef, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';

import { AuthContext } from '../contexts/AuthContext';

const schema = yup.object({
  username: yup.string().required('Campo obrigatório'),
  password: yup.string().required('Campo obrigatório'),
});

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: null,
  });
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const data = Cookies.get('Ecrm@auth');
    const sessionData = sessionStorage.getItem('Ecrm@auth');

    if (data || sessionData) {
      const parsedData = JSON.parse(data || sessionData);

      switch (parsedData.user.roles[0]) {
        case 'Administrativo':
          navigate('/admin');
          break;

        case 'Setor de Sócios':
          navigate('/form');
          break;

        case 'Setor Médico':
          navigate('/refunds');
          break;

        case 'Financeiro':
          navigate('/financier');
          break;

        case 'Setor de Serviços':
          navigate('/services');
          break;

        case 'Calendario':
          navigate('/calendar');
          break;

        case 'Relatório':
          navigate('/report');
          break;

        default:
          break;
      }
    }
  }, [navigate]);

  const { login, isLoading } = useContext(AuthContext);

  async function handleSubmitData(data) {
    const { username, password, keepSigned } = data;
    try {
      await login(username, password, keepSigned);
    } catch (error) {
      setSnackbarState({
        open: true,
        message: error.message,
      });
    }
  }

  function handleClickShowPassword() {
    setShowPassword(!showPassword);
  }

  function handleCloseSnackbar(event, reason) {
    if (reason === 'clickaway') return;

    setSnackbarState({
      open: false,
      message: null,
    });
  }

  return (
    <Container component="main" maxWidth="xs">
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
        <Avatar sx={{ m: 1, bgcolor: 'secondary.dark' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit(handleSubmitData)} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Usuário"
            name="username"
            autoComplete="username"
            autoFocus
            {...register('username')}
            error={!!errors?.username}
            helperText={errors?.username?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            {...register('password')}
            error={!!errors?.password}
            helperText={errors?.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword}>
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="Manter conectado"
            {...register('keepSigned')}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
            Entrar
          </Button>
        </Box>
      </Paper>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbarState.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default SignIn;
