import 'dayjs/locale/pt-br';
import { yupResolver } from '@hookform/resolvers/yup';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import MaskInputText from '../Form/MaskInput';
import TextInput from '../Form/TextInput';
import Title from '../Form/Title';

const schema = Yup.object({
  postalCode: Yup.boolean().default(false),
  streetName: Yup.boolean().default(false),
  number: Yup.boolean().default(false),
  neighborhood: Yup.boolean().default(false),
  state: Yup.boolean().default(false),
  city: Yup.boolean().default(false),
  complement: Yup.boolean().default(false),

  postalCodeFilter: Yup.string().default(''),
  streetNameFilter: Yup.string().default(''),
  numberFilter: Yup.string().default(''),
  neighborhoodFilter: Yup.string().default(''),
  stateFilter: Yup.string().default(''),
  cityFilter: Yup.string().default(''),
  complementFilter: Yup.string().default(''),
});

export default function ReportClientAddresses({ update }) {
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

    if (data.postalCode) {
      fields.push('postalCode');
    }
    if (data.streetName) {
      fields.push('streetName');
    }
    if (data.number) {
      fields.push('number');
    }
    if (data.neighborhood) {
      fields.push('neighborhood');
    }
    if (data.state) {
      fields.push('state');
    }
    if (data.city) {
      fields.push('city');
    }
    if (data.complement) {
      fields.push('complement');
    }

    if (data.postalCodeFilter) {
      query.postalCode = data.postalCodeFilter;
    }
    if (data.streetNameFilter) {
      query.streetName = data.streetNameFilter;
    }
    if (data.numberFilter) {
      query.number = data.numberFilter;
    }
    if (data.neighborhoodFilter) {
      query.neighborhood = data.neighborhoodFilter;
    }
    if (data.stateFilter) {
      query.state = data.stateFilter;
    }
    if (data.cityFilter) {
      query.city = data.cityFilter;
    }
    if (data.complementFilter) {
      query.complement = data.complementFilter;
    }

    update({ fields, query });
  }

  values();

  return (
    <>
      <Title>Informações de Endereço</Title>

      <Grid container spacing={1}>
        <Grid item xs={12} sm={6} md={3} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('number')}
            onClick={() => setValue('number', !getValues('number'))}
          />

          <TextInput
            color={watch('numberFilter') ? 'info' : null}
            watch={watch}
            register={register}
            label="Número"
            errors={errors?.numberFilter}
            name="numberFilter"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('postalCode')}
            onClick={() => setValue('postalCode', !getValues('postalCode'))}
          />

          <MaskInputText
            color={watch('postalCodeFilter') ? 'info' : null}
            watch={watch}
            control={control}
            name="postalCodeFilter"
            mask="99999-999"
            label="CEP"
            errors={errors?.postalCodeFilter}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('streetName')}
            onClick={() => setValue('streetName', !getValues('streetName'))}
          />

          <TextInput
            color={watch('streetNameFilter') ? 'info' : null}
            watch={watch}
            register={register}
            label="Rua"
            errors={errors?.streetNameFilter}
            name="streetNameFilter"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('neighborhood')}
            onClick={() => setValue('neighborhood', !getValues('neighborhood'))}
          />

          <TextInput
            color={watch('neighborhoodFilter') ? 'info' : null}
            watch={watch}
            register={register}
            label="Bairro"
            errors={errors?.neighborhoodFilter}
            name="neighborhoodFilter"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('city')}
            onClick={() => setValue('city', !getValues('city'))}
          />

          <TextInput
            color={watch('cityFilter') ? 'info' : null}
            watch={watch}
            register={register}
            label="Cidade"
            errors={errors?.cityFilter}
            name="cityFilter"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('state')}
            onClick={() => setValue('state', !getValues('state'))}
          />

          <TextInput
            color={watch('stateFilter') ? 'info' : null}
            watch={watch}
            register={register}
            label="Estado"
            errors={errors?.stateFilter}
            name="stateFilter"
          />
        </Grid>

        <Grid item xs={12} sm={12} md={6} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('complement')}
            onClick={() => setValue('complement', !getValues('complement'))}
          />

          <TextInput
            color={watch('complementFilter') ? 'info' : null}
            watch={watch}
            register={register}
            label="Complemento"
            errors={errors?.complementFilter}
            name="complementFilter"
          />
        </Grid>
      </Grid>
    </>
  );
}
