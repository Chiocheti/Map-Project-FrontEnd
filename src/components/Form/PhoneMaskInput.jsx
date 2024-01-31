import TextField from '@mui/material/TextField';
import { Controller } from 'react-hook-form';
import InputMask from 'react-input-mask';

export default function PhoneMaskInput({ control, name, label, errors }) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field }) => (
        <InputMask mask="(99) 999999999" maskChar="" {...field}>
          {(inputProps) => (
            <TextField
              {...inputProps}
              fullWidth
              label={label}
              error={!!errors}
              helperText={errors?.message}
              variant="outlined"
              size="small"
            />
          )}
        </InputMask>
      )}
    />
  );
}
