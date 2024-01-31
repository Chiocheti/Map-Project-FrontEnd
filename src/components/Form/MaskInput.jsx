import TextField from '@mui/material/TextField';
import { Controller } from 'react-hook-form';
import InputMask from 'react-input-mask';

export default function MaskInputText({ color, control, name, mask, label, errors }) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field }) => (
        <InputMask mask={mask} maskChar={null} {...field}>
          {(inputProps) => (
            <TextField
              {...inputProps}
              color={color}
              focused={color !== null ? !!color : null}
              fullWidth
              label={label}
              error={!!errors}
              helperText={errors?.message}
              variant="outlined"
              size="small"
              // InputLabelProps={{
              //   shrink: !!watch(name),
              // }}
            />
          )}
        </InputMask>
      )}
    />
  );
}
