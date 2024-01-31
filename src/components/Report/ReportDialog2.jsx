import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadingIcon from '@mui/icons-material/Downloading';
import LoopIcon from '@mui/icons-material/Loop';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { forwardRef, useContext, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';
import * as Yup from 'yup';

import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import MyButton from '../Form/Button';
import Select from '../Form/Select';
import Title from '../Form/Title';

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const schema = Yup.object({
  billingPriority: Yup.string().required('Campo Obrigatório'),
});

export default function ReportDialog2({ billingPriorities, isOpen, closeDialog, closeDrawer, snackbar }) {
  const { tokens } = useContext(AuthContext);

  const [duplicated, setDuplicated] = useState();
  const [isBackDropOpen, setIsBackDropOpen] = useState(false);

  const [fileKey, setFileKey] = useState(0);

  const [validateSpreadSheet, setValidateSpreadSheet] = useState(false);

  const [isSpreadSheetBilling, setIsSpreadSheetBilling] = useState(false);
  const [isBillingValidate, setIsBillingValidate] = useState(false);

  const [spreadSheetName, setSpreadSheetName] = useState();

  const [getName, setGetName] = useState(false);
  const [getValue, setGetValue] = useState(false);
  const [getCode, setGetCode] = useState(false);
  const [getCpf, setGetCpf] = useState(false);
  const [getCpfDependente, setGetCpfDependente] = useState(false);
  const [getDate, setGetDate] = useState(false);

  const [changed, setChanged] = useState({
    much: 0,
    last: 0,
  });

  const spreadSheet = useRef();

  const billingSpreadSheetReport = useRef([]);
  const spreadSheetReport = useRef([]);

  const muchUpdate = useRef(0);
  const muchCreate = useRef(0);

  const isToNot = useRef([]);
  const notToIs = useRef([]);

  const notAssociateList = useRef([]);
  const notAssociateListArray = useRef([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(schema),
  });

  function formateCpf(cpf) {
    if (!cpf) return '';
    let formattedCpf = cpf.toString().trim();

    formattedCpf.trim();

    function unformed() {
      let newValue = '';

      for (let i = 0; i < formattedCpf.length; i += 1) {
        if (formattedCpf[i] !== '.' && formattedCpf[i] !== '-' && formattedCpf[i] !== ' ' && formattedCpf[i] !== '') {
          newValue = `${newValue}${formattedCpf[i]}`;
        }
      }
      formattedCpf = newValue;
    }

    function addZero() {
      let newValue = formattedCpf;

      while (newValue.length < 11) {
        newValue = `0${newValue}`;
      }
      formattedCpf = newValue;
    }

    if (formattedCpf.length === 14) {
      return formattedCpf;
    }

    unformed(formattedCpf);

    addZero(formattedCpf);

    formattedCpf = `${formattedCpf.slice(0, 3)}.${formattedCpf.slice(3, 6)}.${formattedCpf.slice(
      6,
      9,
    )}-${formattedCpf.slice(9, 11)}`;

    return formattedCpf;
  }

  function calculateDate(value) {
    if (!value || !Number(value)) {
      return null;
    }

    const date = moment().date(1).month(0).year(1900).format('YYYY-MM-DD');
    const newDate = moment(date)
      .add(value - 2, 'day')
      .format('YYYY-MM-DD');

    if (moment(newDate).isValid()) {
      return newDate;
    }

    return null;
  }

  function setToUpperCase(value) {
    return value.toUpperCase();
  }

  function setToTrim(value) {
    if (!value) {
      return false;
    }
    return value.trim();
  }

  function createErrorReport() {
    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.aoa_to_sheet(spreadSheetReport.current);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cadastros com Falha');

    XLSX.writeFile(workbook, 'Relatório Cadastros com Falha.xlsx', { bookType: 'xlsx', type: 'binary' });
  }

  function createDuplicateReport() {
    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.aoa_to_sheet(duplicated);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Entradas Duplicadas');

    XLSX.writeFile(workbook, 'Relatório Cadastros Duplicados.xlsx', { bookType: 'xlsx', type: 'binary' });
  }

  function createNotAssociateReport() {
    const workbook = XLSX.utils.book_new();

    const page01 = XLSX.utils.aoa_to_sheet(notAssociateListArray.current);

    XLSX.utils.book_append_sheet(workbook, page01, 'Não Sócios');

    const page02 = XLSX.utils.aoa_to_sheet(isToNot.current);

    XLSX.utils.book_append_sheet(workbook, page02, 'Deixaram de ser sócios');

    const page03 = XLSX.utils.aoa_to_sheet(notToIs.current);

    XLSX.utils.book_append_sheet(workbook, page03, 'Começaram a ser sócios');

    XLSX.writeFile(workbook, 'Relatório Atualização de Não Sócios.xlsx', { bookType: 'xlsx', type: 'binary' });
  }

  async function sendDataToDelete({ id }) {
    try {
      await api.post(
        '/clients/removeClientById',
        { id },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  async function deleteNotAssociate() {
    let index = 0;
    let size = 0;
    setIsBackDropOpen(true);

    async function sendNextObject() {
      if (index < notAssociateList.current.length) {
        const response = await sendDataToDelete(notAssociateList.current[index]);
        index += 1;
        size += 1;

        if (response) {
          if (index < notAssociateList.current.length) {
            if (size === 100) {
              setTimeout(sendNextObject, 1000);
              size = 0;
            } else {
              setTimeout(sendNextObject, 10);
            }
          } else {
            setIsBackDropOpen(false);
          }
        }
      }
    }

    sendNextObject();
  }

  async function getClientList() {
    try {
      const { data } = await api.get('clients/getEveryOne', {
        headers: {
          'x-access-token': tokens?.accessToken,
        },
      });

      return data;
    } catch (error) {
      snackbar({
        open: true,
        message: 'Houve um erro interno',
        severity: 'error',
      });

      return false;
    }
  }

  async function sendDataToServer(client) {
    try {
      const { data } = await api.post(
        '/clients/remoteInsert',
        { client },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      if (data.status) {
        muchUpdate.current += 1;
      } else {
        muchCreate.current += 1;
        spreadSheetReport.current.push([client.name, client.cpfNumber, client.associateState, client.associate]);
      }

      console.log(`Create: ${muchCreate.current} - Update: ${muchUpdate.current} - Client: ${client.name}`);

      return true;
    } catch (error) {
      snackbar({
        open: true,
        message: 'Houve um erro interno',
        severity: 'error',
      });
      return false;
    }
  }

  async function saveClients(clients) {
    setChanged({
      much: 0,
      last: 0,
    });
    let index = 0;
    let size = 0;
    setIsBackDropOpen(true);
    muchCreate.current = 0;
    muchUpdate.current = 0;

    async function sendNextObject() {
      if (index < clients.length) {
        console.log(`Chamei: ${index}`);
        const response = await sendDataToServer(clients[index]);
        index += 1;
        size += 1;
        setChanged({
          much: clients.length,
          last: index,
        });
        console.log(changed);

        if (response) {
          if (index < clients.length) {
            if (size === 100) {
              setTimeout(sendNextObject, 1000);
              size = 0;
            } else {
              setTimeout(sendNextObject, 10);
            }
          } else {
            spreadSheet.current = null;
            setIsBackDropOpen(false);
            setSpreadSheetName();
          }
        }
      }
    }

    sendNextObject();
  }

  async function saveSpreadsheet() {
    let name = null;
    let cpfNumber = null;
    let baseSalary = null;
    let discount = null;
    let ente = null;

    if (!spreadSheet.current) {
      return false;
    }

    spreadSheet.current[0].forEach((element, index) => {
      switch (element) {
        case 'NOME':
          name = index;
          break;

        case 'CPF':
          cpfNumber = index;
          break;

        case 'SALARIO BASE':
          baseSalary = index;
          break;

        case 'CONTRIBUICAO':
          discount = index;
          break;

        case 'ENTE':
          ente = index;
          break;

        default:
          break;
      }
    });

    if (name === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [NOME]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (cpfNumber === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CPF]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (baseSalary === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [SALARIO BASE]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (discount === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CONTRIBUICAO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (ente === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [ENTE]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }

    const clients = [...notAssociateList.current];

    spreadSheetReport.current = [];

    spreadSheetReport.current.push(['NOME', 'CPF', 'STATUS', 'SITUAÇÃO']);

    spreadSheet.current.shift();

    spreadSheet.current.forEach((line) => {
      const client = {
        name: line[name],
        cpfNumber: formateCpf(line[cpfNumber]),
        baseSalary: line[baseSalary],
        discount: line[discount],
        ente: line[ente],
        associateState: 'ASSOCIADO',
      };

      clients.push(client);
    });

    if (clients.length > 0) {
      saveClients(clients);
    }

    return false;
  }

  async function saveDuplicate() {
    const clientList = await getClientList();

    let name = null;
    let cpfNumber = null;
    let baseSalary = null;
    let discount = null;
    let ente = null;

    if (!spreadSheet.current) {
      return false;
    }

    spreadSheet.current[0].forEach((element, index) => {
      switch (element) {
        case 'NOME':
          name = index;
          break;

        case 'CPF':
          cpfNumber = index;
          break;

        case 'SALARIO BASE':
          baseSalary = index;
          break;

        case 'CONTRIBUICAO':
          discount = index;
          break;

        case 'ENTE':
          ente = index;
          break;

        default:
          break;
      }
    });

    if (name === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [NOME]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (cpfNumber === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CPF]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (baseSalary === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [SALARIO BASE]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (discount === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CONTRIBUICAO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (ente === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [ENTE]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }

    setIsBackDropOpen(true);

    const duplicate = [spreadSheet.current[0]];
    const listToCompare = [];

    spreadSheet.current.forEach((line) => {
      let times = 0;

      spreadSheet.current.forEach((element) => {
        if (line[cpfNumber] === element[cpfNumber]) {
          times += 1;
        }
      });

      if (times > 1) {
        duplicate.push(line);
      }

      listToCompare.push({
        name: line[name],
        cpfNumber: line[cpfNumber],
      });
    });

    const notAssociateListVar = [];
    const notAssociateListArrayVar = [['NOME', 'CPF', 'SITUAÇÃO']];
    const isToNotArray = [['NOME', 'CPF', 'SITUAÇÃO']];
    const notToIsArray = [['NOME', 'CPF', 'SITUAÇÃO']];

    clientList.forEach((client) => {
      let equals = false;

      listToCompare.forEach((element) => {
        if (element.name === client.name && element.cpfNumber === client.cpfNumber) {
          equals = true;
          if (client.associateState === 'NÃO ASSOCIADO') {
            notToIsArray.push([client.name, client.cpfNumber, client.associate]);
          }
        }
      });

      if (!equals) {
        if (client.associateState === 'ASSOCIADO') {
          isToNotArray.push([client.name, client.cpfNumber, client.associate]);
        }
        notAssociateListVar.push({
          name: client.name,
          cpfNumber: client.cpfNumber,
          associate: client.associate,
          associateState: 'NÃO ASSOCIADO',
        });
        notAssociateListArrayVar.push([client.name, client.cpfNumber, client.associate]);
      }
    });

    notAssociateList.current = notAssociateListVar;
    notAssociateListArray.current = notAssociateListArrayVar;

    isToNot.current = isToNotArray;
    notToIs.current = notToIsArray;

    setDuplicated(duplicate);

    setValidateSpreadSheet(true);

    setIsBackDropOpen(false);

    return 0;
  }

  const createSpreadsheet = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const document = [];

        spreadSheetReport.current = [];

        jsonData.forEach((line) => {
          if (line.length !== 0) {
            document.push(line);
          }
        });

        spreadSheet.current = document;

        if (!validateSpreadSheet) {
          saveDuplicate();
        } else {
          saveSpreadsheet();
        }

        setSpreadSheetName(file.name);
      };

      reader.readAsArrayBuffer(file);
    }

    setFileKey((prevValue) => prevValue + 1);
  };

  function createBillingErrorReport() {
    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.aoa_to_sheet(billingSpreadSheetReport.current);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cadastros com Falha');

    XLSX.writeFile(workbook, 'Relatório Cadastros com Falha.xlsx', { bookType: 'xlsx', type: 'binary' });
  }

  async function sendBillingDataToServer(contract, sheet) {
    try {
      const { data } = await api.post(
        'contracts/post',
        { contract },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      console.log(contract);

      if (data.status) {
        muchCreate.current += 1;
      } else {
        muchUpdate.current += 1;
        billingSpreadSheetReport.current.push(sheet);
      }

      console.log(`Sucesso: ${muchCreate.current} - Fracasso: ${muchUpdate.current}`);
      return true;
    } catch (error) {
      snackbar({
        open: true,
        message: 'Houve um erro interno',
        severity: 'error',
      });
      return false;
    }
  }

  function saveBilling(contracts) {
    let index = 0;
    let size = 0;
    muchUpdate.current = 0;
    muchCreate.current = 0;

    setIsBackDropOpen(true);

    async function sendNextObject() {
      if (index < contracts.length) {
        const response = await sendBillingDataToServer(contracts[index], spreadSheet.current[index]);
        index += 1;
        size += 1;

        if (response) {
          if (index < contracts.length) {
            if (size === 100) {
              setTimeout(sendNextObject, 1000);
              size = 0;
            } else {
              setTimeout(sendNextObject, 25);
            }
          } else {
            setGetName(false);
            setGetValue(false);
            setGetCode(false);
            setGetCpf(false);
            setGetCpfDependente(false);
            setGetDate(false);
            setIsBackDropOpen(false);
            setSpreadSheetName();
          }
        }
      }
    }

    sendNextObject();
  }

  function saveSpreadsheetBilling() {
    let name = null;
    let value = null;
    let companyCode = null;
    let cpf = null;
    let cpfDependente = null;
    let date = null;

    if (!spreadSheet.current) {
      return false;
    }

    spreadSheet.current[0].forEach((element, index) => {
      switch (element) {
        case 'CODIGO':
          companyCode = index;
          break;

        case 'NOME':
          name = index;
          break;

        case 'CPF':
          cpf = index;
          break;

        case 'CPF DEP':
          cpfDependente = index;
          break;

        case 'DATA':
          date = index;
          break;

        case 'VALOR':
          value = index;
          break;

        default:
          break;
      }
    });

    if (name === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [NOME]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
      return 0;
    }

    if (value === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [VALOR]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
      return 0;
    }

    if (cpf === null && companyCode === null) {
      snackbar({
        open: true,
        message: 'O campo [CPF] ou [CODIGO] devem estar preenchidos',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
      return 0;
    }

    const contracts = [];

    billingSpreadSheetReport.current = [];

    billingSpreadSheetReport.current.push(spreadSheet.current[0]);

    spreadSheet.current.shift();

    spreadSheet.current.forEach((line) => {
      if (line[name]) {
        const contract = {
          clientName: line[name].trim(),
          clientCpf: cpf !== null ? formateCpf(line[cpf]) : null,
          companyCode: companyCode !== null ? line[companyCode] : null,
          billingPriorityId: watch('billingPriority'),
          date: date !== null ? line[date] : null,
          value: line[value],
        };

        if (line[cpf] === line[cpfDependente]) {
          contract.beneficiaryName = line[name];
        } else if (line[cpfDependente]) {
          contract.beneficiaryName = formateCpf(line[cpfDependente]);
        } else {
          contract.beneficiaryName = line[name];
        }

        const code = billingPriorities.billingPriorities.find((priority) => priority.id === watch('billingPriority'));

        switch (code.value) {
          case 7:
            contract.code = 1;
            break;
          case 3:
            contract.code = 2;
            break;
          case 9:
            contract.code = 3;
            break;
          case 34:
            contract.code = 4;
            break;
          case 5 || 27 || 32:
            contract.code = 5;
            break;
          case 8 || 10:
            contract.code = 6;
            break;
          case 35:
            contract.code = 7;
            break;
          case 13:
            contract.code = 8;
            break;
          case 21:
            contract.code = 9;
            break;
          case 23:
            contract.code = 10;
            break;
          case 22:
            contract.code = 11;
            break;
          case 24:
            contract.code = 12;
            break;
          case 25:
            contract.code = 13;
            break;
          case 12:
            contract.code = 14;
            break;
          case 2:
            contract.code = 15;
            break;
          case 26:
            contract.code = 16;
            break;
          case 28:
            contract.code = 17;
            break;
          case 30:
            contract.code = 18;
            break;
          case 31:
            contract.code = 19;
            break;
          case 33:
            contract.code = 20;
            break;
          case 36:
            contract.code = 21;
            break;

          default:
            break;
        }

        contracts.push(contract);
      }
    });

    if (contracts.length > 0) {
      saveBilling(contracts);
    }

    return true;
  }

  function validadeSpreadSheetBilling() {
    let name = false;
    let value = false;
    let code = false;
    let cpf = false;

    setGetName(false);
    setGetValue(false);
    setGetCode(false);
    setGetCpf(false);
    setGetCpfDependente(false);
    setGetDate(false);

    if (!spreadSheet.current) {
      return false;
    }

    spreadSheet.current[0].forEach((element) => {
      switch (element) {
        case 'CODIGO':
          setGetCode(true);
          code = true;
          break;

        case 'NOME':
          setGetName(true);
          name = true;
          break;

        case 'CPF':
          setGetCpf(true);
          cpf = true;
          break;

        case 'CPF DEP':
          setGetCpfDependente(true);
          break;

        case 'DATA':
          setGetDate(true);
          break;

        case 'VALOR':
          setGetValue(true);
          value = true;
          break;

        default:
          break;
      }
    });

    setIsSpreadSheetBilling(true);

    if (((name && code) || (name && cpf)) && value) {
      setIsBillingValidate(true);
    } else {
      setIsBillingValidate(false);
    }

    return true;
  }

  const spreadsheetBills = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        spreadSheet.current = jsonData;
        validadeSpreadSheetBilling();
        setSpreadSheetName(file.name);
      };

      reader.readAsArrayBuffer(file);
    }

    setFileKey((prevValue) => prevValue + 1);
  };

  async function sendDataToServerDB({ addresses, ...client }) {
    try {
      const { data } = await api.post(
        '/clients/remoteUpdate',
        { addresses, client },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      if (data.message === 'Update') {
        muchUpdate.current += 1;
      } else {
        muchCreate.current += 1;
      }

      console.log(`Create: ${muchCreate.current} - Update: ${muchUpdate.current} - Client: ${client.name}`);

      return true;
    } catch (error) {
      snackbar({
        open: true,
        message: 'Houve um erro interno',
        severity: 'error',
      });
      return false;
    }
  }

  async function saveClientsDB(clients) {
    setChanged({
      much: 0,
      last: 0,
    });
    let index = 0;
    let size = 0;
    setIsBackDropOpen(true);
    muchCreate.current = 0;
    muchUpdate.current = 0;

    async function sendNextObject() {
      if (index < clients.length) {
        console.log(`Chamei: ${index}`);
        const response = await sendDataToServerDB(clients[index]);
        index += 1;
        size += 1;
        setChanged({
          much: clients.length,
          last: index,
        });

        if (response) {
          if (index < clients.length) {
            if (size === 100) {
              setTimeout(sendNextObject, 1000);
              size = 0;
            } else {
              setTimeout(sendNextObject, 10);
            }
          } else {
            setIsBackDropOpen(false);
            setSpreadSheetName();
          }
        }
      }
    }

    sendNextObject();
  }

  async function saveDB() {
    let name = null;
    let cpf = null;
    let birthdate = null;
    let admissionDate = null;
    let idCardNumber = null;
    let email = null;
    let issuingAgency = null;
    let gender = null;
    let maritalStatus = null;
    let educationLevel = null;
    let specialNeeds = null;
    let sendJournal = null;

    let phone01 = null;
    let phone02 = null;
    let phone03 = null;

    let bankAccount = null;
    let bankAgency = null;
    let bankCode = null;

    let streetName = null;
    let number = null;
    let neighborhood = null;
    let city = null;
    let state = null;
    let postalCode = null;

    let streetNameCorr = null;
    let numberCorr = null;
    let neighborhoodCorr = null;
    let cityCorr = null;
    let stateCorr = null;
    let postalCodeCorr = null;

    let companyCode = null;
    let baseSalary = null;
    let associate = null;
    let associateState = null;

    spreadSheet.current[0].forEach((element, index) => {
      switch (element) {
        case 'NOME':
          name = index;
          break;

        case 'CPF':
          cpf = index;
          break;

        case 'DATA.NAS':
          birthdate = index;
          break;

        case 'DATA.ADM':
          admissionDate = index;
          break;

        case 'RG':
          idCardNumber = index;
          break;

        case 'EMAIL':
          email = index;
          break;

        case 'ORG':
          issuingAgency = index;
          break;

        case 'SEXO':
          gender = index;
          break;

        case 'EST.CIVIL':
          maritalStatus = index;
          break;

        case 'INSTRUCAO':
          educationLevel = index;
          break;

        case 'PCD':
          specialNeeds = index;
          break;

        case 'JORNAL':
          sendJournal = index;
          break;

        case 'TEL01':
          phone01 = index;
          break;

        case 'TEL02':
          phone02 = index;
          break;

        case 'TEL03':
          phone03 = index;
          break;

        case 'BANC.CONT':
          bankAccount = index;
          break;

        case 'BANC.AGEN':
          bankAgency = index;
          break;

        case 'BANC.CODE':
          bankCode = index;
          break;

        // --------------------

        case 'LOGRADOURO':
          streetName = index;
          break;

        case 'COMPL.':
          number = index;
          break;

        case 'NR':
          neighborhood = index;
          break;

        case 'CIDADE':
          city = index;
          break;

        case 'UF':
          state = index;
          break;

        case 'CEP':
          postalCode = index;
          break;

        // -----------------------

        case 'CORR.LOGRADOURO':
          streetNameCorr = index;
          break;

        case 'CORR.NR':
          numberCorr = index;
          break;

        case 'CORR.BAIRRO':
          neighborhoodCorr = index;
          break;

        case 'CORR.CIDADE':
          cityCorr = index;
          break;

        case 'CORR.UF':
          stateCorr = index;
          break;

        case 'CORR.CEP':
          postalCodeCorr = index;
          break;

        // -----------------------

        case 'COD.PREF':
          companyCode = index;
          break;

        case 'SALARIO':
          baseSalary = index;
          break;

        case 'STATUS':
          associate = index;
          break;

        case 'TIPO.ASS':
          associateState = index;
          break;

        default:
          break;
      }
    });

    if (name === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [NOME]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (cpf === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CPF]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (birthdate === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DATA.NAS]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (admissionDate === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DATA.AMD]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (idCardNumber === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [RG]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (email === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [EMAIL]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (issuingAgency === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [ORG]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (gender === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [SEXO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (maritalStatus === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [EST.CIVIL]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (educationLevel === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [INSTRUCAO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (specialNeeds === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [PCD]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (sendJournal === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [JORNAL]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (phone01 === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [TEL01]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (phone02 === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [TEL02]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (phone03 === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [TEL03]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (bankAccount === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [BANC.CONT]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (bankAgency === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [BANC.AGEN]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (bankCode === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [BANC.CODE]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (streetName === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [LOGRADOURO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (number === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [COMPL.]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (neighborhood === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [NR]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (city === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CIDADE]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (state === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [UF]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (postalCode === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CEP]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (streetNameCorr === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CORR.LOGRADOURO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (numberCorr === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CORR.NR]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (neighborhoodCorr === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CORR.BAIRRO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (cityCorr === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CORR.CIDADE]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (stateCorr === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CORR.UF]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (postalCodeCorr === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CORR.CEP]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (companyCode === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [COD.PREF]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }

    if (associate === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [STATUS]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (associateState === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [TIPO.ASS]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (baseSalary === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [SALARIO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }

    const clients = [];

    spreadSheet.current.shift();

    spreadSheet.current.forEach((line) => {
      const client = {
        name: line[name],
        cpfNumber: formateCpf(line[cpf]),
        birthdate: calculateDate(line[birthdate]),
        admissionDate: calculateDate(line[admissionDate]),
        email: line[email],
        idCardNumber: line[idCardNumber].trim(),
        issuingAgency: line[issuingAgency],
        gender: line[gender] === 'M' ? 'MASCULINO' : 'FEMININO',
        maritalStatus: line[maritalStatus] === 'NA' ? '' : setToUpperCase(line[maritalStatus]),
        specialNeeds: line[specialNeeds] === 'Sim' ? 'POSSUI' : 'NÃO POSSUI',
        educationLevel: setToUpperCase(line[educationLevel]),
        sendJournal: line[sendJournal] === 'Sim' ? 'ENVIAR' : 'NÃO ENVIAR',
        phone01: line[phone01],
        phone02: line[phone02],
        phone03: line[phone03],
        bankAccount: line[bankAccount] ? line[bankAccount] : 0,
        bankAgency: line[bankAgency] ? line[bankAgency] : 0,
        bankCode: line[bankCode] ? line[bankCode] : 0,
        companyCode: line[companyCode] ? line[companyCode] : '',
        baseSalary: line[baseSalary] ? line[baseSalary] : 0,
        discount: 0,
        hiringDate: null,
        dismissalDate: null,
        retirementDate: null,
        ente: '',
        monthlyType: '',
        associateState: setToTrim(line[associateState]),
        appPermission: setToTrim(line[associateState]) === 'ASSOCIADO' ? 'PERMITIR' : 'NÃO PERMITIR',
      };

      const addresses = [
        {
          streetName: line[streetName],
          number: line[number],
          neighborhood: line[neighborhood],
          city: line[city],
          state: line[state],
          postalCode: line[postalCode],
          order: 1,
        },
        {
          streetName: line[streetNameCorr],
          number: line[numberCorr],
          neighborhood: line[neighborhoodCorr],
          city: line[cityCorr],
          state: line[stateCorr],
          postalCode: line[postalCodeCorr],
          order: 2,
        },
      ];

      if (setToTrim(line[associate]) === 'Ativo') {
        client.associate = 'ATIVO';
      }
      if (setToTrim(line[associate]) === 'Aposent.') {
        client.associate = 'APOSENTADO';
      }
      if (setToTrim(line[associate]) === 'Pensionista') {
        client.associate = 'PENSIONISTA';
      }
      if (setToTrim(line[associate]) === 'Lic.S/Renum') {
        client.associate = 'LIC. S. REMUNERAÇÃO';
      }
      if (setToTrim(line[associate]) === 'Exonerado.') {
        client.associate = 'EXONERADO';
      }
      if (setToTrim(line[associate]) === 'Falecido') {
        client.associate = 'FALECIDO';
      }

      clients.push({ addresses, ...client });
    });

    if (clients.length > 0) {
      saveClientsDB(clients);
    }

    return 0;
  }

  const readAndSaveDB = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        spreadSheet.current = jsonData;
        saveDB();
        setSpreadSheetName(file.name);
      };

      reader.readAsArrayBuffer(file);
    }

    setFileKey((prevValue) => prevValue + 1);
  };

  async function sendDependentDataToServer(dependent, sheet) {
    try {
      const { data } = await api.post(
        '/clients/remoteUpdateDependent',
        { dependent },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      console.log(data);

      if (data.status) {
        muchCreate.current += 1;
      } else {
        muchUpdate.current += 1;
        spreadSheetReport.current.push(sheet);
      }

      console.log(`Passou: ${muchCreate.current} - Falhou: ${muchUpdate.current} - Client: ${dependent.name}`);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function saveDependents(dependents) {
    setChanged({
      much: 0,
      last: 0,
    });
    let index = 0;
    let size = 0;
    setIsBackDropOpen(true);
    muchCreate.current = 0;
    muchUpdate.current = 0;

    async function sendNextObject() {
      if (index < dependents.length) {
        console.log(`Chamei: ${index}`);
        const response = await sendDependentDataToServer(dependents[index], spreadSheet.current[index]);
        index += 1;
        size += 1;
        setChanged({
          much: dependents.length,
          last: index,
        });

        if (response) {
          if (index < dependents.length) {
            if (size === 100) {
              setTimeout(sendNextObject, 1000);
              size = 0;
            } else {
              setTimeout(sendNextObject, 10);
            }
          } else {
            setIsBackDropOpen(false);
            setSpreadSheetName();
          }
        }
      }
    }

    sendNextObject();
  }

  async function createDependents() {
    let clientName = null;
    let clientCpf = null;
    let name = null;
    let birthdate = null;
    let relationship = null;

    if (!spreadSheet.current) {
      return false;
    }

    spreadSheet.current[0].forEach((element, index) => {
      switch (element) {
        case 'NOME':
          clientName = index;
          break;

        case 'CPF':
          clientCpf = index;
          break;

        case 'DEPENDENTE':
          name = index;
          break;

        case 'DATE NASC':
          birthdate = index;
          break;

        case 'PARENTESCO':
          relationship = index;
          break;

        default:
          break;
      }
    });

    if (clientName === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [NOME]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (clientCpf === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CPF]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (name === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DEPENDENTE]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (birthdate === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DATE NASC]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (relationship === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [PARENTESCO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }

    const dependents = [];

    spreadSheetReport.current.push(spreadSheet.current[0]);

    const list = spreadSheet.current;

    list.shift();

    list.forEach((line) => {
      const dependent = {
        clientName: line[clientName],
        clientCpf: formateCpf(line[clientCpf]),
        name: line[name],
        birthdate: calculateDate(line[birthdate]),
        relationship: setToUpperCase(line[relationship]),
        documents: true,
        gender: '',
      };

      dependents.push(dependent);
    });

    if (dependents.length > 0) {
      saveDependents(dependents);
    }

    return true;
  }

  const readAndSaveDependents = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        spreadSheet.current = jsonData;
        createDependents();
        setSpreadSheetName(file.name);
      };

      reader.readAsArrayBuffer(file);
    }

    setFileKey((prevValue) => prevValue + 1);
  };

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isBackDropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Dialog
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        maxWidth="md"
        fullWidth
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent sx={{ mt: 1, p: 2 }}>
          <Grid container spacing={1}>
            <Grid item xs={6} sm={6} md={6}>
              <Button
                fullWidth
                component="label"
                variant="contained"
                onChange={readAndSaveDB}
                startIcon={<CloudUploadIcon />}
                disabled={isBackDropOpen}
                key={fileKey}
              >
                {!isBackDropOpen ? (
                  'Carregar Associado'
                ) : (
                  <LoopIcon
                    sx={{
                      animation: 'spin 2s linear infinite',
                      '@keyframes spin': {
                        '0%': {
                          transform: 'rotate(360deg)',
                        },
                        '100%': {
                          transform: 'rotate(0deg)',
                        },
                      },
                    }}
                  />
                )}
                <VisuallyHiddenInput type="file" />
              </Button>
            </Grid>

            <Grid item xs={6} sm={6} md={6}>
              <Button
                fullWidth
                component="label"
                variant="contained"
                onChange={readAndSaveDependents}
                startIcon={<CloudUploadIcon />}
                disabled={isBackDropOpen}
                key={fileKey}
              >
                {!isBackDropOpen ? (
                  'Carregar dependente'
                ) : (
                  <LoopIcon
                    sx={{
                      animation: 'spin 2s linear infinite',
                      '@keyframes spin': {
                        '0%': {
                          transform: 'rotate(360deg)',
                        },
                        '100%': {
                          transform: 'rotate(0deg)',
                        },
                      },
                    }}
                  />
                )}
                <VisuallyHiddenInput type="file" />
              </Button>
            </Grid>
          </Grid>

          <Title>Fechamento Mensal</Title>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12}>
              <Typography variant="h6" align="center" color={spreadSheetName ? 'green' : 'gray'}>
                {spreadSheetName || 'Esperando Arquivo ...'}
              </Typography>
              <Divider color={spreadSheetName ? 'success' : 'error'} />
            </Grid>

            {isBackDropOpen ? (
              <Grid container spacing={1} mt={1} textAlign="center">
                <Grid item xs={12} sm={12} md={12}>
                  <Typography component="h2" variant="h5">
                    {`Carregando ${changed.last} de ${changed.much} cadastros`}
                  </Typography>
                  <DownloadingIcon style={{ transform: `rotate(${(changed.last / changed.much) * 360}deg)` }} />
                </Grid>
              </Grid>
            ) : null}

            <Grid item xs={12} sm={12} md={12}>
              <Button
                fullWidth
                component="label"
                variant="contained"
                onChange={createSpreadsheet}
                startIcon={<CloudUploadIcon />}
                color={!validateSpreadSheet ? 'info' : 'success'}
                disabled={isBackDropOpen}
                key={fileKey}
              >
                {!isBackDropOpen ? (
                  'Carregar Prefeitura/Previdência'
                ) : (
                  <LoopIcon
                    sx={{
                      animation: 'spin 2s linear infinite',
                      '@keyframes spin': {
                        '0%': {
                          transform: 'rotate(360deg)',
                        },
                        '100%': {
                          transform: 'rotate(0deg)',
                        },
                      },
                    }}
                  />
                )}
                <VisuallyHiddenInput type="file" />
              </Button>
            </Grid>

            <Grid item xs={12} sm={12} md={12}>
              <MyButton
                fullWidth
                color="warning"
                variant="contained"
                disabled={isBackDropOpen || spreadSheetReport.current.length < 1}
                onClick={createErrorReport}
              >
                Salvar lista de erros
              </MyButton>
            </Grid>

            {notAssociateListArray.current.length > 1 ? (
              <Grid item xs={12} sm={6} md={6}>
                <MyButton
                  disabled={isBackDropOpen}
                  fullWidth
                  color="info"
                  variant="contained"
                  onClick={createNotAssociateReport}
                >
                  Gerar lista de não sócios
                </MyButton>
              </Grid>
            ) : null}

            {notAssociateList.current.length > 1 ? (
              <Grid item xs={12} sm={6} md={6}>
                <MyButton
                  disabled={isBackDropOpen}
                  fullWidth
                  color="error"
                  variant="contained"
                  onClick={deleteNotAssociate}
                >
                  DELETAR NÃO SÓCIOS
                </MyButton>
              </Grid>
            ) : null}

            <Grid item xs={12} sm={12} md={12}>
              <Button
                fullWidth
                color="success"
                variant="contained"
                disabled={isBackDropOpen || !duplicated || duplicated.length <= 1}
                onClick={createDuplicateReport}
              >
                Salvar Lista de Duplicados
              </Button>
            </Grid>
          </Grid>

          <Title>Cadastro de Convênios</Title>

          <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={6}>
              <Select
                options={billingPriorities.list}
                control={control}
                label="Nivel de Prioridade"
                errors={errors?.billingPriority}
                {...register('billingPriority')}
                register={register}
                name="billingPriority"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Button
                fullWidth
                component="label"
                variant="contained"
                onChange={spreadsheetBills}
                startIcon={<CloudUploadIcon />}
                disabled={isBackDropOpen}
                key={fileKey}
              >
                {!isBackDropOpen ? (
                  'Carregar Planilha Convênios'
                ) : (
                  <LoopIcon
                    sx={{
                      animation: 'spin 2s linear infinite',
                      '@keyframes spin': {
                        '0%': {
                          transform: 'rotate(360deg)',
                        },
                        '100%': {
                          transform: 'rotate(0deg)',
                        },
                      },
                    }}
                  />
                )}
                <VisuallyHiddenInput type="file" />
              </Button>
            </Grid>

            {isSpreadSheetBilling ? (
              <>
                <Grid item xs={6} sm={4} md={2}>
                  <Typography variant="h6" align="center" color={getName ? 'success' : 'error'}>
                    NOME
                  </Typography>
                  <Divider color={getName ? 'success' : 'error'} />
                </Grid>

                <Grid item xs={6} sm={4} md={2}>
                  <Typography variant="h6" align="center" color={getCode ? 'success' : 'error'}>
                    CODIGO
                  </Typography>
                  <Divider color={getCode ? 'success' : 'error'} />
                </Grid>

                <Grid item xs={6} sm={4} md={2}>
                  <Typography variant="h6" align="center" color={getCpf ? 'success' : 'error'}>
                    CPF
                  </Typography>
                  <Divider color={getCpf ? 'success' : 'error'} />
                </Grid>

                <Grid item xs={6} sm={4} md={2}>
                  <Typography variant="h6" align="center" color={getCpfDependente ? 'success' : 'error'}>
                    CPF DEP
                  </Typography>
                  <Divider color={getCpfDependente ? 'success' : 'error'} />
                </Grid>

                <Grid item xs={6} sm={4} md={2}>
                  <Typography variant="h6" align="center" color={getValue ? 'success' : 'error'}>
                    VALOR
                  </Typography>
                  <Divider color={getValue ? 'success' : 'error'} />
                </Grid>

                <Grid item xs={6} sm={4} md={2}>
                  <Typography variant="h6" align="center" color={getDate ? 'success' : 'error'}>
                    DATA
                  </Typography>
                  <Divider color={getDate ? 'success' : 'error'} />
                </Grid>

                {isBillingValidate ? (
                  <Grid item xs={12} sm={12} md={12}>
                    <MyButton
                      onClick={handleSubmit(saveSpreadsheetBilling)}
                      fullWidth
                      color="success"
                      variant="contained"
                      disabled={isBackDropOpen}
                    >
                      Carregar
                    </MyButton>
                  </Grid>
                ) : null}
              </>
            ) : null}

            <Grid item xs={12} sm={12} md={12}>
              <Button
                fullWidth
                color="warning"
                variant="contained"
                disabled={isBackDropOpen || billingSpreadSheetReport.current.length <= 1}
                onClick={createBillingErrorReport}
              >
                Salvar lista de erros
              </Button>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setIsSpreadSheetBilling(false);
              setSpreadSheetName();
              setDuplicated();
              setValidateSpreadSheet(false);
              spreadSheet.current = null;
              closeDialog();
              reset();
            }}
            disabled={isBackDropOpen}
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
