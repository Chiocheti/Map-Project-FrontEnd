import 'dayjs/locale/pt-br';
import { yupResolver } from '@hookform/resolvers/yup';
import PaidIcon from '@mui/icons-material/Paid';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import moment from 'moment';
import { useState, useContext, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import Button from '../Form/Button';
import DateInput from '../Form/DateInput';
import MoneyTextInput from '../Form/MoneyTextInput';
import Select from '../Form/Select';
import TextInput from '../Form/TextInput';

const schema = Yup.object({
  account: Yup.string().required('Campo obrigatório'),
  date: Yup.string().required('Campo obrigatório'),
  doc: Yup.string().default(''),
  value: Yup.string().required('Campo obrigatório'),
  dca: Yup.string().required('Campo obrigatório'),
  status: Yup.string().required('Campo obrigatório'),
  details: Yup.string().required('Campo obrigatório'),
});

export default function FinancierList({ banksList, clientList, addNewBill, setSnackbarState, bills, setIsMedic }) {
  const { tokens } = useContext(AuthContext);

  const [autocompleteValue, setAutocompleteValue] = useState(null);
  const [docValue, setDocValue] = useState(0);

  const referenceId = useRef('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    resetField,
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

        if (max) {
          setDocValue(parseFloat(max) + 1 + parseFloat(bills));
        } else {
          setDocValue(parseFloat(config.receiver_number) + parseFloat(bills));
        }
      } catch (error) {
        setSnackbarState({
          open: true,
          message: 'Houve um erro interno',
          severity: 'error',
        });
      }
    }
    searchData();
  }, [tokens, bills, setSnackbarState]);

  async function search(value) {
    if (!value) {
      return null;
    }

    const searchValue = value.split(' - ');

    let reference = null;

    if (searchValue.length === 1) {
      reference = clientList.idServicesArray.find((element) => searchValue[0] === element.company);

      referenceId.current = reference.id;
      return 0;
    }

    reference = clientList.idClientArray.find(
      (element) => element.cpfNumber === searchValue[0].slice(1, 15) && element.name === searchValue[1],
    );

    referenceId.current = reference.id;

    const end = moment(new Date()).format('YYYY-MM-DD');

    const start = moment(end).date('1').subtract(1, 'month').format('YYYY-MM-DD');

    const {
      data: { refunds },
    } = await api.post(
      'clients/searchRefunds',
      { clientId: reference.id, start, end },
      {
        headers: {
          'x-access-token': tokens?.accessToken,
        },
      },
    );

    if (refunds) {
      setSnackbarState({
        open: true,
        message: `O sócio ${searchValue[1]} teve ${refunds?.length} reembolso(s) médicos esse mês`,
        severity: 'warning',
      });
    } else {
      setSnackbarState({
        open: true,
        message: `O sócio ${searchValue[1]} não teve nenhum outro reembolso médico esse mês`,
        severity: 'success',
      });
    }

    return null;
  }

  const handleAutocompleteChange = (event, newValue) => {
    setAutocompleteValue(newValue);
    search(newValue);
  };

  function handleClick({ doc, ...data }) {
    data.referenceId = referenceId.current; // eslint-disable-line
    data.clientName = autocompleteValue; // eslint-disable-line
    data.confirmationDate = ''; // eslint-disable-line

    if (doc === '') {
      data.doc = docValue; // eslint-disable-line
    } else {
      data.doc = doc; // eslint-disable-line
    }

    addNewBill(data);
    resetField('doc');
    resetField('value');
    resetField('status');
    resetField('details');
    setAutocompleteValue(null);
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sm={12} md={12}>
        <Button
          startIcon={<PaidIcon />}
          fullWidth
          color="primary"
          onClick={() => {
            setIsMedic((prevValue) => !prevValue);
          }}
          variant="contained"
        >
          cheque
        </Button>
      </Grid>

      <Grid item xs={6} sm={2.5} md={2}>
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

      <Grid item xs={6} sm={3} md={2}>
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

      <Grid item xs={6} sm={2} md={2}>
        <TextInput watch={watch} register={register} label={docValue} errors={errors?.doc} name="doc" />
      </Grid>

      <Grid item xs={6} sm={2} md={2}>
        <MoneyTextInput watch={watch} register={register} label="Valor" errors={errors?.value} name="value" />
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
          value={autocompleteValue}
          onChange={handleAutocompleteChange}
          options={clientList.referenceArray || []}
          renderInput={(params) => (
            <TextField {...params} label="Referente" variant="outlined" size="small" fullWidth />
          )}
        />
      </Grid>

      <Grid item xs={12} sm={8} md={7}>
        <TextInput watch={watch} register={register} label="Destina-se" errors={errors?.details} name="details" />
      </Grid>

      <Grid item xs={12} sm={4} md={1}>
        <Button fullWidth color="primary" onClick={handleSubmit(handleClick)} variant="contained">
          Adicionar
        </Button>
      </Grid>
    </Grid>
  );
}
