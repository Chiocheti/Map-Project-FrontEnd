import 'dayjs/locale/pt-br';

import MenuIcon from '@mui/icons-material/Menu';
import MuiAlert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import moment from 'moment';
import { useContext, useState, useRef, forwardRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

import AppBar from '../components/Form/AppBar';
import Button from '../components/Form/Button';
import ReportClientAddresses from '../components/Report/ReportClientAddresses';
import ReportClientDependents from '../components/Report/ReportClientDependents';
import ReportClientInformation from '../components/Report/ReportClientInformation';
import ReportClientRefunds from '../components/Report/ReportClientRefunds';
import ReportDrawer from '../components/Report/ReportDrawer';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

export default function Report() {
  const { tokens, user } = useContext(AuthContext);

  const [banks, setBanks] = useState([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPersonalInformation, setShowPersonalInformation] = useState(false);

  const [showAddressInformation, setShowAddressInformation] = useState(false);
  const [showDependentInformation, setShowDependentInformation] = useState(false);
  const [showRefundInformation, setShowRefundInformation] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: null,
    severity: null,
  });

  const canEdit = useRef(false);
  const amount = useRef();

  const billingPriorities = useRef([]);
  const servicesList = useRef([]);

  const personalData = useRef({});

  const addressData = useRef({});
  const dependentData = useRef({});
  const refundData = useRef({});

  useEffect(() => {
    async function fetchData() {
      try {
        user.permissions.forEach((permission) => {
          if (permission.resource === 'Relatório' && permission.action === 'edit') {
            canEdit.current = true;
          }
        });

        const { data } = await api.get('/banks', {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        });

        setBanks(data);

        const billingPrioritiesData = await api.get('billingPriorities', {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        });

        const res = await api.get('specialties/getAll', {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        });

        const config = await api.get('configs', {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        });

        amount.current = config.data.amount;

        servicesList.current = res.data;

        billingPriorities.current = billingPrioritiesData.data;
      } catch (error) {
        setSnackbarState({
          open: true,
          message: error.response.data.message,
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

  const updatePersonalData = (newData) => {
    personalData.current = newData;
  };

  const updateAddressData = (newData) => {
    addressData.current = newData;
  };

  const updateDependentData = (newData) => {
    dependentData.current = newData;
  };

  const updateRefundData = (newData) => {
    refundData.current = newData;
  };

  async function writeWorkBook(sheetData) {
    const workBook = XLSX.utils.book_new();

    const workSheet = XLSX.utils.aoa_to_sheet(sheetData);

    XLSX.utils.book_append_sheet(workBook, workSheet, 'Relatório');

    XLSX.writeFile(workBook, 'Relatório.xlsx', { bookType: 'xlsx', type: 'binary' });
  }

  function createSheetReport(res) {
    const titleList = [];
    const document = [];
    let maxAddress = 0;
    let maxDependents = 0;
    let maxRefunds = 0;

    if (personalData?.current?.fields?.length > 0) {
      personalData.current.fields.forEach((element) => {
        switch (element) {
          case 'name':
            titleList.push('NOME');
            break;

          case 'cpfNumber':
            titleList.push('CPF');
            break;

          case 'birthdate':
            titleList.push('DATA DE NASCIMENTO');
            break;

          case 'admissionDate':
            titleList.push('DATA DE ADMISSÃO');
            break;

          case 'email':
            titleList.push('EMAIL');
            break;

          case 'idCardNumber':
            titleList.push('RG');
            break;

          case 'issuingAgency':
            titleList.push('ÓRGÃO EMISSOR');
            break;

          case 'employmentCard':
            titleList.push('CARTEIRA DE TRABALHO');
            break;

          case 'gender':
            titleList.push('GÊNERO');
            break;

          case 'maritalStatus':
            titleList.push('ESTADO CIVIL');
            break;

          case 'specialNeeds':
            titleList.push('DEFICIÊNCIA');
            break;

          case 'appPermission':
            titleList.push('APLICATIVO');
            break;

          case 'educationLevel':
            titleList.push('INSTRUÇÃO');
            break;

          case 'sendJournal':
            titleList.push('JORNAL');
            break;

          case 'details':
            titleList.push('DETALHES');
            break;

          case 'monthlyCredit':
            titleList.push('CREDITO MENSAL');
            break;

          case 'annualCredit':
            titleList.push('CREDITO ANUAL');
            break;

          case 'phone01':
            titleList.push('TELEFONE 01');
            break;

          case 'phone02':
            titleList.push('TELEFONE 02');
            break;

          case 'phone03':
            titleList.push('TELEFONE 03');
            break;

          case 'bankAccount':
            titleList.push('CONTA BANCO');
            break;

          case 'bankAgency':
            titleList.push('AGENCIA BANCO');
            break;

          case 'bankCode':
            titleList.push('CÓDIGO BANCO');
            break;

          case 'companyCode':
            titleList.push('CÓDIGO SINDICATO');
            break;

          case 'baseSalary':
            titleList.push('SALARIO BASE');
            break;

          case 'discount':
            titleList.push('DESCONTO');
            break;

          case 'associate':
            titleList.push('SITUAÇÃO');
            break;

          case 'associateState':
            titleList.push('STATUS');
            break;

          case 'hiringDate':
            titleList.push('DATA DE CONTRATAÇÃO');
            break;

          case 'dismissalDate':
            titleList.push('DATA DE DEMISSÃO');
            break;

          case 'retirementDate':
            titleList.push('DATA DE APOSENTADORIA');
            break;

          case 'ente':
            titleList.push('ENTE');
            break;

          case 'monthlyType':
            titleList.push('TIPO DE MENSALIDADE');
            break;

          default:
            break;
        }
      });
    }

    if (addressData?.current?.fields?.length > 0) {
      res.forEach((element) => {
        if (element.adresses.length > maxAddress) {
          maxAddress = element.adresses.length;
        }
      });

      for (let index = 0; index < maxAddress; index += 1) {
        addressData.current.fields.forEach((element) => {
          switch (element) {
            case 'postalCode':
              titleList.push('CEP');
              break;

            case 'streetName':
              titleList.push('RUA');
              break;

            case 'number':
              titleList.push('NUMERO');
              break;

            case 'neighborhood':
              titleList.push('BAIRRO');
              break;

            case 'state':
              titleList.push('ESTADO');
              break;

            case 'city':
              titleList.push('CIDADE');
              break;

            case 'complement':
              titleList.push('COMPLEMENTO');
              break;

            default:
              break;
          }
        });
      }
    }

    if (dependentData?.current?.fields?.length > 0) {
      res.forEach((element) => {
        if (element.dependents.length > maxDependents) {
          maxDependents = element.dependents.length;
        }
      });

      for (let index = 0; index < maxDependents; index += 1) {
        dependentData.current.fields.forEach((element) => {
          switch (element) {
            case 'name':
              titleList.push('NOME DEPENDENTE');
              break;
            case 'birthdate':
              titleList.push('DATA DE NASCIMENTO');
              break;
            case 'gender':
              titleList.push('SEXO');
              break;
            case 'relationship':
              titleList.push('PARENTESCO');
              break;
            case 'documents':
              titleList.push('DOCUMENTOS');
              break;

            default:
              break;
          }
        });
      }
    }

    if (refundData?.current?.fields?.length > 0) {
      res.forEach((element) => {
        if (element.refunds.length > maxRefunds) {
          maxRefunds = element.refunds.length;
        }
      });

      for (let index = 0; index < maxRefunds; index += 1) {
        refundData.current.fields.forEach((element) => {
          switch (element) {
            case 'dependentId':
              titleList.push('REFERENTE');
              break;
            case 'specialtyId':
              titleList.push('ESPECIALIDADE');
              break;
            case 'invoiceReceived':
              titleList.push('DATA DE EMISSÃO');
              break;
            case 'invoiceNumber':
              titleList.push('CÓDIGO');
              break;
            case 'invoiceValue':
              titleList.push('VALOR PEDIDO');
              break;
            case 'refundValue':
              titleList.push('VALOR REEMBOLSADO');
              break;

            default:
              break;
          }
        });
      }
    }

    res.forEach((element) => {
      const listItem = [];

      if (element.name !== undefined) {
        listItem.push(element.name !== null ? element.name : '');
      }
      if (element.cpfNumber !== undefined) {
        listItem.push(element.cpfNumber !== null ? element.cpfNumber : '');
      }
      if (element.birthdate !== undefined) {
        listItem.push(element.birthdate !== null ? moment(element.birthdate).format('DD/MM/YYYY') : '');
      }
      if (element.admissionDate !== undefined) {
        listItem.push(element.admissionDate !== null ? moment(element.admissionDate).format('DD/MM/YYYY') : '');
      }
      if (element.email !== undefined) {
        listItem.push(element.email !== null ? element.email : '');
      }
      if (element.idCardNumber !== undefined) {
        listItem.push(element.idCardNumber !== null ? element.idCardNumber : '');
      }
      if (element.issuingAgency !== undefined) {
        listItem.push(element.issuingAgency !== null ? element.issuingAgency : '');
      }
      if (element.employmentCard !== undefined) {
        listItem.push(element.employmentCard !== null ? element.employmentCard : '');
      }
      if (element.gender !== undefined) {
        listItem.push(element.gender !== null ? element.gender : '');
      }
      if (element.maritalStatus !== undefined) {
        listItem.push(element.maritalStatus !== null ? element.maritalStatus : '');
      }
      if (element.specialNeeds !== undefined) {
        listItem.push(element.specialNeeds !== null ? element.specialNeeds : '');
      }
      if (element.appPermission !== undefined) {
        listItem.push(element.appPermission !== null ? element.appPermission : '');
      }
      if (element.educationLevel !== undefined) {
        listItem.push(element.educationLevel !== null ? element.educationLevel : '');
      }
      if (element.sendJournal !== undefined) {
        listItem.push(element.sendJournal !== null ? element.sendJournal : '');
      }
      if (element.details !== undefined) {
        listItem.push(element.details !== null ? element.details : '');
      }
      if (element.monthlyCredit !== undefined) {
        listItem.push(element.monthlyCredit !== null ? element.monthlyCredit.toFixed(2) : '');
      }
      if (element.annualCredit !== undefined) {
        listItem.push(element.annualCredit !== null ? element.annualCredit.toFixed(2) : '');
      }
      if (element.phone01 !== undefined) {
        listItem.push(element.phone01 !== null ? element.phone01 : '');
      }
      if (element.phone02 !== undefined) {
        listItem.push(element.phone02 !== null ? element.phone02 : '');
      }
      if (element.phone03 !== undefined) {
        listItem.push(element.phone03 !== null ? element.phone03 : '');
      }
      if (element.bankAccount !== undefined) {
        listItem.push(element.bankAccount !== null ? element.bankAccount : '');
      }
      if (element.bankAgency !== undefined) {
        listItem.push(element.bankAgency !== null ? element.bankAgency : '');
      }
      if (element.bankCode !== undefined) {
        listItem.push(element.bankCode !== null ? element.bankCode : '');
      }
      if (element.companyCode !== undefined) {
        listItem.push(element.companyCode !== null ? element.companyCode : '');
      }
      if (element.baseSalary !== undefined) {
        listItem.push(element.baseSalary !== null ? element.baseSalary.toFixed(2) : '');
      }
      if (element.discount !== undefined) {
        listItem.push(element.discount !== null ? element.discount.toFixed(2) : '');
      }
      if (element.associate !== undefined) {
        listItem.push(element.associate !== null ? element.associate : '');
      }
      if (element.associateState !== undefined) {
        listItem.push(element.associateState !== null ? element.associateState : '');
      }
      if (element.hiringDate !== undefined) {
        listItem.push(element.hiringDate !== null ? moment(element.hiringDate).format('DD/MM/YYYY') : '');
      }
      if (element.dismissalDate !== undefined) {
        listItem.push(element.dismissalDate !== null ? moment(element.dismissalDate).format('DD/MM/YYYY') : '');
      }
      if (element.retirementDate !== undefined) {
        listItem.push(element.retirementDate !== null ? moment(element.retirementDate).format('DD/MM/YYYY') : '');
      }
      if (element.ente !== undefined) {
        listItem.push(element.ente !== null ? element.ente : '');
      }
      if (element.monthlyType !== undefined) {
        listItem.push(element.monthlyType !== null ? element.monthlyType : '');
      }

      if (element.adresses) {
        element.adresses.forEach((address) => {
          if (address.postalCode !== undefined) {
            listItem.push(address.postalCode !== null ? address.postalCode : '');
          }
          if (address.streetName !== undefined) {
            listItem.push(address.streetName !== null ? address.streetName : '');
          }
          if (address.number !== undefined) {
            listItem.push(address.number !== null ? address.number : '');
          }
          if (address.neighborhood !== undefined) {
            listItem.push(address.neighborhood !== null ? address.neighborhood : '');
          }
          if (address.state !== undefined) {
            listItem.push(address.state !== null ? address.state : '');
          }
          if (address.city !== undefined) {
            listItem.push(address.city !== null ? address.city : '');
          }
          if (address.complement !== undefined) {
            listItem.push(address.complement !== null ? address.complement : '');
          }
        });

        for (let index = element.adresses.length; index < maxAddress; index += 1) {
          addressData.current.fields.forEach((address) => {
            switch (address) {
              case 'postalCode':
                listItem.push('');
                break;

              case 'streetName':
                listItem.push('');
                break;

              case 'number':
                listItem.push('');
                break;

              case 'neighborhood':
                listItem.push('');
                break;

              case 'state':
                listItem.push('');
                break;

              case 'city':
                listItem.push('');
                break;

              case 'complement':
                listItem.push('');
                break;

              default:
                break;
            }
          });
        }
      }

      if (element.dependents) {
        element.dependents.forEach((dependent) => {
          if (dependent.name !== undefined) {
            listItem.push(dependent.name !== null ? dependent.name : '');
          }
          if (dependent.birthdate !== undefined) {
            listItem.push(dependent.birthdate !== null ? moment(dependent.birthdate).format('DD/MM/YYYY') : '');
          }
          if (dependent.gender !== undefined) {
            listItem.push(dependent.gender !== null ? dependent.gender : '');
          }
          if (dependent.relationship !== undefined) {
            listItem.push(dependent.relationship !== null ? dependent.relationship : '');
          }
          if (dependent.documents !== undefined) {
            listItem.push(dependent.documents !== null ? dependent.documents : '');
          }
        });

        for (let index = element.dependents.length; index < maxDependents; index += 1) {
          switch (element) {
            case 'name':
              listItem.push('');
              break;
            case 'birthdate':
              listItem.push('');
              break;
            case 'gender':
              listItem.push('');
              break;
            case 'relationship':
              listItem.push('');
              break;
            case 'documents':
              listItem.push('');
              break;

            default:
              break;
          }
        }
      }

      if (element.refunds) {
        element.refunds.forEach((refund) => {
          if (refund.dependentId !== undefined) {
            listItem.push(refund?.dependents?.name !== null ? refund?.dependents?.name : '');
          }
          if (refund.specialtyId !== undefined) {
            listItem.push(refund?.specialties?.skill !== null ? refund.specialties.skill : '');
          }
          if (refund.invoiceReceived !== undefined) {
            listItem.push(refund.invoiceReceived !== null ? moment(refund.invoiceReceived).format('DD/MM/YYYY') : '');
          }
          if (refund.invoiceNumber !== undefined) {
            listItem.push(refund.invoiceNumber !== null ? refund.invoiceNumber : '');
          }
          if (refund.invoiceValue !== undefined) {
            listItem.push(refund.invoiceValue !== null ? refund.invoiceValue.toFixed(2) : '');
          }
          if (refund.refundValue !== undefined) {
            listItem.push(refund.refundValue !== null ? refund.refundValue.toFixed(2) : '');
          }
        });

        for (let index = element.refunds.length; index < maxRefunds; index += 1) {
          switch (element) {
            case 'dependentId':
              listItem.push('');
              break;
            case 'specialtyId':
              listItem.push('');
              break;
            case 'invoiceReceived':
              listItem.push('');
              break;
            case 'invoiceNumber':
              listItem.push('');
              break;
            case 'invoiceValue':
              listItem.push('');
              break;
            case 'refundValue':
              listItem.push('');
              break;

            default:
              break;
          }
        }
      }

      document.push(listItem);
    });

    const report = [[...titleList], ...document];

    writeWorkBook(report);
  }

  async function createReport() {
    if (!canEdit.current) {
      setSnackbarState({
        open: true,
        message: 'Você não tem permissão para gerar um relatório',
        severity: 'error',
      });

      return false;
    }

    try {
      const res = await api.post(
        'report',
        {
          fields: personalData.current.fields,
          query: personalData.current.query,
          addresses: addressData.current,
          dependents: dependentData.current,
          refunds: refundData.current,
        },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      createSheetReport(res.data);
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

  return (
    <>
      <AppBar>
        <Grid container justifyContent="space-between">
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" onClick={toggleIsDrawerOpen}>
            <MenuIcon />
          </IconButton>

          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="success" onClick={createReport}>
              Gerar Relatório
            </Button>
          </Stack>
        </Grid>
      </AppBar>

      <ReportDrawer
        billingPriorities={billingPriorities.current}
        snackbar={setSnackbarState}
        isOpen={isDrawerOpen}
        closeDrawer={toggleIsDrawerOpen}
        isEdit={false}
        setShowPersonalInformation={setShowPersonalInformation}
        setSnackbarState={setSnackbarState}
        amount={amount.current}
        canEdit={canEdit.current}
        banks={banks}
      />

      {showPersonalInformation ? (
        <>
          <ReportClientInformation update={updatePersonalData} />

          <Container component="form" sx={{ mt: 1, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
            <Grid>
              <Button
                sx={{ mb: 1 }}
                fullWidth
                variant="contained"
                color={showAddressInformation ? 'warning' : 'info'}
                onClick={() => setShowAddressInformation((previousValue) => !previousValue)}
              >
                {showAddressInformation ? 'Ocultar endereços' : 'Buscar endereços'}
              </Button>
            </Grid>
            {showAddressInformation ? <ReportClientAddresses update={updateAddressData} /> : null}
          </Container>

          <Container component="form" sx={{ mt: 1, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
            <Grid>
              <Button
                sx={{ mb: 1 }}
                fullWidth
                variant="contained"
                color={showDependentInformation ? 'warning' : 'info'}
                onClick={() => setShowDependentInformation((previousValue) => !previousValue)}
              >
                {showDependentInformation ? 'Ocultar dependentes' : 'Buscar dependentes'}
              </Button>
            </Grid>
            {showDependentInformation ? <ReportClientDependents update={updateDependentData} /> : null}
          </Container>

          <Container component="form" sx={{ mt: 1, mb: 4, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
            <Grid>
              <Button
                sx={{ mb: 1 }}
                color={showRefundInformation ? 'warning' : 'info'}
                fullWidth
                variant="contained"
                onClick={() => setShowRefundInformation((previousValue) => !previousValue)}
              >
                {showRefundInformation ? 'Ocultar reembolsos' : 'Buscar reembolsos'}
              </Button>
            </Grid>
            {showRefundInformation ? (
              <ReportClientRefunds update={updateRefundData} servicesList={servicesList.current} />
            ) : null}
          </Container>
        </>
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
