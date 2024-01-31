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

const schema = Yup.object().shape({
  start: Yup.string(),
  end: Yup.string(),
});

export default function ReportAllContracts({ setSnackbarState, canEdit }) {
  const { tokens } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function createReport(contracts) {
    const title = ['PREF.', 'ADMISSÃO', 'SÓCIO', 'BENEFICIÁRIO', 'PRIORIDADE', 'CONVENIO', 'VALOR', 'DATA'];
    const document = [];

    contracts.forEach((contract) => {
      let codPref = '';
      const line = [];

      contract.clients.companies.forEach((company) => {
        if (company.associate === 'ATIVO / ASSOCIADO') {
          codPref = company.companyCode;
        } else if (codPref === '') {
          codPref = company.companyCode;
        }
      });

      line.push(codPref);
      line.push(contract.clients.admissionDate ? moment(contract.clients.admissionDate).format('DD/MM/YYYY') : '');
      line.push(contract.clients.name);
      line.push(contract.beneficiaryName);
      line.push(contract.billingPriorities.value);
      line.push(contract.billingPriorities.name);
      line.push(`R$${contract.value.toFixed(2)}`);
      line.push(contract.data ? moment(contract.data).format('DD/MM/YYYY') : 'NÃO INFORMADA');

      document.push(line);
    });

    const report = [title, ...document];

    return report;
  }

  function calculateGeral(contracts, billingPriorities) {
    const document = [['PRIORIDADE', 'CONVENIO', 'TOTAL']];
    billingPriorities.forEach((priority) => {
      let total = 0;
      contracts.forEach((contract) => {
        if (contract.billingPriorityId === priority.id) {
          total += contract.value;
        }
      });

      if (total > 0) {
        document.push([priority.value, priority.name, `R$${total.toFixed(2)}`]);
      }
    });

    return document;
  }

  async function writeWorkBook(contracts, billingPriorities, start, end) {
    const reportData = createReport(contracts);
    const geralData = calculateGeral(contracts, billingPriorities);

    const header = [
      ['Sindicato dos Funcionario da Prefeitura municipal, Câmara Municipal, Autarquias,'],
      ['Empresas e Fundações Municipais de São joão da Boa Vista - SP'],
      ['Rua Oscar Janson, 3 Centro - São João da Boa Vista/SP - Cep 13.870-070'],
      [
        `Tel: (19) 3623-1834 - sindprsjbv@gmail.com - De: ${
          start === '' ? '-' : moment(start).format('DD/MM/YYYY')
        } | Até: ${end === '' ? '-' : moment(end).format('DD/MM/YYYY')}`,
      ],
    ];

    const workBook = XLSX.utils.book_new();

    const workSheetPg1 = XLSX.utils.aoa_to_sheet([...header, [''], ...reportData]);

    workSheetPg1['!merges'] = [];
    workSheetPg1['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } });
    workSheetPg1['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 7 } });
    workSheetPg1['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 7 } });
    workSheetPg1['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: 7 } });

    XLSX.utils.book_append_sheet(workBook, workSheetPg1, 'Reembolsos');

    const workSheetPg2 = XLSX.utils.aoa_to_sheet([
      ...header,
      [''],
      ...geralData,
      [''],
      ['Reembolso Aprovado por'],
      ['JOÃO HENRIQUE DE PAULA CONSENTINO'],
      ['Presidente do Sindicato'],
    ]);

    workSheetPg2['!merges'] = [];
    workSheetPg2['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } });
    workSheetPg2['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 4 } });
    workSheetPg2['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 4 } });
    workSheetPg2['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: 4 } });
    workSheetPg2['!merges'].push({ s: { r: geralData.length + 6, c: 0 }, e: { r: geralData.length + 6, c: 4 } });
    workSheetPg2['!merges'].push({ s: { r: geralData.length + 7, c: 0 }, e: { r: geralData.length + 7, c: 4 } });
    workSheetPg2['!merges'].push({ s: { r: geralData.length + 8, c: 0 }, e: { r: geralData.length + 8, c: 4 } });

    XLSX.utils.book_append_sheet(workBook, workSheetPg2, 'Total Convênios');

    XLSX.writeFile(workBook, 'Relatório_de_Convênios.xlsx', { bookType: 'xlsx', type: 'binary' });

    reset();
  }

  async function refundReport({ start, end }) {
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
        data: { contracts, billingPriorities },
      } = await api.post(
        'report/contractReport',
        {
          start: start === '' ? null : moment(start).subtract('1', 'day').format('YYYY-MM-DD'),
          end: end === '' ? null : end,
        },
        {
          headers: {
            'x-access-token': tokens?.accessToken,
          },
        },
      );

      writeWorkBook(contracts, billingPriorities, start, end);
      return true;
    } catch (error) {
      setSnackbarState({
        open: true,
        message: error.response.data.message,
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
            Gerar relatório de Convênios
          </Button>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <DateInput label="De" register={register} errors={errors?.start} name="start" />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <DateInput label="Até" register={register} errors={errors?.end} name="end" />
        </Grid>
      </Grid>
    </Paper>
  );
}
