import TextField from '@mui/material/TextField';

export default function TextInput({ color, watch, register, label, errors, name, ...rest }) {
  return (
    <TextField
      color={color}
      focused={color !== null ? !!color : null}
      defaultValue=""
      label={label}
      variant="outlined"
      size="small"
      fullWidth
      {...register(name)}
      error={!!errors}
      helperText={errors?.message}
      InputLabelProps={{
        shrink: !!watch(name),
      }}
      {...rest}
    />
  );
}
