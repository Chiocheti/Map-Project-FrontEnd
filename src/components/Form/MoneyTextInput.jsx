import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

export default function MoneyTextInput({ color, watch, register, label, errors, name, ...rest }) {
  return (
    <FormControl fullWidth focused={color !== null ? !!color : null}>
      <InputLabel error={!!errors}>{label}</InputLabel>
      <OutlinedInput
        color={color}
        type="number"
        defaultValue=""
        size="small"
        label={label}
        error={!!errors}
        {...register(name)}
        inputProps={{ step: 0.01, min: 0 }}
        // InputLabelProps={{
        //   shrink: !!watch(name),
        // }}
        startAdornment={<InputAdornment position="start">$</InputAdornment>}
        {...rest}
      />
      <FormHelperText error>{errors?.message}</FormHelperText>
    </FormControl>
  );
}
