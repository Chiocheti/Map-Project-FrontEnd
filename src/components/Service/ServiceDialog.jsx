import { yupResolver } from '@hookform/resolvers/yup';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DeleteIcon from '@mui/icons-material/Delete';
import MuiAlert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import { useState, forwardRef, useContext, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import * as Yup from 'yup';

import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import TextInput from '../Form/TextInput';
import ServiceList from './ServiceList';

const schema = Yup.object().shape({
  specialties: Yup.array().of(
    Yup.object().shape({
      skill: Yup.string().required('Campo obrigatório'),
      lack: Yup.boolean().required('Campo obrigatório'),
    }),
  ),
});

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

export default function ServiceDialog({ isOpen, closeDialog, canEdit }) {
  const {
    tokens,
    user: { id },
  } = useContext(AuthContext);

  const [isBackDropOpen, setIsBackDropOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: null,
    severity: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      specialties: [],
    },
  });

  const {
    fields: fieldsSpecialties,
    prepend: prependSpecialties,
    remove: removeSpecialties,
  } = useFieldArray({
    control,
    name: 'specialties',
  });

  useEffect(() => {
    async function searchSpecialties() {
      setIsBackDropOpen(true);
      let res = [];

      if (isOpen) {
        res = await api.get('specialties', {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        });
      }

      setValue('specialties', res.data);
      setIsBackDropOpen(false);
    }
    searchSpecialties();
  }, [tokens, setValue, isOpen]);

  function handleCloseSnackbar(event, reason) {
    if (reason === 'clickaway') return;

    setSnackbarState({
      open: false,
      message: null,
    });
  }

  async function saveList({ specialties }) {
    try {
      if (!canEdit) {
        setSnackbarState({
          open: true,
          message: 'Você não tem permissão de editar uma especialidade',
          severity: 'error',
        });
      } else {
        const res = await api.post(
          'specialties/save',
          { specialties, userId: id },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );

        if (res.status === 200) {
          setSnackbarState({
            open: true,
            message: 'Especialidades atualizadas',
            severity: 'success',
          });
        }
      }
    } catch (error) {
      console.log(error);
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
        maxWidth="sm"
        sx={{ height: '90vh', mt: 5 }}
        fullWidth
        onClose={() => {
          closeDialog();
          reset();
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Especialidades Médicas</DialogTitle>

        <DialogContent>
          <ServiceList add={prependSpecialties} isOpen={isOpen} />

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={1} sx={{ mt: 1 }}>
            {fieldsSpecialties.map((specialty, index) => (
              <Grid item xs={12} sm={12} md={12} display="flex">
                <Grid item xs={2} sm={1} md={1} textAlign="center">
                  <IconButton
                    disabled={watch(`bills.${index}.id`)}
                    aria-label="delete"
                    size="lg"
                    onClick={() => {
                      removeSpecialties(index);
                    }}
                  >
                    <DeleteIcon fontSize="inherit" color="error" />
                  </IconButton>
                </Grid>
                <Grid item xs={8} sm={10} md={10}>
                  <TextInput
                    watch={watch}
                    register={register}
                    label="Especialidade"
                    errors={errors?.specialties?.[index]?.skill}
                    name={`specialties.${index}.skill`}
                  />
                </Grid>
                <Grid item xs={2} sm={1} md={1} textAlign="center">
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckBoxIcon color="success" />}
                    checked={watch(`specialties.${index}.lack`)}
                    onClick={() => {
                      setValue(`specialties.${index}.lack`, !watch(`specialties.${index}.lack`));
                    }}
                  />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit(saveList)} color="success" variant="contained">
            Salvar
          </Button>
          <Button onClick={closeDialog} color="error" variant="contained">
            fechar
          </Button>
        </DialogActions>
      </Dialog>

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
