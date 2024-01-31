import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

export default function MoneyReadOnly({ value, label, errors, ...rest }) {
  return (
    <FormControl fullWidth>
      <InputLabel htmlFor="outlined-adornment-amount">{label}</InputLabel>
      <OutlinedInput
        label={label}
        defaultValue=""
        size="small"
        error={!!errors}
        value={value !== undefined ? value : ''}
        readOnly
        startAdornment={<InputAdornment position="start">$</InputAdornment>}
        {...rest}
      />
    </FormControl>
  );
}
