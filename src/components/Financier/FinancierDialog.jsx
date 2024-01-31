import { yupResolver } from '@hookform/resolvers/yup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Slide from '@mui/material/Slide';
import { forwardRef, useContext, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import Button from '../Form/Button';
import MoneyTextInput from '../Form/MoneyTextInput';
import TextInput from '../Form/TextInput';

const schema = Yup.object({
  banks: Yup.array().of(
    Yup.object().shape({
      bank: Yup.string().required('Campo obrigatório'),
      agency: Yup.string().required('Campo obrigatório'),
      account: Yup.string().required('Campo obrigatório'),
      over: Yup.string().required('Campo obrigatório'),
      reserved: Yup.string().required('Campo obrigatório'),
      application: Yup.string().required('Campo obrigatório'),
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
    control,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      banks: [],
    },
  });

  const {
    fields: fieldsBanks,
    append: appendBank,
    remove: removeBank,
  } = useFieldArray({
    control,
    name: 'banks',
  });

  useEffect(() => {
    async function fetchData() {
      if (tokens) {
        try {
          const { data } = await api.get('/banks', {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          });

          setValue('banks', data);
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
  }, [tokens, user, setValue, setSnackbarState]);

  function addNewBank() {
    appendBank({
      bank: '',
      agency: '',
      account: '',
      over: '',
      reserved: '',
      application: '',
    });
  }

  async function saveBanks({ banks }) {
    if (!canEdit) {
      setSnackbarState({
        open: true,
        message: 'Você não tem permissão para cadastrar um novo banco',
        severity: 'warning',
      });
    } else {
      try {
        const res = await api.post(
          'banks/create',
          { banks, userId: user.id },
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
      maxWidth="md"
      fullWidth
      onClose={() => {
        closeDialog();
      }}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>Cadastrar Bancos</DialogTitle>

      <DialogContent sx={{ mt: 1, mb: 1, p: 2 }}>
        <Grid container>
          {fieldsBanks.map((field, index) => (
            <Grid container spacing={1} sx={{ mt: 1 }} key={watch(`banks.${index}.id`)}>
              <Grid item xs={6} sm={4} md={2}>
                <TextInput
                  watch={watch}
                  register={register}
                  label="Banco"
                  errors={errors?.banks?.[index]?.bank}
                  name={`banks.${index}.bank`}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <TextInput
                  watch={watch}
                  register={register}
                  label="Agencia"
                  errors={errors?.banks?.[index]?.agency}
                  name={`banks.${index}.agency`}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <TextInput
                  watch={watch}
                  register={register}
                  label="Conta"
                  errors={errors?.banks?.[index]?.account}
                  name={`banks.${index}.account`}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <MoneyTextInput
                  watch={watch}
                  register={register}
                  label="Saldo"
                  errors={errors?.banks?.[index]?.over}
                  name={`banks.${index}.over`}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <MoneyTextInput
                  watch={watch}
                  register={register}
                  label="Reservado"
                  errors={errors?.banks?.[index]?.reserved}
                  name={`banks.${index}.reserved`}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <MoneyTextInput
                  watch={watch}
                  register={register}
                  label="Aplicação"
                  errors={errors?.banks?.[index]?.application}
                  name={`banks.${index}.application`}
                />
              </Grid>
              <Grid item xs={12}>
                {fieldsBanks.length > 1 ? (
                  <Button variant="contained" size="medium" fullWidth color="error" onClick={() => removeBank(index)}>
                    Deletar
                  </Button>
                ) : null}
              </Grid>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button fullWidth color="primary" sx={{ mt: 1 }} onClick={addNewBank} variant="contained">
              Adicionar
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit(saveBanks)} color="success" variant="contained">
          Salvar
        </Button>
        <Button onClick={closeDialog} color="error" variant="contained">
          fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
