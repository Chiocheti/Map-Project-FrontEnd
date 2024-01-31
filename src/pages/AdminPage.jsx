import { yupResolver } from '@hookform/resolvers/yup';
import EditOffOutlinedIcon from '@mui/icons-material/EditOffOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useState, forwardRef, useEffect, useContext, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as Yup from 'yup';

import AdminDrawer from '../components/Adm/AdminDrawer';
import AdmList from '../components/Adm/AdmList';
import AppBar from '../components/Form/AppBar';
import Button from '../components/Form/Button';
import PhoneMaskInput from '../components/Form/PhoneMaskInput';
import ReadOnly from '../components/Form/ReadOnly';
import TextInput from '../components/Form/TextInput';
import Title from '../components/Form/Title';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

const schema = Yup.object({
  name: Yup.string().required('Campo obrigatório').min(3, 'O nome deve ter mais de 3 letras'),
  username: Yup.string().required('Campo obrigatório').min(3, 'O nome de usuário deve ter mais de 5 dígitos'),
  password: Yup.string().required('Campo obrigatório').min(8, 'A senha deve ter mais de 8 dígitos'),
  repeatPassword: Yup.string()
    .required('Campo obrigatório')
    .oneOf([Yup.ref('password'), null], 'Senhas diferentes'),
  phone: Yup.string().required('Campo obrigatório'),
  roles: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required('Campo obrigatório'),
        permission: Yup.boolean(),
      }),
    )
    .min(1, 'Selecione pelo menos 1 cargo'),
});

const editSchema = Yup.object({
  name: Yup.string().required('Campo obrigatório').min(3, 'O nome deve ter mais de 3 letras'),
  username: Yup.string().required('Campo obrigatório').min(3, 'O nome de usuário deve ter mais de 5 dígitos'),
  password: Yup.string(),
  phone: Yup.string().required('Campo obrigatório'),
  roles: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required('Campo obrigatório'),
        permission: Yup.boolean(),
      }),
    )
    .min(1, 'Selecione pelo menos 1 cargo'),
});

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

function AdminPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [saveOrEdit, setSaveOrEdit] = useState('save');
  const [isBackDropOpen, setIsBackDropOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: null,
    severity: null,
  });

  const [rolesOptions, setRolesOptions] = useState([]);

  const { tokens, user } = useContext(AuthContext);

  let isEdit = false;
  const canEdit = useRef(false);
  const userId = useRef(null);

  useEffect(() => {
    async function fetchData() {
      if (tokens) {
        try {
          setIsBackDropOpen(true);
          const { data } = await api.get('/roles', {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          });
          const roles = [];

          await data.forEach((role) => {
            roles.push({ text: role.name, value: role.name });
          });

          setRolesOptions(roles);

          user.permissions.forEach((permission) => {
            if (permission.resource === 'Administrativo' && permission.action === 'edit') {
              canEdit.current = true;
            }
          });

          setIsBackDropOpen(false);
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
  }, [tokens, user]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(saveOrEdit === 'save' ? schema : editSchema),
    defaultValues: {
      roles: [],
    },
  });

  const {
    fields: fieldsRoles,
    append: appendRoles,
    remove: removeRoles,
  } = useFieldArray({
    control,
    name: 'roles',
  });

  function addNewRole(name, permission) {
    appendRoles({
      name,
      permission,
    });
  }

  function toggleIsDrawerOpen() {
    setIsDrawerOpen((previousValue) => !previousValue);
  }

  function handleCloseSnackbar(event, reason) {
    if (reason === 'clickaway') return;

    setSnackbarState(false);
  }

  function verifyIsEdit() {
    if (watch('name') !== '') {
      isEdit = true;
    }
    if (watch('username') !== '') {
      isEdit = true;
    }
    if (watch('password') !== '') {
      isEdit = true;
    }
    if (watch('repeatPassword') !== '') {
      isEdit = true;
    }
    if (watch('phone') !== '') {
      isEdit = true;
    }
    if (watch('roles')?.length > 1) {
      isEdit = true;
    }
  }

  verifyIsEdit();

  async function createUser(fields) {
    if (!canEdit.current) {
      setSnackbarState({
        open: true,
        message: 'Você não tem permissão para cadastrar um usuário',
        severity: 'error',
      });
    } else {
      const { roles, ...save } = fields;

      roles.forEach((role) => {
        role.permission = role.permission === true ? 'edit' : 'read'; // eslint-disable-line
      });

      try {
        const res = await api.post(
          'users',
          { save, roles, userId: user.id },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );
        if (res.status === 202) {
          setSnackbarState({
            open: true,
            message: res.data.message,
            severity: 'error',
          });
        }
        if (res.status === 201) {
          setSnackbarState({
            open: true,
            message: res.data.message,
            severity: 'success',
          });
          reset();
        }
      } catch (error) {
        setSnackbarState({
          open: true,
          message: error.message,
          severity: 'error',
        });
      }
    }
  }

  async function updateUser(fields) {
    if (!canEdit.current) {
      setSnackbarState({
        open: true,
        message: 'Você não tem permissão para editar um usuário',
        severity: 'error',
      });
    } else {
      try {
        const { roles, ...save } = fields;

        const res = await api.post(
          'users/update',
          { save, rolesList: roles, userId: userId.current, actualUserId: user.id },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );

        if (res.status === 202) {
          setSnackbarState({
            open: true,
            message: res.data.message,
            severity: 'error',
          });
        }
        if (res.status === 201) {
          setSnackbarState({
            open: true,
            message: res.data.message,
            severity: 'success',
          });
          reset();
          setSaveOrEdit('save');
        }
      } catch (error) {
        setSnackbarState({
          open: true,
          message: error.message,
          severity: 'error',
        });
      }
    }
  }

  async function fillFields(fields, roles, permissions) {
    userId.current = fields.id;
    setValue('name', fields.name);
    setValue('username', fields.username);
    setValue('phone', fields.phone);

    const newRoles = [];

    permissions.forEach((permission) => {
      newRoles.push({ name: permission.resource, permission: permission.action !== 'read' });
    });

    setValue('roles', newRoles);
  }

  async function deleteUser() {
    if (!canEdit.current) {
      setSnackbarState({
        open: true,
        message: 'Você não tem permissão para deletar um usuário',
        severity: 'error',
      });
    } else {
      try {
        const userName = watch('name');

        const res = await api.post(
          'users/delete',
          { userId: userId.current, actualUserId: user.id, userName },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );

        setSnackbarState({
          open: true,
          message: res.data.message,
          severity: 'success',
        });

        reset();

        setSaveOrEdit('save');
      } catch (error) {
        setSnackbarState({
          open: true,
          message: error.message,
          severity: 'error',
        });
      }
    }
  }

  return (
    <>
      <AdminDrawer
        fill={fillFields}
        isOpen={isDrawerOpen}
        closeDrawer={toggleIsDrawerOpen}
        toggleSaveOrEdit={setSaveOrEdit}
        roles={user?.roles}
        isEdit={isEdit}
        snackbar={setSnackbarState}
      />

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isBackDropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <AppBar>
        <Grid container justifyContent="space-between">
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" onClick={toggleIsDrawerOpen}>
            <MenuIcon />
          </IconButton>
          <Stack display="flex" direction="row" spacing={1}>
            <Stack direction="row" spacing={1}>
              {saveOrEdit === 'save' ? (
                <Button fullWidth variant="contained" color="success" onClick={handleSubmit(createUser)}>
                  Salvar
                </Button>
              ) : (
                <Button fullWidth variant="contained" color="warning" onClick={handleSubmit(updateUser)}>
                  Atualizar
                </Button>
              )}
            </Stack>
            <Stack direction="row" spacing={1}>
              {saveOrEdit === 'edit' ? (
                <Button fullWidth variant="contained" color="error" onClick={() => deleteUser()}>
                  Deletar
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Grid>
      </AppBar>

      <Container
        component="form"
        sx={{ mt: 4, mb: 4, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}
        maxWidth="sm"
      >
        <Title>CRIAR NOVO USUÁRIO</Title>

        <Grid container spacing={1}>
          <Grid item xs={12} sm={12} md={12}>
            <TextInput register={register} label="Nome" errors={errors?.name} name="name" watch={watch} />
          </Grid>

          <Grid item xs={12} sm={12} md={6}>
            <TextInput register={register} label="Login" errors={errors?.username} name="username" watch={watch} />
          </Grid>

          <Grid item xs={12} sm={12} md={6}>
            <PhoneMaskInput
              watch={watch}
              control={control}
              name="phone"
              label="Telefone/Celular"
              errors={errors?.phone}
            />
          </Grid>

          {saveOrEdit === 'save' ? (
            <>
              <Grid item xs={12} sm={12} md={6}>
                <TextInput register={register} label="Senha" errors={errors?.password} name="password" watch={watch} />
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <TextInput
                  register={register}
                  label="Repetir Senha"
                  errors={errors?.repeatPassword}
                  name="repeatPassword"
                  watch={watch}
                />
              </Grid>
            </>
          ) : (
            <Grid item xs={12} sm={12} md={12}>
              <TextInput
                register={register}
                label="Atualizar Senha (Deixe em branco para não mudar)"
                errors={errors?.password}
                name="password"
                watch={watch}
              />
            </Grid>
          )}

          <AdmList rolesOptions={rolesOptions} addNewRole={addNewRole} usedRoles={watch('roles')} />

          <Grid container justifyContent="center">
            <FormHelperText sx={{ fontSize: 20 }} error>
              {errors?.roles?.message}
            </FormHelperText>
          </Grid>

          {watch('roles')?.length > 0 ? (
            <Grid item xs={12}>
              <Divider sx={{ mb: 1 }} />
            </Grid>
          ) : null}

          <Grid container sx={{ mt: 1, ml: 1 }}>
            {fieldsRoles.map((field, index) => (
              <Grid container spacing={1} key={field.id} sx={{ mb: 1 }}>
                <Grid item xs={10} sm={11} md={fieldsRoles.length > 1 ? 6 : 11}>
                  <ReadOnly label="Cargo" value={field.name} />
                </Grid>

                <Grid item xs={2} sm={1} md={1}>
                  <Checkbox
                    icon={<EditOffOutlinedIcon />}
                    checkedIcon={<EditOutlinedIcon />}
                    checked={watch(`roles.${index}.permission`)}
                    {...register(`roles.${index}.permission`)}
                  />
                </Grid>

                {fieldsRoles.length > 1 ? (
                  <Grid item xs={12} sm={12} md={5}>
                    <Button variant="contained" fullWidth color="error" onClick={() => removeRoles(index)}>
                      Remover
                    </Button>
                  </Grid>
                ) : (
                  ''
                )}
              </Grid>
            ))}
          </Grid>
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

export default AdminPage;
