import { yupResolver } from '@hookform/resolvers/yup';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import TextInput from '../Form/TextInput';

const schema = Yup.object().shape({
  skill: Yup.string().required('Campo obrigatório'),
  lack: Yup.boolean().required('Campo obrigatório').default(false),
});

export default function ServiceList({ add, isOpen }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      skill: '',
      lack: false,
    },
  });

  useEffect(() => {
    reset();
  }, [isOpen, reset]);

  function create(data) {
    add(data);
  }

  return (
    <Grid container mt={1} spacing={1}>
      <Grid item xs={10} sm={11} md={11}>
        <TextInput watch={watch} register={register} label="Especialidade" errors={errors.skill} name="skill" />
      </Grid>
      <Grid item xs={2} sm={1} md={1} textAlign="center">
        <Checkbox
          icon={<CheckBoxOutlineBlankIcon />}
          checkedIcon={<CheckBoxIcon color="success" />}
          checked={watch('lack')}
          onClick={() => setValue('lack', !watch('lack'))}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={12}>
        <Button onClick={handleSubmit(create)} color="success" variant="contained" fullWidth>
          Adicionar
        </Button>
      </Grid>
    </Grid>
  );
}
