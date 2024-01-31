import 'dayjs/locale/pt-br';
import { yupResolver } from '@hookform/resolvers/yup';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MenuIcon from '@mui/icons-material/Menu';
import ReportIcon from '@mui/icons-material/Report';
import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import MuiAlert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import moment from 'moment';
import { forwardRef, useContext, useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import * as Yup from 'yup';

import FinancierDrawer from '../components/Financier/FinancierDrawer';
import FinancierList from '../components/Financier/FinancierList';
import MedicFinancierList from '../components/Financier/MedicFinancierList';
import AppBar from '../components/Form/AppBar';
import Button from '../components/Form/Button';
import DateInput from '../components/Form/DateInput';
import MoneyReadOnly from '../components/Form/MoneyReadOnly';
import ReadOnly from '../components/Form/ReadOnly';
import TextInput from '../components/Form/TextInput';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

const schema = Yup.object({
  banks: Yup.array().of(
    Yup.object().shape({
      bank: Yup.string().required('Campo obrigatório'),
      agency: Yup.string().required('Campo obrigatório'),
      account: Yup.string().required('Campo obrigatório'),
      over: Yup.number().required('Campo obrigatório'),
      reserved: Yup.number().required('Campo obrigatório'),
      application: Yup.number().required('Campo obrigatório'),
    }),
  ),
  bills: Yup.array().of(
    Yup.object().shape({
      account: Yup.string().required('Campo obrigatório'),
      date: Yup.string().required('Campo obrigatório'),
      confirmationDate: Yup.string().nullable(),
      doc: Yup.string().required('Campo obrigatório'),
      value: Yup.string().required('Campo obrigatório'),
      dca: Yup.string().required('Campo obrigatório'),
      status: Yup.string().required('Campo obrigatório'),
      clientName: Yup.string(),
      details: Yup.string(),
      referenceId: Yup.string(),
      order: Yup.string(),
      showDetails: Yup.boolean().default(false),
    }),
  ),
});

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

export default function Financier() {
  const [clientList, setClientList] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBackDropOpen, setIsBackDropOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isMedic, setIsMedic] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: null,
    severity: null,
  });

  const canEdit = useRef(false);

  const newBills = useRef(0);

  function toggleIsDrawerOpen() {
    setIsDrawerOpen((previousValue) => !previousValue);
  }

  const { tokens, user } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    control,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      banks: [],
      bills: [],
    },
  });

  function handleCloseSnackbar(event, reason) {
    if (reason === 'clickaway') return;

    setSnackbarState({
      open: false,
      message: null,
    });
  }

  const { fields: fieldsBanks } = useFieldArray({
    control,
    name: 'banks',
  });

  const {
    fields: fieldsBills,
    prepend: prependBill,
    remove: removeBill,
  } = useFieldArray({
    control,
    name: 'bills',
  });

  const banks = watch('banks');

  const banksList = [];

  if (banks) {
    banks.forEach((bank) => {
      banksList.push({ text: bank.bank, value: bank.bank });
    });
  }

  useEffect(() => {
    async function fetchData() {
      if (tokens && !isDrawerOpen) {
        try {
          setIsBackDropOpen(true);

          user.permissions.forEach((permission) => {
            if (permission.resource === 'Financeiro' && permission.action === 'edit') {
              canEdit.current = true;
            }
          });

          const { data } = await api.get('/banks', {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          });

          setValue('banks', data);

          const {
            data: { clients, services },
          } = await api.get('/clients/allClientList', {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          });

          const referenceArray = [];
          const idClientArray = [];

          await clients.forEach((element) => {
            referenceArray.push(`[${element.cpfNumber}] - ${element.name}`);

            idClientArray.push({
              id: element.id,
              name: element.name,
              cpfNumber: element.cpfNumber,
            });
          });

          await services.forEach((element) => {
            referenceArray.push(element.company);
          });

          setClientList({ referenceArray, idClientArray, idServicesArray: services });

          const end = new Date();

          const start = moment(end).subtract('1', 'month').date('1').format('YYYY-MM-DD');

          const lastBills = await api.post(
            'bills/getBills',
            { end, start },
            {
              headers: {
                'x-access-token': tokens?.accessToken,
              },
            },
          );

          lastBills.data.forEach((element) => {
            element.date = element.date.slice(0, 10); //eslint-disable-line
            element.confirmationDate = element.confirmationDate.slice(0, 10); //eslint-disable-line
          });

          setValue('bills', lastBills.data);

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
  }, [tokens, user, setValue, isDrawerOpen]);

  function addNewBill({ account, date, doc, value, dca, status, clientName, details, referenceId, confirmationDate }) {
    setIsEdit(true);

    const newValue = parseFloat(value);

    if (doc !== '0') {
      newBills.current += 1;
    }

    prependBill({
      account,
      date,
      doc,
      value: newValue,
      dca,
      status,
      clientName,
      details,
      referenceId,
      confirmationDate,
    });

    let bankId = 0;
    banks.forEach((bank, index) => {
      if (bank.bank === account) {
        bankId = index;
      }
    });

    if (dca === 'Debito' && status === 'Pendente') {
      setValue(`banks.${bankId}.reserved`, getValues(`banks.${bankId}.reserved`) + newValue);
    }

    if (dca === 'Debito' && status === 'Compensado') {
      setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) - newValue);
    }

    if (dca === 'Aplicação' && status === 'Pendente') {
      setValue(`banks.${bankId}.reserved`, getValues(`banks.${bankId}.reserved`) + newValue);
    }

    if (dca === 'Aplicação' && status === 'Compensado') {
      setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) - newValue);
      setValue(`banks.${bankId}.application`, getValues(`banks.${bankId}.application`) + newValue);
    }

    // if (dca === 'Resgate' && status === 'Pendente') {
    //   setValue(`banks.${bankId}.reserved`, getValues(`banks.${bankId}.reserved`) + newValue);
    // }

    if (dca === 'Resgate' && status === 'Compensado') {
      setValue(`banks.${bankId}.application`, getValues(`banks.${bankId}.application`) - newValue);
      setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) + newValue);
    }

    if (dca === 'Credito' && status === 'Compensado') {
      setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) + newValue);
    }
  }

  function setStatusCompensado(id) {
    const account = getValues(`bills.${id}.account`);
    const value = getValues(`bills.${id}.value`);
    const dca = getValues(`bills.${id}.dca`);
    const status = getValues(`bills.${id}.status`);

    let bankId = 0;
    banks.forEach((bank, index) => {
      if (bank.bank === account) {
        bankId = index;
      }
    });

    if (dca === 'Debito' && status === 'Pendente') {
      setValue(`banks.${bankId}.reserved`, getValues(`banks.${bankId}.reserved`) - value);

      setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) - value);
    }

    if (dca === 'Debito' && status === 'Cancelado') {
      setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) - value);
    }

    if (dca === 'Aplicação' && status === 'Pendente') {
      setValue(`banks.${bankId}.reserved`, getValues(`banks.${bankId}.reserved`) - value);

      setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) - value);

      setValue(`banks.${bankId}.application`, getValues(`banks.${bankId}.application`) + value);
    }

    if (dca === 'Aplicação' && status === 'Cancelado') {
      setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) - value);

      setValue(`banks.${bankId}.application`, getValues(`banks.${bankId}.application`) + value);
    }

    if (dca === 'Resgate' && status === 'Pendente') {
      setValue(`banks.${bankId}.application`, getValues(`banks.${bankId}.application`) - value);
      setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) + value);
    }

    if (dca === 'Resgate' && status === 'Cancelado') {
      setValue(`banks.${bankId}.application`, getValues(`banks.${bankId}.application`) - value);
      setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) + value);
    }

    if (dca === 'Credito' && status === 'Pendente') {
      setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) + value);
    }

    if (dca === 'Credito' && status === 'Cancelado') {
      setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) + value);
    }

    setValue(`bills.${id}.status`, 'Compensado');
  }

  function setStatusCancelado(id) {
    const account = watch(`bills.${id}.account`);
    const value = watch(`bills.${id}.value`);
    const dca = watch(`bills.${id}.dca`);
    const status = watch(`bills.${id}.status`);

    let bankId = 0;
    banks.forEach((bank, index) => {
      if (bank.bank === account) {
        bankId = index;
      }
    });

    if (dca === 'Debito' && status === 'Pendente') {
      setValue(`banks.${bankId}.reserved`, watch(`banks.${bankId}.reserved`) - value);
    }

    if (dca === 'Debito' && status === 'Compensado') {
      setValue(`banks.${bankId}.over`, watch(`banks.${bankId}.over`) + value);
    }

    if (dca === 'Aplicação' && status === 'Pendente') {
      setValue(`banks.${bankId}.reserved`, watch(`banks.${bankId}.reserved`) - value);
    }

    if (dca === 'Aplicação' && status === 'Compensado') {
      setValue(`banks.${bankId}.application`, watch(`banks.${bankId}.application`) - value);

      setValue(`banks.${bankId}.over`, watch(`banks.${bankId}.over`) + value);
    }

    // if (dca === 'Resgate' && status === 'Pendente') {
    //   setValue(`banks.${bankId}.application`, getValues(`banks.${bankId}.application`) - value);
    //   setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) + value);
    // }

    if (dca === 'Resgate' && status === 'Compensado') {
      setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) - value);
      setValue(`banks.${bankId}.application`, getValues(`banks.${bankId}.application`) + value);
    }

    if (dca === 'Credito' && status === 'Compensado') {
      setValue(`banks.${bankId}.over`, watch(`banks.${bankId}.over`) - value);
    }

    setValue(`bills.${id}.status`, 'Cancelado');
  }

  function setStatusPendente(id) {
    const account = watch(`bills.${id}.account`);
    const value = watch(`bills.${id}.value`);
    const dca = watch(`bills.${id}.dca`);
    const status = watch(`bills.${id}.status`);

    let bankId = 0;
    banks.forEach((bank, index) => {
      if (bank.bank === account) {
        bankId = index;
      }
    });

    if (dca === 'Debito' && status === 'Cancelado') {
      setValue(`banks.${bankId}.reserved`, watch(`banks.${bankId}.reserved`) + value);
    }

    if (dca === 'Debito' && status === 'Compensado') {
      setValue(`banks.${bankId}.over`, watch(`banks.${bankId}.over`) + value);

      setValue(`banks.${bankId}.reserved`, watch(`banks.${bankId}.reserved`) + value);
    }

    if (dca === 'Aplicação' && status === 'Cancelado') {
      setValue(`banks.${bankId}.reserved`, watch(`banks.${bankId}.reserved`) + value);
    }

    if (dca === 'Aplicação' && status === 'Compensado') {
      setValue(`banks.${bankId}.application`, watch(`banks.${bankId}.application`) - value);

      setValue(`banks.${bankId}.over`, watch(`banks.${bankId}.over`) + value);

      setValue(`banks.${bankId}.reserved`, watch(`banks.${bankId}.reserved`) + value);
    }

    // if (dca === 'Resgate' && status === 'Cancelado') {
    //   setValue(`banks.${bankId}.application`, getValues(`banks.${bankId}.application`) - value);
    //   setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) + value);
    // }

    if (dca === 'Resgate' && status === 'Compensado') {
      setValue(`banks.${bankId}.application`, getValues(`banks.${bankId}.application`) + value);
      setValue(`banks.${bankId}.over`, getValues(`banks.${bankId}.over`) - value);
    }

    if (dca === 'Credito' && status === 'Compensado') {
      setValue(`banks.${bankId}.over`, watch(`banks.${bankId}.over`) - value);
    }

    setValue(`bills.${id}.status`, 'Pendente');
  }

  async function handleClick({ bills }) {
    if (!canEdit.current) {
      setSnackbarState({
        open: true,
        message: 'Você não tem permissão para cadastrar um pagamento',
        severity: 'warning',
      });
    } else {
      try {
        bills.forEach((bill) => {
          bill.confirmationDate = bill.confirmationDate ? bill.confirmationDate : null; //eslint-disable-line
          banks.forEach((bank) => {
            if (bill.account === bank.bank) {
              bill.bankId = bank.id; //eslint-disable-line
            }
          });
        });

        const updateBills = [];
        const createBills = [];

        bills.forEach((bill) => {
          if (bill.id) {
            updateBills.push(bill);
          } else {
            createBills.unshift(bill);
          }
        });

        const res = await api.post(
          'bills/update',
          { banks, updateBills, createBills, userId: user.id },
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

        const end = new Date();

        const start = moment(end).subtract('1', 'month').day('1');

        const lastBills = await api.post(
          'bills/getBills',
          { end, start },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );

        lastBills.data.forEach((element) => {
          element.date = element.date.slice(0, 10); //eslint-disable-line
        });

        setValue('bills', lastBills.data);

        setIsEdit(false);
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
      <FinancierDrawer
        isOpen={isDrawerOpen}
        closeDrawer={toggleIsDrawerOpen}
        isEdit={isEdit}
        setSnackbarState={setSnackbarState}
        canEdit={canEdit.current}
      />

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isBackDropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <AppBar>
        <Grid container justifyContent="space-between">
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" onClick={toggleIsDrawerOpen}>
            <MenuIcon />
          </IconButton>

          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="success" onClick={handleSubmit(handleClick)}>
              Salvar
            </Button>
          </Stack>
        </Grid>
      </AppBar>

      <Container
        component="form"
        sx={{ mt: 1, mb: 1, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}
        maxWidth="xl"
      >
        <Grid container>
          {fieldsBanks.map((field, index) => (
            <Grid container spacing={1} key={watch(`banks.${index}.id`)} mb={1}>
              <Grid item xs={12} sm={3} md={1.5}>
                <ReadOnly label="Banco" value={watch(`banks.${index}.bank`)} />
              </Grid>

              <Grid item xs={6} sm={3} md={1.5}>
                <ReadOnly label="Agencia" value={watch(`banks.${index}.agency`)} />
              </Grid>

              <Grid item xs={6} sm={3} md={1.5}>
                <ReadOnly label="Conta" value={watch(`banks.${index}.account`)} />
              </Grid>

              <Grid item xs={12} sm={3} md={1.5}>
                <MoneyReadOnly label="Saldo Conta" value={watch(`banks.${index}.over`).toFixed(2)} />
              </Grid>

              <Grid item xs={6} sm={3} md={1.5}>
                <MoneyReadOnly label="Reservado" value={watch(`banks.${index}.reserved`).toFixed(2)} />
              </Grid>

              <Grid item xs={6} sm={3} md={1.5}>
                <MoneyReadOnly
                  label="Disponível"
                  value={(watch(`banks.${index}.over`) - watch(`banks.${index}.reserved`)).toFixed(2)}
                />
              </Grid>

              <Grid item xs={6} sm={3} md={1.5}>
                <MoneyReadOnly label="Aplicação" value={watch(`banks.${index}.application`).toFixed(2)} />
              </Grid>

              <Grid item xs={6} sm={3} md={1.5}>
                <MoneyReadOnly
                  label="Disponível + Aplicação"
                  value={(
                    watch(`banks.${index}.over`) -
                    watch(`banks.${index}.reserved`) +
                    watch(`banks.${index}.application`)
                  ).toFixed(2)}
                />
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container
        component="form"
        sx={{ mt: 1, mb: 1, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}
        maxWidth="xl"
      >
        {isMedic ? (
          <MedicFinancierList
            setIsMedic={setIsMedic}
            banksList={banksList}
            clientList={clientList}
            addNewBill={addNewBill}
            setSnackbarState={setSnackbarState}
            bills={newBills.current}
          />
        ) : (
          <FinancierList
            setIsMedic={setIsMedic}
            banksList={banksList}
            clientList={clientList}
            addNewBill={addNewBill}
            setSnackbarState={setSnackbarState}
            bills={newBills.current}
          />
        )}
      </Container>

      <Container
        component="form"
        sx={{ mt: 1, mb: 1, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}
        maxWidth="xl"
      >
        {useMediaQuery('(min-width:900px)') ? (
          <Grid container spacing={1} sx={{ mt: 1 }}>
            <Grid item md={0.4} />

            <Grid item md={1}>
              <Typography variant="h6" align="center">
                Conta
              </Typography>
              <Divider />
            </Grid>

            <Grid item md={3}>
              <Typography variant="h6" align="center">
                Referente
              </Typography>
              <Divider />
            </Grid>

            <Grid item md={1.2}>
              <Typography variant="h6" align="center">
                Emissão
              </Typography>
              <Divider />
            </Grid>

            <Grid item md={1.5}>
              <Typography variant="h6" align="center">
                Confirmação
              </Typography>
              <Divider />
            </Grid>

            <Grid item md={1}>
              <Typography variant="h6" align="center">
                Código
              </Typography>
              <Divider />
            </Grid>

            <Grid item md={1.3}>
              <Typography variant="h6" align="center">
                Valor
              </Typography>
              <Divider />
            </Grid>

            <Grid item md={1}>
              <Typography variant="h6" align="center">
                D/C/A
              </Typography>
              <Divider />
            </Grid>

            <Grid item md={1.6}>
              <Typography variant="h6" align="center">
                Status
              </Typography>
              <Divider />
            </Grid>
          </Grid>
        ) : (
          <Grid item xs={12} sm={12} md={12} sx={{ my: 1 }}>
            <Divider />
          </Grid>
        )}

        <Grid sx={{ mt: 1 }}>
          {fieldsBills.map((field, index) => (
            <Grid container spacing={1} key={field.id}>
              <Grid item xs={2} sm={1} md={0.4}>
                <IconButton
                  disabled={watch(`bills.${index}.id`) !== undefined}
                  aria-label="delete"
                  size="lg"
                  onClick={() => {
                    if (watch(`bills.${index}.doc`) !== '0') {
                      newBills.current -= 1;
                    }
                    setStatusCancelado(index);
                    removeBill(index);
                  }}
                >
                  {watch(`bills.${index}.id`) ? (
                    <DeleteForeverIcon fontSize="inherit" />
                  ) : (
                    <DeleteIcon fontSize="inherit" color="error" />
                  )}
                </IconButton>
              </Grid>

              <Grid item xs={10} sm={2.5} md={1}>
                <ReadOnly value={watch(`bills.${index}.account`)} errors={errors?.bills?.[index]?.account} />
              </Grid>

              <Grid item xs={12} sm={8.5} md={3}>
                <ReadOnly value={watch(`bills.${index}.clientName`)} errors={errors?.bills?.[index]?.clientName} />
              </Grid>

              <Grid item xs={6} sm={3.5} md={1.2}>
                <ReadOnly
                  value={moment(watch(`bills.${index}.date`)).format('DD/MM/YYYY')}
                  errors={errors?.bills?.[index]?.date}
                />
              </Grid>

              <Grid item xs={6} sm={3.5} md={1.5}>
                <DateInput
                  register={register}
                  errors={errors?.bills?.[index]?.confirmationDate}
                  name={`bills.${index}.confirmationDate`}
                />
              </Grid>

              <Grid item xs={6} sm={2} md={1}>
                <ReadOnly value={watch(`bills.${index}.doc`)} errors={errors?.bills?.[index]?.doc} />
              </Grid>

              <Grid item xs={8} sm={4} md={1.3}>
                <MoneyReadOnly
                  value={watch(`bills.${index}.value`).toFixed(2)}
                  errors={errors?.bills?.[index]?.value}
                />
              </Grid>

              <Grid item xs={4} sm={2.5} md={1}>
                <ReadOnly value={watch(`bills.${index}.dca`)} errors={errors?.bills?.[index]?.dca} />
              </Grid>

              <Grid item xs={3} sm={3} md={0.4} textAlign="center">
                <Tooltip title="Compensado" arrow>
                  <Checkbox
                    icon={<CheckCircleOutlineOutlinedIcon />}
                    checkedIcon={<CheckCircleIcon color="success" />}
                    checked={watch(`bills.${index}.status`) === 'Compensado'}
                    onClick={() => {
                      setStatusCompensado(index);
                    }}
                  />
                </Tooltip>
              </Grid>

              <Grid item xs={3} sm={3} md={0.4} textAlign="center">
                <Tooltip title="Pendente" arrow>
                  <Checkbox
                    icon={<WatchLaterOutlinedIcon />}
                    checkedIcon={<WatchLaterIcon />}
                    checked={watch(`bills.${index}.status`) === 'Pendente'}
                    onClick={() => {
                      setStatusPendente(index);
                    }}
                  />
                </Tooltip>
              </Grid>

              <Grid item xs={3} sm={3} md={0.4} textAlign="center">
                <Tooltip title="Cancelado" arrow>
                  <Checkbox
                    icon={<ReportGmailerrorredOutlinedIcon />}
                    checkedIcon={<ReportIcon color="error" />}
                    checked={watch(`bills.${index}.status`) === 'Cancelado'}
                    onClick={() => {
                      setStatusCancelado(index);
                    }}
                  />
                </Tooltip>
              </Grid>

              <Grid item xs={3} sm={3} md={0.4} textAlign="center">
                <Tooltip title="Destina-se" arrow>
                  <Checkbox
                    icon={<BookmarkBorderOutlinedIcon />}
                    checkedIcon={<BookmarkIcon color="warning" />}
                    checked={watch(`bills.${index}.showDetails`)}
                    onClick={() => {
                      setValue(`bills.${index}.showDetails`, !watch(`bills.${index}.showDetails`));
                    }}
                  />
                </Tooltip>
              </Grid>

              {watch(`bills.${index}.showDetails`) ? (
                <Grid item xs={12} sm={12} md={12} sx={{ mb: 1 }}>
                  <TextInput watch={watch} register={register} label="Destina-se" name={`bills.${index}.details`} />
                </Grid>
              ) : null}
            </Grid>
          ))}
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
