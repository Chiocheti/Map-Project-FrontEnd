import 'dayjs/locale/pt-br';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import moment from 'moment';

import TextInputToCard from '../Form/TextInputToCard';
import Title from '../Form/Title';

export default function FormCard({ client }) {
  return (
    <div>
      <Container
        component="form"
        sx={{ mt: 1, mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper', borderColor: '#000', border: 2 }}
      >
        <Grid container spacing={1}>
          <Grid item md={12}>
            <Title>INFORMAÇÕES PESSOAIS</Title>
          </Grid>

          <Grid item md={6}>
            <TextInputToCard label="Nome" value={client.name} />
          </Grid>
          <Grid item md={3}>
            <TextInputToCard label="CPF" value={client.cpfNumber} />
          </Grid>
          <Grid item md={3}>
            <TextInputToCard label="RG" value={client.idCardNumber} />
          </Grid>

          <Grid item md={6}>
            <TextInputToCard label="Email" value={client.email} />
          </Grid>
          <Grid item md={3}>
            <TextInputToCard label="Órgão Emissor" value={client.issuingAgency} />
          </Grid>
          <Grid item md={3}>
            <TextInputToCard label="Cart.de Trabalho" value={client.employmentCard} />
          </Grid>

          <Grid item md={4}>
            <TextInputToCard label="Telefone 01" value={client.phone01} />
          </Grid>
          <Grid item md={4}>
            <TextInputToCard label="Telefone 02" value={client.phone02} />
          </Grid>
          <Grid item md={4}>
            <TextInputToCard label="Telefone 03" value={client.phone03} />
          </Grid>

          <Grid item md={3}>
            <TextInputToCard
              label="Data de Nascimento"
              value={moment(client.birthdate).isValid() ? moment(client.birthdate).format('DD/MM/YYYY') : ''}
            />
          </Grid>
          <Grid item md={3}>
            <TextInputToCard
              label="Data de Sindicalização"
              value={moment(client.admissionDate).isValid() ? moment(client.admissionDate).format('DD/MM/YYYY') : ''}
            />
          </Grid>
          <Grid item md={3}>
            <TextInputToCard label="Sexo" value={client.gender} />
          </Grid>
          <Grid item md={3}>
            <TextInputToCard label="Estado Civil" value={client.maritalStatus} />
          </Grid>

          <Grid item md={4}>
            <TextInputToCard label="Instrução" value={client.educationLevel} />
          </Grid>
          <Grid item md={4}>
            <TextInputToCard label="Deficiência" value={client.specialNeeds} />
          </Grid>
          <Grid item md={4}>
            <TextInputToCard label="Enviar Jornal" value={client.sendJournal} />
          </Grid>
        </Grid>
      </Container>

      {client?.adresses?.length > 0 ? (
        <Container
          component="form"
          sx={{ mt: 1, mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper', borderColor: '#000', border: 2 }}
        >
          <Grid container spacing={1}>
            {client?.adresses?.map((address, index) => (
              <Grid container spacing={1} key={address.id}>
                <Grid item md={12}>
                  {index === 0 ? <Title>Endereço</Title> : <Title>Endereço de Correspondência</Title>}
                </Grid>
                <Grid item md={2}>
                  <TextInputToCard label="Numero" value={address.number} />
                </Grid>
                <Grid item md={2}>
                  <TextInputToCard label="CEP" value={address.postalCode} />
                </Grid>
                <Grid item md={8}>
                  <TextInputToCard label="Rua" value={address.streetName} />
                </Grid>

                <Grid item md={8}>
                  <TextInputToCard label="Cidade" value={address.city} />
                </Grid>
                <Grid item md={2}>
                  <TextInputToCard label="Estado" value={address.state} />
                </Grid>
                <Grid item md={2}>
                  <TextInputToCard label="Complemento" value={address.complement} />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Container>
      ) : null}

      <Container
        component="form"
        sx={{ mt: 1, mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper', borderColor: '#000', border: 2 }}
      >
        <Grid container spacing={1}>
          <Grid item md={12}>
            <Title>INFORMAÇÕES BANCARIAS</Title>
          </Grid>

          <Grid item md={2}>
            <TextInputToCard label="Código Banco" value={client.bankCode} />
          </Grid>
          <Grid item md={3}>
            <TextInputToCard label="Conta Banco" value={client.bankAccount} />
          </Grid>
          <Grid item md={3}>
            <TextInputToCard label="Agencia Banco" value={client.bankAgency} />
          </Grid>
          <Grid item md={2}>
            <TextInputToCard
              label="Credito Mensal"
              value={`R$ ${client.monthlyCredit ? parseFloat(client.monthlyCredit).toFixed(2) : ''}`}
            />
          </Grid>
          <Grid item md={2}>
            <TextInputToCard
              label="Credito Anual"
              value={`R$ ${client.annualCredit ? parseFloat(client.annualCredit).toFixed(2) : ''}`}
            />
          </Grid>
        </Grid>
      </Container>

      <Container
        component="form"
        sx={{ mt: 1, mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper', borderColor: '#000', border: 2 }}
      >
        <Grid container spacing={1}>
          <Grid item md={12}>
            <Title>INFORMAÇÕES DA PROFISSÃO</Title>
          </Grid>

          <Grid item md={3}>
            <TextInputToCard label="Cod. Sindicato" value={client.companyCode} />
          </Grid>
          <Grid item md={3}>
            <TextInputToCard label="Situação" value={client.associate} />
          </Grid>
          <Grid item md={3}>
            <TextInputToCard
              label="Salario Base"
              value={`R$ ${client?.baseSalary ? parseFloat(client.baseSalary).toFixed(2) : ''}`}
            />
          </Grid>
          <Grid item md={3}>
            <TextInputToCard
              label="Desconto"
              value={`R$ ${client?.discount ? parseFloat(client.discount).toFixed(2) : ''}`}
            />
          </Grid>

          <Grid item md={2}>
            <TextInputToCard
              label="Data de Admissão"
              value={moment(client.hiringDate).isValid() ? moment(client.hiringDate).format('DD/MM/YYYY') : ''}
            />
          </Grid>
          <Grid item md={2}>
            <TextInputToCard
              label="Data de Demissão"
              value={moment(client.dismissalDate).isValid() ? moment(client.dismissalDate).format('DD/MM/YYYY') : ''}
            />
          </Grid>
          <Grid item md={2}>
            <TextInputToCard
              label="Data de Aposentadoria"
              value={moment(client.retirementDate).isValid() ? moment(client.retirementDate).format('DD/MM/YYYY') : ''}
            />
          </Grid>
          <Grid item md={3}>
            <TextInputToCard label="Ente" value={client.ente} />
          </Grid>
          <Grid item md={3}>
            <TextInputToCard label="Tipo Mensalidade" value={client.monthlyType} />
          </Grid>
        </Grid>
      </Container>

      {client?.dependents?.length > 0 ? (
        <Container
          component="form"
          sx={{ mt: 1, mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper', borderColor: '#000', border: 2 }}
        >
          <Grid container spacing={1}>
            {client?.dependents?.map((dependent, index) => (
              <Grid container spacing={1} key={dependent.id}>
                <Grid item md={12}>
                  <Title>{index + 1}º DEPENDENTE </Title>
                </Grid>
                <Grid item md={6}>
                  <TextInputToCard label="Nome" value={dependent.name} />
                </Grid>
                <Grid item md={2}>
                  <TextInputToCard
                    label="Nascimento"
                    value={
                      moment(dependent.birthdate).isValid() ? moment(dependent.birthdate).format('DD/MM/YYYY') : ''
                    }
                  />
                </Grid>
                <Grid item md={2}>
                  <TextInputToCard label="Sexo" value={dependent.gender} />
                </Grid>
                <Grid item md={2}>
                  <TextInputToCard label="Parentesco" value={dependent.relationship} />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Container>
      ) : null}
    </div>
  );
}
