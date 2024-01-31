import 'dayjs/locale/pt-br';
import { yupResolver } from '@hookform/resolvers/yup';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import html2pdf from 'html2pdf.js';
import moment from 'moment';
import { useState, useContext, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import Button from '../Form/Button';
import DateInput from '../Form/DateInput';
import MoneyReadOnly from '../Form/MoneyReadOnly';
import MoneyTextInput from '../Form/MoneyTextInput';
import ReadOnly from '../Form/ReadOnly';
import Select from '../Form/Select';
import SelectNullable from '../Form/SelectNullable';
import TextInput from '../Form/TextInput';
import FinancierCard from '../Pdfs/FinancierCard';

const schema = Yup.object({
  account: Yup.string().required('Campo obrigatório'),
  date: Yup.string().required('Campo obrigatório'),
  doc: Yup.string().default(''),
  value: Yup.string().required('Campo obrigatório'),
  dca: Yup.string().required('Campo obrigatório'),
  status: Yup.string().required('Campo obrigatório'),
  details: Yup.string().required('Campo obrigatório'),
  reservationDate: Yup.string().required('Campo obrigatório'),
  dependent: Yup.string(),
  checkNumber: Yup.string(),
});

export default function MedicFinancierList({ banksList, addNewBill, setSnackbarState, bills, setIsMedic }) {
  const { tokens } = useContext(AuthContext);

  const [client, setClient] = useState();
  const [clientList, setClientList] = useState([]);
  const [dependentList, setDependentList] = useState([]);
  const [refundValue, setRefundValue] = useState(0);
  const [refundValuePercent, setRefundValuePercent] = useState(0);

  const [autocompleteValue, setAutocompleteValue] = useState(null);
  const [autocompleteMedicValue, setAutocompleteMedicValue] = useState(null);
  const [docValue, setDocValue] = useState(0);

  const [medicList, setMedicList] = useState([]);

  const bill = useRef({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    resetField,
    setValue,
    control,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      account: '',
      date: '',
      doc: '',
      value: '',
      dca: '',
      status: '',
      details: '',
    },
  });

  useEffect(() => {
    async function searchData() {
      try {
        const {
          data: { max, config },
        } = await api.get('/bills/getMaxBills', {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        });

        setValue('checkNumber', config.check_number);

        if (max) {
          setDocValue(parseFloat(max) + 1 + parseFloat(bills));
        } else {
          setDocValue(parseFloat(config.receiver_number) + parseFloat(bills));
        }

        const {
          data: { clients },
        } = await api.get('/clients/clientList', {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        });

        const clientListArray = [];

        clients.forEach((element) => {
          clientListArray.push(`[${element.cpfNumber}] - ${element.name}`);
        });

        setClientList(clientListArray);

        const {
          data: { medics },
        } = await api.get('/services/getAllMedics', {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        });

        const medicArrayList = [];

        medics.forEach((medic) => {
          medicArrayList.push(medic.company);
        });

        setMedicList(medicArrayList);
      } catch (error) {
        setSnackbarState({
          open: true,
          message: 'Houve um erro interno',
          severity: 'error',
        });
      }
    }
    searchData();
  }, [tokens, bills, setSnackbarState, setValue]);

  async function search(value) {
    const searchValue = value.split(' - ');

    const { data } = await api.post(
      '/clients/findByName',
      { name: searchValue[1], cpfNumber: searchValue[0].slice(1, 15) },
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
          value: dependent.name,
        });
      });
    }

    const { monthlyCredit, annualCredit, ...rest } = data;

    rest.monthlyCredit = parseFloat(monthlyCredit);
    rest.annualCredit = parseFloat(annualCredit);

    setDependentList(dependentListArray);
    setClient(rest);
  }

  const handleAutocompleteChange = (event, newValue) => {
    setAutocompleteValue(newValue);
    search(newValue);
  };
  const handleMedicAutocompleteChange = (event, newValue) => {
    setAutocompleteMedicValue(newValue);
  };

  function handleClick({ doc, ...data }, value) {
    data.referenceId = client.id; // eslint-disable-line
    data.clientName = autocompleteValue; // eslint-disable-line
    data.confirmationDate = ''; // eslint-disable-line
    data.value = value; // eslint-disable-line

    if (doc === '') {
      data.doc = docValue; // eslint-disable-line
    } else {
      data.doc = doc; // eslint-disable-line
    }

    addNewBill(data);
    resetField('reservationDate');
    resetField('doc');
    resetField('status');
    resetField('value');
    resetField('details');
    resetField('dependent');
    setAutocompleteMedicValue(null);
    setAutocompleteValue(null);
    setClient(null);
    setDependentList([]);
    setRefundValue(0);
    setRefundValuePercent(0);
  }

  function handleDownloadPDF(value) {
    bill.current = value;

    const pdfOptions = {
      margin: 10,
      filename: `${value.clientName}_doc.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    const content = document.getElementById('pdf-content');
    html2pdf(content, pdfOptions);
  }

  function validateRefund({ value, ...data }) {
    const clientData = autocompleteValue.split(' - ');

    if (!autocompleteMedicValue) {
      setSnackbarState({
        open: true,
        message: 'Por favor selecione um médico',
        severity: 'warning',
      });
    }
    if (!autocompleteValue) {
      setSnackbarState({
        open: true,
        message: 'Por favor selecione um sócio',
        severity: 'warning',
      });
    }

    let newValue = '';
    for (let i = 0; i < value.length; i += 1) {
      if (value[i] !== '.') {
        newValue = `${newValue}${value[i]}`;
      } else {
        newValue = `${newValue},`;
      }
    }

    const obj = {
      ...data,
      value: newValue,
      refundValue,
      refundValuePercent,
      medic: autocompleteMedicValue,
      clientName: client.name,
      clientCpf: clientData[0].slice(1, 15),
      receiver: data.dependent !== '' ? data.dependent : client.name,
      doc: docValue,
    };

    handleDownloadPDF(obj);

    handleClick(data, value);
  }

  function calcRefund(invoiceValue) {
    let refunded = invoiceValue / 2;

    if (!refunded || !client?.monthlyCredit || !client?.annualCredit) {
      setRefundValue(0);
      setRefundValuePercent(0);
      return 0;
    }

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

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={6} sm={6} md={6}>
          <MoneyReadOnly
            label="Limite mensal restante"
            value={client?.monthlyCredit ? (client.monthlyCredit - (refundValue || 0)).toFixed(2) : 0}
          />
        </Grid>

        <Grid item xs={6} sm={6} md={6}>
          <MoneyReadOnly
            label="Limite anual restante"
            value={client?.annualCredit ? (client.annualCredit - (refundValue || 0)).toFixed(2) : 0}
          />
        </Grid>

        <Grid item xs={12} sm={12} md={12}>
          <Button
            startIcon={<MedicalServicesIcon />}
            fullWidth
            color="error"
            onClick={() => {
              setIsMedic((prevValue) => !prevValue);
            }}
            variant="contained"
          >
            medico
          </Button>
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <Select
            options={banksList}
            control={control}
            label="Conta"
            errors={errors.account}
            {...register(`account`)}
            register={register}
            name="account"
          />
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <DateInput
            register={register}
            label="Emissão do Cheque"
            errors={errors?.date}
            name="date"
            inputProps={{
              max: moment(new Date()).format('YYYY-MM-DD'),
            }}
          />
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <DateInput
            register={register}
            label="Data da Consulta"
            errors={errors?.reservationDate}
            name="reservationDate"
          />
        </Grid>

        <Grid item xs={6} sm={2} md={2}>
          <TextInput watch={watch} register={register} label={docValue} errors={errors?.doc} name="doc" />
        </Grid>

        <Grid item xs={6} sm={2.5} md={2}>
          <Select
            options={[
              { text: 'Debito', value: 'Debito' },
              { text: 'Credito', value: 'Credito' },
              { text: 'Aplicação', value: 'Aplicação' },
              { text: 'Resgate', value: 'Resgate' },
            ]}
            control={control}
            label="D/C/A"
            errors={errors?.dca}
            {...register(`dca`)}
            register={register}
            name="dca"
          />
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <Select
            options={[
              { text: 'Pendente', value: 'Pendente' },
              { text: 'Compensado', value: 'Compensado' },
            ]}
            control={control}
            label="Status"
            errors={errors?.status}
            {...register(`status`)}
            register={register}
            name="status"
          />
        </Grid>

        <Grid item xs={12} sm={8} md={4}>
          <Autocomplete
            value={autocompleteMedicValue}
            onChange={handleMedicAutocompleteChange}
            options={medicList || []}
            renderInput={(params) => <TextField {...params} label="Médico" variant="outlined" size="small" fullWidth />}
          />
        </Grid>

        <Grid item xs={12} sm={8} md={4}>
          <Autocomplete
            value={autocompleteValue}
            onChange={handleAutocompleteChange}
            options={clientList || []}
            renderInput={(params) => (
              <TextField {...params} label="Referente" variant="outlined" size="small" fullWidth />
            )}
          />
        </Grid>

        <Grid item xs={6} sm={2.5} md={4}>
          <SelectNullable
            options={dependentList}
            control={control}
            label="Dependente"
            errors={errors?.dependent}
            {...register(`dca`)}
            register={register}
            name="dependent"
          />
        </Grid>

        <Grid item xs={6} sm={2} md={2}>
          <MoneyTextInput
            watch={watch}
            register={register}
            label="Valor Pedido"
            errors={errors?.value}
            name="value"
            onChange={(event) => {
              calcRefund(event.target.value);
            }}
          />
        </Grid>

        <Grid item xs={6} sm={4} md={2}>
          <MoneyReadOnly label="Valor Reembolsado" value={refundValue} />
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <ReadOnly label="%" value={refundValuePercent} />
        </Grid>

        <Grid item xs={12} sm={8} md={5}>
          <TextInput watch={watch} register={register} label="Destina-se" errors={errors?.details} name="details" />
        </Grid>

        <Grid item xs={12} sm={4} md={1}>
          <Button fullWidth color="primary" onClick={handleSubmit(validateRefund)} variant="contained">
            Validar
          </Button>
        </Grid>
      </Grid>

      <Grid display="none">
        {/* <Grid> */}
        <div id="pdf-content">
          <FinancierCard bill={bill.current} />
        </div>
      </Grid>
    </>
  );
}
