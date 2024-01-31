import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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

export default function ReportDialog({ billingPriorities, isOpen, closeDialog, closeDrawer, snackbar }) {
  const { tokens } = useContext(AuthContext);

  const [duplicated, setDuplicated] = useState();
  const [isBackDropOpen, setIsBackDropOpen] = useState(false);

  const [fileKey, setFileKey] = useState(0);

  const [validatePrefeituraSpreadSheet, setValidadePrefeituraSpreadSheet] = useState(false);
  const [validatePrevidenciaSpreadSheet, setValidadePrevidenciaSpreadSheet] = useState(false);

  const [isSpreadSheetBilling, setIsSpreadSheetBilling] = useState(false);
  const [isBillingValidate, setIsBillingValidate] = useState(false);

  const [spreadSheetName, setSpreadSheetName] = useState();

  const [getName, setGetName] = useState(false);
  const [getValue, setGetValue] = useState(false);
  const [getCode, setGetCode] = useState(false);
  const [getCpf, setGetCpf] = useState(false);
  const [getCpfDependente, setGetCpfDependente] = useState(false);
  const [getDate, setGetDate] = useState(false);

  const spreadSheet = useRef();

  const billingSpreadSheetReport = useRef([]);
  const spreadSheetReport = useRef([]);

  const muchUpdate = useRef(0);
  const muchCreate = useRef(0);

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

  async function sendDataToServer({ company, ...client }, sheet) {
    try {
      const { data } = await api.post(
        '/clients/remoteInsert',
        { company, client },
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
        spreadSheetReport.current.push(sheet);
      }

      console.log(`Create: ${muchCreate.current} - Update: ${muchUpdate.current} - Client: ${client.name}`);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function saveClients(clients) {
    let index = 0;
    let size = 0;
    setIsBackDropOpen(true);
    muchCreate.current = 0;
    muchUpdate.current = 0;

    async function sendNextObject() {
      if (index < clients.length) {
        console.log(`Chamei: ${index}`);
        const response = await sendDataToServer(clients[index], spreadSheet.current[index]);
        index += 1;
        size += 1;

        if (response) {
          if (index < clients.length) {
            if (size === 100) {
              setTimeout(sendNextObject, 1000);
              size = 0;
            } else {
              setTimeout(sendNextObject, 100);
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

  async function saveSpreadsheetPrevidencia() {
    let name = null;
    let cpf = null;
    let netSalary = null;
    let memberDiscount = null;
    let notMemberDiscount = null;
    let companyCode = null;
    let associate = null;

    if (!spreadSheet.current) {
      return false;
    }

    spreadSheet.current[0].forEach((element, index) => {
      switch (element) {
        case 'NOME':
          name = index;
          break;

        case 'CPF':
          cpf = index;
          break;

        case 'SALARIO LIQUIDO':
          netSalary = index;
          break;

        case 'DESCONTO SOCIO':
          memberDiscount = index;
          break;

        case 'DESCONTO NAO SOCIO':
          notMemberDiscount = index;
          break;

        case 'MATRICULA':
          companyCode = index;
          break;

        case 'SITUACAO':
          associate = index;
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
    if (cpf === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CPF]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (netSalary === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [SALARIO LIQUIDO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (memberDiscount === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DESCONTO SOCIO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (notMemberDiscount === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DESCONTO NAO SOCIO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (companyCode === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [MATRICULA]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (associate === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [SITUACAO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }

    const clients = [];

    spreadSheetReport.current = [];

    spreadSheetReport.current.push(spreadSheet.current[0]);

    spreadSheet.current.shift();

    spreadSheet.current.forEach((line) => {
      const client = {
        name: line[name],
        cpfNumber: formateCpf(line[cpf]),
      };

      const company = {
        companyCode: line[companyCode].toString(),
        netSalary: line[netSalary],
        memberDiscount: line[memberDiscount],
        notMemberDiscount: line[notMemberDiscount],
      };

      if (setToTrim(line[associate]) === 'Aposentado' || setToTrim(line[associate]) === 'Aposentada') {
        if (line[notMemberDiscount] === 0) {
          company.associate = 'APOSENTADO / ASSOCIADO';
        } else {
          company.associate = 'APOSENTADO / NÃO ASSOCIADO';
        }
      } else if (setToTrim(line[associate]) === 'Pensionista') {
        if (line[notMemberDiscount] === 0) {
          company.associate = 'PENSIONISTA / ASSOCIADO';
        } else {
          company.associate = 'PENSIONISTA / NÃO ASSOCIADO';
        }
      } else if (setToTrim(line[associate]) === 'Ativo') {
        if (line[notMemberDiscount] === 0) {
          company.associate = 'ATIVO / ASSOCIADO';
        } else {
          company.associate = 'ATIVO / NÃO ASSOCIADO';
        }
      } else {
        company.associate = '';
      }

      clients.push({ company, ...client });
    });

    if (clients.length > 0) {
      saveClients(clients);
    }

    return false;
  }

  function saveDuplicatePrevidencia() {
    let name = null;
    let cpf = null;
    let netSalary = null;
    let memberDiscount = null;
    let notMemberDiscount = null;
    let companyCode = null;
    let associate = null;

    if (!spreadSheet.current) {
      return false;
    }

    spreadSheet.current[0].forEach((element, index) => {
      switch (element) {
        case 'NOME':
          name = index;
          break;

        case 'CPF':
          cpf = index;
          break;

        case 'SALARIO LIQUIDO':
          netSalary = index;
          break;

        case 'DESCONTO SOCIO':
          memberDiscount = index;
          break;

        case 'DESCONTO NAO SOCIO':
          notMemberDiscount = index;
          break;

        case 'MATRICULA':
          companyCode = index;
          break;

        case 'SITUACAO':
          associate = index;
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
    if (cpf === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CPF]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (netSalary === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [SALARIO LIQUIDO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (memberDiscount === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DESCONTO SOCIO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (notMemberDiscount === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DESCONTO NAO SOCIO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (companyCode === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [MATRICULA]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }
    if (associate === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [SITUACAO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();
    }

    const duplicate = [spreadSheet.current[0]];

    spreadSheet.current.forEach((line) => {
      let times = 0;

      spreadSheet.current.forEach((element) => {
        if (line[cpf] === element[cpf]) {
          times += 1;
        }
      });

      if (times > 1) {
        duplicate.push(line);
      }

      setDuplicated(duplicate);
    });

    setValidadePrevidenciaSpreadSheet(true);

    return 0;
  }

  const spreadsheetPrevidencia = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        spreadSheet.current = jsonData;

        if (!validatePrevidenciaSpreadSheet) {
          saveDuplicatePrevidencia();
        } else {
          saveSpreadsheetPrevidencia();
        }

        setSpreadSheetName(file.name);
      };

      reader.readAsArrayBuffer(file);
    }

    setFileKey((prevValue) => prevValue + 1);
  };

  async function saveSpreadsheetPrefeitura() {
    let name = null;
    let cpf = null;
    let netSalary = null;
    let grossSalary = null;
    let discount = null;
    let companyCode = null;

    let organCode = null;
    let organDescription = null;
    let unitCode = null;
    let unitDescription = null;

    if (!spreadSheet.current) {
      return false;
    }

    spreadSheet.current[0].forEach((element, index) => {
      switch (element) {
        case 'NOME':
          name = index;
          break;

        case 'CPF':
          cpf = index;
          break;

        case 'SALARIO LIQUIDO':
          netSalary = index;
          break;

        case 'SALARIO BRUTO':
          grossSalary = index;
          break;

        case 'DESCONTO':
          discount = index;
          break;

        case 'MATRICULA':
          companyCode = index;
          break;

        case 'CODIGO ORGAO':
          organCode = index;
          break;

        case 'DESCRICAO ORGAO':
          organDescription = index;
          break;

        case 'CODIGO UNIDADE':
          unitCode = index;
          break;

        case 'DESCRICAO UNIDADE':
          unitDescription = index;
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
    if (netSalary === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [SALARIO LIQUIDO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (grossSalary === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [SALARIO BRUTO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (discount === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DESCONTO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (companyCode === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [MATRICULA]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (organCode === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CODIGO ORGAO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (organDescription === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DESCRICAO ORGAO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (unitCode === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CODIGO UNIDADE]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (unitDescription === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DESCRICAO UNIDADE]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }

    const clients = [];

    spreadSheetReport.current = [];

    spreadSheetReport.current.push(spreadSheet.current[0]);

    spreadSheet.current.shift();

    spreadSheet.current.forEach((line) => {
      const client = {
        name: line[name],
        cpfNumber: formateCpf(line[cpf]),
      };
      const company = {
        companyCode: line[companyCode].toString(),
        grossSalary: line[grossSalary],
        netSalary: line[netSalary],
        memberDiscount: line[discount],
        organCode: line[organCode],
        organDescription: line[organDescription],
        unitCode: line[unitCode],
        unitDescription: line[unitDescription],
      };
      if (line[discount] === 0) {
        company.associate = 'ATIVO / NÃO ASSOCIADO';
      } else {
        company.associate = 'ATIVO / ASSOCIADO';
      }
      clients.push({ company, ...client });
    });

    if (clients.length > 0) {
      saveClients(clients);
    }

    return false;
  }

  function saveDuplicatePrefeitura() {
    let name = null;
    let cpf = null;
    let netSalary = null;
    let grossSalary = null;
    let discount = null;
    let companyCode = null;

    let organCode = null;
    let organDescription = null;
    let unitCode = null;
    let unitDescription = null;

    spreadSheet.current[0].forEach((element, index) => {
      switch (element) {
        case 'NOME':
          name = index;
          break;

        case 'CPF':
          cpf = index;
          break;

        case 'SALARIO LIQUIDO':
          netSalary = index;
          break;

        case 'SALARIO BRUTO':
          grossSalary = index;
          break;

        case 'DESCONTO':
          discount = index;
          break;

        case 'MATRICULA':
          companyCode = index;
          break;

        case 'CODIGO ORGAO':
          organCode = index;
          break;

        case 'DESCRICAO ORGAO':
          organDescription = index;
          break;

        case 'CODIGO UNIDADE':
          unitCode = index;
          break;

        case 'DESCRICAO UNIDADE':
          unitDescription = index;
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
    if (netSalary === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [SALARIO LIQUIDO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (grossSalary === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [SALARIO BRUTO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (discount === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DESCONTO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (companyCode === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [MATRICULA]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (organCode === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CODIGO ORGAO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (organDescription === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DESCRICAO ORGAO]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (unitCode === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CODIGO UNIDADE]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (unitDescription === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DESCRICAO UNIDADE]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }

    const duplicate = [spreadSheet.current[0]];

    spreadSheet.current.forEach((line) => {
      let times = 0;

      spreadSheet.current.forEach((element) => {
        if (line[cpf] === element[cpf]) {
          times += 1;
        }
      });

      if (times > 1) {
        duplicate.push(line);
      }

      setDuplicated(duplicate);
    });

    setValidadePrefeituraSpreadSheet(true);

    return 0;
  }

  const spreadsheetPrefeitura = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        spreadSheet.current = jsonData;

        if (!validatePrefeituraSpreadSheet) {
          saveDuplicatePrefeitura();
        } else {
          saveSpreadsheetPrefeitura();
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
      console.log(error);
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
    let code = null;
    let cpf = null;
    let cpfDependente = null;
    let date = null;

    if (!spreadSheet.current) {
      return false;
    }

    spreadSheet.current[0].forEach((element, index) => {
      switch (element) {
        case 'CODIGO':
          code = index;
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

    if (cpf === null && code === null) {
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
          code: code !== null ? line[code] : null,
          billingPriorityId: watch('billingPriority'),
          beneficiaryName:
            // eslint-disable-next-line no-nested-ternary
            line[cpf] === line[cpfDependente]
              ? line[name]
              : line[cpfDependente]
              ? formateCpf(line[cpfDependente])
              : line[name],
          date: date !== null ? line[date] : null,
          value: line[value],
        };

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

  async function sendDataToServerDB({ addresses, company, ...client }) {
    try {
      const { data } = await api.post(
        '/clients/remoteUpdate',
        { addresses, company, client },
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
      console.log(error);
      return false;
    }
  }

  async function saveClientsDB(clients) {
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
    let grossSalary = null;
    let organCode = null;
    let organDescription = null;
    let unitCode = null;
    let unitDescription = null;
    let status = null;
    let type = null;

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

        case 'DEP.COD':
          organCode = index;
          break;

        case 'DEP.NOME':
          organDescription = index;
          break;

        case 'SET.COD':
          unitCode = index;
          break;

        case 'SET.NAME':
          unitDescription = index;
          break;

        case 'STATUS':
          status = index;
          break;

        case 'TIPO.ASS':
          type = index;
          break;

        case 'SALARIO':
          grossSalary = index;
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
    if (organCode === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DEP.COD]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (organDescription === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [DEP.NOME]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (unitCode === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [SET.COD]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (unitDescription === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [SET.NAME]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (status === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [STATUS]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (type === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [TIPO.ASS]',
        severity: 'error',
      });
      closeDialog();
      closeDrawer();

      return 0;
    }
    if (grossSalary === null) {
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

      const company = {
        companyCode: line[companyCode],
        grossSalary: line[grossSalary],
        netSalary: 0,
        memberDiscount: 0,
        notMemberDiscount: 0,
        organCode: line[organCode],
        organDescription: line[organDescription],
        unitCode: line[unitCode],
        unitDescription: line[unitDescription],
        admissionDate: null,
        dismissalDate: null,
        retirementDate: null,
        interruptedContribution: '',
        dismissalReason: '',
      };

      if (setToTrim(line[type]) === 'ASSOCIADO') {
        client.appPermission = 'PERMITIR';
        if (setToTrim(line[status]) === 'Ativo') {
          company.associate = 'ATIVO / ASSOCIADO';
        }
        if (setToTrim(line[status]) === 'Aposent.') {
          company.associate = 'APOSENTADO / ASSOCIADO';
        }
        if (setToTrim(line[status]) === 'Pensionista') {
          company.associate = 'PENSIONISTA / ASSOCIADO';
        }
      } else if (setToTrim(line[type]) === 'NÃO ASSOCIADO') {
        client.appPermission = 'NÃO PERMITIR';
        if (setToTrim(line[status]) === 'Ativo') {
          company.associate = 'ATIVO / NÃO ASSOCIADO';
        }
        if (setToTrim(line[status]) === 'Aposent.') {
          company.associate = 'APOSENTADO / NÃO ASSOCIADO';
        }
        if (setToTrim(line[status]) === 'Pensionista') {
          company.associate = 'PENSIONISTA / NÃO ASSOCIADO';
        }
        if (setToTrim(line[status]) === 'Exonerado.') {
          company.associate = 'EXONERADO';
        }
        if (setToTrim(line[status]) === 'Falecido') {
          company.associate = 'FALECIDO';
        }
      }

      clients.push({ addresses, company, ...client });
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

        if (response) {
          if (index < dependents.length) {
            if (size === 100) {
              setTimeout(sendNextObject, 1000);
              size = 0;
            } else {
              setTimeout(sendNextObject, 100);
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
    let clientCode = null;
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

        case 'CODIGO':
          clientCode = index;
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
    if (clientCode === null) {
      snackbar({
        open: true,
        message: 'Não foi encontrado o campo [CODIGO]',
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
        clientCode: formateCpf(line[clientCode]),
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
                  'Carregar Planilha de Associado ou Não'
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
                  'Carregar Planilha de dependente'
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
                    {`Expectativa de espera ${moment()
                      .add((spreadSheet.current.length / 10) * 1.4, 'second')
                      .locale('pt-br')
                      .format('HH:mm:ss')}`}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                  <Typography component="h2" variant="h5">
                    {`Carregando ${spreadSheet.current.length} cadastros`}
                  </Typography>
                </Grid>
              </Grid>
            ) : null}

            <Grid item xs={12} sm={12} md={6}>
              <Button
                fullWidth
                component="label"
                variant="contained"
                onChange={spreadsheetPrefeitura}
                startIcon={<CloudUploadIcon />}
                disabled={isBackDropOpen}
                key={fileKey}
              >
                {!isBackDropOpen ? (
                  'Carregar Planilha da Prefeitura'
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

            <Grid item xs={12} sm={12} md={6}>
              <Button
                fullWidth
                component="label"
                variant="contained"
                onChange={spreadsheetPrevidencia}
                startIcon={<CloudUploadIcon />}
                disabled={isBackDropOpen}
                key={fileKey}
              >
                {!isBackDropOpen ? (
                  'Carregar Planilha da Previdência'
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

            <Grid item xs={12} sm={12} md={12}>
              <Button
                fullWidth
                color="success"
                variant="contained"
                disabled={isBackDropOpen || !duplicated || duplicated.length < 1}
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
                options={billingPriorities}
                control={control}
                label="Nivel de Prioridade"
                errors={errors?.billingPriority}
                {...register('billingPriority')}
                register={register}
                name="billingPriority"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6}>
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
                  'Carregar Planilha'
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
              setValidadePrefeituraSpreadSheet(false);
              setValidadePrevidenciaSpreadSheet(false);
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
