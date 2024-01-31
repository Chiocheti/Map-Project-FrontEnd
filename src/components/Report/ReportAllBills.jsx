import { yupResolver } from '@hookform/resolvers/yup';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import moment from 'moment';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';
import * as Yup from 'yup';

import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import Button from '../Form/Button';
import DateInput from '../Form/DateInput';
import Select from '../Form/Select';

const schema = Yup.object().shape({
  start: Yup.string().required('Escolha o inicio da consulta'),
  end: Yup.string().required('Escolha o fim da consulta'),
  account: Yup.string().required('Escolha o banco a ser pesquisado'),
});

export default function ReportAllBills({ banks, setSnackbarState, canEdit }) {
  const { tokens } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function createArray(comp, pend) {
    const workBook = XLSX.utils.book_new();

    const array1 = [['Compensado', '', '', '', '', '']];

    array1.push(['Data', 'Cod. Documento', 'Beneficiário', 'Destina-se', 'D/C/A', 'Valor']);

    comp.forEach((element) => {
      array1.push([
        moment(element.date).format('DD/MM/YYYY'),
        element.doc,
        element.clientName,
        element.details,
        element.dca,
        element.value,
      ]);
    });

    const workSheetPg1 = XLSX.utils.aoa_to_sheet(array1);

    workSheetPg1['!merges'] = [];
    workSheetPg1['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } });

    XLSX.utils.book_append_sheet(workBook, workSheetPg1, 'Compensados');

    const array2 = [];

    array2.push(['Pendente', '', '', '', '', '']);

    array2.push(['Data', 'Cod. Documento', 'Beneficiário', 'D/C/A', 'Valor', 'Destina-se']);

    pend.forEach((element) => {
      array2.push([
        moment(element.date).format('DD/MM/YYYY'),
        element.doc,
        element.clientName,
        element.dca,
        `R$${element.value.toFixed(2)}`,
        element.details,
      ]);
    });

    const workSheetPg2 = XLSX.utils.aoa_to_sheet(array2);

    workSheetPg2['!merges'] = [];
    workSheetPg2['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } });

    XLSX.utils.book_append_sheet(workBook, workSheetPg2, 'Pendentes');

    XLSX.writeFile(workBook, 'Relatório_de_Pagamentos.xlsx', { bookType: 'xlsx', type: 'binary' });
  }

  async function handleSearch({ start, end, account }) {
    if (!canEdit) {
      setSnackbarState({
        open: true,
        message: 'Você não tem permissão de gerar um relatório',
        severity: 'error',
      });

      return false;
    }

    const { data } = await api.post(
      'report/billsReport',
      { start: moment(start).format('YYYY-MM-DD'), end: moment(end).format('YYYY-MM-DD'), bankId: account },
      {
        headers: {
          'x-access-token': tokens?.accessToken,
        },
      },
    );

    createArray(data.compBills, data.pendBills);

    return true;
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
        <Grid item xs={12}>
          <Button fullWidth variant="contained" onClick={handleSubmit(handleSearch)}>
            Gerar Histórico do Banco
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
            options={banks}
            control={control}
            label="Conta"
            errors={errors.account}
            {...register(`account`)}
            register={register}
            name="account"
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
