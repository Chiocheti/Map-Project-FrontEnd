import 'dayjs/locale/pt-br';
import { yupResolver } from '@hookform/resolvers/yup';
import MenuIcon from '@mui/icons-material/Menu';
import MuiAlert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import moment from 'moment';
import { forwardRef, useContext, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import DashboardBillsList from '../components/Dashboard/DashboardBillsList';
import DashboardOthersRefunds from '../components/Dashboard/DashboardOthersRefunds';
import AppBar from '../components/Form/AppBar';
import Button from '../components/Form/Button';
import DateInput from '../components/Form/DateInput';
import MoneyReadOnly from '../components/Form/MoneyReadOnly';
import MoneyTextInput from '../components/Form/MoneyTextInput';
import ReadOnly from '../components/Form/ReadOnly';
import SelectFilter from '../components/Form/SelectFilter';
import Title from '../components/Form/Title';
import RefundsDrawer from '../components/Refunds/RefundsDrawer';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

const schema = Yup.object({
  client: Yup.string().required('Selecione o responsável pelo reembolso'),
  dependentId: Yup.string(),
  specialty: Yup.string().required('Selecione a especialidade médica'),
  invoiceReceived: Yup.string().required('Campo obrigatório'),
  invoiceValue: Yup.string().required('Campo obrigatório'),
});

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

export default function Refunds() {
  const { tokens, user } = useContext(AuthContext);

  const [isBackDropOpen, setIsBackDropOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [client, setClient] = useState();
  const [clientList, setClientList] = useState([]);
  const [specialtyList, setSpecialtyList] = useState({
    specialtyArray: [],
    idSpecialtyArray: [],
  });
  const [dependentList, setDependentList] = useState([]);

  const [refundValue, setRefundValue] = useState(0);
  const [refundValuePercent, setRefundValuePercent] = useState(0);

  const [autocompleteValue, setAutocompleteValue] = useState(null);
  const [autocompleteSpecialtyValue, setAutocompleteSpecialtyValue] = useState(null);

  const [clientRefunds, setClientRefunds] = useState([]);

  const [clientBills, setClientBills] = useState([]);
  const [showClientBills, setShowClientBills] = useState(false);

  const [clientOldRefunds, setClientOldRefunds] = useState([]);
  const [showClientOldRefunds, setShowClientOldRefunds] = useState(false);

  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: null,
    severity: null,
  });

  const canEdit = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    clearErrors,
    watch,
    reset,
    resetField,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      client: '',
      dependentId: '',
      specialty: '',
      invoiceReceived: '',
      invoiceValue: '',
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setIsBackDropOpen(true);

        user.permissions.forEach((permission) => {
          if (permission.resource === 'Setor Médico' && permission.action === 'edit') {
            canEdit.current = true;
          }
        });

        const {
          data: { idList, list },
        } = await api.get('specialties/list', {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        });

        setSpecialtyList({
          specialtyArray: list,
          idSpecialtyArray: idList,
        });

        const {
          data: { clients },
        } = await api.get('/clients/clientList', {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        });

        const clientArray = [];

        await clients.forEach((element) => {
          clientArray.push(`[${element.cpfNumber}] - ${element.name}`);
        });

        setClientList(clientArray);

        setIsBackDropOpen(false);
      } catch (error) {
        setSnackbarState({
          open: true,
          message: 'Houve um erro interno',
          severity: 'error',
        });
      }
    }

    fetchData();
  }, [tokens, user]);

  function handleCloseSnackbar(event, reason) {
    if (reason === 'clickaway') return;

    setSnackbarState({
      open: false,
      message: null,
    });
  }

  function toggleIsDrawerOpen() {
    setIsDrawerOpen((previousValue) => !previousValue);
  }

  async function findClient(clientName) {
    try {
      if (!clientName) {
        setValue('admissionDate', null);
        setDependentList([]);

        return false;
      }

      const search = clientName.split(' - ');

      const { data } = await api.post(
        '/clients/findByName',
        { name: search[1], cpfNumber: search[0].slice(1, 15) },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      const dependentListArray = [];

      if (data.dependents.length > 0) {
        data.dependents.forEach((dependent) => {
          dependentListArray.push({
            text: dependent.name,
            value: dependent.id,
            relationship: dependent.relationship,
          });
        });
      }

      const { monthlyCredit, annualCredit, ...rest } = data;

      rest.monthlyCredit = parseFloat(monthlyCredit);
      rest.annualCredit = parseFloat(annualCredit);

      setDependentList(dependentListArray);
      setClient(rest);

      const start = moment().date('1').subtract(1, 'month').format('YYYY-MM-DD');

      const clientData = await api.post(
        'bills/getClientBills',
        { clientId: rest.id, start },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      setClientBills(clientData.data.bills);
      setClientRefunds(clientData.data.refunds.refunds);
      setClientOldRefunds(clientData.data.otherRefunds.refunds);

      return true;
    } catch (error) {
      setSnackbarState({
        open: true,
        message: 'Houve um erro interno',
        severity: 'error',
      });
      return false;
    }
  }

  const handleAutocompleteChange = (event, newValue) => {
    setValue('client', newValue); //
    clearErrors(`client`); //
    findClient(newValue); //
    setAutocompleteValue(newValue);
    resetField('dependentId');
    setAutocompleteSpecialtyValue(null);
    resetField('specialty');
    resetField('invoiceReceived');
    resetField('invoiceValue');
    setRefundValue();
    setRefundValuePercent();
  };

  const handleAutocompleteSpecialtyChange = (event, newValue) => {
    setValue('specialty', newValue);
    setAutocompleteSpecialtyValue(newValue);
    clearErrors(`specialty`);
  };

  function calcRefund(invoiceValue) {
    let refunded = invoiceValue / 2;

    if (!refunded || !client?.monthlyCredit || !client?.annualCredit) {
      setRefundValue(0);
      setRefundValuePercent(0);
      return 0;
    }

    clearErrors(`invoiceValue`);

    if (refunded > client.monthlyCredit) {
      refunded = client.monthlyCredit;
    }

    if (refunded > client.annualCredit) {
      refunded = client.annualCredit;
    }

    setRefundValue(refunded.toFixed(2));
    setRefundValuePercent(((refunded / invoiceValue) * 100).toFixed(2));

    return 0;
  }

  async function saveRefunds(data) {
    try {
      if (!canEdit.current) {
        setSnackbarState({
          open: true,
          message: 'Você não tem permissão para cadastrar um reembolso',
          severity: 'error',
        });
      } else {
        await api.post(
          '/clients/storeRefund',
          {
            refund: data,
            userId: user.id,
            monthly: client.monthlyCredit - refundValue,
            annual: client.annualCredit - refundValue,
          },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );
        setAutocompleteValue(null);
        setAutocompleteSpecialtyValue(null);
        reset();
        setRefundValue();
        setRefundValuePercent();
        setClient();
        setSnackbarState({
          open: true,
          message: 'Este reembolso está apto a ser aceitado',
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

  function validate(data) {
    const sixMonthsEarlier = moment().subtract(6, 'months');
    const twentyOneYearsEarlier = moment().subtract(21, 'year');

    let canPass = true;

    const specialty = specialtyList.idSpecialtyArray.find((element) => element.name === data.specialty);

    if (client.admissionDate !== '' && specialty.lack) {
      if (moment(client.admissionDate).isAfter(sixMonthsEarlier)) {
        setSnackbarState({
          open: true,
          message: 'Este serviço necessita de ao menos 6 meses de carência',
          severity: 'error',
        });

        canPass = false;
      }
    }

    if (data.dependentId !== '') {
      dependentList.forEach((element) => {
        if (element.id === data.dependentId) {
          if (!element.relationship || !element.birthdate) {
            setSnackbarState({
              open: true,
              message: 'Faltam informações do dependente',
              severity: 'error',
            });

            canPass = false;
          }

          const dependentAge = moment(element.birthdate);

          if (
            element.relationship !== 'ESPOSO(A)' &&
            element.relationship !== 'DEP. LAUDO MÉDICO' &&
            moment(twentyOneYearsEarlier).isAfter(dependentAge)
          ) {
            setSnackbarState({
              open: true,
              message: 'Este dependente não pode receber reembolso',
              severity: 'error',
            });

            canPass = false;
          }
        }
      });
    } else {
      // eslint-disable-next-line no-param-reassign
      data.dependentId = null;
    }

    const refund = {
      clientId: client.id,
      specialtyId: specialty.id,
      refundValue,
      ...data,
    };

    if (canPass) {
      saveRefunds(refund);
    }

    setClientBills([]);
    setClientRefunds([]);
    setClientOldRefunds([]);
  }

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isBackDropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <RefundsDrawer
        isOpen={isDrawerOpen}
        closeDrawer={toggleIsDrawerOpen}
        setSnackbarState={setSnackbarState}
        canEdit={canEdit.current}
      />

      <AppBar>
        <Grid container justifyContent="space-between">
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" onClick={toggleIsDrawerOpen}>
            <MenuIcon />
          </IconButton>

          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="success" onClick={handleSubmit(saveRefunds)}>
              Salvar
            </Button>
          </Stack>
        </Grid>
      </AppBar>

      <Container component="form" sx={{ mt: 1, mb: 4, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Title> Reembolso Médico </Title>

        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid item xs={6} sm={6} md={6}>
            <MoneyReadOnly
              label="Limite mensal restante"
              value={client?.monthlyCredit ? client.monthlyCredit - (refundValue || 0) : 0}
            />
          </Grid>

          <Grid item xs={6} sm={6} md={6}>
            <MoneyReadOnly
              label="Limite anual restante"
              value={client?.annualCredit ? client.annualCredit - (refundValue || 0) : 0}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Autocomplete
              value={autocompleteValue}
              onChange={handleAutocompleteChange}
              options={clientList || []}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sócio"
                  variant="outlined"
                  size="small"
                  fullWidth
                  error={!!errors?.client}
                  helperText={errors?.client?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <SelectFilter
              options={dependentList}
              control={control}
              label="Dependente"
              errors={errors?.dependentId}
              {...register(`dependentId`)}
              register={register}
              name="dependentId"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Autocomplete
              value={autocompleteSpecialtyValue}
              onChange={handleAutocompleteSpecialtyChange}
              options={specialtyList.specialtyArray || []}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Especialidade"
                  variant="outlined"
                  size="small"
                  fullWidth
                  error={!!errors?.specialty}
                  helperText={errors?.specialty?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <DateInput
              register={register}
              label="Data do Recibo"
              errors={errors?.invoiceReceived}
              name="invoiceReceived"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={4}>
            <MoneyTextInput
              watch={watch}
              register={register}
              label="Valor do Recibo"
              errors={errors?.invoiceValue}
              name="invoiceValue"
              onChange={(event) => {
                calcRefund(event.target.value);
              }}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={4}>
            <MoneyReadOnly label="Valor Reembolsado" value={refundValue} />
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <ReadOnly label="%" value={refundValuePercent} />
          </Grid>

          <Grid item xs={12} sm={12} md={12}>
            <Button variant="contained" fullWidth onClick={handleSubmit(validate)}>
              Aprovar
            </Button>
          </Grid>
        </Grid>
        {clientRefunds.length > 0 ? (
          <>
            <Title>Reembolsos</Title>
            <DashboardOthersRefunds refunds={clientRefunds} clientName={client?.name || ''} />
          </>
        ) : null}
      </Container>

      {clientOldRefunds.length > 0 ? (
        <Container component="form" sx={{ mt: 1, mb: 4, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Button
            variant="contained"
            color="warning"
            fullWidth
            onClick={() => setShowClientOldRefunds((prev) => !prev)}
          >
            Mostrar Reembolsos Antigos
          </Button>

          <Grid mt={2}>
            {showClientOldRefunds ? (
              <DashboardOthersRefunds refunds={clientOldRefunds} clientName={client.name || ''} />
            ) : null}
          </Grid>
        </Container>
      ) : null}

      {clientBills.length > 0 ? (
        <Container component="form" sx={{ mt: 1, mb: 4, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Button variant="contained" color="warning" fullWidth onClick={() => setShowClientBills((prev) => !prev)}>
            Mostrar Cheques
          </Button>

          <Grid mt={2}>{showClientBills ? <DashboardBillsList fieldsBills={clientBills} /> : null}</Grid>
        </Container>
      ) : null}

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
