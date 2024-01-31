import { yupResolver } from '@hookform/resolvers/yup';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { forwardRef, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import Button from '../Form/Button';
import MoneyTextInput from '../Form/MoneyTextInput';
import TextInput from '../Form/TextInput';

const schema = Yup.object({
  config: Yup.array().of(
    Yup.object().shape({
      id: Yup.string(),
      amount: Yup.string(),
      check_number: Yup.boolean(),
      receiver_number: Yup.boolean(),
      actualized_monthly_credit: Yup.boolean(),
      actualized_annual_credit: Yup.boolean(),
    }),
  ),
});

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function CompDialog({ isOpen, closeDialog, setSnackbarState, canEdit }) {
  const { tokens, user } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    async function fetchData() {
      if (tokens) {
        try {
          const { data } = await api.get('/configs', {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          });
          setValue('id', data.id);
          setValue('amount', data.amount);
          setValue('check_number', data.check_number);
          setValue('receiver_number', data.receiver_number);
          setValue('actualized_monthly_credit', data.actualized_monthly_credit);
          setValue('actualized_annual_credit', data.actualized_annual_credit);
        } catch (error) {
          setSnackbarState({
            open: true,
            message: 'Houve um erro interno',
            severity: 'error',
          });
        }
      }
    }
    fetchData();
  }, [tokens, user, setValue, setSnackbarState, watch]);

  async function saveConfig({ id, ...config }) {
    if (!canEdit) {
      setSnackbarState({
        open: true,
        message: 'Você não tem permissão para fazer essas alterações',
        severity: 'warning',
      });
    } else {
      try {
        const res = await api.post(
          'configs/update',
          { id, config, userId: user.id },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );

        if (res.status === 200) {
          setSnackbarState({
            open: true,
            message: 'Salvo com sucesso',
            severity: 'success',
          });
        }
      } catch (error) {
        setSnackbarState({
          open: true,
          message: 'Houve um erro interno',
          severity: 'error',
        });
      }
    }
  }

  return (
    <Dialog
      open={isOpen}
      TransitionComponent={Transition}
      keepMounted
      maxWidth="lg"
      fullWidth
      onClose={() => {
        closeDialog();
      }}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogContent sx={{ mt: 1, mb: 1, p: 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={4} sm={4} md={2}>
            <Typography variant="h6" align="center">
              {useMediaQuery('(min-width:600px)') ? 'TOTAL DA RECEITA' : 'RECEITA'}
            </Typography>
            <Divider />
          </Grid>

          <Grid item xs={4} sm={4} md={2}>
            <Typography variant="h6" align="center">
              {useMediaQuery('(min-width:600px)') ? 'CHEQUE' : 'CHEQUE'}
            </Typography>
            <Divider />
          </Grid>

          <Grid item xs={4} sm={4} md={2}>
            <Typography variant="h6" align="center">
              {useMediaQuery('(min-width:600px)') ? 'RECIBO' : 'RECIBO'}
            </Typography>
            <Divider />
          </Grid>

          <Grid item xs={4} sm={4} md={3}>
            <Typography variant="h6" align="center">
              {useMediaQuery('(min-width:600px)') ? 'CREDITO MENSAL' : 'MENSAL'}
            </Typography>
            <Divider />
          </Grid>

          <Grid item xs={4} sm={4} md={3}>
            <Typography variant="h6" align="center">
              {useMediaQuery('(min-width:600px)') ? 'CREDITO ANUAL' : 'ANUAL'}
            </Typography>
            <Divider />
          </Grid>

          <Grid item xs={4} sm={4} md={2}>
            <MoneyTextInput watch={watch} register={register} label="Total" errors={errors?.amount} name="amount" />
          </Grid>

          <Grid item xs={4} sm={4} md={2}>
            <TextInput
              watch={watch}
              register={register}
              label="Cheque"
              errors={errors?.check_number}
              name="check_number"
            />
          </Grid>

          <Grid item xs={4} sm={4} md={2}>
            <TextInput
              watch={watch}
              register={register}
              label="Recibo"
              errors={errors?.receiver_number}
              name="receiver_number"
            />
          </Grid>

          <Grid item xs={4} sm={4} md={3} textAlign="center">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon color="error" />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={watch('actualized_monthly_credit') || false}
              onClick={() => {
                setValue('actualized_monthly_credit', !watch('actualized_monthly_credit'));
              }}
            />
          </Grid>

          <Grid item xs={4} sm={4} md={3} textAlign="center">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon color="error" />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={watch('actualized_annual_credit') || false}
              onClick={() => {
                setValue('actualized_annual_credit', !watch('actualized_annual_credit'));
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleSubmit(saveConfig)} color="success" variant="contained">
          Salvar
        </Button>
        <Button onClick={closeDialog} color="error" variant="contained">
          fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
