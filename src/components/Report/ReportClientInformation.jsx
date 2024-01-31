import 'dayjs/locale/pt-br';
import { yupResolver } from '@hookform/resolvers/yup';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import MuiSelect from '@mui/material/Select';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import DateInput from '../Form/DateInput';
import MaskInputText from '../Form/MaskInput';
import MoneyTextInput from '../Form/MoneyTextInput';
import SelectFilter from '../Form/SelectFilter';
import TextInput from '../Form/TextInput';
import Title from '../Form/Title';

const options = ['ATIVO', 'APOSENTADO', 'PENSIONISTA', 'LIC. S. REMUNERAÇÃO', 'EXONERADO', 'FALECIDO'];

const schema = Yup.object({
  name: Yup.boolean().default(false),
  cpfNumber: Yup.boolean().default(false),
  birthdate: Yup.boolean().default(false),
  admissionDate: Yup.boolean().default(false),
  email: Yup.boolean().default(false),
  idCardNumber: Yup.boolean().default(false),
  issuingAgency: Yup.boolean().default(false),
  employmentCard: Yup.boolean().default(false),
  gender: Yup.boolean().default(false),
  maritalStatus: Yup.boolean().default(false),
  specialNeeds: Yup.boolean().default(false),
  appPermission: Yup.boolean().default(false),
  educationLevel: Yup.boolean().default(false),
  sendJournal: Yup.boolean().default(false),
  details: Yup.boolean().default(false),
  monthlyCredit: Yup.boolean().default(false),
  annualCredit: Yup.boolean().default(false),
  phone01: Yup.boolean().default(false),
  phone02: Yup.boolean().default(false),
  phone03: Yup.boolean().default(false),
  bankAccount: Yup.boolean().default(false),
  bankAgency: Yup.boolean().default(false),
  bankCode: Yup.boolean().default(false),
  companyCode: Yup.boolean().default(false),
  baseSalary: Yup.boolean().default(false),
  discount: Yup.boolean().default(false),
  associate: Yup.boolean().default(false),
  associateState: Yup.boolean().default(false),
  hiringDate: Yup.boolean().default(false),
  dismissalDate: Yup.boolean().default(false),
  retirementDate: Yup.boolean().default(false),
  ente: Yup.boolean().default(false),
  monthlyType: Yup.boolean().default(false),

  nameFilter: Yup.string().default(''),
  cpfNumberFilter: Yup.string().default(''),

  birthdateStartFilter: Yup.string().default(''),
  birthdateEndFilter: Yup.string().default(''),

  admissionDateStartFilter: Yup.string().default(''),
  admissionDateEndFilter: Yup.string().default(''),

  emailFilter: Yup.string().default(''),
  idCardNumberFilter: Yup.string().default(''),
  issuingAgencyFilter: Yup.string().default(''),
  employmentCardFilter: Yup.string().default(''),
  genderFilter: Yup.string().default(''),
  maritalStatusFilter: Yup.string().default(''),
  specialNeedsFilter: Yup.string().default(''),
  appPermissionFilter: Yup.string().default(''),
  educationLevelFilter: Yup.string().default(''),
  sendJournalFilter: Yup.string().default(''),
  detailsFilter: Yup.string().default(''),
  monthlyCreditFilter: Yup.string().default(''),
  annualCreditFilter: Yup.string().default(''),
  phone01Filter: Yup.string().default(''),
  phone02Filter: Yup.string().default(''),
  phone03Filter: Yup.string().default(''),
  bankAccountFilter: Yup.string().default(''),
  bankAgencyFilter: Yup.string().default(''),
  bankCodeFilter: Yup.string().default(''),

  companyCodeFilter: Yup.string().default(''),

  baseSalaryFilterStart: Yup.string().default(''),
  baseSalaryFilterEnd: Yup.string().default(''),

  discountFilterStart: Yup.string().default(''),
  discountFilterEnd: Yup.string().default(''),

  associateFilter: Yup.string().default(''),
  associateStateFilter: Yup.string().default(''),

  hiringDateFilterStart: Yup.string().default(''),
  hiringDateFilterEnd: Yup.string().default(''),

  dismissalDateFilterStart: Yup.string().default(''),
  dismissalDateFilterEnd: Yup.string().default(''),

  retirementDateFilterStart: Yup.string().default(''),
  retirementDateFilterEnd: Yup.string().default(''),

  enteFilter: Yup.string().default(''),
  monthlyTypeFilter: Yup.string().default(''),
});

export default function ReportClientInformation({ update }) {
  const [arrayList, setArrayList] = useState([]);

  const {
    register,
    formState: { errors },
    watch,
    setValue,
    getValues,
    control,
  } = useForm({
    resolver: yupResolver(schema),
  });

  function values() {
    const fields = [];
    const query = {};

    const data = getValues();
    data.associateFilter = arrayList;

    if (data.name) {
      fields.push('name');
    }
    if (data.cpfNumber) {
      fields.push('cpfNumber');
    }
    if (data.birthdate) {
      fields.push('birthdate');
    }
    if (data.admissionDate) {
      fields.push('admissionDate');
    }
    if (data.email) {
      fields.push('email');
    }
    if (data.idCardNumber) {
      fields.push('idCardNumber');
    }
    if (data.issuingAgency) {
      fields.push('issuingAgency');
    }
    if (data.employmentCard) {
      fields.push('employmentCard');
    }
    if (data.gender) {
      fields.push('gender');
    }
    if (data.maritalStatus) {
      fields.push('maritalStatus');
    }
    if (data.specialNeeds) {
      fields.push('specialNeeds');
    }
    if (data.appPermission) {
      fields.push('appPermission');
    }
    if (data.educationLevel) {
      fields.push('educationLevel');
    }
    if (data.sendJournal) {
      fields.push('sendJournal');
    }
    if (data.details) {
      fields.push('details');
    }
    if (data.monthlyCredit) {
      fields.push('monthlyCredit');
    }
    if (data.annualCredit) {
      fields.push('annualCredit');
    }
    if (data.phone01) {
      fields.push('phone01');
    }
    if (data.phone02) {
      fields.push('phone02');
    }
    if (data.phone03) {
      fields.push('phone03');
    }
    if (data.bankAccount) {
      fields.push('bankAccount');
    }
    if (data.bankAgency) {
      fields.push('bankAgency');
    }
    if (data.bankCode) {
      fields.push('bankCode');
    }
    if (data.companyCode) {
      fields.push('companyCode');
    }
    if (data.baseSalary) {
      fields.push('baseSalary');
    }
    if (data.discount) {
      fields.push('discount');
    }
    if (data.associate) {
      fields.push('associate');
    }
    if (data.associateState) {
      fields.push('associateState');
    }
    if (data.hiringDate) {
      fields.push('hiringDate');
    }
    if (data.dismissalDate) {
      fields.push('dismissalDate');
    }
    if (data.retirementDate) {
      fields.push('retirementDate');
    }
    if (data.ente) {
      fields.push('ente');
    }
    if (data.monthlyType) {
      fields.push('monthlyType');
    }

    if (data.nameFilter) {
      query.name = data.nameFilter;
    }
    if (data.cpfNumberFilter) {
      query.cpfNumber = data.cpfNumberFilter;
    }

    if (data.birthdateStartFilter && data.birthdateEndFilter) {
      query.birthdate = {
        start: data?.birthdateStartFilter,
        end: data?.birthdateEndFilter,
      };
    } else if (data.birthdateStartFilter) {
      query.birthdate = {
        start: data?.birthdateStartFilter,
      };
    } else if (data.birthdateEndFilter) {
      query.birthdate = {
        end: data?.birthdateEndFilter,
      };
    }

    if (data.admissionDateStartFilter && data.admissionDateEndFilter) {
      query.admissionDate = {
        start: data?.admissionDateStartFilter,
        end: data?.admissionDateEndFilter,
      };
    } else if (data.admissionDateStartFilter) {
      query.admissionDate = {
        start: data?.admissionDateStartFilter,
      };
    } else if (data.admissionDateEndFilter) {
      query.admissionDate = {
        end: data?.admissionDateEndFilter,
      };
    }

    if (data.emailFilter) {
      query.email = data.emailFilter;
    }
    if (data.idCardNumberFilter) {
      query.idCardNumber = data.idCardNumberFilter;
    }
    if (data.issuingAgencyFilter) {
      query.issuingAgency = data.issuingAgencyFilter;
    }
    if (data.employmentCardFilter) {
      query.employmentCard = data.employmentCardFilter;
    }
    if (data.genderFilter) {
      query.gender = data.genderFilter;
    }
    if (data.maritalStatusFilter) {
      query.maritalStatus = data.maritalStatusFilter;
    }
    if (data.specialNeedsFilter) {
      query.specialNeeds = data.specialNeedsFilter;
    }
    if (data.appPermissionFilter) {
      query.appPermission = data.appPermissionFilter;
    }
    if (data.educationLevelFilter) {
      query.educationLevel = data.educationLevelFilter;
    }
    if (data.sendJournalFilter) {
      query.sendJournal = data.sendJournalFilter;
    }
    if (data.detailsFilter) {
      query.details = data.detailsFilter;
    }
    if (data.monthlyCreditFilter) {
      query.monthlyCredit = data.monthlyCreditFilter;
    }
    if (data.annualCreditFilter) {
      query.annualCredit = data.annualCreditFilter;
    }
    if (data.phone01Filter) {
      query.phone01 = data.phone01Filter;
    }
    if (data.phone02Filter) {
      query.phone02 = data.phone02Filter;
    }
    if (data.phone03Filter) {
      query.phone03 = data.phone03Filter;
    }
    if (data.bankAccountFilter) {
      query.bankAccount = data.bankAccountFilter;
    }
    if (data.bankAgencyFilter) {
      query.bankAgency = data.bankAgencyFilter;
    }
    if (data.bankCodeFilter) {
      query.bankCode = data.bankCodeFilter;
    }

    if (data.companyCodeFilter) {
      query.companyCode = data.companyCodeFilter;
    }

    if (data.baseSalaryStartFilter && data.baseSalaryEndFilter) {
      query.baseSalary = {
        start: data?.baseSalaryStartFilter,
        end: data?.baseSalaryEndFilter,
      };
    } else if (data.baseSalaryStartFilter) {
      query.baseSalary = {
        start: data?.baseSalaryStartFilter,
      };
    } else if (data.baseSalaryEndFilter) {
      query.baseSalary = {
        end: data?.baseSalaryEndFilter,
      };
    }

    if (data.discountStartFilter && data.discountEndFilter) {
      query.discount = {
        start: data?.discountStartFilter,
        end: data?.discountEndFilter,
      };
    } else if (data.discountStartFilter) {
      query.discount = {
        start: data?.discountStartFilter,
      };
    } else if (data.discountEndFilter) {
      query.discount = {
        end: data?.discountEndFilter,
      };
    }

    if (data.associateFilter.length > 0) {
      query.associate = data.associateFilter;
    }
    if (data.associateStateFilter) {
      query.associateState = data.associateStateFilter;
    }

    if (data.hiringDateStartFilter && data.hiringDateEndFilter) {
      query.hiringDate = {
        start: data?.hiringDateStartFilter,
        end: data?.hiringDateEndFilter,
      };
    } else if (data.hiringDateStartFilter) {
      query.hiringDate = {
        start: data?.hiringDateStartFilter,
      };
    } else if (data.hiringDateEndFilter) {
      query.hiringDate = {
        end: data?.hiringDateEndFilter,
      };
    }

    if (data.dismissalDateStartFilter && data.dismissalDateEndFilter) {
      query.dismissalDate = {
        start: data?.dismissalDateStartFilter,
        end: data?.dismissalDateEndFilter,
      };
    } else if (data.dismissalDateStartFilter) {
      query.dismissalDate = {
        start: data?.dismissalDateStartFilter,
      };
    } else if (data.dismissalDateEndFilter) {
      query.dismissalDate = {
        end: data?.dismissalDateEndFilter,
      };
    }

    if (data.retirementDateStartFilter && data.retirementDateEndFilter) {
      query.retirementDate = {
        start: data?.retirementDateStartFilter,
        end: data?.retirementDateEndFilter,
      };
    } else if (data.retirementDateStartFilter) {
      query.retirementDate = {
        start: data?.retirementDateStartFilter,
      };
    } else if (data.retirementDateEndFilter) {
      query.retirementDate = {
        end: data?.retirementDateEndFilter,
      };
    }

    if (data.enteFilter) {
      query.ente = data.enteFilter;
    }

    if (data.monthlyTypeFilter) {
      query.monthlyType = data.monthlyTypeFilter;
    }

    update({ fields, query });
  }

  values();

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setArrayList(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <>
      <Container component="form" sx={{ mt: 1, mb: 1, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Title>Informações Pessoais</Title>

        <Grid container spacing={1}>
          <Grid item xs={12} sm={6} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('name')}
              onClick={() => setValue('name', !getValues('name'))}
            />

            <TextInput
              color={watch('nameFilter') ? 'info' : null}
              watch={watch}
              register={register}
              label="Nome Completo"
              errors={errors?.nameFilter}
              name="nameFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('cpfNumber')}
              onClick={() => setValue('cpfNumber', !getValues('cpfNumber'))}
            />

            <MaskInputText
              color={watch('cpfNumberFilter') ? 'info' : null}
              watch={watch}
              control={control}
              name="cpfNumberFilter"
              mask="999.999.999-99"
              label="CPF"
              errors={errors?.cpfNumberFilter}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('idCardNumber')}
              onClick={() => setValue('idCardNumber', !getValues('idCardNumber'))}
            />

            <MaskInputText
              color={watch('idCardNumberFilter') ? 'info' : null}
              watch={watch}
              control={control}
              name="idCardNumberFilter"
              mask="99.999.999-9"
              label="RG"
              errors={errors?.idCardNumberFilter}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('issuingAgency')}
              onClick={() => setValue('issuingAgency', !getValues('issuingAgency'))}
            />

            <TextInput
              color={watch('issuingAgencyFilter') ? 'info' : null}
              watch={watch}
              register={register}
              label="Órgão Emissor"
              name="issuingAgencyFilter"
              errors={errors?.issuingAgencyFilter}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('email')}
              onClick={() => setValue('email', !getValues('email'))}
            />

            <TextInput
              color={watch('emailFilter') ? 'info' : null}
              watch={watch}
              register={register}
              label="Email"
              errors={errors?.emailFilter}
              name="emailFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('details')}
              onClick={() => setValue('details', !getValues('details'))}
            />

            <TextInput
              color={watch('detailsFilter') ? 'info' : null}
              watch={watch}
              register={register}
              label="Descrição"
              errors={errors?.detailsFilter}
              name="detailsFilter"
            />
          </Grid>

          <Grid item xs={12} sm={12} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('birthdate')}
              onClick={() => setValue('birthdate', !getValues('birthdate'))}
            />

            <Grid container display="flex" spacing={1}>
              <Grid item xs={6} sm={6} md={6}>
                <DateInput
                  color={watch('birthdateStartFilter') ? 'info' : null}
                  register={register}
                  label="Data Nascimento De: "
                  errors={errors?.birthdateStartFilter}
                  name="birthdateStartFilter"
                />
              </Grid>

              <Grid item xs={6} sm={6} md={6}>
                <DateInput
                  color={watch('birthdateEndFilter') ? 'info' : null}
                  register={register}
                  label="Data Nascimento Até: "
                  errors={errors?.birthdateEndFilter}
                  name="birthdateEndFilter"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={12} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('admissionDate')}
              onClick={() => setValue('admissionDate', !getValues('admissionDate'))}
            />

            <Grid container spacing={1}>
              <Grid item xs={6} sm={6} md={6}>
                <DateInput
                  color={watch('admissionDateStartFilter') ? 'info' : null}
                  register={register}
                  label="Data de Sindicalização De: "
                  errors={errors?.admissionDateStartFilter}
                  name="admissionDateStartFilter"
                />
              </Grid>
              <Grid item xs={6} sm={6} md={6}>
                <DateInput
                  color={watch('admissionDateEndFilter') ? 'info' : null}
                  register={register}
                  label="Data de Sindicalização Até:"
                  errors={errors?.admissionDateEndFilter}
                  name="admissionDateEndFilter"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={6} md={3} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('employmentCard')}
              onClick={() => setValue('employmentCard', !getValues('employmentCard'))}
            />

            <TextInput
              color={watch('employmentCardFilter') ? 'info' : null}
              watch={watch}
              register={register}
              label="Cart.de Trabalho"
              errors={errors?.employmentCardFilter}
              name="employmentCardFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('gender')}
              onClick={() => setValue('gender', !getValues('gender'))}
            />

            <SelectFilter
              options={[
                { text: 'MASCULINO', value: 'MASCULINO' },
                { text: 'FEMININO', value: 'FEMININO' },
                { text: 'OUTROS', value: 'OUTROS' },
              ]}
              color={watch('genderFilter') ? 'info' : null}
              control={control}
              label="Sexo"
              errors={errors?.genderFilter}
              {...register('genderFilter')}
              register={register}
              name="genderFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('maritalStatus')}
              onClick={() => setValue('maritalStatus', !getValues('maritalStatus'))}
            />

            <SelectFilter
              options={[
                { text: 'SOLTEIRO(A)', value: 'SOLTEIRO(A)' },
                { text: 'CASADO(A)', value: 'CASADO(A)' },
                { text: 'SEPARADO(A)', value: 'SEPARADO(A)' },
                { text: 'DIVORCIADO(A)', value: 'DIVORCIADO(A)' },
                { text: 'DESQUITADO(A)', value: 'DESQUITADO(A)' },
                { text: 'VIUVO(A)', value: 'VIUVO(A)' },
                { text: 'UNIÃO ESTAVEL', value: 'UNIÃO ESTAVEL' },
                { text: 'OUTROS', value: 'OUTROS' },
              ]}
              color={watch('maritalStatusFilter') ? 'info' : null}
              control={control}
              label="Estado Civil"
              errors={errors?.maritalStatusFilter}
              {...register('maritalStatusFilter')}
              register={register}
              name="maritalStatusFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('educationLevel')}
              onClick={() => setValue('educationLevel', !getValues('educationLevel'))}
            />

            <SelectFilter
              options={[
                { text: 'NÃO INFORMADO', value: 'NÃO INFORMADO' },
                { text: 'NÃO ALFABETIZADO', value: 'NÃO ALFABETIZADO' },
                { text: 'ENSINO FUNDAMENTAL', value: 'ENSINO FUNDAMENTAL' },
                { text: 'ENSINO FUNDAM./INCOMPLE.', value: 'ENSINO FUNDAM./INCOMPLE.' },
                { text: 'ENSINO MÉDIO', value: 'ENSINO MÉDIO' },
                { text: 'ENSINO MÉDIO/INCOMPL.', value: 'ENSINO MÉDIO/INCOMPL.' },
                { text: 'SUPERIOR', value: 'SUPERIOR' },
                { text: 'SUPERIOR/INCOMPL.', value: 'SUPERIOR/INCOMPL.' },
                { text: 'PÓS GRADUADO', value: 'PÓS GRADUADO' },
                { text: 'MESTRADO', value: 'MESTRADO' },
                { text: 'DOUTORADO', value: 'DOUTORADO' },
              ]}
              color={watch('educationLevelFilter') ? 'info' : null}
              control={control}
              label="Instrução"
              errors={errors?.educationLevelFilter}
              {...register('educationLevelFilter')}
              register={register}
              name="educationLevelFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('specialNeeds')}
              onClick={() => setValue('specialNeeds', !getValues('specialNeeds'))}
            />

            <SelectFilter
              options={[
                { text: 'NÃO POSSUI', value: 'NÃO POSSUI' },
                { text: 'POSSUI', value: 'POSSUI' },
              ]}
              color={watch('specialNeedsFilter') !== '' && watch('specialNeedsFilter') !== undefined ? 'info' : null}
              control={control}
              label="Deficiência"
              errors={errors?.specialNeedsFilter}
              {...register('specialNeedsFilter')}
              register={register}
              name="specialNeedsFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('sendJournal')}
              onClick={() => setValue('sendJournal', !getValues('sendJournal'))}
            />

            <SelectFilter
              options={[
                { text: 'NÃO ENVIAR', value: 'NÃO ENVIAR' },
                { text: 'ENVIAR', value: 'ENVIAR' },
              ]}
              color={watch('sendJournalFilter') !== '' && watch('sendJournalFilter') !== undefined ? 'info' : null}
              control={control}
              label="Jornal"
              errors={errors?.sendJournalFilter}
              {...register('sendJournalFilter')}
              register={register}
              name="sendJournalFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('appPermission')}
              onClick={() => setValue('appPermission', !getValues('appPermission'))}
            />

            <SelectFilter
              options={[
                { text: 'NÃO PERMITIR', value: 'NÃO PERMITIR' },
                { text: 'PERMITIR', value: 'PERMITIR' },
              ]}
              color={watch('appPermissionFilter') !== '' && watch('appPermissionFilter') !== undefined ? 'info' : null}
              control={control}
              label="Permitir Carteirinha"
              errors={errors?.appPermissionFilter}
              {...register('appPermissionFilter')}
              register={register}
              name="appPermissionFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('phone01')}
              onClick={() => setValue('phone01', !getValues('phone01'))}
            />

            <TextInput
              color={watch('phone01Filter') ? 'info' : null}
              watch={watch}
              register={register}
              label="Telefone 01"
              errors={errors?.phone01Filter}
              name="phone01Filter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('phone02')}
              onClick={() => setValue('phone02', !getValues('phone02'))}
            />

            <TextInput
              color={watch('phone02Filter') ? 'info' : null}
              watch={watch}
              register={register}
              label="Telefone 02"
              errors={errors?.phone02Filter}
              name="phone02Filter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('phone03')}
              onClick={() => setValue('phone03', !getValues('phone03'))}
            />

            <TextInput
              color={watch('phone03Filter') ? 'info' : null}
              watch={watch}
              register={register}
              label="Telefone 03"
              errors={errors?.phone03Filter}
              name="phone03Filter"
            />
          </Grid>
        </Grid>
      </Container>

      <Container component="form" sx={{ mt: 1, mb: 1, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Title>Informações Bancarias</Title>

        <Grid container spacing={1}>
          <Grid item xs={12} sm={12} md={4} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('bankCode')}
              onClick={() => setValue('bankCode', !getValues('bankCode'))}
            />

            <TextInput
              color={watch('bankCodeFilter') ? 'info' : null}
              watch={watch}
              register={register}
              label="Código Banco"
              errors={errors?.bankCodeFilter}
              name="bankCodeFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('bankAccount')}
              onClick={() => setValue('bankAccount', !getValues('bankAccount'))}
            />

            <TextInput
              color={watch('bankAccountFilter') ? 'info' : null}
              watch={watch}
              register={register}
              label="Conta Banco"
              errors={errors?.bankAccountFilter}
              name="bankAccountFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('bankAgency')}
              onClick={() => setValue('bankAgency', !getValues('bankAgency'))}
            />

            <TextInput
              color={watch('bankAgencyFilter') ? 'info' : null}
              watch={watch}
              register={register}
              label="Agencia Banco"
              errors={errors?.bankAgencyFilter}
              name="bankAgencyFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('annualCredit')}
              onClick={() => setValue('annualCredit', !getValues('annualCredit'))}
            />

            <TextInput
              color={watch('annualCreditFilter') ? 'info' : null}
              watch={watch}
              register={register}
              label="Credito Anual"
              errors={errors?.annualCreditFilter}
              name="annualCreditFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('monthlyCredit')}
              onClick={() => setValue('monthlyCredit', !getValues('monthlyCredit'))}
            />

            <TextInput
              color={watch('monthlyCreditFilter') ? 'info' : null}
              watch={watch}
              register={register}
              label="Credito Mensal"
              errors={errors?.monthlyCreditFilter}
              name="monthlyCreditFilter"
            />
          </Grid>
        </Grid>
      </Container>

      <Container component="form" sx={{ mt: 1, mb: 1, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Title>Informações da Profissão</Title>

        <Grid container spacing={1}>
          <Grid item xs={12} sm={6} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('companyCode')}
              onClick={() => setValue('companyCode', !getValues('companyCode'))}
            />

            <TextInput
              color={watch('companyCodeFilter') ? 'info' : null}
              watch={watch}
              register={register}
              label="Cod. Sindicato"
              errors={errors?.companyCodeFilter}
              name="companyCodeFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('associateState')}
              onClick={() => setValue('associateState', !getValues('associateState'))}
            />

            <SelectFilter
              options={[
                { text: 'ASSOCIADO', value: 'ASSOCIADO' },
                { text: 'NÂO ASSOCIADO', value: 'NÂO ASSOCIADO' },
              ]}
              color={watch('associateStateFilter') ? 'info' : null}
              control={control}
              label="Status"
              errors={errors?.associateStateFilter}
              {...register('associateStateFilter')}
              register={register}
              name="associateStateFilter"
            />
          </Grid>

          <Grid item xs={12} sm={12} md={12} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('associate')}
              onClick={() => setValue('associate', !getValues('associate'))}
            />

            <FormControl fullWidth focused={arrayList.length > 0}>
              <InputLabel size="small">Situação</InputLabel>
              <MuiSelect
                size="small"
                multiple
                value={arrayList}
                onChange={handleChange}
                input={<OutlinedInput label="Situação" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {options.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox checked={arrayList.indexOf(option) > -1} />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('baseSalary')}
              onClick={() => setValue('baseSalary', !getValues('baseSalary'))}
            />

            <Grid container spacing={1}>
              <Grid item xs={6} sm={6} md={6}>
                <MoneyTextInput
                  color={watch('baseSalaryStartFilter') ? 'info' : null}
                  watch={watch}
                  register={register}
                  label="Salario Base Mínimo:"
                  errors={errors?.baseSalaryStartFilter}
                  name="baseSalaryStartFilter"
                />
              </Grid>
              <Grid item xs={6} sm={6} md={6}>
                <MoneyTextInput
                  color={watch('baseSalaryEndFilter') ? 'info' : null}
                  watch={watch}
                  register={register}
                  label="Salario Base Máximo:"
                  errors={errors?.baseSalaryEndFilter}
                  name="baseSalaryEndFilter"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={12} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('discount')}
              onClick={() => setValue('discount', !getValues('discount'))}
            />

            <Grid container spacing={1}>
              <Grid item xs={6} sm={6} md={6}>
                <MoneyTextInput
                  color={watch('discountStartFilter') ? 'info' : null}
                  watch={watch}
                  register={register}
                  label="Desconto Mínimo:"
                  errors={errors?.discountStartFilter}
                  name="discountStartFilter"
                />
              </Grid>
              <Grid item xs={6} sm={6} md={6}>
                <MoneyTextInput
                  color={watch('discountEndFilter') ? 'info' : null}
                  watch={watch}
                  register={register}
                  label="Desconto Máximo:"
                  errors={errors?.discountEndFilter}
                  name="discountEndFilter"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={12} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('hiringDate')}
              onClick={() => setValue('hiringDate', !getValues('hiringDate'))}
            />

            <Grid container display="flex" spacing={1}>
              <Grid item xs={6} sm={6} md={6}>
                <DateInput
                  color={watch('hiringDateStartFilter') ? 'info' : null}
                  register={register}
                  label="Data de Admissão De: "
                  errors={errors?.hiringDateStartFilter}
                  name="hiringDateStartFilter"
                />
              </Grid>

              <Grid item xs={6} sm={6} md={6}>
                <DateInput
                  color={watch('hiringDateEndFilter') ? 'info' : null}
                  register={register}
                  label="Data de Admissão Até: "
                  errors={errors?.hiringDateEndFilter}
                  name="hiringDateEndFilter"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={12} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('dismissalDate')}
              onClick={() => setValue('dismissalDate', !getValues('dismissalDate'))}
            />

            <Grid container display="flex" spacing={1}>
              <Grid item xs={6} sm={6} md={6}>
                <DateInput
                  color={watch('dismissalDateStartFilter') ? 'info' : null}
                  register={register}
                  label="Data de Demissão De: "
                  errors={errors?.dismissalDateStartFilter}
                  name="dismissalDateStartFilter"
                />
              </Grid>

              <Grid item xs={6} sm={6} md={6}>
                <DateInput
                  color={watch('dismissalDateEndFilter') ? 'info' : null}
                  register={register}
                  label="Data de Demissão Até: "
                  errors={errors?.dismissalDateEndFilter}
                  name="dismissalDateEndFilter"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={12} md={6} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('retirementDate')}
              onClick={() => setValue('retirementDate', !getValues('retirementDate'))}
            />

            <Grid container display="flex" spacing={1}>
              <Grid item xs={6} sm={6} md={6}>
                <DateInput
                  color={watch('retirementDateStartFilter') ? 'info' : null}
                  register={register}
                  label="Data de Aposentadoria De: "
                  errors={errors?.retirementDateStartFilter}
                  name="retirementDateStartFilter"
                />
              </Grid>

              <Grid item xs={6} sm={6} md={6}>
                <DateInput
                  color={watch('retirementDateEndFilter') ? 'info' : null}
                  register={register}
                  label="Data de Aposentadoria Até: "
                  errors={errors?.retirementDateEndFilter}
                  name="retirementDateEndFilter"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={6} md={3} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('ente')}
              onClick={() => setValue('ente', !getValues('ente'))}
            />

            <SelectFilter
              options={[
                { text: 'PREFEITURA', value: 'PREFEITURA' },
                { text: 'SÃO JOÃO PREV', value: 'SÃO JOÃO PREV' },
                { text: 'CÂMARA MUNICIPAL', value: 'CÂMARA MUNICIPAL' },
                { text: 'UNIFAE', value: 'UNIFAE' },
              ]}
              color={watch('enteFilter') ? 'info' : null}
              control={control}
              label="Ente"
              errors={errors?.enteFilter}
              {...register('enteFilter')}
              register={register}
              name="enteFilter"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3} display="flex">
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="success" />}
              checked={!!watch('monthlyType')}
              onClick={() => setValue('monthlyType', !getValues('monthlyType'))}
            />

            <SelectFilter
              options={[
                { text: 'MENSALIDADE SÓCIO', value: 'MENSALIDADE SÓCIO' },
                { text: 'CONTRIBUIÇÃO ASSOCIATIVA', value: 'CONTRIBUIÇÃO ASSOCIATIVA' },
              ]}
              color={watch('monthlyTypeFilter') ? 'info' : null}
              control={control}
              label="Tipo de Mensalidade"
              errors={errors?.monthlyTypeFilter}
              {...register('monthlyTypeFilter')}
              register={register}
              name="monthlyTypeFilter"
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
