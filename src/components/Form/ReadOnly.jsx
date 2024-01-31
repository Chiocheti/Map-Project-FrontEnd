import TextField from '@mui/material/TextField';

export default function ReadOnly({ color, disabled, errors, value, label, ...rest }) {
  return (
    <TextField
      color={color}
      focused={color !== null ? color : null}
      disabled={disabled}
      label={label}
      defaultValue=""
      size="small"
      fullWidth
      value={value || ''}
      InputProps={{
        readOnly: true,
      }}
      InputLabelProps={{
        shrink: true,
      }}
      error={!!errors}
      helperText={errors?.message}
      {...rest}
    />
  );
}
