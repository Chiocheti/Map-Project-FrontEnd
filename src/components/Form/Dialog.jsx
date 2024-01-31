import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Slide from '@mui/material/Slide';
import { forwardRef, useContext } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import TextInput from './TextInput';

const schema = Yup.object().shape({
  changePassword: Yup.string().required('Campo obrigatório'),
  repeatPassword: Yup.string()
    .required('Campo obrigatório')
    .oneOf([Yup.ref('changePassword'), null], 'Senhas diferentes'),
});

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function CompDialog({ isOpen, closeDialog, setSnackbarState }) {
  const {
    tokens,
    user: { id },
  } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      changePassword: '',
      repeatPassword: '',
    },
  });

  async function updatePassword({ changePassword }) {
    try {
      await api.post(
        'users/password',
        { id, changePassword },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      setSnackbarState({
        open: true,
        message: 'Senha mudada com sucesso',
        severity: 'success',
      });
    } catch (error) {
      setSnackbarState({
        open: true,
        message: 'Houve um erro',
        severity: 'error',
      });
    }
  }

  return (
    <Dialog
      open={isOpen}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => {
        reset();
        closeDialog();
      }}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>MUDAR SENHA</DialogTitle>

      <DialogContent>
        <Grid container spacing={1} marginY={1}>
          <Grid item>
            <TextInput
              watch={watch}
              register={register}
              label="Nova Senha"
              errors={errors?.changePassword}
              name="changePassword"
            />
          </Grid>
          <Grid item>
            <TextInput
              watch={watch}
              register={register}
              label="Repetir Senha"
              errors={errors?.repeatPassword}
              name="repeatPassword"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleSubmit(updatePassword)} color="success">
          Trocar Senha
        </Button>
        <Button variant="contained" onClick={closeDialog} color="error">
          fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
