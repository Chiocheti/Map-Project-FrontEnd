import { yupResolver } from '@hookform/resolvers/yup';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Slide from '@mui/material/Slide';
import moment from 'moment';
import { useState, forwardRef, useContext } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import ReadOnly from '../Form/ReadOnly';
import Select from '../Form/Select';
import TextInput from '../Form/TextInput';

const schema = Yup.object().shape({
  field: Yup.string().required('Escolha o tipo de consulta'),
  value: Yup.string().required('Digite a consulta'),
});

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function CompDialog({ isOpen, closeDialog, snackbar }) {
  const { tokens } = useContext(AuthContext);

  const [searchData, setSearchData] = useState([]);
  const [newActions, setNewActions] = useState([]);
  const [showOldActions, setShowOldActions] = useState(false);
  const [oldActions, setOldActions] = useState([]);
  const [isBackDropOpen, setIsBackDropOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      field: '',
      value: '',
    },
  });

  async function findData(data) {
    try {
      setIsBackDropOpen(true);
      const { field, value } = data;

      let users = 0;

      if (field === 'userId') {
        users = await api.post(
          'users/simpleSearch',
          { value },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );
      } else {
        users = await api.post(
          'actions/simpleSearch',
          { value },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );
      }

      setSearchData(users.data);
      setIsBackDropOpen(false);
    } catch (error) {
      snackbar({
        open: true,
        message: 'Houve um erro interno',
        severity: 'error',
      });
    }
  }

  async function findActions(id) {
    try {
      setIsBackDropOpen(true);
      const field = watch('field');
      const month = moment(new Date()).date('1').format('YYYY-MM-DD');

      const {
        data: { newActionsArray, oldActionsArray },
      } = await api.post(
        'actions/search',
        { id, field, month },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      moment.locale('pt-br');

      newActionsArray.forEach((element) => {
        const day = new Date(element.created_at);

        const date = moment(day).format('DD/MM/YYYY - HH:mm:ss');

        element.created_at = date; //eslint-disable-line

        element.action = `${element.user.name} - ${element.action}`; //eslint-disable-line
      });

      oldActionsArray.forEach((element) => {
        const day = new Date(element.created_at);

        const date = moment(day).format('DD/MM/YYYY - HH:mm:ss');

        element.created_at = date; //eslint-disable-line

        element.action = `${element.user.name} - ${element.action}`; //eslint-disable-line
      });

      setNewActions(newActionsArray);
      setOldActions(oldActionsArray);
      setIsBackDropOpen(false);
    } catch (error) {
      snackbar({
        open: true,
        message: 'Houve um erro interno',
        severity: 'error',
      });
    }
  }

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isBackDropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Dialog
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        maxWidth="xl"
        fullWidth
        onClose={() => {
          setSearchData([]);
          setOldActions([]);
          setNewActions([]);
          setShowOldActions(false);
          reset();
          closeDialog();
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Buscar Histórico</DialogTitle>

        <DialogContent>
          <Grid item xs={12} sx={{ my: 1 }}>
            <Select
              options={[
                { text: 'Usuário', value: 'userId' },
                { text: 'Cadastro', value: 'reference' },
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

          <Grid container display="flex" spacing={1} sx={{ mt: 1 }}>
            {searchData.map((result, index) => (
              <Grid
                item
                display="flex"
                xs={index + 1 === searchData.length && searchData.length % 2 !== 0 ? 12 : 6}
                key={result.id}
              >
                <Button
                  variant="contained"
                  size="medium"
                  fullWidth
                  onClick={() => {
                    findActions(result.id);
                  }}
                  key={result.id}
                >
                  {result.name}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Grid container mt={2}>
            {newActions
              ? newActions.map((action) => (
                  <Grid container key={action.id} spacing={1}>
                    <Grid item xs={12} sm={6} md={4}>
                      <ReadOnly value={action.action} variant="standard" />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <ReadOnly value={action.created_at} variant="standard" />
                    </Grid>

                    <Grid item xs={12} sm={12} md={4}>
                      <ReadOnly value={action.reference ? action.reference : 'Sem referencia'} variant="standard" />
                    </Grid>
                  </Grid>
                ))
              : null}
          </Grid>

          <Grid container spacing={1} sx={{ mt: 1 }}>
            {newActions.length || oldActions.length ? (
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="medium"
                  fullWidth
                  color="warning"
                  onClick={() => {
                    setShowOldActions((oldValue) => !oldValue);
                  }}
                >
                  Mostrar Informações antigas
                </Button>
              </Grid>
            ) : null}
          </Grid>

          <Grid container mt={2}>
            {oldActions && showOldActions
              ? oldActions.map((action) => (
                  <Grid container key={action.id} spacing={1}>
                    <Grid item xs={12} sm={6} md={4}>
                      <ReadOnly value={action.action} variant="standard" />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <ReadOnly value={action.created_at} variant="standard" />
                    </Grid>

                    <Grid item xs={12} sm={12} md={4}>
                      <ReadOnly value={action.reference ? action.reference : 'Sem referencia'} variant="standard" />
                    </Grid>
                  </Grid>
                ))
              : null}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit(findData)} color="success" variant="contained">
            Buscar
          </Button>
          <Button
            onClick={() => {
              setSearchData([]);
              setOldActions([]);
              setNewActions([]);
              setShowOldActions(false);
              reset();
              closeDialog();
            }}
            color="error"
            variant="contained"
          >
            fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
