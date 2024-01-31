import { yupResolver } from '@hookform/resolvers/yup';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import moment from 'moment';
import { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import Button from '../Form/Button';
import DateInput from '../Form/DateInput';
import Select from '../Form/Select';

const schema = Yup.object().shape({
  start: Yup.string(),
  end: Yup.string(),
  bank: Yup.string().required('Selecione um Banco'),
});

export default function ReportAllTxTFile({ setSnackbarState, canEdit }) {
  const { tokens } = useContext(AuthContext);

  const [options, setOptions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const banks = await api.get('clients/findClientsBanks', {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        });

        const list = [];

        banks.data.forEach((bank) => {
          list.push({ text: bank.bank_code, value: bank.bank_code });
        });

        setOptions(list);
      } catch (error) {
        setSnackbarState({
          open: true,
          message: error.response.data.message,
          severity: 'error',
        });
      }
    }

    fetchData();
  }, [tokens, setSnackbarState]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function fillWithZeros(string, characters) {
    let newString = string;
    for (let index = string.length; index < characters; index += 1) {
      newString = `0${newString}`;
    }

    return newString;
  }

  function numberToString(string) {
    let newString = '';
    for (let index = 0; index < string.length; index += 1) {
      if (string[index] !== '.' && string[index] !== ',') {
        newString = `${newString}${string[index]}`;
      }
    }

    return newString;
  }

  function createTextFile(fileContent) {
    const fileName = `Relatório_Banco[${watch('bank')}].txt`;

    const element = document.createElement('a');

    const file = new Blob(fileContent, { type: 'text/plain' });

    element.href = URL.createObjectURL(file);
    element.download = fileName;
    element.click();
  }

  function orderArray(array, maxPriority) {
    const newList = [];
    for (let index = 0; index <= maxPriority; index += 1) {
      array.forEach((element) => {
        if (parseInt(element.order, 10) === index) {
          newList.push(element.string);
        }
      });
    }

    return newList;
  }

  function createArray(clients) {
    const string = [];
    let maxPriority = 0;
    clients.forEach((client) => {
      const priorityList = [];
      client.contracts.forEach((contract) => {
        if (parseInt(contract.code, 10) > maxPriority) {
          maxPriority = parseInt(contract.code, 10);
        }
        if (!priorityList.find((priority) => priority === contract.code)) {
          priorityList.push(contract.code);
        }
      });

      const orderPriorityList = [];

      for (let index = 0; index <= maxPriority; index += 1) {
        priorityList.forEach((priority) => {
          if (parseInt(priority, 10) === index) {
            orderPriorityList.push(priority);
          }
        });
      }

      orderPriorityList.forEach((priority) => {
        let sum = 0;
        client.contracts.forEach((contract) => {
          if (contract.code === priority) {
            sum += contract.value;
          }
        });

        string.push({
          order: priority,
          string: `${fillWithZeros(client.bankCode, 3)}${fillWithZeros(client.bankAgency, 5)}${fillWithZeros(
            priority,
            2,
          )}${fillWithZeros(client.bankAccount, 9)}${fillWithZeros(numberToString(`${sum}`), 13)}\n`,
        });
      });
    });

    const order = orderArray(string, maxPriority);

    createTextFile(order);
  }

  async function refundReport({ start, end, bank }) {
    if (!canEdit) {
      setSnackbarState({
        open: true,
        message: 'Você não tem permissão de gerar um relatório',
        severity: 'error',
      });

      return false;
    }

    try {
      const {
        data: { clients },
      } = await api.post(
        'report/textReport',
        {
          start: start === '' ? null : moment(start).subtract('1', 'day').format('YYYY-MM-DD'),
          end: end === '' ? null : end,
          bank,
        },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      createArray(clients);
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
    <Paper
      sx={{
        p: 2,
        mb: 1,
        bgcolor: 'background.paper',
      }}
    >
      <Grid container spacing={1}>
        <Grid item xs={12} sm={12} md={12}>
          <Button fullWidth variant="contained" onClick={handleSubmit(refundReport)}>
            Gerar relatório TXT
          </Button>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <DateInput label="De" register={register} errors={errors?.start} name="start" />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <DateInput label="Até" register={register} errors={errors?.end} name="end" />
        </Grid>

        <Grid item xs={12} sm={12} md={12}>
          <Select
            options={options}
            control={control}
            label="Banco"
            errors={errors?.bank}
            {...register('bank')}
            register={register}
            name="bank"
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
