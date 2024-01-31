import { yupResolver } from '@hookform/resolvers/yup';
import EditOffOutlinedIcon from '@mui/icons-material/EditOffOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import Button from '../Form/Button';
import Select from '../Form/Select';

const schema = Yup.object({
  name: Yup.string().required('Campo obrigatório'),
  permission: Yup.boolean().required('Campo obrigatório'),
});

export default function AdmList({ usedRoles, rolesOptions, addNewRole }) {
  const [checkBox, setCheckBox] = useState(false);
  const [rolesList, setRolesList] = useState([]);

  useEffect(() => {
    const list = [];

    rolesOptions.forEach((role) => {
      let canPass = true;
      usedRoles.forEach((usedRole) => {
        if (role.text === usedRole.name) {
          canPass = false;
        }
      });
      if (canPass) {
        list.push(role);
      }
    });

    setRolesList(list);
  }, [rolesOptions, usedRoles]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function addRole({ name, permission }) {
    addNewRole(name, permission);
    setCheckBox(false);
    setValue('name', '');
    setValue('permission', false);
  }

  return (
    <>
      <Grid component="form" item xs={10} sm={11} md={usedRoles?.length < rolesOptions.length ? 6 : 11}>
        <Select
          options={rolesList}
          control={control}
          label="Cargo"
          errors={errors?.name}
          {...register('name')}
          register={register}
          name="name"
        />
      </Grid>

      <Grid item xs={2} sm={1} md={1}>
        <Checkbox
          icon={<EditOffOutlinedIcon />}
          checkedIcon={<EditOutlinedIcon />}
          checked={checkBox}
          onClick={() => setCheckBox((prevValue) => !prevValue)}
          {...register(`permission`)}
        />
      </Grid>

      {usedRoles?.length < rolesOptions.length ? (
        <Grid item xs={12} sm={12} md={5}>
          <Button variant="contained" fullWidth color="success" onClick={handleSubmit(addRole)}>
            Adicionar cargo
          </Button>
        </Grid>
      ) : null}
    </>
  );
}
