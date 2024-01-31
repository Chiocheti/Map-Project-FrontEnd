import 'dayjs/locale/pt-br';

import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import extenso from 'extenso';
import moment from 'moment';

import Title from '../Form/Title';
import Logo from '../Img/logoSindicato.jpg';

export default function FinancierCard({ bill }) {
  moment.updateLocale('pt', {
    months: [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
  });

  const title = 'Sindicato dos Func. Públicos da Prefeitura, Autarquias e Empresas Municipais';

  return (
    <div>
      <Container
        component="form"
        sx={{ mt: 1, mb: 1, p: 2, borderRadius: 2, bgcolor: 'background.paper', borderColor: '#000', border: 2 }}
      >
        <Grid container spacing={1} padding={0}>
          <Grid item md={2}>
            <img src={Logo} alt="" height="100px" width="100px" />
          </Grid>

          <Grid item md={8}>
            <Typography variant="subtitle1" textAlign="center" sx={{ lineHeight: 1.2 }}>
              Sindicato dos Funcionários da Prefeitura Municipal, Câmara Municipal, Autarquias, Empresas e Fundações
              Municipais de São joão da Boa Vista-SP
            </Typography>
            <Typography variant="subtitle2" textAlign="center" sx={{ lineHeight: 1.2 }} mt={2}>
              Rua Oscar Janson, 3 Centro - São João da Boa Vista/SP
            </Typography>
            <Typography variant="subtitle2" textAlign="center" sx={{ lineHeight: 1.2 }}>
              Cep 13.870-070
            </Typography>
            <Typography variant="subtitle2" textAlign="center">
              Tel: (19) 3623-1834
            </Typography>
          </Grid>

          <Grid item md={2} justifyItems="end">
            <Typography variant="subtitle2" textAlign="right">
              {moment(new Date()).format('DD/MM/YYYY')}
            </Typography>

            <Typography variant="subtitle2" textAlign="right">
              {moment(new Date()).format('HH:mm:ss')}
            </Typography>
          </Grid>
        </Grid>
      </Container>

      <Container
        component="form"
        sx={{ mt: 1, mb: 1, p: 2, borderRadius: 2, bgcolor: 'background.paper', borderColor: '#000', border: 2 }}
      >
        <Grid container>
          <Grid item md={3} />
          <Grid item md={6}>
            <Typography variant="h6" gutterBottom textAlign="center">
              Recibo - Reembolso Antecipado
            </Typography>

            <Typography variant="subtitle2" gutterBottom textAlign="center">
              Competência Ano {new Date().getFullYear()} Mês {new Date().getMonth() + 1}
            </Typography>
          </Grid>
          <Grid item md={3} sx={{ border: 1, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom textAlign="center">
              Nr. Recibo
            </Typography>
            <Typography variant="subtitle1" gutterBottom textAlign="center">
              {bill?.doc}
            </Typography>
          </Grid>

          <Grid item md={12}>
            <Typography variant="subtitle2" gutterBottom textAlign="left">
              Informações do Associado
            </Typography>
          </Grid>

          <Grid container spacing={5}>
            <Grid item>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                CPF Sócio
              </Typography>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                {bill?.clientCpf}
              </Typography>
            </Grid>

            <Grid item>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                Empresa
              </Typography>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                {bill?.account}
              </Typography>
            </Grid>

            <Grid item>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                Nome
              </Typography>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                {bill?.receiver}
              </Typography>
            </Grid>
          </Grid>

          <Grid item md={12}>
            <Title>Informações do Recibo/Reembolso</Title>
          </Grid>

          <Grid container spacing={5}>
            <Grid item>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                Seq
              </Typography>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                {bill?.doc}
              </Typography>
            </Grid>

            <Grid item>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                Data
              </Typography>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                {moment(bill?.date).format('DD/MM/YYYY')}
              </Typography>
            </Grid>

            <Grid item>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                Valor Cheque
              </Typography>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                {`R$ ${bill?.value}`}
              </Typography>
            </Grid>

            <Grid item>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                %
              </Typography>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                {`${bill?.refundValuePercent}%`}
              </Typography>
            </Grid>

            <Grid item>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                Valor a descontar
              </Typography>
              <Typography variant="subtitle2" gutterBottom textAlign="left">
                {`R$ ${bill?.refundValue}`}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <Container
        component="form"
        sx={{ mt: 1, mb: 1, p: 1, borderRadius: 2, bgcolor: 'background.paper', borderColor: '#000', border: 2 }}
      >
        <Typography variant="subtitle2" align="justify" sx={{ lineHeight: 1.2 }}>
          Recebi do {title}, o Cheque nr. - {bill?.checkNumber} - datado de{' '}
          {moment(bill?.date).locale('pt').format('DD [de] MMMM [de] YYYY')} do {bill?.account?.toUpperCase()} Na
          importância de {`R$ ${bill?.value}`} (
          {extenso(bill?.value || 0, { mode: 'currency', currency: { type: 'BRL' } }).toUpperCase()}), correspondente ao
          adiantamento para consulta medica no dia{' '}
          {moment(bill?.reservationDate).locale('pt').format('DD [de] MMMM [de] YYYY')} em favor de{' '}
          {bill?.medic?.toUpperCase()}. Autorizo o {title} a descontar o valor total do cheque fornecido ou o valor a
          descontar apontado acima em minha conta corrente por ocasião no proximo pagamento de proventos dos servidores
          municipais de São João da Boa Vista-SP.
        </Typography>
      </Container>

      <Container sx={{ mt: 1, mb: 1, p: 2 }}>
        <Grid container>
          <Grid item md={12} mb={15}>
            <Typography variant="subtitle1" gutterBottom textAlign="left">
              São João da Boa Vista, _____ de _______________ de __________
            </Typography>
          </Grid>
          <Grid item md={3} />
          <Grid item md={6}>
            <Divider sx={{ border: 1 }} variant="fullWidth" />
            <Typography variant="subtitle1" textAlign="center">
              {bill?.clientName}
            </Typography>
            <Typography variant="subtitle1" textAlign="center">
              Nome por extenso
            </Typography>
          </Grid>
          <Grid item md={3} />
        </Grid>
        <Grid item md={12}>
          <Typography variant="body2" textAlign="center" mt={10}>
            Observação: O associado esta obrigado a apresentar o recibo na consulta médica em até 2 dias, após a data da
            consulta
          </Typography>
        </Grid>
      </Container>
    </div>
  );
}
