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

export default function ReportAllRefunds({ setSnackbarState, amount, canEdit }) {
  const { tokens } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function createReport(refunds) {
    const title = [
      'PREF.',
      'SÓCIO',
      'REFERENTE',
      'ADMISSÃO',
      'BENEFICIO',
      'N. RECIBO',
      'VALOR',
      'REEMBOLSO',
      '%',
      'DATA',
    ];
    const document = [];

    refunds.forEach((refund) => {
      let codPref = '';
      const line = [];

      refund.clients.companies.forEach((company) => {
        if (company.associate === 'ATIVO / ASSOCIADO') {
          codPref = company.companyCode;
        } else if (codPref === '') {
          codPref = company.companyCode;
        }
      });

      line.push(codPref);
      line.push(refund.clients.name);
      line.push(refund.dependents ? refund.dependents.name : refund.clients.name);
      line.push(
        refund.clients.admissionDate ? moment(refund.clients.admissionDate).add('1', 'day').format('DD/MM/YYYY') : '',
      );
      line.push(refund.specialties.skill);
      line.push(refund.invoiceNumber);
      line.push(`R$${refund.invoiceValue}`);
      line.push(`R$${refund.refundValue}`);
      line.push(`${((refund.refundValue / refund.invoiceValue) * 100).toFixed(2)}%`);
      line.push(moment(refund.invoiceReceived).add('1', 'day').format('DD/MM/YYYY'));
      document.push(line);
    });

    const report = [[...title], ...document];

    return report;
  }

  function calculateGeral(refunds, specialties) {
    const document = [['Especialidade', 'Total Reembolsado']];
    specialties.forEach((specialty) => {
      let total = 0;
      refunds.forEach((refund) => {
        if (refund.specialtyId === specialty.id) {
          total += refund.refundValue;
        }
      });

      if (total > 0) {
        document.push([specialty.skill, `R$${total}`]);
      }
    });

    return document;
  }

  function countData(refunds) {
    let invoice = 0;
    let refunded = 0;

    refunds.forEach((refund) => {
      invoice += refund.invoiceValue;
      refunded += refund.refundValue;
    });

    return { invoice, refunded };
  }

  async function writeWorkBook(refunds, specialties, start, end) {
    const reportData = createReport(refunds);
    const geralData = calculateGeral(refunds, specialties);
    const sumData = countData(refunds);

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
    workSheetPg1['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } });
    workSheetPg1['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 9 } });
    workSheetPg1['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 9 } });
    workSheetPg1['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: 9 } });

    XLSX.utils.book_append_sheet(workBook, workSheetPg1, 'Reembolsos');

    const workSheetPg2 = XLSX.utils.aoa_to_sheet([
      ...header,
      [''],
      ['Total Geral'],
      ['Total Reembolsos', 'Total Reembolsado', 'Total Receita', '25%', 'Diferença'],
      [
        `R$${sumData.invoice}`,
        `R$${sumData.refunded}`,
        `R$${amount}`,
        `R$${(amount / 100) * 25}`,
        `R$${(amount / 100) * 25 - sumData.refunded}`,
      ],
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
    workSheetPg2['!merges'].push({ s: { r: 5, c: 0 }, e: { r: 5, c: 4 } });
    workSheetPg2['!merges'].push({ s: { r: geralData.length + 10, c: 0 }, e: { r: geralData.length + 10, c: 4 } });
    workSheetPg2['!merges'].push({ s: { r: geralData.length + 11, c: 0 }, e: { r: geralData.length + 11, c: 4 } });
    workSheetPg2['!merges'].push({ s: { r: geralData.length + 12, c: 0 }, e: { r: geralData.length + 12, c: 4 } });

    XLSX.utils.book_append_sheet(workBook, workSheetPg2, 'Total Reembolsos');

    XLSX.writeFile(workBook, 'Relatório_de_Reembolsos.xlsx', { bookType: 'xlsx', type: 'binary' });

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
        data: { refunds, specialties },
      } = await api.post(
        'report/refundReport',
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

      writeWorkBook(refunds, specialties, start, end);
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
            Gerar relatório de Reembolsos
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
