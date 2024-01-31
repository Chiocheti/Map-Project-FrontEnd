import 'dayjs/locale/pt-br';
import { yupResolver } from '@hookform/resolvers/yup';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import DateInput from '../Form/DateInput';
import SelectFilter from '../Form/SelectFilter';
import TextInput from '../Form/TextInput';
import Title from '../Form/Title';

const schema = Yup.object({
  name: Yup.boolean().default(false),
  birthdate: Yup.boolean().default(false),
  gender: Yup.boolean().default(false),
  relationship: Yup.boolean().default(false),
  documents: Yup.boolean().default(false),

  nameFilter: Yup.string().default(''),
  birthdateFilterStart: Yup.string().default(''),
  birthdateFilterEnd: Yup.string().default(''),
  genderFilter: Yup.string().default(''),
  relationshipFilter: Yup.string().default(''),
  documentsFilter: Yup.boolean().default(''),
});

export default function ReportClientDependents({ update }) {
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

    if (data.name) {
      fields.push('name');
    }
    if (data.birthdate) {
      fields.push('birthdate');
    }
    if (data.gender) {
      fields.push('gender');
    }
    if (data.relationship) {
      fields.push('relationship');
    }
    if (data.documents) {
      fields.push('documents');
    }

    if (data.nameFilter) {
      query.name = data.nameFilter;
    }

    if (data.birthdateFilterStart && data.birthdateFilterEnd) {
      query.birthdate = {
        start: data?.birthdateFilterStart,
        end: data?.birthdateFilterEnd,
      };
    } else if (data.birthdateFilterStart) {
      query.birthdate = {
        start: data?.birthdateFilterStart,
      };
    } else if (data.birthdateFilterEnd) {
      query.birthdate = {
        end: data?.birthdateFilterEnd,
      };
    }

    if (data.genderFilter) {
      query.gender = data.genderFilter;
    }
    if (data.relationshipFilter) {
      query.relationship = data.relationshipFilter;
    }
    if (data.documentsFilter) {
      query.documents = data.documentsFilter !== 'FALTANDO';
    }

    update({ fields, query });
  }

  values();

  return (
    <>
      <Title>Informações de Empregos</Title>

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
            label="Nome"
            errors={errors?.nameFilter}
            name="nameFilter"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('birthdate')}
            onClick={() => setValue('birthdate', !getValues('birthdate'))}
          />

          <Grid container spacing={1}>
            <Grid item xs={6} sm={6} md={6}>
              <DateInput
                color={watch('birthdateFilterStart') ? 'info' : null}
                register={register}
                label="Nascimento De:"
                errors={errors?.birthdateFilterStart}
                name="birthdateFilterStart"
              />
            </Grid>

            <Grid item xs={6} sm={6} md={6}>
              <DateInput
                color={watch('birthdateFilterEnd') ? 'info' : null}
                register={register}
                label="Nascimento Até:"
                errors={errors?.birthdateFilterEnd}
                name="birthdateFilterEnd"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6} md={6} display="flex">
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
            {...register(`genderFilter`)}
            register={register}
            name="genderFilter"
          />
        </Grid>

        <Grid item xs={12} sm={3} md={3} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('relationship')}
            onClick={() => setValue('relationship', !getValues('relationship'))}
          />

          <SelectFilter
            options={[
              { text: 'ESPOSO(A)', value: 'ESPOSO(A)' },
              { text: 'FILHO(A)', value: 'FILHO(A)' },
              { text: 'ENTEADO(A)', value: 'ENTEADO(A)' },
              { text: 'TUTELADO(A)', value: 'TUTELADO(A)' },
              { text: 'OUTROS(AS)', value: 'OUTROS(AS)' },
              { text: 'DEP. LAUDO MÉDICO', value: 'DEP. LAUDO MÉDICO' },
            ]}
            color={watch('relationshipFilter') ? 'info' : null}
            control={control}
            label="Parentesco"
            errors={errors?.relationshipFilter}
            {...register(`relationshipFilter`)}
            register={register}
            name="relationshipFilter"
          />
        </Grid>

        <Grid item xs={12} sm={3} md={3} display="flex">
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="success" />}
            checked={!!watch('documents')}
            onClick={() => setValue('documents', !getValues('documents'))}
          />

          <SelectFilter
            options={[
              { text: 'ENTREGUE', value: 'ENTREGUE' },
              { text: 'FALTANDO', value: 'FALTANDO' },
            ]}
            color={watch('documentsFilter') === '' || watch('documentsFilter') === undefined ? null : 'info'}
            control={control}
            label="Documentos"
            errors={errors?.documentsFilter}
            {...register(`documentsFilter`)}
            register={register}
            name="documentsFilter"
          />
        </Grid>
      </Grid>
    </>
  );
}
