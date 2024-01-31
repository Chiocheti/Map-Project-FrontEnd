import 'dayjs/locale/pt-br';
import { yupResolver } from '@hookform/resolvers/yup';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuIcon from '@mui/icons-material/Menu';
import MuiAlert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import html2pdf from 'html2pdf.js';
import moment from 'moment';
import { forwardRef, useContext, useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import * as Yup from 'yup';

import DashboardBillsList from '../components/Dashboard/DashboardBillsList';
import DashboardContractsList from '../components/Dashboard/DashboardContractsList';
import DashboardDrawer from '../components/Dashboard/DashboardDrawer';
import DashboardOthersRefunds from '../components/Dashboard/DashboardOthersRefunds';
import AppBar from '../components/Form/AppBar';
import Button from '../components/Form/Button';
import DateInput from '../components/Form/DateInput';
import MaskInputText from '../components/Form/MaskInput';
import MoneyReadOnly from '../components/Form/MoneyReadOnly';
import MoneyTextInput from '../components/Form/MoneyTextInput';
import Select from '../components/Form/Select';
import TextInput from '../components/Form/TextInput';
import Title from '../components/Form/Title';
import FormCard from '../components/Pdfs/FormCard';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

const schema = Yup.object({
  name: Yup.string().required('Campo obrigatório'),
  cpfNumber: Yup.string().required('Campo obrigatório').nullable(),
  birthdate: Yup.string().nullable(),
  admissionDate: Yup.string().nullable(),
  email: Yup.string().email('Formato de email invalido').nullable(),
  idCardNumber: Yup.string().nullable(),
  issuingAgency: Yup.string().uppercase().nullable(),
  employmentCard: Yup.string().nullable(),
  gender: Yup.string().nullable(),
  maritalStatus: Yup.string().nullable(),
  specialNeeds: Yup.string().nullable(),
  appPermission: Yup.string().nullable(),
  educationLevel: Yup.string().nullable(),
  sendJournal: Yup.string().nullable(),
  details: Yup.string().nullable(),
  monthlyCredit: Yup.number().default(175),
  annualCredit: Yup.number().default(700),
  phone01: Yup.string().nullable(),
  phone02: Yup.string().nullable(),
  phone03: Yup.string().nullable(),
  bankAccount: Yup.string().nullable(),
  bankAgency: Yup.string().nullable(),
  bankCode: Yup.string().nullable(),
  companyCode: Yup.string().nullable(),
  baseSalary: Yup.string().default(0).nullable(),
  discount: Yup.string().default(0).nullable(),
  associate: Yup.string().required('Campo obrigatório'),
  associateState: Yup.string(),
  hiringDate: Yup.string().nullable(),
  dismissalDate: Yup.string().nullable(),
  retirementDate: Yup.string().nullable(),
  ente: Yup.string().nullable(),
  monthlyType: Yup.string().nullable(),
  adresses: Yup.array().of(
    Yup.object().shape({
      postalCode: Yup.string().nullable(),
      streetName: Yup.string().nullable(),
      number: Yup.string().nullable(),
      neighborhood: Yup.string().nullable(),
      state: Yup.string().nullable(),
      city: Yup.string().nullable(),
      complement: Yup.string().nullable(),
    }),
  ),
  dependents: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().nullable(),
      birthdate: Yup.string().nullable(),
      gender: Yup.string().nullable(),
      relationship: Yup.string().nullable(),
      documents: Yup.boolean().default(false).nullable(),
    }),
  ),
  clientHistory: Yup.array().of(
    Yup.object().shape({
      company: Yup.string().nullable(),
      code: Yup.string().nullable(),
      admissionDate: Yup.string().nullable(),
      dismissalDate: Yup.string().nullable(),
    }),
  ),
});

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

export default function Form() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [saveOrEdit, setSaveOrEdit] = useState('save');
  const [clientId, setClientId] = useState(null);
  const [isBackDropOpen, setIsBackDropOpen] = useState(false);
  const [dataActualized, setDataActualized] = useState(false);

  const [clientBills, setClientBills] = useState([]);
  const [clientRefunds, setClientRefunds] = useState([]);

  const [clientOtherRefunds, setClientOtherRefunds] = useState([]);
  const [showOtherRefunds, setShowOtherRefunds] = useState(false);

  const [clientContracts, setClientContracts] = useState([]);

  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: null,
    severity: null,
  });

  const billingPriorities = useRef([]);

  const canEdit = useRef(false);

  const dataClient = useRef({});

  const { tokens, user } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    getValues,
    setValue,
    watch,
    clearErrors,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      adresses: [],
      dependents: [],
      clientHistory: [],
    },
  });

  useEffect(() => {
    async function fetchData() {
      if (user) {
        try {
          setIsBackDropOpen(true);

          user.permissions.forEach((permission) => {
            if (permission.resource === 'Setor de Sócios' && permission.action === 'edit') {
              canEdit.current = true;
            }
          });

          const billingPrioritiesData = await api.get('billingPriorities/getPriorities', {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          });

          billingPriorities.current = billingPrioritiesData.data;

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

    async function resetMonth() {
      setIsBackDropOpen(true);
      const today = new Date();
      if (today.getDate() >= 1 && today.getDate() <= 7) {
        try {
          const { data } = await api.get('configs', {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          });

          if (!data.actualized_monthly_credit) {
            await api.post(
              '/configs/month',
              { value: true },
              {
                headers: {
                  'x-access-token': tokens?.accessToken,
                },
              },
            );
          }

          if (today.getMonth() === 0 && !data.actualized_annual_credit) {
            await api.post(
              '/configs/annual',
              { value: true },
              {
                headers: {
                  'x-access-token': tokens?.accessToken,
                },
              },
            );
          }
        } catch (error) {
          setSnackbarState({
            open: true,
            message: 'Houve um erro interno',
            severity: 'error',
          });
        }
      }

      if (today.getDate() >= 20 && today.getDate() <= 31) {
        try {
          const { data } = await api.get('configs', {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          });

          if (data.actualized_monthly_credit) {
            await api.post(
              '/configs/month',
              { value: false },
              {
                headers: {
                  'x-access-token': tokens?.accessToken,
                },
              },
            );
          }

          if (today.getMonth() === 8 && data.actualized_annual_credit) {
            await api.post(
              '/configs/annual',
              { value: false },
              {
                headers: {
                  'x-access-token': tokens?.accessToken,
                },
              },
            );
          }
        } catch (error) {
          setSnackbarState({
            open: true,
            message: 'Houve um erro interno',
            severity: 'error',
          });
        }
      }
      setIsBackDropOpen(false);
      setDataActualized(true);
    }

    fetchData();

    if (!dataActualized) {
      resetMonth();
    }
  }, [user, tokens, dataActualized]);

  let isEdit = false;

  function verifyIsEdit() {
    if (!isEdit) {
      if (watch('name') !== '') {
        isEdit = true;
      }
      if (watch('cpfNumber') !== '') {
        isEdit = true;
      }
      if (watch('idCardNumber') !== '') {
        isEdit = true;
      }
      if (watch('issuingAgency') !== '') {
        isEdit = true;
      }
      if (watch('birthdate') !== '') {
        isEdit = true;
      }
      if (watch('email') !== '') {
        isEdit = true;
      }
      if (watch('employmentCard') !== '') {
        isEdit = true;
      }
      if (watch('admissionDate') !== '') {
        isEdit = true;
      }
      if (watch('details') !== '') {
        isEdit = true;
      }
      if (watch('gender') !== undefined) {
        isEdit = true;
      }
      if (watch('maritalStatus') !== undefined) {
        isEdit = true;
      }
      if (watch('educationLevel') !== undefined) {
        isEdit = true;
      }
      if (watch('specialNeeds') !== undefined) {
        isEdit = true;
      }
      if (watch('employmentStatus') !== undefined) {
        isEdit = true;
      }
      if (watch('sendJournal') !== undefined) {
        isEdit = true;
      }
    }
  }

  verifyIsEdit();

  function toggleIsDrawerOpen() {
    setIsDrawerOpen((previousValue) => !previousValue);
  }

  const {
    fields: fieldsDependents,
    append: appendDependent,
    remove: removeDependent,
  } = useFieldArray({
    control,
    name: 'dependents',
  });

  const {
    fields: fieldsAdresses,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control,
    name: 'adresses',
  });

  const {
    fields: fieldsClientHistory,
    append: appendClientHistory,
    remove: removeClientHistory,
  } = useFieldArray({
    control,
    name: 'clientHistory',
  });

  function addNewDependent() {
    appendDependent({
      name: '',
      birthdate: '',
      gender: '',
      relationship: '',
      documents: false,
    });
  }

  function addNewAddress() {
    appendAddress({
      postalCode: '',
      streetName: '',
      number: '',
      neighborhood: '',
      state: '',
      city: '',
      complement: '',
    });
  }

  function addNewClientHistory() {
    appendClientHistory({
      company: '',
      code: '',
      admissionDate: '',
      dismissalDate: '',
    });
  }

  function handleCloseSnackbar(event, reason) {
    if (reason === 'clickaway') return;

    setSnackbarState({
      open: false,
      message: null,
    });
  }

  async function createClient(data) {
    if (!canEdit.current) {
      setSnackbarState({
        open: true,
        message: 'Você não tem permissão para cadastrar um cliente',
        severity: 'error',
      });
    } else {
      const { adresses, dependents, clientHistory, ...rest } = data;

      rest.birthdate = rest.birthdate ? moment(rest.birthdate).format('YYYY-MM-DD') : null;
      rest.admissionDate = rest.admissionDate ? moment(rest.admissionDate).format('YYYY-MM-DD') : null;

      rest.hiringDate = rest.hiringDate ? moment(rest.hiringDate).format('YYYY-MM-DD') : null;
      rest.dismissalDate = rest.dismissalDate ? moment(rest.dismissalDate).format('YYYY-MM-DD') : null;
      rest.retirementDate = rest.retirementDate ? moment(rest.retirementDate).format('YYYY-MM-DD') : null;

      rest.gender = rest.gender ? rest.gender : '';
      rest.maritalStatus = rest.maritalStatus ? rest.maritalStatus : '';
      rest.specialNeeds = rest.specialNeeds ? rest.specialNeeds : '';
      rest.educationLevel = rest.educationLevel ? rest.educationLevel : '';
      rest.appPermission = rest.appPermission ? rest.appPermission : '';
      rest.sendJournal = rest.sendJournal ? rest.sendJournal : '';
      rest.associate = rest.associate ? rest.associate : '';
      rest.ente = rest.ente ? rest.ente : '';
      rest.monthlyType = rest.monthlyType ? rest.monthlyType : '';

      adresses.forEach((address, addressIndex) => {
        address.order = addressIndex; // eslint-disable-line
      });

      dependents.forEach((dependent, dependentIndex) => {
        dependent.order = dependentIndex; // eslint-disable-line
      });

      clientHistory.forEach((history, historyIndex) => {
        history.order = historyIndex; // eslint-disable-line
        history.dismissalDate = history.dismissalDate ? moment(history.dismissalDate).format('YYYY-MM-DD') : null; // eslint-disable-line
        history.admissionDate = history.admissionDate ? moment(history.admissionDate).format('YYYY-MM-DD') : null; // eslint-disable-line
      });

      const client = {
        adresses,
        dependents,
        clientHistory,
        ...rest,
      };

      try {
        await api.post(
          'clients',
          { client, userId: user.id },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );

        setSnackbarState({
          open: true,
          message: 'Cadastrado com Sucesso',
          severity: 'success',
        });

        reset();
      } catch (error) {
        setSnackbarState({
          open: true,
          message: 'Houve um erro interno',
          severity: 'error',
        });
      }
    }
  }

  async function updateClient(data) {
    if (!canEdit.current) {
      setSnackbarState({
        open: true,
        message: 'Você não tem permissão para editar um usuário',
        severity: 'error',
      });
    } else {
      const { adresses, dependents, clientHistory, ...rest } = data;

      rest.birthdate = rest.birthdate ? moment(rest.birthdate).format('YYYY-MM-DD') : null;
      rest.admissionDate = rest.admissionDate ? moment(rest.admissionDate).format('YYYY-MM-DD') : null;

      rest.hiringDate = rest.hiringDate ? moment(rest.hiringDate).format('YYYY-MM-DD') : null;
      rest.dismissalDate = rest.dismissalDate ? moment(rest.dismissalDate).format('YYYY-MM-DD') : null;
      rest.retirementDate = rest.retirementDate ? moment(rest.retirementDate).format('YYYY-MM-DD') : null;

      rest.gender = rest.gender ? rest.gender : '';
      rest.maritalStatus = rest.maritalStatus ? rest.maritalStatus : '';
      rest.specialNeeds = rest.specialNeeds ? rest.specialNeeds : '';
      rest.educationLevel = rest.educationLevel ? rest.educationLevel : '';
      rest.appPermission = rest.appPermission ? rest.appPermission : '';
      rest.sendJournal = rest.sendJournal ? rest.sendJournal : '';
      rest.associate = rest.associate ? rest.associate : '';
      rest.ente = rest.ente ? rest.ente : '';
      rest.monthlyType = rest.monthlyType ? rest.monthlyType : '';

      adresses.forEach((address, addressIndex) => {
        address.clientId = clientId; // eslint-disable-line
        address.order = addressIndex; // eslint-disable-line
      });

      dependents.forEach((dependent, dependentIndex) => {
        dependent.clientId = clientId; // eslint-disable-line
        dependent.order = dependentIndex; // eslint-disable-line
      });

      clientHistory.forEach((history, historyIndex) => {
        history.clientId = clientId; // eslint-disable-line
        history.order = historyIndex; // eslint-disable-line
        history.dismissalDate = history.dismissalDate ? moment(history.dismissalDate).format('YYYY-MM-DD') : null; // eslint-disable-line
        history.admissionDate = history.admissionDate ? moment(history.admissionDate).format('YYYY-MM-DD') : null; // eslint-disable-line
      });

      const client = {
        adresses,
        dependents,
        clientHistory,
        ...rest,
      };

      try {
        await api.post(
          'clients/update',
          { client, clientId, userId: user.id },
          {
            headers: {
              'x-access-token': tokens?.accessToken,
            },
          },
        );

        setSnackbarState({
          open: true,
          message: 'Cliente atualizado com sucesso',
          severity: 'success',
        });

        reset();
        setShowOtherRefunds(false);
        setClientBills([]);
        setClientRefunds([]);
        setClientOtherRefunds([]);
        setSaveOrEdit('save');
      } catch (error) {
        setSnackbarState({
          open: true,
          message: 'Houve um erro interno',
          severity: 'error',
        });
      }
    }
  }

  async function getAddress(addressIndex) {
    const postalCode = getValues(`adresses.${addressIndex}.postalCode`);
    if (!postalCode) return;

    const response = await fetch(`https://viacep.com.br/ws/${postalCode}/json`);

    const { logradouro, localidade, uf, bairro } = await response.json();

    clearErrors(`adresses.${addressIndex}`);

    setValue(`adresses.${addressIndex}.streetName`, logradouro);
    setValue(`adresses.${addressIndex}.city`, localidade);
    setValue(`adresses.${addressIndex}.state`, uf);
    setValue(`adresses.${addressIndex}.neighborhood`, bairro);
  }

  function fillFields(fields, bills, refunds, otherRefunds, contracts) {
    setClientId(fields.id);

    setClientBills(bills);
    setClientContracts(contracts);
    setClientRefunds(refunds.refunds);
    setClientOtherRefunds(otherRefunds?.refunds || []);

    setValue('name', fields.name);
    setValue('cpfNumber', fields.cpfNumber);
    setValue('birthdate', fields.birthdate ? fields.birthdate.slice(0, 10) : '');
    setValue('admissionDate', fields.admissionDate ? fields.admissionDate.slice(0, 10) : '');
    setValue('email', fields.email);
    setValue('idCardNumber', fields.idCardNumber);
    setValue('issuingAgency', fields.issuingAgency);
    setValue('employmentCard', fields.employmentCard);
    setValue('gender', fields.gender ? fields.gender : '');
    setValue('maritalStatus', fields.maritalStatus ? fields.maritalStatus : '');
    setValue('specialNeeds', fields.specialNeeds ? fields.specialNeeds : '');
    setValue('educationLevel', fields.educationLevel ? fields.educationLevel : '');
    setValue('sendJournal', fields.sendJournal ? fields.sendJournal : '');
    setValue('appPermission', fields.appPermission ? fields.appPermission : '');
    setValue('details', fields.details);

    setValue('monthlyCredit', fields.monthlyCredit);
    setValue('annualCredit', fields.annualCredit);

    setValue('phone01', fields.phone01);
    setValue('phone02', fields.phone02);
    setValue('phone03', fields.phone03);

    setValue('bankAccount', fields.bankAccount);
    setValue('bankAgency', fields.bankAgency);
    setValue('bankCode', fields.bankCode);

    setValue('companyCode', fields.companyCode);
    setValue('baseSalary', fields.baseSalary);
    setValue('discount', fields.discount);
    setValue('associate', fields.associate ? fields.associate : '');
    setValue('associateState', fields.associateState);
    setValue('hiringDate', fields.hiringDate ? fields.hiringDate.slice(0, 10) : '');
    setValue('dismissalDate', fields.dismissalDate ? fields.dismissalDate.slice(0, 10) : '');
    setValue('retirementDate', fields.retirementDate ? fields.retirementDate.slice(0, 10) : '');
    setValue('ente', fields.ente ? fields.ente : '');
    setValue('monthlyType', fields.monthlyType ? fields.monthlyType : '');

    fields.dependents.forEach((dependent) => {
      dependent.birthdate = dependent.birthdate.slice(0, 10); // eslint-disable-line
    });

    fields.clientHistory.forEach((history) => {
      history.admissionDate === null // eslint-disable-line
        ? (history.admissionDate = '') // eslint-disable-line
        : (history.admissionDate = history.admissionDate.slice(0, 10)); // eslint-disable-line
      history.dismissalDate === null // eslint-disable-line
        ? (history.dismissalDate = '') // eslint-disable-line
        : (history.dismissalDate = history.dismissalDate.slice(0, 10)); // eslint-disable-line
    });

    setValue('adresses', fields.adresses);

    setValue('dependents', fields.dependents);

    setValue('clientHistory', fields.clientHistory);
  }

  function handleDownloadPDF(data) {
    dataClient.current = data;

    const pdfOptions = {
      margin: 10,
      filename: `${data.name}_doc.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    const content = document.getElementById('pdf-content');
    html2pdf(content, pdfOptions);
  }

  return (
    <>
      <DashboardDrawer
        fill={fillFields}
        isOpen={isDrawerOpen}
        closeDrawer={toggleIsDrawerOpen}
        toggleSaveOrEdit={setSaveOrEdit}
        roles={user.roles}
        isEdit={isEdit}
        setSnackbarState={setSnackbarState}
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
            {saveOrEdit === 'save' ? (
              <Button variant="contained" color="success" onClick={handleSubmit(createClient)}>
                Cadastrar
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={handleSubmit(updateClient)}>
                Salvar
              </Button>
            )}
            <Button variant="contained" color="error" onClick={handleSubmit(handleDownloadPDF)}>
              GERAR PDF
            </Button>
          </Stack>
        </Grid>
      </AppBar>

      <Container component="form" sx={{ mt: 1, mb: 4, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Title>Informações Pessoais</Title>

        <Grid container spacing={1}>
          <Grid item xs={12} sm={12} md={6}>
            <TextInput watch={watch} register={register} label="Nome Completo" errors={errors?.name} name="name" />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <MaskInputText
              watch={watch}
              control={control}
              name="cpfNumber"
              mask="999.999.999-99"
              label="CPF"
              errors={errors?.cpfNumber}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <TextInput watch={watch} register={register} label="RG" name="idCardNumber" errors={errors?.idCardNumber} />
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <TextInput
              watch={watch}
              register={register}
              label="Órgão Emissor"
              name="issuingAgency"
              errors={errors?.issuingAgency}
            />
          </Grid>

          <Grid item xs={12} sm={12} md={6}>
            <TextInput watch={watch} register={register} label="Email" errors={errors?.email} name="email" />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <TextInput
              watch={watch}
              register={register}
              label="Telefone/Celular"
              errors={errors?.phone01}
              name="phone01"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <TextInput
              watch={watch}
              register={register}
              label="Telefone/Celular"
              errors={errors?.phone02}
              name="phone02"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <TextInput
              watch={watch}
              register={register}
              label="Telefone/Celular"
              errors={errors?.phone03}
              name="phone03"
            />
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <DateInput register={register} label="Data de Nascimento" errors={errors?.birthdate} name="birthdate" />
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <DateInput
              register={register}
              label="Data de Sindicalização"
              errors={errors?.admissionDate}
              name="admissionDate"
            />
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <TextInput
              watch={watch}
              register={register}
              label="Cart.de Trabalho"
              errors={errors?.employmentCard}
              name="employmentCard"
            />
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Select
              options={[
                { text: 'MASCULINO', value: 'MASCULINO' },
                { text: 'FEMININO', value: 'FEMININO' },
                { text: 'OUTROS', value: 'OUTROS' },
              ]}
              control={control}
              label="Sexo"
              errors={errors?.gender}
              {...register('gender')}
              register={register}
              name="gender"
            />
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Select
              options={[
                { text: 'SOLTEIRO(A)', value: 'SOLTEIRO(A)' },
                { text: 'CASADO(A)', value: 'CASADO(A)' },
                { text: 'SEPARADO(A)', value: 'SEPARADO(A)' },
                { text: 'DIVORCIADO(A)', value: 'DIVORCIADO(A)' },
                { text: 'DESQUITADO(A)', value: 'DESQUITADO(A)' },
                { text: 'VIUVO(A)', value: 'VIUVO(A)' },
                { text: 'UNIÃO ESTAVEL', value: 'UNIÃO ESTAVEL' },
                { text: 'OUTROS', value: 'OUTROS' },
              ]}
              control={control}
              label="Estado Civil"
              errors={errors?.maritalStatus}
              {...register('maritalStatus')}
              register={register}
              name="maritalStatus"
            />
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Select
              options={[
                { text: 'NÃO INFORMADO', value: 'NÃO INFORMADO' },
                { text: 'NÃO ALFABETIZADO', value: 'NÃO ALFABETIZADO' },
                { text: 'ENSINO FUNDAMENTAL', value: 'ENSINO FUNDAMENTAL' },
                { text: 'ENSINO FUNDAM./INCOMPLE.', value: 'ENSINO FUNDAM./INCOMPLE.' },
                { text: 'ENSINO MÉDIO', value: 'ENSINO MÉDIO' },
                { text: 'ENSINO MÉDIO/INCOMPL.', value: 'ENSINO MÉDIO/INCOMPL.' },
                { text: 'SUPERIOR', value: 'SUPERIOR' },
                { text: 'SUPERIOR/INCOMPL.', value: 'SUPERIOR/INCOMPL.' },
                { text: 'PÓS GRADUADO', value: 'PÓS GRADUADO' },
                { text: 'MESTRADO', value: 'MESTRADO' },
                { text: 'DOUTORADO', value: 'DOUTORADO' },
              ]}
              control={control}
              label="Instrução"
              errors={errors?.educationLevel}
              {...register('educationLevel')}
              register={register}
              name="educationLevel"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <Select
              options={[
                { text: 'NÃO POSSUI', value: 'NÃO POSSUI' },
                { text: 'POSSUI', value: 'POSSUI' },
              ]}
              control={control}
              label="Deficiência"
              errors={errors?.specialNeeds}
              {...register('specialNeeds')}
              register={register}
              name="specialNeeds"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <Select
              options={[
                { text: 'NÃO ENVIAR', value: 'NÃO ENVIAR' },
                { text: 'ENVIAR', value: 'ENVIAR' },
              ]}
              control={control}
              label="Jornal"
              errors={errors?.sendJournal}
              {...register('sendJournal')}
              register={register}
              name="sendJournal"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <Select
              options={[
                { text: 'NÃO PERMITIR', value: 'NÃO PERMITIR' },
                { text: 'PERMITIR', value: 'PERMITIR' },
              ]}
              control={control}
              label="Permitir Carteirinha"
              errors={errors?.appPermission}
              {...register('appPermission')}
              register={register}
              name="appPermission"
            />
          </Grid>

          <Grid item xs={12}>
            <TextInput watch={watch} register={register} label="Descrição" errors={errors?.details} name="details" />
          </Grid>
        </Grid>

        <Title>Endereços</Title>

        <Grid container>
          {fieldsAdresses.map((field, index) => (
            <Grid key={field.id}>
              {index >= 1 ? <Title>Endereço de Correspondência</Title> : null}
              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid item xs={4} sm={4} md={1}>
                  <TextInput
                    watch={watch}
                    register={register}
                    label="Número"
                    errors={errors?.adresses?.[index]?.number}
                    name={`adresses.${index}.number`}
                  />
                </Grid>

                <Grid item xs={4} sm={4} md={1.5}>
                  <MaskInputText
                    watch={watch}
                    control={control}
                    name={`adresses.${index}.postalCode`}
                    mask="99999-999"
                    label="CEP"
                    errors={errors?.adresses?.[index]?.postalCode}
                  />
                </Grid>

                <Grid item xs={4} sm={4} md={1.5}>
                  <Button variant="contained" value="Buscar" fullWidth onClick={() => getAddress(index)}>
                    Buscar
                  </Button>
                </Grid>

                <Grid item xs={12} sm={8} md={4}>
                  <TextInput
                    watch={watch}
                    register={register}
                    label="Rua"
                    errors={errors?.adresses?.[index]?.streetName}
                    name={`adresses.${index}.streetName`}
                  />
                </Grid>

                <Grid item xs={6} sm={4} md={4}>
                  <TextInput
                    watch={watch}
                    register={register}
                    label="Bairro"
                    errors={errors?.adresses?.[index]?.neighborhood}
                    name={`adresses.${index}.neighborhood`}
                  />
                </Grid>

                <Grid item xs={6} sm={4} md={4}>
                  <TextInput
                    watch={watch}
                    register={register}
                    label="Cidade"
                    errors={errors?.adresses?.[index]?.city}
                    name={`adresses.${index}.city`}
                  />
                </Grid>

                <Grid item xs={6} sm={4} md={4}>
                  <TextInput
                    watch={watch}
                    register={register}
                    label="Estado"
                    errors={errors?.adresses?.[index]?.state}
                    name={`adresses.${index}.state`}
                  />
                </Grid>

                <Grid item xs={6} sm={4} md={4}>
                  <TextInput
                    watch={watch}
                    register={register}
                    label="Complemento"
                    errors={errors?.adresses?.[index]?.complement}
                    name={`adresses.${index}.complement`}
                  />
                </Grid>

                <Grid item xs={12} sm={12} md={12}>
                  <Button variant="contained" fullWidth color="error" onClick={() => removeAddress(index)}>
                    Remover
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          ))}

          <Grid item xs={12} sm={12} md={12}>
            <Button variant="contained" fullWidth color="primary" onClick={addNewAddress}>
              adicionar
            </Button>
          </Grid>
        </Grid>

        <Title>Informações Bancarias</Title>

        <Grid container spacing={1}>
          <Grid item xs={6} sm={4} md={2}>
            <TextInput watch={watch} register={register} label="Cod. Banco" errors={errors?.bankCode} name="bankCode" />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <TextInput
              watch={watch}
              register={register}
              label="Conta Banco"
              errors={errors?.bankAccount}
              name="bankAccount"
            />
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <TextInput
              watch={watch}
              register={register}
              label="Agencia Banco"
              errors={errors?.bankAgency}
              name="bankAgency"
            />
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <MoneyReadOnly label="Credito Mensal" value={watch('monthlyCredit')} />
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <MoneyReadOnly label="Credito Anual" value={watch('annualCredit')} />
          </Grid>
        </Grid>

        <Title>Informações da Profissão</Title>

        <Grid container spacing={1}>
          <Grid item xs={2} sm={1} md={0.5}>
            <Checkbox
              icon={<CancelIcon color="error" />}
              checkedIcon={<CheckCircleIcon color="success" />}
              checked={watch(`associateState`) === 'ASSOCIADO'}
              onClick={() => {
                setValue('associateState', watch('associateState') === 'ASSOCIADO' ? 'NÃO ASSOCIADO' : 'ASSOCIADO');
                setValue('associate', '');
              }}
            />
          </Grid>

          <Grid item xs={10} sm={5} md={2}>
            <TextInput
              watch={watch}
              register={register}
              label="Cod. Sindicato"
              errors={errors?.companyCode}
              name="companyCode"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3.5}>
            <Select
              options={
                watch('associateState') === 'ASSOCIADO'
                  ? [
                      { text: 'ATIVO', value: 'ATIVO' },
                      { text: 'APOSENTADO', value: 'APOSENTADO' },
                      { text: 'PENSIONISTA', value: 'PENSIONISTA' },
                      { text: 'LIC. S. REMUNERAÇÃO', value: 'LIC. S. REMUNERAÇÃO' },
                    ]
                  : [
                      { text: 'ATIVO', value: 'ATIVO' },
                      { text: 'APOSENTADO', value: 'APOSENTADO' },
                      { text: 'PENSIONISTA', value: 'PENSIONISTA' },
                      { text: 'LIC. S. REMUNERAÇÃO', value: 'LIC. S. REMUNERAÇÃO' },
                      { text: 'EXONERADO', value: 'EXONERADO' },
                      { text: 'FALECIDO', value: 'FALECIDO' },
                    ]
              }
              control={control}
              label="Situação"
              register={register}
              {...register(`associate`)}
              errors={errors?.associate}
              name="associate"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <MoneyTextInput
              watch={watch}
              register={register}
              label="Salario Base"
              errors={errors?.baseSalary}
              name="baseSalary"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <MoneyTextInput
              watch={watch}
              register={register}
              label="Desconto"
              errors={errors?.discount}
              name="discount"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <DateInput register={register} label="Data da Admissão" errors={errors?.hiringDate} name="hiringDate" />
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <DateInput
              register={register}
              label="Data da Demissão"
              errors={errors?.dismissalDate}
              name="dismissalDate"
            />
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <DateInput
              register={register}
              label="Data da Aposentadoria"
              errors={errors?.retirementDate}
              name="retirementDate"
            />
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Select
              options={[
                { text: 'PREFEITURA', value: 'PREFEITURA' },
                { text: 'SAO JOAO PREV', value: 'SAO JOAO PREV' },
                { text: 'CÂMARA MUNICIPAL', value: 'CÂMARA MUNICIPAL' },
                { text: 'UNIFAE', value: 'UNIFAE' },
              ]}
              control={control}
              label="Ente"
              register={register}
              {...register(`ente`)}
              errors={errors?.ente}
              name="ente"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Select
              options={[
                { text: 'MENSALIDADE SÓCIO', value: 'MENSALIDADE SÓCIO' },
                { text: 'CONTRIBUIÇÃO ASSOCIATIVA', value: 'CONTRIBUIÇÃO ASSOCIATIVA' },
              ]}
              control={control}
              label="Tipo Mensalidade"
              register={register}
              {...register(`monthlyType`)}
              errors={errors?.monthlyType}
              name="monthlyType"
            />
          </Grid>
        </Grid>

        <Title>Histórico Do Cliente</Title>

        <Grid container>
          {fieldsClientHistory.map((field, index) => (
            <Grid container spacing={1} sx={{ mb: 1 }} key={field.id}>
              <Grid item xs={12} sm={4} md={2}>
                <TextInput
                  watch={watch}
                  register={register}
                  label="Código do Cargo"
                  errors={errors?.clientHistory?.[index]?.code}
                  name={`clientHistory.${index}.code`}
                />
              </Grid>

              <Grid item xs={12} sm={8} md={4}>
                <TextInput
                  watch={watch}
                  register={register}
                  label="Cargo"
                  errors={errors?.clientHistory?.[index]?.company}
                  name={`clientHistory.${index}.company`}
                />
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <DateInput
                  register={register}
                  label="Data de Admissão"
                  errors={errors?.clientHistory?.[index]?.admissionDate}
                  name={`clientHistory.${index}.admissionDate`}
                />
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <DateInput
                  register={register}
                  label="Data de Demissão"
                  errors={errors?.clientHistory?.[index]?.dismissalDate}
                  name={`clientHistory.${index}.dismissalDate`}
                />
              </Grid>

              <Grid item xs={12} sm={4} md={2}>
                <Button variant="contained" fullWidth color="error" onClick={() => removeClientHistory(index)}>
                  Remover
                </Button>
              </Grid>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button variant="contained" fullWidth color="primary" onClick={addNewClientHistory}>
              Adicionar
            </Button>
          </Grid>
        </Grid>

        <Title>Dependentes</Title>

        <Grid container>
          {fieldsDependents.map((field, index) => (
            <Grid container spacing={1} sx={{ mb: 1 }} key={field.id}>
              <Grid item xs={12} sm={9} md={4.5}>
                <TextInput
                  watch={watch}
                  register={register}
                  label="Nome"
                  errors={errors?.dependents?.[index]?.name}
                  name={`dependents.${index}.name`}
                />
              </Grid>

              <Grid item xs={6} sm={3} md={2.5}>
                <DateInput
                  register={register}
                  label="Nascimento"
                  errors={errors?.dependents?.[index]?.birthdate}
                  name={`dependents.${index}.birthdate`}
                />
              </Grid>

              <Grid item xs={6} sm={5} md={2}>
                <Select
                  options={[
                    { text: 'MASCULINO', value: 'MASCULINO' },
                    { text: 'FEMININO', value: 'FEMININO' },
                    { text: 'OUTROS', value: 'OUTROS' },
                  ]}
                  control={control}
                  label="Sexo"
                  errors={errors?.dependents?.[index]?.gender}
                  {...register(`dependents.${index}.gender`)}
                  register={register}
                  name={`dependents.${index}.gender`}
                />
              </Grid>

              <Grid item xs={10} sm={5} md={2.5}>
                <Select
                  options={[
                    { text: 'ESPOSO(A)', value: 'ESPOSO(A)' },
                    { text: 'FILHO(A)', value: 'FILHO(A)' },
                    { text: 'ENTEADO(A)', value: 'ENTEADO(A)' },
                    { text: 'TUTELADO(A)', value: 'TUTELADO(A)' },
                    { text: 'OUTROS(AS)', value: 'OUTROS(AS)' },
                    { text: 'DEP. LAUDO MÉDICO', value: 'DEP. LAUDO MÉDICO' },
                  ]}
                  control={control}
                  label="Parentesco"
                  errors={errors?.dependents?.[index]?.relationship}
                  {...register(`dependents.${index}.relationship`)}
                  register={register}
                  name={`dependents.${index}.relationship`}
                />
              </Grid>

              <Grid item xs={2} sm={2} md={0.5}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon />}
                  checkedIcon={<CheckBoxIcon color="success" />}
                  checked={!!watch(`dependents.${index}.documents`)}
                  onClick={() => setValue(`dependents.${index}.documents`, !watch(`dependents.${index}.documents`))}
                />
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" fullWidth color="error" onClick={() => removeDependent(index)}>
                  Remover
                </Button>
              </Grid>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button variant="contained" fullWidth color="primary" onClick={addNewDependent}>
              Adicionar
            </Button>
          </Grid>
        </Grid>

        {clientRefunds.length > 0 ? (
          <>
            <Title>Reembolsos Atuais</Title>

            <DashboardOthersRefunds refunds={clientRefunds} clientName={watch('name')} />
          </>
        ) : null}

        {showOtherRefunds ? (
          <>
            <Title>Reembolsos Antigos</Title>

            <Grid>
              <DashboardOthersRefunds refunds={clientOtherRefunds} clientName={watch('name')} />
            </Grid>
          </>
        ) : null}

        {clientOtherRefunds.length > 0 ? (
          <Grid item xs={12} mb={2}>
            <Button
              variant="contained"
              fullWidth
              color="warning"
              onClick={() => setShowOtherRefunds((currentValue) => !currentValue)}
            >
              {showOtherRefunds ? 'Ocultar Reembolsos Antigos' : 'Mostrar Reembolsos Antigos'}
            </Button>
          </Grid>
        ) : null}

        <Grid>
          <DashboardBillsList fieldsBills={clientBills} />
        </Grid>

        {clientContracts.length > 0 ? (
          <DashboardContractsList contracts={clientContracts} billingPriorities={billingPriorities.current} />
        ) : null}
        <Grid />
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

      <Grid display="none">
        <div id="pdf-content">
          <FormCard client={dataClient.current} />
        </div>
      </Grid>
    </>
  );
}
