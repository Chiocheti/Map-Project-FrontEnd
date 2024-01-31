import { yupResolver } from '@hookform/resolvers/yup';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import Autocomplete from '@mui/material/Autocomplete';
import Badge from '@mui/material/Badge';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { forwardRef, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import Button from '../Form/Button';
import MaskInput from '../Form/MaskInput';
import MoneyTextInput from '../Form/MoneyTextInput';
import Select from '../Form/Select';
import TextInput from '../Form/TextInput';

const schema = Yup.object({
  value: Yup.string().required('Campo obrigatório'),
  name: Yup.string().required('Campo obrigatório'),
  cpf: Yup.string().required('Campo obrigatório'),
  phone: Yup.string().required('Campo obrigatório'),
  payStyle: Yup.string().required('Campo obrigatório'),
  description: Yup.string().required('Campo obrigatório'),
});

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function CalendarPopUp({ isOpen, close, clients, clientsId, day, reserv, snackbar, canEdit }) {
  const [isUpdate, setIsUpdate] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isRegistered, setIsRegistered] = useState(true);
  const [autocompleteValue, setAutocompleteValue] = useState(null);
  const [countCancelate, setCountCancelate] = useState(0);
  const [countReservation, setCountReservation] = useState(0);

  const { tokens } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    control,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      value: '',
      name: '',
      cpf: '',
      phone: '',
      payStyle: '',
      description: '',
    },
  });

  useEffect(() => {
    reset();
    setIsUpdate(false);
    setIsBlocked(false);
    setAutocompleteValue(null);
    setCountReservation(0);
    setCountCancelate(0);
    if (reserv) {
      if (reserv.payStyle === 'BLOQUEADO') {
        setIsBlocked(true);
      } else {
        setValue('cpf', reserv.cpf);
        setValue('value', reserv.value);
        setValue('phone', reserv.phone);
        setValue('description', reserv.description);
        setValue('payStyle', reserv.payStyle);
        if (reserv.clientId) {
          setIsRegistered(true);
          // setValue('name', reserv.clients.name);
          setValue('name', `[${reserv.clients.cpfNumber}] - ${reserv.clients.name}`);
          setAutocompleteValue(`[${reserv.clients.cpfNumber}] - ${reserv.clients.name}`);
          let numberCanceled = 0;

          reserv.clients.reservations.forEach((reserved) => {
            if (reserved.pay_style === 'Cancelado') {
              numberCanceled += 1;
            }
          });

          setCountReservation(reserv.clients.reservations.length);

          setCountCancelate(numberCanceled);
        } else {
          setIsRegistered(false);
          setValue('name', reserv.name);
        }
        setIsUpdate(true);
      }
    }
  }, [reserv, setValue, reset]);

  async function find(value) {
    try {
      if (!value) {
        return 0;
      }

      const search = value.split(' - ');

      const { data } = await api.post(
        'clients/findInformation',
        { name: search[1], cpfNumber: search[0].slice(1, 15) },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      let numberCanceled = 0;

      data.reservations.forEach((reserved) => {
        if (reserved.pay_style === 'Cancelado') {
          numberCanceled += 1;
        }
      });

      setCountReservation(data.reservations.length);

      setCountCancelate(numberCanceled);

      setValue('cpf', data.cpf_number);
      setValue('phone', data.phone01);

      return 0;
    } catch (error) {
      snackbar({
        open: true,
        message: 'Houve um erro interno',
        severity: 'error',
      });
      return 0;
    }
  }

  async function saveDay({ name, ...data }) {
    if (!canEdit) {
      snackbar({
        open: true,
        message: 'Você não tem permissão para reservar um dia',
        severity: 'error',
      });
    } else {
      data.date = day.format('YYYY-MM-DD'); //eslint-disable-line

      if (isUpdate) {
      data.id = reserv.id; //eslint-disable-line
      }

      const search = name.split(' - ');

      if (isRegistered) {
      data.clientId = clientsId.current.find((client) => client.name === search[1] && client.cpfNumber === search[0].slice(1, 15)).id; //eslint-disable-line
      data.name = null; //eslint-disable-line
      } else {
      data.clientId = null; //eslint-disable-line
      data.name = name; //eslint-disable-line
      }

      try {
        await api.post(
          'reservations/update',
          { data },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );

        if (isUpdate) {
          snackbar({
            open: true,
            message: 'Reserva editada com sucesso',
            severity: 'success',
          });
        } else {
          snackbar({
            open: true,
            message: 'Reserva cadastrada com sucesso',
            severity: 'success',
          });
        }

        close();
      } catch (error) {
        snackbar({
          open: true,
          message: 'Houve um erro interno',
          severity: 'error',
        });
      }
    }
  }

  async function blockDay() {
    if (!canEdit) {
      snackbar({
        open: true,
        message: 'Você não ter permissão para bloquear esse dia',
        severity: 'warning',
      });
    } else {
      const data = {
        date: day.format('YYYY-MM-DD'),
        payStyle: 'BLOQUEADO',
        name: 'BLOQUEADO',
      };

      try {
        await api.post(
          'reservations/update',
          { data },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );

        snackbar({
          open: true,
          message: 'Reserva bloqueada com sucesso',
          severity: 'warning',
        });

        close();
      } catch (error) {
        snackbar({
          open: true,
          message: 'Houve um erro interno',
          severity: 'error',
        });
      }
    }
  }

  async function unlockDay() {
    if (!canEdit) {
      snackbar({
        open: true,
        message: 'Você não ter permissão para desbloquear esse dia',
        severity: 'warning',
      });
    } else {
      try {
        await api.post(
          'reservations/delete',
          { id: reserv.id },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );

        snackbar({
          open: true,
          message: 'Reserva desbloqueada com sucesso',
          severity: 'warning',
        });

        close();
      } catch (error) {
        snackbar({
          open: true,
          message: 'Houve um erro interno',
          severity: 'error',
        });
      }
    }
  }

  const handleAutocompleteChange = (event, newValue) => {
    setAutocompleteValue(newValue);
    setValue('name', newValue);
    find(newValue);
  };

  function toggleIsRegistered() {
    setIsRegistered((previousValue) => !previousValue);
  }

  return (
    <Dialog
      open={isOpen}
      TransitionComponent={Transition}
      keepMounted
      maxWidth="md"
      fullWidth
      onClose={() => {
        close();
        reset();
        setIsUpdate(false);
        setIsBlocked(false);
        setAutocompleteValue(null);
        setCountReservation(0);
        setCountCancelate(0);
      }}
    >
      <DialogContent>
        <Typography variant="h6">REGISTRO DO DIA {day ? day.format('DD/MM/YYYY') : ''}</Typography>
        <Grid container spacing={1}>
          {isRegistered ? (
            <>
              <Grid item xs={10} sm={10} md={10} textAlign="end">
                <Badge color="warning" badgeContent={countCancelate} showZero>
                  <EventBusyIcon color="error" />
                </Badge>
              </Grid>

              <Grid item xs={2} sm={2} md={2} textAlign="center">
                <Badge color="warning" badgeContent={countReservation} showZero>
                  <EventAvailableIcon color="success" />
                </Badge>
              </Grid>
            </>
          ) : null}

          <Grid item xs={2} sm={1} md={1} textAlign="center" mt={!isRegistered ? 2 : null}>
            <Checkbox
              icon={<AccountCircleOutlinedIcon color="warning" />}
              checkedIcon={<AccountCircleIcon color="success" />}
              checked={isRegistered}
              onClick={toggleIsRegistered}
            />
          </Grid>

          {isRegistered ? (
            <Grid item xs={10} sm={7} md={7}>
              <Autocomplete
                value={autocompleteValue}
                onChange={handleAutocompleteChange}
                options={clients}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cliente"
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={!!errors?.name}
                    helperText={errors?.name?.message}
                  />
                )}
              />
            </Grid>
          ) : (
            <Grid item xs={10} sm={11} md={7} mt={2}>
              <TextInput watch={watch} register={register} label="Cliente" errors={errors?.name} name="name" />
            </Grid>
          )}

          <Grid item xs={12} sm={4} md={4} mt={!isRegistered ? 2 : null}>
            <MaskInput
              watch={watch}
              control={control}
              name="cpf"
              mask="999.999.999-99"
              label="CPF"
              errors={errors?.cpf}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <TextInput watch={watch} register={register} label="Telefone/Celular" errors={errors?.phone} name="phone" />
          </Grid>

          <Grid item xs={5} sm={4} md={4}>
            <MoneyTextInput
              watch={watch}
              register={register}
              label="Valor do Recibo"
              errors={errors?.value}
              name="value"
            />
          </Grid>

          <Grid item xs={7} sm={4} md={4}>
            {isUpdate ? (
              <Select
                options={[
                  { text: 'Depósito', value: 'Depósito' },
                  { text: 'Parcela Unica', value: 'Parcela Unica' },
                  { text: 'Duas Parcelas', value: 'Duas Parcelas' },
                  { text: 'Cancelado', value: 'Cancelado' },
                ]}
                control={control}
                label="Pagamento"
                errors={errors?.payStyle}
                {...register('payStyle')}
                register={register}
                name="payStyle"
              />
            ) : (
              <Select
                options={[
                  { text: 'Depósito', value: 'Depósito' },
                  { text: 'Parcela Unica', value: 'Parcela Unica' },
                  { text: 'Duas Parcelas', value: 'Duas Parcelas' },
                ]}
                control={control}
                label="Pagamento"
                errors={errors?.payStyle}
                {...register('payStyle')}
                register={register}
                name="payStyle"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={12} md={12}>
            <TextInput
              watch={watch}
              register={register}
              label="Descrição"
              errors={errors?.description}
              name="description"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        {!isUpdate && !isBlocked ? (
          <Button onClick={blockDay} color="warning" variant="contained">
            Bloquear
          </Button>
        ) : null}

        {isBlocked ? (
          <Button onClick={unlockDay} color="warning" variant="contained">
            Desbloquear
          </Button>
        ) : (
          <Button onClick={handleSubmit(saveDay)} color="success" variant="contained">
            Salvar
          </Button>
        )}

        <Button onClick={() => close()} color="error" variant="contained">
          fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
