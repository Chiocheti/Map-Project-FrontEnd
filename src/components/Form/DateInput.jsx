import TextField from '@mui/material/TextField';

export default function DateInput({ color, register, label, errors, name, defaultValue, control, ...rest }) {
  return (
    <TextField
      color={color}
      focused={color !== null ? !!color : null}
      type="date"
      label={label}
      variant="outlined"
      size="small"
      fullWidth
      {...register(name)}
      error={!!errors}
      helperText={errors?.message}
      defaultValue=""
      {...rest}
      InputLabelProps={{
        shrink: true,
      }}
    />
  );
}
