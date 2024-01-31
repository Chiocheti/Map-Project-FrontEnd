import 'dayjs/locale/pt-br';
import { yupResolver } from '@hookform/resolvers/yup';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import DateInput from '../Form/DateInput';
import MoneyTextInput from '../Form/MoneyTextInput';
import SelectFilter from '../Form/SelectFilter';
import TextInput from '../Form/TextInput';
import Title from '../Form/Title';

const schema = Yup.object({
  dependentId: Yup.boolean().default(false),
  specialtyId: Yup.boolean().default(false),
  invoiceReceived: Yup.boolean().default(false),
  invoiceNumber: Yup.boolean().default(false),
  invoiceValue: Yup.boolean().default(false),
  refundValue: Yup.boolean().default(false),

  dependentIdFilter: Yup.string().default(''),
  specialtyIdFilter: Yup.string().default(''),

  invoiceReceivedFilterStart: Yup.string().default(''),
  invoiceReceivedFilterEnd: Yup.string().default(''),

  invoiceNumberFilter: Yup.string().default(''),

  invoiceValueFilterStart: Yup.string().default(''),
  invoiceValueFilterEnd: Yup.string().default(''),

  refundValueFilterStart: Yup.boolean().default(''),
  refundValueFilterEnd: Yup.boolean().default(''),
});

export default function ReportClientRefunds({ update, servicesList }) {
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

    if (data.dependentId) {
      fields.push('dependentId');
    }
    if (data.specialtyId) {
      fields.push('specialtyId');
    }
    if (data.invoiceReceived) {
      fields.push('invoiceReceived');
    }
    if (data.invoiceNumber) {
      fields.push('invoiceNumber');
    }
    if (data.invoiceValue) {
      fields.push('invoiceValue');
    }
    if (data.refundValue) {
      fields.push('refundValue');
    }

    if (data.genderFilter) {
      query.gender = data.genderFilter;
    }

    if (data.dependentIdFilter) {
      query.dependentId = data.dependentIdFilter;
    }
    if (data.specialtyIdFilter) {
      query.specialtyId = data.specialtyIdFilter;
    }

    if (data.invoiceReceivedFilterStart && data.invoiceReceivedFilterEnd) {
      query.invoiceReceived = {
        start: data?.invoiceReceivedFilterStart,
        end: data?.invoiceReceivedFilterEnd,
      };
    } else if (data.invoiceReceivedFilterStart) {
      query.invoiceReceived = {
        start: data?.invoiceReceivedFilterStart,
      };
    } else if (data.invoiceReceivedFilterEnd) {
      query.invoiceReceived = {
        end: data?.invoiceReceivedFilterEnd,
      };
    }

    if (data.invoiceNumberFilter) {
      query.invoiceNumber = data.invoiceNumberFilter;
    }

    if (data.invoiceValueFilterStart && data.invoiceValueFilterEnd) {
      query.invoiceValue = {
        start: data?.invoiceValueFilterStart,
        end: data?.invoiceValueFilterEnd,
      };
    } else if (data.invoiceValueFilterStart) {
      query.invoiceValue = {
        start: data?.invoiceValueFilterStart,
      };
    } else if (data.invoiceValueFilterEnd) {
      query.invoiceValue = {
        end: data?.invoiceValueFilterEnd,
      };
    }

    if (data.refundValueFilterStart && data.refundValueFilterEnd) {
      query.refundValue = {
        start: data?.refundValueFilterStart,
        end: data?.refundValueFilterEnd,
      };
    } else if (data.refundValueFilterStart) {
      query.refundValue = {
        start: data?.refundValueFilterStart,
      };
    } else if (data.refundValueFilterEnd) {
      query.refundValue = {
        end: data?.refundValueFilterEnd,
      };
    }

    update({ fields, query });
  }

  values();

  return (
    <>
      <Title>Informações de Reembolso Médico</Title>

      <Grid container spacing={1}>
        <Grid item xs={12} sm={6} md={6} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('dependentId')}
            onClick={() => setValue('dependentId', !getValues('dependentId'))}
          />

          <TextInput
            color={watch('dependentIdFilter') ? 'info' : null}
            watch={watch}
            register={register}
            label="Nome"
            errors={errors?.dependentIdFilter}
            name="dependentIdFilter"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('specialtyId')}
            onClick={() => setValue('specialtyId', !getValues('specialtyId'))}
          />

          <SelectFilter
            options={servicesList}
            color={watch('specialtyIdFilter') === '' || watch('specialtyIdFilter') === undefined ? null : 'info'}
            control={control}
            label="Serviço"
            errors={errors?.specialtyIdFilter}
            {...register(`specialtyIdFilter`)}
            register={register}
            name="specialtyIdFilter"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('invoiceReceived')}
            onClick={() => setValue('invoiceReceived', !getValues('invoiceReceived'))}
          />

          <Grid container spacing={1}>
            <Grid item xs={6} sm={6} md={6}>
              <DateInput
                color={watch('invoiceReceivedFilterStart') ? 'info' : null}
                register={register}
                label="Data do Pedido De:"
                errors={errors?.invoiceReceivedFilterStart}
                name="invoiceReceivedFilterStart"
              />
            </Grid>

            <Grid item xs={6} sm={6} md={6}>
              <DateInput
                color={watch('invoiceReceivedFilterEnd') ? 'info' : null}
                register={register}
                label="Data do Pedido Até:"
                errors={errors?.invoiceReceivedFilterEnd}
                name="invoiceReceivedFilterEnd"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6} md={6} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('invoiceNumber')}
            onClick={() => setValue('invoiceNumber', !getValues('invoiceNumber'))}
          />

          <TextInput
            color={watch('invoiceNumberFilter') ? 'info' : null}
            watch={watch}
            register={register}
            label="Numero do Pedido"
            errors={errors?.invoiceNumberFilter}
            name="invoiceNumberFilter"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('invoiceValue')}
            onClick={() => setValue('invoiceValue', !getValues('invoiceValue'))}
          />

          <Grid container spacing={1}>
            <Grid item xs={6} sm={6} md={6}>
              <MoneyTextInput
                color={watch('invoiceValueFilterStart') ? 'info' : null}
                watch={watch}
                register={register}
                label="Valor do Recibo Mínimo:"
                errors={errors?.invoiceValueFilterStart}
                name="invoiceValueFilterStart"
              />
            </Grid>
            <Grid item xs={6} sm={6} md={6}>
              <MoneyTextInput
                color={watch('invoiceValueFilterEnd') ? 'info' : null}
                watch={watch}
                register={register}
                label="Valor do Recibo Máximo:"
                errors={errors?.invoiceValueFilterEnd}
                name="invoiceValueFilterEnd"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6} md={6} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('refundValue')}
            onClick={() => setValue('refundValue', !getValues('refundValue'))}
          />

          <Grid container spacing={1}>
            <Grid item xs={6} sm={6} md={6}>
              <MoneyTextInput
                color={watch('refundValueFilterStart') ? 'info' : null}
                watch={watch}
                register={register}
                label="Valor Reembolsado Mínimo:"
                errors={errors?.refundValueFilterStart}
                name="refundValueFilterStart"
              />
            </Grid>
            <Grid item xs={6} sm={6} md={6}>
              <MoneyTextInput
                color={watch('refundValueFilterEnd') ? 'info' : null}
                watch={watch}
                register={register}
                label="Valor Reembolsado Máximo:"
                errors={errors?.refundValueFilterEnd}
                name="refundValueFilterEnd"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
