import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';
import { Controller } from 'react-hook-form';

export default function SelectNullable({ label, errors, register, options, name, control, defaultValue, ...rest }) {
  return (
    <FormControl fullWidth error={!!errors}>
      <InputLabel size="small">{label}</InputLabel>
      <Controller
        defaultValue=""
        name={name}
        control={control}
        render={({ field }) => (
          <MuiSelect size="small" label={label} {...field} {...rest} defaultValue="">
            <MenuItem value="">SEM FILTRO</MenuItem>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.text}
              </MenuItem>
            ))}
          </MuiSelect>
        )}
      />
      <FormHelperText error>{errors?.message}</FormHelperText>
    </FormControl>
  );
}
